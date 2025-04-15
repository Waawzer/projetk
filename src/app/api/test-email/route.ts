import { NextResponse } from "next/server";
import { Resend } from "resend";

// Créer une instance de Resend pour l'envoi d'emails
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  console.log("Test d'envoi d'email via Resend");
  console.log("RESEND_API_KEY présente:", !!process.env.RESEND_API_KEY);
  console.log(
    "RESEND_API_KEY longueur:",
    process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0
  );

  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY manquante");
    }

    // Remplacez par votre adresse email
    const testEmail = process.env.ADMIN_EMAIL || "votre-email@example.com";

    console.log("Envoi d'un email de test à:", testEmail);

    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: testEmail,
      subject: "Test d'email depuis l'API Resend",
      html: "<h1>Ceci est un test</h1><p>Si vous recevez cet email, cela signifie que l'API Resend fonctionne correctement.</p>",
    });

    console.log("Résultat de l'envoi:", JSON.stringify(result));

    return NextResponse.json({
      success: true,
      message: "Email de test envoyé avec succès",
      result,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de test:", error);

    if (error instanceof Error) {
      console.error("Message d'erreur:", error.message);
      console.error("Stack trace:", error.stack);
    } else {
      console.error("Erreur non standard:", JSON.stringify(error));
    }

    return NextResponse.json(
      {
        success: false,
        message: "Échec de l'envoi de l'email de test",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
