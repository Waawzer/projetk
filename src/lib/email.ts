import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailData {
  name: string;
  email: string;
  service: string;
  message: string;
}

interface BookingConfirmationData {
  customerName: string;
  customerEmail: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  totalPrice?: number;
  depositAmount?: number;
  remainingAmount?: number;
}

export async function sendContactNotification(data: EmailData) {
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
      "Tentative d'envoi d'email à l'admin:",
      process.env.ADMIN_EMAIL
    );

    // Email pour l'administrateur
    const adminResponse = await resend.emails.send({
      from: "onboarding@resend.dev", // Utilisez cette adresse pour commencer
      to: process.env.ADMIN_EMAIL,
      subject: `Nouveau message de contact - ${data.service}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom :</strong> ${data.name}</p>
        <p><strong>Email :</strong> ${data.email}</p>
        <p><strong>Service :</strong> ${data.service}</p>
        <p><strong>Message :</strong></p>
        <p>${data.message}</p>
      `,
    });

    console.log("Réponse de l'envoi admin:", adminResponse);

    console.log("Tentative d'envoi d'email au client:", data.email);

    // Email de confirmation pour le client
    const clientResponse = await resend.emails.send({
      from: "onboarding@resend.dev", // Utilisez cette adresse pour commencer
      to: data.email,
      subject: "Confirmation de réception de votre message - Kasar Studio",
      html: `
        <h2>Merci de nous avoir contacté !</h2>
        <p>Cher(e) ${data.name},</p>
        <p>Nous avons bien reçu votre message concernant ${data.service}. Notre équipe vous répondra dans les plus brefs délais.</p>
        <p>Pour rappel, voici votre message :</p>
        <blockquote>${data.message}</blockquote>
        <p>Cordialement,</p>
        <p>L'équipe Kasar Studio</p>
      `,
    });

    console.log("Réponse de l'envoi client:", clientResponse);

    return { success: true };
  } catch (error) {
    console.error("Erreur détaillée lors de l'envoi des emails:", error);
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

export async function sendBookingConfirmation(data: BookingConfirmationData) {
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
