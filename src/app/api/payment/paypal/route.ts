import { NextResponse, NextRequest } from "next/server";

// PayPal API endpoints
const PAYPAL_API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// PayPal client ID et secret (à définir dans .env.local)
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

// Route POST pour créer un paiement PayPal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      bookingId,
      service,
      customerName,
      customerEmail,
      returnUrl,
      cancelUrl,
    } = body;

    if (!amount || !bookingId || !returnUrl || !cancelUrl) {
      return NextResponse.json(
        { error: "Les paramètres requis sont manquants" },
        { status: 400 }
      );
    }

    // Obtenir le token d'accès
    const accessToken = await getPayPalAccessToken();

    // Formater le montant pour PayPal (2 décimales)
    const formattedAmount = parseFloat(amount).toFixed(2);

    // Créer l'ordre PayPal
    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: bookingId,
          description: `Acompte pour ${service || "réservation de studio"}`,
          amount: {
            currency_code: "EUR",
            value: formattedAmount,
          },
        },
      ],
      application_context: {
        brand_name: "Kasar Studio",
        landing_page: "BILLING",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
      payer: customerEmail
        ? {
            email_address: customerEmail,
            name: customerName
              ? {
                  given_name: customerName.split(" ")[0] || "",
                  surname: customerName.split(" ").slice(1).join(" ") || "",
                }
              : undefined,
          }
        : undefined,
    };

    // Créer l'ordre PayPal via l'API
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erreur PayPal:", errorData);
      return NextResponse.json(
        {
          error: "Erreur lors de la création du paiement PayPal",
          details: errorData,
        },
        { status: 500 }
      );
    }

    const order = await response.json();

    // Retourner les liens de paiement et l'ID de l'ordre
    return NextResponse.json({
      id: order.id,
      status: order.status,
      links: order.links,
      approveUrl: order.links.find((link: any) => link.rel === "approve").href,
    });
  } catch (error) {
    console.error("Erreur lors de la création du paiement PayPal:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors du traitement du paiement" },
      { status: 500 }
    );
  }
}
