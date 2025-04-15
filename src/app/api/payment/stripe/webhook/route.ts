import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";

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
    try {
      const session = event.data.object as Stripe.Checkout.Session;

      // Récupérer l'ID de réservation depuis les métadonnées
      const bookingId = session.metadata?.bookingId;
      const paymentType = session.metadata?.paymentType || "deposit";

      if (!bookingId) {
        throw new Error("ID de réservation manquant dans les métadonnées");
      }

      console.log(
        "Webhook Stripe reçu, redirection vers la route de capture pour le paiement:",
        {
          sessionId: session.id,
          bookingId,
          paymentType,
        }
      );

      // Rediriger vers la route /api/payment/stripe/capture
      // Ajouter fromWebhook=true pour éviter la duplication d'événements Google Calendar
      const response = await fetch(
        `${
          process.env.NEXTAUTH_URL || request.nextUrl.origin
        }/api/payment/stripe/capture`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: session.id,
            bookingId,
            type: paymentType,
            fromWebhook: true,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          "Erreur lors de la redirection vers la capture:",
          errorData
        );
        throw new Error(
          errorData.error || "Erreur lors du traitement du webhook"
        );
      }

      const result = await response.json();
      console.log("Résultat de la capture via webhook:", result);

      return NextResponse.json({ success: true, received: true });
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
