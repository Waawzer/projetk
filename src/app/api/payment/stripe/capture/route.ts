import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { createCalendarEvent } from "@/lib/googleCalendar";
import { sendBookingConfirmation } from "@/lib/email";
import fs from "fs";
import path from "path";

// Initialiser Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Fonction d'aide pour écrire des logs dans un fichier
const writeLog = (message: string) => {
  try {
    const logDir = path.join(process.cwd(), "logs");

    // Créer le répertoire logs s'il n'existe pas
    if (!fs.existsSync(logDir)) {
      try {
        fs.mkdirSync(logDir, { recursive: true });
        console.log(`Répertoire de logs créé à : ${logDir}`);
      } catch (err) {
        console.error("Impossible de créer le répertoire logs:", err);
        console.error("Chemin absolu tenté:", logDir);
        console.error(
          "Erreur détaillée:",
          err instanceof Error ? err.message : String(err)
        );
        return;
      }
    }

    const logFile = path.join(logDir, "stripe-email.log");
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    try {
      fs.appendFileSync(logFile, logMessage);
    } catch (err) {
      console.error("Impossible d'écrire dans le fichier de log:", err);
      console.error("Chemin du fichier de log:", logFile);
      console.error("Message qui n'a pas pu être écrit:", logMessage);
      console.error(
        "Erreur détaillée:",
        err instanceof Error ? err.message : String(err)
      );
    }
  } catch (err) {
    console.error("Erreur générale dans writeLog:", err);
  }
};

