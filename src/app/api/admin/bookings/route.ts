import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BookingModel from "@/models/Booking";
import { FilterQuery } from "mongoose";
import { IBookingDocument } from "@/models/Booking";
import { deleteCalendarEvent, createCalendarEvent } from "@/lib/googleCalendar";
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
      from: "onboarding@resend.dev",
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

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const date = searchParams.get("date") || "";

    // Construire la requête
    const query: FilterQuery<IBookingDocument> = {};

    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
        { service: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (date) {
      query.date = date;
    }

    // Exécuter la requête
    const bookings = await BookingModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des réservations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const data = await request.json();

    // Vérifier si nous devons ajouter l'événement à Google Calendar
    const addToGoogleCalendar = data.addToGoogleCalendar;

    // Supprimer le champ addToGoogleCalendar avant d'enregistrer dans MongoDB
    if (data.addToGoogleCalendar) {
      delete data.addToGoogleCalendar;
    }

    // Formater la date pour s'assurer qu'elle est au format YYYY-MM-DD
    if (data.date) {
      const dateObj = new Date(data.date);
      data.date = dateObj.toISOString().split("T")[0]; // Format YYYY-MM-DD
    }

    // Créer la réservation dans la base de données
    const newBooking = await BookingModel.create(data);

    // Si demandé, ajouter l'événement à Google Calendar
    if (addToGoogleCalendar) {
      try {
        // Construire le titre et la description de l'événement
        const summary = `${
          data.service.charAt(0).toUpperCase() + data.service.slice(1)
        } - ${data.customerName}`;

        const description = `
Client: ${data.customerName}
Email: ${data.customerEmail}
${data.customerPhone ? `Téléphone: ${data.customerPhone}` : ""}
Service: ${data.service}
Durée: ${data.duration} heure(s)
Prix total: ${data.totalPrice || 0}€
ID Réservation: ${newBooking._id}
${data.notes ? `Notes: ${data.notes}` : ""}
        `.trim();

        // Convertir la date et l'heure en objets Date pour Google Calendar
        const [year, month, day] = data.date.split("-").map(Number);
        const [hours, minutes] = data.time.split(":").map(Number);

        // Créer une date en utilisant UTC avec décalage horaire (+2 heures pour la France en été)
        const startDateTime = new Date(
          Date.UTC(year, month - 1, day, hours - 2, minutes)
        );

        console.log("Date et heure de début UTC:", startDateTime.toISOString());

        // Créer la date et l'heure de fin
        const endDateTime = new Date(
          Date.UTC(year, month - 1, day, hours + data.duration - 2, minutes)
        );

        console.log("Date et heure de fin UTC:", endDateTime.toISOString());

        // Créer l'événement dans Google Calendar
        const calendarEvent = await createCalendarEvent(
          summary,
          description,
          startDateTime,
          endDateTime,
          data.customerEmail
        );

        // Mettre à jour la réservation avec l'ID de l'événement Google Calendar
        if (calendarEvent.id) {
          await BookingModel.findByIdAndUpdate(newBooking._id, {
            googleCalendarEventId: calendarEvent.id,
          });

          console.log(`Événement Google Calendar créé: ${calendarEvent.id}`);
        }
      } catch (calendarError) {
        console.error(
          "Erreur lors de la création de l'événement dans Google Calendar:",
          calendarError
        );
        // On continue même si la création de l'événement dans le calendrier échoue
      }
    }

    return NextResponse.json(newBooking.toJSON(), { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la réservation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la réservation" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const data = await request.json();
    const { id } = data;

    // Formater la date pour s'assurer qu'elle est au format YYYY-MM-DD
    if (data.date) {
      const dateObj = new Date(data.date);
      data.date = dateObj.toISOString().split("T")[0]; // Format YYYY-MM-DD
    }

    const updatedBooking = await BookingModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedBooking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la réservation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la réservation" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de réservation manquant" },
        { status: 400 }
      );
    }

    // Récupérer la réservation avant de la supprimer pour avoir l'ID Google Calendar
    const booking = await BookingModel.findById(id).lean();

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer l'événement dans Google Calendar si l'ID existe
    if (booking.googleCalendarEventId) {
      try {
        await deleteCalendarEvent(booking.googleCalendarEventId);
        console.log(
          `Événement Google Calendar supprimé: ${booking.googleCalendarEventId}`
        );
      } catch (calendarError) {
        console.error(
          "Erreur lors de la suppression de l'événement dans Google Calendar:",
          calendarError
        );
        // On continue même si la suppression de l'événement dans le calendrier échoue
      }
    }

    // Supprimer la réservation de la base de données
    const deletedBooking = await BookingModel.findByIdAndDelete(id);

    if (!deletedBooking) {
      return NextResponse.json(
        { error: "Erreur lors de la suppression de la réservation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de la réservation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la réservation" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID de réservation manquant" },
        { status: 400 }
      );
    }

    await dbConnect();
    const booking = await BookingModel.findById(id);

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    // Mettre à jour les champs
    Object.keys(updateData).forEach((key) => {
      if (key !== "sendConfirmationEmail") {
        // Ne pas ajouter ce champ au modèle
        booking[key] = updateData[key];
      }
    });

    // Si depositPaid passe à true et sendConfirmationEmail est true, envoyer un email
    if (
      updateData.depositPaid === true &&
      updateData.sendConfirmationEmail === true
    ) {
      try {
        console.log(
          "Envoi de l'email de confirmation de réservation après mise à jour manuelle"
        );

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
        // Continuer même si l'envoi de l'email échoue
      }
    }

    // Si le statut passe à confirmed et qu'il n'y a pas d'ID Google Calendar, ajouter au calendrier
    if (updateData.status === "confirmed" && !booking.googleCalendarEventId) {
      try {
        console.log("Ajout de l'événement au calendrier Google");

        // Récupérer les composants de la date et de l'heure
        const [year, month, day] = booking.date.split("-").map(Number);
        const [hours, minutes] = booking.time.split(":").map(Number);

        // Créer une date en utilisant UTC avec décalage horaire (+2 heures pour la France en été)
        const bookingDate = new Date(
          Date.UTC(year, month - 1, day, hours + 2, minutes)
        );

        console.log("Date et heure de début UTC:", bookingDate.toISOString());

        // Créer la date et l'heure de fin en utilisant UTC également
        const endDateTime = new Date(
          Date.UTC(year, month - 1, day, hours + booking.duration + 2, minutes)
        );

        console.log("Date et heure de fin UTC:", endDateTime.toISOString());

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
        // Continuer même si l'ajout au calendrier échoue
      }
    }

    // Sauvegarder la réservation mise à jour
    await booking.save();

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la réservation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la réservation" },
      { status: 500 }
    );
  }
}

