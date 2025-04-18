import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      bookingId,
      service,
      customerEmail,
      returnUrl,
      cancelUrl,
      paymentType = "deposit", // "deposit" ou "remaining"
    } = body;

    if (!amount || !bookingId || !returnUrl || !cancelUrl) {
      return NextResponse.json(
        { error: "Les paramètres requis sont manquants" },
        { status: 400 }
      );
    }

    // Formater le montant pour Stripe (en centimes)
    const stripeAmount = Math.round(parseFloat(amount) * 100);

    // Créer une session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${
                paymentType === "deposit" ? "Acompte" : "Paiement du solde"
              } pour ${service || "réservation de studio"}`,
              description: `Réservation #${bookingId}`,
            },
            unit_amount: stripeAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: bookingId,
        paymentType: paymentType,
      },
      customer_email: customerEmail,
      mode: "payment",
      success_url: `${returnUrl}{CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la session Stripe:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors du traitement du paiement" },
      { status: 500 }
    );
  }
}
