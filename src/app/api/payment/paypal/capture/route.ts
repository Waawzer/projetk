import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { createCalendarEvent } from "@/lib/googleCalendar";
import { sendBookingConfirmation } from "@/lib/email";

// PayPal API endpoints
const PAYPAL_API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// PayPal client ID et secret
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

// Fonction pour obtenir un token d'accès PayPal
async function getPayPalAccessToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
    throw new Error("Les identifiants PayPal ne sont pas configurés");
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString(
    "base64"
  );

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Erreur d'authentification PayPal: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Route POST pour capturer un paiement PayPal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, bookingId } = body;

    if (!orderId || !bookingId) {
      return NextResponse.json(
        { error: "ID de commande PayPal ou ID de réservation manquant" },
        { status: 400 }
      );
    }

    // Obtenir le token d'accès
    const accessToken = await getPayPalAccessToken();

    // Capturer le paiement
    const response = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erreur lors de la capture du paiement PayPal:", errorData);
      return NextResponse.json(
        { error: "Erreur lors de la capture du paiement", details: errorData },
        { status: 500 }
      );
    }

    const captureData = await response.json();
    console.log(
      "Données de capture PayPal:",
      JSON.stringify(captureData, null, 2)
    );

    // Mettre à jour la réservation dans la base de données
    await dbConnect();

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier si c'est un paiement du reste ou de l'acompte
    const paymentType = request.nextUrl.searchParams.get("type") || "deposit";

    console.log("Type de paiement capturé:", paymentType);

    if (paymentType === "remaining") {
      // Mettre à jour le statut de paiement du reste
      booking.remainingPaid = true;
      booking.remainingPaymentMethod = "paypal" as "cash" | "card" | "transfer";
      booking.remainingPaymentDate = new Date();

      console.log("Mise à jour du paiement restant avec ID:", bookingId);
      console.log("Nouvelles valeurs:", {
        remainingPaid: booking.remainingPaid,
        remainingPaymentMethod: booking.remainingPaymentMethod,
        remainingPaymentDate: booking.remainingPaymentDate,
      });
    } else {
      // Mettre à jour le statut de paiement de l'acompte
      booking.depositPaid = true;
      booking.paymentMethod = "paypal";
      booking.paymentId = orderId;
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
        const bookingDate = new Date(booking.date);
        const [hours, minutes] = startTime.split(":").map(Number);
        bookingDate.setHours(hours, minutes, 0);

        console.log("- Date et heure formatées:", bookingDate.toLocaleString());

        // Créer la date et l'heure de fin
        const endDateTime = new Date(
          bookingDate.getTime() + duration * 60 * 60 * 1000
        );

        console.log("- Date et heure de fin:", endDateTime.toLocaleString());

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
          console.error("Erreur non standard:", JSON.stringify(calendarError));
        }

        // Continuer même si l'ajout au calendrier échoue
      }

      // Envoyer un email de confirmation au client
      try {
        console.log("Envoi de l'email de confirmation de réservation");

        await sendBookingConfirmation({
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
    }

    // Sauvegarder dans la base de données
    await booking.save();

    console.log("Réservation mise à jour avec succès:", booking._id);

    return NextResponse.json({
      success: true,
      paymentId: orderId,
      captureId: captureData.purchase_units[0].payments.captures[0].id,
      bookingStatus: booking.status,
      depositPaid: booking.depositPaid,
      paymentMethod: booking.paymentMethod,
      type: paymentType,
    });
  } catch (error) {
    console.error("Erreur lors de la capture du paiement PayPal:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors du traitement du paiement" },
      { status: 500 }
    );
  }
}

function getServiceLabel(service: string): string {
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
}
