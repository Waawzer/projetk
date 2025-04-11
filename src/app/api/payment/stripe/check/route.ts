import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { createCalendarEvent } from "@/lib/googleCalendar";
import { Resend } from "resend";

// Créer une instance de Resend pour l'envoi d'emails
const resend = new Resend(process.env.RESEND_API_KEY);

// Fonction locale pour envoyer l'email de confirmation
async function sendBookingConfirmationEmail(data: {
  customerName: string;
  customerEmail: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  totalPrice?: number;
  depositAmount?: number;
  remainingAmount?: number;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY non définie");
    throw new Error("Configuration email manquante");
  }

  if (!process.env.ADMIN_EMAIL) {
    console.error("ADMIN_EMAIL non définie");
    throw new Error("Email admin manquant");
  }

  try {
    console.log(
      "Tentative d'envoi d'email de confirmation de réservation à:",
      data.customerEmail
    );

    const formattedDate = formatDateFr(data.date);
    const serviceLabel = getServiceLabel(data.service);

    // Email de confirmation pour le client
    const clientResponse = await resend.emails.send({
      from: "onboarding@resend.dev", // Utilisez cette adresse pour commencer
      to: data.customerEmail,
      subject: "Confirmation de votre réservation - Kasar Studio",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="color: #6200ea; text-align: center;">Confirmation de réservation</h2>
          <p>Cher(e) ${data.customerName},</p>
          <p>Nous vous remercions pour votre réservation. Votre paiement initial a été confirmé et votre réservation est maintenant <strong>validée</strong>.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #6200ea; margin-top: 0;">Détails de votre réservation</h3>
            <p><strong>Service :</strong> ${serviceLabel}</p>
            <p><strong>Date :</strong> ${formattedDate}</p>
            <p><strong>Heure :</strong> ${data.time}</p>
            <p><strong>Durée :</strong> ${data.duration} heure${
        data.duration > 1 ? "s" : ""
      }</p>
            ${
              data.totalPrice
                ? `<p><strong>Prix total :</strong> ${data.totalPrice} €</p>`
                : ""
            }
            ${
              data.depositAmount
                ? `<p><strong>Acompte payé :</strong> ${data.depositAmount} €</p>`
                : ""
            }
            ${
              data.remainingAmount
                ? `<p><strong>Reste à payer :</strong> ${data.remainingAmount} €</p>`
                : ""
            }
          </div>
          
          <p>Le solde restant sera à régler le jour de votre séance.</p>
          
          <p>Si vous avez des questions ou souhaitez modifier votre réservation, n'hésitez pas à nous contacter.</p>
          
          <p style="margin-top: 30px;">Cordialement,</p>
          <p><strong>L'équipe Kasar Studio</strong></p>
        </div>
      `,
    });

    console.log(
      "Réponse de l'envoi confirmation de réservation:",
      clientResponse
    );

    // Email de notification pour l'administrateur
    const adminResponse = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: process.env.ADMIN_EMAIL,
      subject: `Nouvelle réservation confirmée - ${serviceLabel}`,
      html: `
        <h2>Nouvelle réservation confirmée</h2>
        <p><strong>Client :</strong> ${data.customerName}</p>
        <p><strong>Email :</strong> ${data.customerEmail}</p>
        <p><strong>Service :</strong> ${serviceLabel}</p>
        <p><strong>Date :</strong> ${formattedDate}</p>
        <p><strong>Heure :</strong> ${data.time}</p>
        <p><strong>Durée :</strong> ${data.duration} heure${
        data.duration > 1 ? "s" : ""
      }</p>
        ${
          data.totalPrice
            ? `<p><strong>Prix total :</strong> ${data.totalPrice} €</p>`
            : ""
        }
        ${
          data.depositAmount
            ? `<p><strong>Acompte payé :</strong> ${data.depositAmount} €</p>`
            : ""
        }
        ${
          data.remainingAmount
            ? `<p><strong>Reste à payer :</strong> ${data.remainingAmount} €</p>`
            : ""
        }
      `,
    });

    console.log("Réponse de l'envoi notification admin:", adminResponse);

    return { success: true };
  } catch (error) {
    console.error(
      "Erreur détaillée lors de l'envoi des emails de confirmation:",
      error
    );
    throw error;
  }
}

// Fonction pour formatter la date au format français
const formatDateFr = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Fonction pour obtenir le libellé du service
const getServiceLabel = (service: string) => {
  switch (service) {
    case "recording":
      return "Enregistrement";
    case "mixing":
      return "Mixage";
    case "mastering":
      return "Mastering";
    case "production":
      return "Production";
    default:
      return service;
  }
};

// Initialiser Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    const bookingId = searchParams.get("bookingId");
    const type = searchParams.get("type") || "deposit";

    console.log("Vérification du paiement Stripe:", {
      sessionId,
      bookingId,
      type,
    });

    if (!sessionId || !bookingId) {
      return NextResponse.json(
        { error: "ID de session ou ID de réservation manquant" },
        { status: 400 }
      );
    }

    // Récupérer la session depuis Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Session Stripe récupérée:", {
      id: session.id,
      payment_status: session.payment_status,
      status: session.status,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session Stripe introuvable" },
        { status: 400 }
      );
    }

    // Vérifier que la réservation existe
    await dbConnect();
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    console.log("Réservation trouvée:", {
      id: booking._id,
      depositPaid: booking.depositPaid,
      paymentId: booking.paymentId,
    });

    // Vérifier si le paiement a déjà été traité (peut-être par le webhook)
    if (
      type === "deposit" &&
      booking.depositPaid &&
      booking.paymentId === sessionId
    ) {
      return NextResponse.json({
        success: true,
        message: "Paiement déjà traité",
        bookingStatus: booking.status,
        paymentType: type,
      });
    } else if (
      type === "remaining" &&
      booking.remainingPaid &&
      booking.remainingPaymentId === sessionId
    ) {
      return NextResponse.json({
        success: true,
        message: "Paiement déjà traité",
        bookingStatus: booking.status,
        paymentType: type,
      });
    }

    // Vérifier si le paiement est confirmé selon Stripe
    const isPaid =
      session.payment_status === "paid" || session.status === "complete";

    console.log("Statut du paiement:", {
      isPaid,
      payment_status: session.payment_status,
    });

    // Si le paiement n'a pas été confirmé par Stripe
    if (!isPaid) {
      return NextResponse.json(
        {
          error: "Le paiement n'a pas été confirmé par Stripe",
          status: session.payment_status,
        },
        { status: 400 }
      );
    }

    // Si le paiement est confirmé mais pas encore traité dans notre base de données
    if (type === "deposit") {
      booking.depositPaid = true;
      booking.paymentMethod = "card";
      booking.paymentId = sessionId;
      booking.paymentDate = new Date();
      booking.status = "confirmed";

      console.log("Mise à jour du paiement de l'acompte:", {
        depositPaid: booking.depositPaid,
        paymentMethod: booking.paymentMethod,
        status: booking.status,
      });

      // Créer l'événement dans Google Calendar si nécessaire
      try {
        // Vérifier si un événement existe déjà
        if (!booking.googleCalendarEventId) {
          console.log("Création d'un événement Google Calendar...");

          // Récupérer les informations nécessaires de la réservation
          const startTime = booking.time;
          const duration = booking.duration;

          // Créer la date et l'heure de début
          const bookingDate = new Date(booking.date);
          const [hours, minutes] = startTime.split(":").map(Number);
          bookingDate.setHours(hours, minutes, 0);

          // Créer la date et l'heure de fin
          const endDateTime = new Date(
            bookingDate.getTime() + duration * 60 * 60 * 1000
          );

          // Formatage du service pour le titre
          const serviceLabel = getServiceLabel(booking.service);

          const eventDetails = {
            summary: `${serviceLabel} - ${booking.customerName}`,
            description: `Réservation pour ${serviceLabel}
Client: ${booking.customerName}
Email: ${booking.customerEmail}
Téléphone: ${booking.customerPhone || "Non spécifié"}
Prix total: ${booking.totalPrice || "Non spécifié"} €
Acompte: ${booking.depositAmount || "Non spécifié"} €`,
            startDateTime: bookingDate,
            endDateTime: endDateTime,
            email: booking.customerEmail,
          };

          const calendarEvent = await createCalendarEvent(
            eventDetails.summary,
            eventDetails.description,
            eventDetails.startDateTime,
            eventDetails.endDateTime,
            eventDetails.email
          );

          if (calendarEvent.id) {
            booking.googleCalendarEventId = calendarEvent.id;
            console.log(
              "Événement Google Calendar créé avec ID:",
              calendarEvent.id
            );
          }
        }
      } catch (calendarError) {
        console.error(
          "Erreur lors de la création de l'événement Google Calendar:",
          calendarError
        );
        // Continuer même si l'ajout au calendrier échoue
      }

      // Envoyer un email de confirmation au client
      try {
        console.log("Envoi de l'email de confirmation de réservation...");

        await sendBookingConfirmationEmail({
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          service: booking.service,
          date: booking.date,
          time: booking.time,
          duration: booking.duration,
          totalPrice: booking.totalPrice,
          depositAmount: booking.depositAmount,
          remainingAmount: booking.totalPrice
            ? booking.totalPrice - (booking.depositAmount || 0)
            : undefined,
        });

        console.log("Email de confirmation envoyé avec succès");
      } catch (emailError) {
        console.error(
          "Erreur lors de l'envoi de l'email de confirmation:",
          emailError
        );
        // Continuer même si l'envoi de l'email échoue
      }
    } else {
      booking.remainingPaid = true;
      booking.remainingPaymentMethod = "card";
      booking.remainingPaymentDate = new Date();
      booking.remainingPaymentId = sessionId;

      console.log("Mise à jour du paiement du solde:", {
        remainingPaid: booking.remainingPaid,
        remainingPaymentMethod: booking.remainingPaymentMethod,
      });
    }

    await booking.save();
    console.log("Réservation mise à jour et sauvegardée avec succès");

    return NextResponse.json({
      success: true,
      message: "Paiement confirmé et réservation mise à jour",
      bookingStatus: booking.status,
      paymentType: type,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la vérification de la session Stripe:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la vérification du paiement" },
      { status: 500 }
    );
  }
}