// Route POST pour capturer un paiement Stripe
export async function POST(request: NextRequest) {
  writeLog("DÉBUT POST stripe/capture - Nouvelle requête");
  try {
    const body = await request.json();
    const { sessionId, bookingId, fromWebhook } = body;
    const type = body.type || "deposit"; // "deposit" ou "remaining"

    writeLog(
      `POST - Paiement demandé: sessionId=${sessionId}, bookingId=${bookingId}, type=${type}, fromWebhook=${fromWebhook}`
    );

    if (!sessionId || !bookingId) {
      writeLog("ERREUR - ID de session ou ID de réservation manquant");
      return NextResponse.json(
        { error: "ID de session ou ID de réservation manquant" },
        { status: 400 }
      );
    }

    console.log("Capture de paiement Stripe demandée:", {
      sessionId,
      bookingId,
      type,
      fromWebhook,
    });

    // Récupérer la session depuis Stripe
    writeLog("Récupération de la session Stripe");
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    writeLog(
      `Session Stripe récupérée: id=${session.id}, payment_status=${session.payment_status}`
    );
    console.log("Session Stripe récupérée:", {
      id: session.id,
      payment_status: session.payment_status,
      status: session.status,
    });

    if (!session) {
      writeLog("ERREUR - Session Stripe introuvable");
      return NextResponse.json(
        { error: "Session Stripe introuvable" },
        { status: 400 }
      );
    }

    // Vérifier que le paiement est confirmé
    const isPaid =
      session.payment_status === "paid" || session.status === "complete";

    writeLog(`Paiement confirmé: ${isPaid}`);

    if (!isPaid) {
      writeLog(`ERREUR - Paiement non confirmé: ${session.payment_status}`);
      return NextResponse.json(
        {
          error: "Le paiement n'a pas été confirmé par Stripe",
          status: session.payment_status,
        },
        { status: 400 }
      );
    }

    // Connexion à la base de données
    writeLog("Connexion à la base de données");
    await dbConnect();

    // Récupérer la réservation
    writeLog(`Recherche de la réservation: ${bookingId}`);
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      writeLog(`ERREUR - Réservation non trouvée: ${bookingId}`);
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    writeLog(
      `Réservation trouvée: id=${booking._id}, depositPaid=${booking.depositPaid}`
    );
    console.log("Réservation trouvée:", {
      id: booking._id,
      depositPaid: booking.depositPaid,
      paymentId: booking.paymentId,
    });

    // Vérifier si le paiement a déjà été traité
    let alreadyProcessed = false;
    if (
      type === "deposit" &&
      booking.depositPaid &&
      booking.paymentId === sessionId
    ) {
      writeLog("Paiement déjà traité (acompte), envoi d'email seulement");
      alreadyProcessed = true;
      // On ne retourne pas de réponse ici, on continue pour envoyer l'email
    } else if (
      type === "remaining" &&
      booking.remainingPaid &&
      booking.remainingPaymentId === sessionId
    ) {
      writeLog("Paiement déjà traité (reste), envoi d'email seulement");
      alreadyProcessed = true;
      // On ne retourne pas de réponse ici, on continue pour envoyer l'email
    }

    // Si le paiement n'a pas encore été traité, mettre à jour la réservation
    if (!alreadyProcessed) {
      // Mettre à jour la réservation selon le type de paiement
      if (type === "remaining") {
        // Mettre à jour le statut de paiement du reste
        writeLog("Mise à jour du paiement du reste");
        booking.remainingPaid = true;
        booking.remainingPaymentMethod = "card";
        booking.remainingPaymentDate = new Date();
        booking.remainingPaymentId = sessionId;

        console.log("Mise à jour du paiement restant avec ID:", bookingId);
        console.log("Nouvelles valeurs:", {
          remainingPaid: booking.remainingPaid,
          remainingPaymentMethod: booking.remainingPaymentMethod,
          remainingPaymentDate: booking.remainingPaymentDate,
          remainingPaymentId: booking.remainingPaymentId,
        });
      } else {
        // Mettre à jour le statut de paiement de l'acompte
        writeLog("Mise à jour du paiement de l'acompte");
        booking.depositPaid = true;
        booking.paymentMethod = "card";
        booking.paymentId = sessionId;
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
      }

      // Sauvegarder dans la base de données
      await booking.save();
      writeLog(`Réservation sauvegardée avec succès: ${booking._id}`);
      console.log("Réservation mise à jour et sauvegardée avec succès");
    }

    // Toujours créer l'événement Google Calendar et envoyer l'email, même si le paiement a déjà été traité
    if (type === "deposit") {
      // Vérifier si un événement Google Calendar existe déjà pour cette réservation
      const calendarEventExists =
        booking.googleCalendarEventId &&
        booking.googleCalendarEventId.length > 0;

      // Créer l'événement dans Google Calendar uniquement si ce n'est pas une requête du webhook
      // ou si l'événement n'existe pas encore
      if (!calendarEventExists && !fromWebhook) {
        try {
          writeLog("Création d'un événement dans Google Calendar");
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

          // Créer la date et l'heure de début - utiliser la même approche que PayPal
          const bookingDate = new Date(booking.date);
          const [hours, minutes] = startTime.split(":").map(Number);
          bookingDate.setHours(hours, minutes, 0);

          console.log(
            "- Date et heure formatées:",
            bookingDate.toLocaleString()
          );

          // Créer la date et l'heure de fin - utiliser la même approche que PayPal
          const endDateTime = new Date(
            bookingDate.getTime() + duration * 60 * 60 * 1000
          );

          console.log("- Date et heure de fin:", endDateTime.toLocaleString());

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
            writeLog(
              `Événement Google Calendar créé avec ID: ${calendarEvent.id}`
            );

            // Si nous avons modifié la réservation après avoir déjà vérifié alreadyProcessed, il faut la sauvegarder
            if (alreadyProcessed) {
              await booking.save();
              writeLog(
                "Réservation mise à jour avec l'ID de l'événement Google Calendar"
              );
            }
          }
        } catch (calendarError) {
          console.error(
            "Erreur lors de la création de l'événement Google Calendar:",
            calendarError
          );
          writeLog(
            `Erreur création événement Google Calendar: ${
              calendarError instanceof Error
                ? calendarError.message
                : JSON.stringify(calendarError)
            }`
          );
          // Continuer même si l'ajout au calendrier échoue
        }
      } else {
        if (calendarEventExists) {
          writeLog(
            `Événement Google Calendar déjà créé avec ID: ${booking.googleCalendarEventId}`
          );
          console.log(
            "Événement Google Calendar déjà existant, pas de création en double"
          );
        } else if (fromWebhook) {
          writeLog(
            "Requête provenant du webhook, création de l'événement Google Calendar ignorée (sera créée par la redirection utilisateur)"
          );
          console.log(
            "Requête provenant du webhook, création de l'événement Google Calendar ignorée"
          );
        }
      }

      // Envoyer un email de confirmation au client
      try {
        writeLog("POINT CRITIQUE - Début envoi email via lib/email.ts");
        console.log("DÉMARRAGE PROCESSUS EMAIL - STRIPE via lib/email.ts");
        console.log("Informations réservation:", {
          id: booking._id,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          service: booking.service,
          date: booking.date,
          time: booking.time,
          duration: booking.duration,
        });

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
        console.log("FIN PROCESSUS EMAIL - STRIPE");
        writeLog("POINT CRITIQUE - Email envoyé avec succès via lib/email.ts");
      } catch (emailError) {
        writeLog(
          `ERREUR CRITIQUE - Échec envoi email via lib/email.ts: ${
            emailError instanceof Error
              ? emailError.message
              : JSON.stringify(emailError)
          }`
        );
        console.error(
          "ERREUR CRITIQUE LORS DE L'ENVOI EMAIL - STRIPE:",
          emailError
        );
        // Imprimer plus de détails sur l'erreur
        if (emailError instanceof Error) {
          console.error("Message d'erreur:", emailError.message);
          console.error("Stack trace:", emailError.stack);
        } else {
          console.error("Erreur non standard:", JSON.stringify(emailError));
        }
        // Continuer même si l'envoi de l'email échoue
      }
    }

    writeLog(
      `FIN POST stripe/capture - Paiement confirmé: type=${type}, bookingId=${booking._id}`
    );
    return NextResponse.json({
      success: true,
      message: "Paiement confirmé et réservation mise à jour",
      bookingStatus: booking.status,
      sessionId: session.id,
      paymentType: type,
    });
  } catch (error) {
    writeLog(
      `ERREUR POST stripe/capture: ${
        error instanceof Error ? error.message : JSON.stringify(error)
      }`
    );
    console.error("Erreur lors de la capture du paiement Stripe:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors du traitement du paiement" },
      { status: 500 }
    );
  }
}

// Route GET pour le webhook Stripe (maintenu pour compatibilité)
export async function GET(request: NextRequest) {
  writeLog("DÉBUT GET stripe/capture - Nouvelle requête");
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    const bookingId = searchParams.get("bookingId");
    const type = searchParams.get("type") || "deposit";

    writeLog(
      `GET - Paramètres reçus: sessionId=${sessionId}, bookingId=${bookingId}, type=${type}`
    );

    // Rediriger vers le même endpoint en POST
    writeLog("Redirection vers POST");
    const response = await fetch(`${request.url.split("?")[0]}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId,
        bookingId,
        type,
        fromWebhook: false, // Cette requête provient de la redirection utilisateur, pas du webhook
      }),
    });

    const data = await response.json();
    writeLog(
      `GET - Réponse du POST: status=${response.status}, success=${
        data.success || false
      }`
    );
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    writeLog(
      `ERREUR GET stripe/capture: ${
        error instanceof Error ? error.message : JSON.stringify(error)
      }`
    );
    console.error("Erreur lors de la redirection vers la capture:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification du paiement" },
      { status: 500 }
    );
  }
}

// Import des utilitaires de services
import { getServiceLabel } from "@/lib/services";
