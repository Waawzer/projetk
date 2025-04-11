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

// Le secret pour vérifier les webhooks Stripe
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") as string;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Signature ou secret webhook manquant" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(
      `⚠️ Erreur webhook: ${
        err instanceof Error ? err.message : "Erreur inconnue"
      }`
    );
    return NextResponse.json(
      {
        error: `Webhook Error: ${
          err instanceof Error ? err.message : "Erreur inconnue"
        }`,
      },
      { status: 400 }
    );
  }

  // Gérer les événements de paiement réussi
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await dbConnect();

      // Récupérer l'ID de réservation depuis les métadonnées
      const bookingId = session.metadata?.bookingId;
      const paymentType = session.metadata?.paymentType || "deposit";

      if (!bookingId) {
        throw new Error("ID de réservation manquant dans les métadonnées");
      }

      const booking = await Booking.findById(bookingId);

      if (!booking) {
        throw new Error(`Réservation non trouvée: ${bookingId}`);
      }

      // Mettre à jour le statut de paiement selon le type
      if (paymentType === "remaining") {
        // Mettre à jour le statut de paiement du reste
        booking.remainingPaid = true;
        booking.remainingPaymentMethod = "card";
        booking.remainingPaymentDate = new Date();
        booking.remainingPaymentId = session.id;

        console.log("Mise à jour du paiement restant avec ID:", bookingId);
        console.log("Nouvelles valeurs:", {
          remainingPaid: booking.remainingPaid,
          remainingPaymentMethod: booking.remainingPaymentMethod,
          remainingPaymentDate: booking.remainingPaymentDate,
          remainingPaymentId: booking.remainingPaymentId,
        });
      } else {
        // Mettre à jour le statut de paiement de l'acompte
        booking.depositPaid = true;
        booking.paymentMethod = "card";
        booking.paymentId = session.id;
        booking.paymentDate = new Date();
        booking.status = "confirmed"; // La réservation est confirmée une fois l'acompte payé

        console.log("Mise à jour de la réservation avec ID:", bookingId);
        console.log("Nouvelles valeurs:", {
          depositPaid: booking.depositPaid,
          paymentMethod: booking.paymentMethod,
          paymentId: booking.paymentId,
          paymentDate: booking.paymentDate,
          status: booking.status,
        });

        // MAINTENANT créer l'événement dans Google Calendar, une fois le paiement de l'acompte confirmé
        try {
          // Récupérer les informations nécessaires de la réservation
          const startTime = booking.time;
          const duration = booking.duration;

          console.log(
            "Création d'un événement dans Google Calendar avec les détails suivants:"
          );
          console.log("- StartTime:", startTime);
          console.log("- Duration:", duration);
          console.log("- Date de réservation:", booking.date);
          console.log("- Service:", booking.service);
          console.log("- Client:", booking.customerName);
          console.log("- Email:", booking.customerEmail);

          // Créer la date et l'heure de début
          const [year, month, day] = booking.date.split("-").map(Number);
          const [hours, minutes] = startTime.split(":").map(Number);

          // Utiliser UTC pour éviter les problèmes de fuseau horaire sur Vercel
          // Correction spécifique à l'environnement :
          // Si nous sommes en production (+3h observé), n'ajoutons pas de décalage
          // Si nous sommes en développement, ajoutons +2h
          const timeAdjustment = process.env.NODE_ENV === "production" ? 0 : 2;

          console.log("Environnement:", process.env.NODE_ENV);
          console.log("Ajustement horaire appliqué:", timeAdjustment, "heures");

          const bookingDate = new Date(
            Date.UTC(year, month - 1, day, hours + timeAdjustment, minutes)
          );

          console.log(
            "- Date et heure formatées UTC:",
            bookingDate.toISOString()
          );

          // Créer la date et l'heure de fin
          const endDateTime = new Date(
            Date.UTC(
              year,
              month - 1,
              day,
              hours + duration + timeAdjustment,
              minutes
            )
          );

          console.log("- Date et heure de fin UTC:", endDateTime.toISOString());

          // Formatage du service pour le titre
          const serviceLabel = getServiceLabel(booking.service);

          // Vérifier les variables d'environnement Google Calendar
          console.log(
            "Vérification des variables d'environnement Google Calendar:"
          );

          if (!process.env.GOOGLE_CLIENT_EMAIL) {
            console.error("GOOGLE_CLIENT_EMAIL manquant");
          }
          if (!process.env.GOOGLE_PRIVATE_KEY) {
            console.error("GOOGLE_PRIVATE_KEY manquant");
          }
          if (!process.env.GOOGLE_CALENDAR_ID) {
            console.error("GOOGLE_CALENDAR_ID manquant");
          }

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

          console.log("Événement créé avec succès:", calendarEvent.id);

          if (calendarEvent.id) {
            booking.googleCalendarEventId = calendarEvent.id;
          }
        } catch (calendarError) {
          console.error(
            "Erreur lors de la création de l'événement dans Google Calendar:",
            calendarError
          );

          // Imprimer plus de détails sur l'erreur
          if (calendarError instanceof Error) {
            console.error("Message d'erreur:", calendarError.message);
            console.error("Stack trace:", calendarError.stack);
          } else {
            console.error(
              "Erreur non standard:",
              JSON.stringify(calendarError)
            );
          }

          // Continuer même si l'ajout au calendrier échoue
        }

        // Envoyer un email de confirmation au client
        try {
          console.log("Envoi de l'email de confirmation de réservation");
          console.log("RESEND_API_KEY définie:", !!process.env.RESEND_API_KEY);
          console.log("ADMIN_EMAIL définie:", !!process.env.ADMIN_EMAIL);

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

          // Plus de détails sur l'erreur pour le débogage
          if (emailError instanceof Error) {
            console.error("Message d'erreur:", emailError.message);
            console.error("Stack trace:", emailError.stack);
          } else {
            console.error("Erreur non standard:", JSON.stringify(emailError));
          }

          // Continuer même si l'envoi de l'email échoue
        }
      }

      // Sauvegarder dans la base de données
      await booking.save();

      console.log(`✅ Paiement Stripe traité pour la réservation ${bookingId}`);
    } catch (error) {
      console.error("Erreur lors du traitement du webhook Stripe:", error);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour de la réservation" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