// Fonction pour marquer les réservations passées comme terminées
// Rendre la fonction non-exportée
async function checkAndUpdateCompletedBookings() {
  try {
    await dbConnect();

    const now = new Date();

    // Trouver toutes les réservations confirmées qui sont passées
    const bookingsToUpdate = await BookingModel.find({
      status: "confirmed",
      depositPaid: true,
      $or: [
        // Soit la date est passée
        { date: { $lt: now.toISOString().split("T")[0] } },
        // Soit c'est aujourd'hui mais l'heure est passée
        {
          date: now.toISOString().split("T")[0],
          time: {
            $lt: `${now.getHours().toString().padStart(2, "0")}:${now
              .getMinutes()
              .toString()
              .padStart(2, "0")}`,
          },
        },
      ],
    });

    console.log(
      `${bookingsToUpdate.length} réservations à marquer comme terminées.`
    );

    for (const booking of bookingsToUpdate) {
      booking.status = "completed";
      await booking.save();
      console.log(`Réservation ${booking._id} marquée comme terminée.`);
    }

    return bookingsToUpdate.length;
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour des réservations terminées:",
      error
    );
    return -1;
  }
}

// Mettre en place une vérification automatique des réservations terminées
// toutes les 12 heures si le serveur est en environnement de production
if (process.env.NODE_ENV === "production") {
  // Effectuer une première vérification au démarrage
  setTimeout(() => {
    checkAndUpdateCompletedBookings()
      .then((count) => {
        if (count > 0) {
          console.log(
            `${count} réservations ont été marquées comme terminées.`
          );
        }
      })
      .catch((err) => {
        console.error(
          "Erreur lors de la vérification automatique des réservations:",
          err
        );
      });
  }, 10000); // Attendre 10 secondes après le démarrage

  // Puis mettre en place une vérification périodique
  setInterval(() => {
    checkAndUpdateCompletedBookings()
      .then((count) => {
        if (count > 0) {
          console.log(
            `${count} réservations ont été marquées comme terminées.`
          );
        }
      })
      .catch((err) => {
        console.error(
          "Erreur lors de la vérification automatique des réservations:",
          err
        );
      });
  }, 12 * 60 * 60 * 1000); // Toutes les 12 heures
}
