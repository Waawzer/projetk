import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailData {
  name: string;
  email: string;
  service: string;
  message: string;
}

export async function sendContactNotification(data: EmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY non définie');
    throw new Error('Configuration email manquante');
  }

  if (!process.env.ADMIN_EMAIL) {
    console.error('ADMIN_EMAIL non définie');
    throw new Error('Email admin manquant');
  }

  try {
    console.log('Tentative d\'envoi d\'email à l\'admin:', process.env.ADMIN_EMAIL);
    
    // Email pour l'administrateur
    const adminResponse = await resend.emails.send({
      from: 'onboarding@resend.dev', // Utilisez cette adresse pour commencer
      to: process.env.ADMIN_EMAIL,
      subject: `Nouveau message de contact - ${data.service}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom :</strong> ${data.name}</p>
        <p><strong>Email :</strong> ${data.email}</p>
        <p><strong>Service :</strong> ${data.service}</p>
        <p><strong>Message :</strong></p>
        <p>${data.message}</p>
      `
    });

    console.log('Réponse de l\'envoi admin:', adminResponse);

    console.log('Tentative d\'envoi d\'email au client:', data.email);
    
    // Email de confirmation pour le client
    const clientResponse = await resend.emails.send({
      from: 'onboarding@resend.dev', // Utilisez cette adresse pour commencer
      to: data.email,
      subject: 'Confirmation de réception de votre message - Kasar Studio',
      html: `
        <h2>Merci de nous avoir contacté !</h2>
        <p>Cher(e) ${data.name},</p>
        <p>Nous avons bien reçu votre message concernant ${data.service}. Notre équipe vous répondra dans les plus brefs délais.</p>
        <p>Pour rappel, voici votre message :</p>
        <blockquote>${data.message}</blockquote>
        <p>Cordialement,</p>
        <p>L'équipe Kasar Studio</p>
      `
    });

    console.log('Réponse de l\'envoi client:', clientResponse);

    return { success: true };
  } catch (error) {
    console.error('Erreur détaillée lors de l\'envoi des emails:', error);
    throw error;
  }
} 