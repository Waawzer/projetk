import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BookingModel from "@/models/Booking";
import { FilterQuery } from "mongoose";
import { IBooking, IBookingDocument } from "@/models/Booking";
import { deleteCalendarEvent } from "@/lib/googleCalendar";

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
    const newBooking = await BookingModel.create(data);

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
    await dbConnect();

    const data = await request.json();
    const { id, status, remainingPaid, remainingPaymentMethod } = data;

    // Préparer les données à mettre à jour
    const updateData: Partial<IBooking> = {};

    // Mettre à jour le statut si fourni
    if (status) {
      updateData.status = status;
    }

    // Mettre à jour les informations de paiement final si fournies
    if (remainingPaid !== undefined) {
      updateData.remainingPaid = remainingPaid;
      if (remainingPaid) {
        updateData.remainingPaymentDate = new Date();
        if (remainingPaymentMethod) {
          updateData.remainingPaymentMethod = remainingPaymentMethod;
        }
      }
    }

    // Mettre à jour la réservation
    const updatedBooking = await BookingModel.findByIdAndUpdate(
      id,
      updateData,
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
