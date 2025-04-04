import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { createCalendarEvent } from "@/lib/googleCalendar";

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

    // Mettre à jour la réservation dans la base de données
    await dbConnect();

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    // Mettre à jour le statut de paiement
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

    // Sauvegarder dans la base de données
    await booking.save();

    // MAINTENANT créer l'événement dans Google Calendar, une fois le paiement confirmé
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
      const serviceLabel = (() => {
        switch (booking.service) {
          case "recording":
            return "Enregistrement";
          case "mixing":
            return "Mixage";
          case "mastering":
            return "Mastering";
          case "production":
            return "Production";
          default:
            return booking.service;
        }
      })();

      // Vérifier les variables d'environnement Google Calendar
      console.log(
        "Vérification des variables d'environnement Google Calendar:"
      );
      console.log(
        "- GOOGLE_CLIENT_EMAIL:",
        process.env.GOOGLE_CLIENT_EMAIL ? "Configuré" : "MANQUANT"
      );
      console.log(
        "- GOOGLE_PRIVATE_KEY:",
        process.env.GOOGLE_PRIVATE_KEY ? "Configuré" : "MANQUANT"
      );
      console.log(
        "- GOOGLE_CALENDAR_ID:",
        process.env.GOOGLE_CALENDAR_ID ? "Configuré" : "MANQUANT"
      );

      // Créer un événement dans Google Calendar
      const calendarEvent = await createCalendarEvent(
        `[Kasar Studio] ${serviceLabel} - ${booking.customerName}`,
        `Client: ${booking.customerName}\nEmail: ${
          booking.customerEmail
        }\nTéléphone: ${
          booking.customerPhone || "Non fourni"
        }\nDurée: ${duration}h\nNotes: ${booking.notes || "Aucune"}\nPrix: ${
          booking.totalPrice
        }€\nStatut: Confirmé (Payé)`,
        bookingDate,
        endDateTime,
        booking.customerEmail
      );

      console.log(
        "Événement créé dans Google Calendar avec succès:",
        calendarEvent.id
      );
      console.log("Détails de l'événement:", {
        summary: calendarEvent.summary,
        start: calendarEvent.start,
        end: calendarEvent.end,
        attendees: calendarEvent.attendees,
      });
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

    return NextResponse.json({
      success: true,
      paymentId: orderId,
      captureId: captureData.purchase_units[0].payments.captures[0].id,
      bookingStatus: "confirmed",
    });
  } catch (error) {
    console.error("Erreur lors de la capture du paiement PayPal:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors du traitement du paiement" },
      { status: 500 }
    );
  }
}
