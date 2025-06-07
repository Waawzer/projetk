import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";

interface ValidationError extends Error {
  name: string;
  errors: {
    [key: string]: {
      message: string;
    };
  };
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    // Parse request body
    const body = await request.json();

    console.log("Données reçues dans l'API:", body);

    // Calculate end time based on time or startTime
    const timeValue = body.time || body.startTime;

    if (!timeValue) {
      return NextResponse.json(
        { error: "L'heure de réservation est requise (time ou startTime)" },
        { status: 400 }
      );
    }

    const duration = parseInt(body.duration);

    // Simple calculation for end time (doesn't handle day changes)
    const [startHour, startMinute] = timeValue.split(":").map(Number);
    const endHour = startHour + Math.floor(duration);
    const endMinute = startMinute;
    const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
      .toString()
      .padStart(2, "0")}`;

    // Calculate total price and deposit amount
    const pricePerHour = getPricePerHour(body.service);
    const totalPrice = pricePerHour * duration;
    const depositAmount = totalPrice * 0.5;
    const remainingAmount = totalPrice - depositAmount;

    // Adapter les noms de champs pour correspondre au modèle Booking
    // Accepter à la fois les formats customerName/customerEmail et name/email
    // Convertir la date pour s'assurer qu'elle est au format YYYY-MM-DD sans l'heure
    const dateObj = new Date(body.date);
    const formattedDate = dateObj.toISOString().split("T")[0]; // Format YYYY-MM-DD

    const adaptedData = {
      customerName: body.customerName || body.name,
      customerEmail: body.customerEmail || body.email,
      customerPhone: body.customerPhone || body.phone,
      service: body.service,
      date: formattedDate, // Utiliser la date formatée sans l'heure
      time: timeValue,
      endTime,
      duration,
      totalPrice,
      depositAmount,
      remainingAmount,
      depositPaid: false,
      remainingPaid: false,
      paymentMethod: body.paymentMethod,
      status: "pending",
      notes: body.notes || "",
    };

    console.log("Données adaptées envoyées à MongoDB:", adaptedData);

    // Vérifier que les champs requis sont présents
    if (!adaptedData.customerName) {
      return NextResponse.json(
        { error: "Le nom du client est requis" },
        { status: 400 }
      );
    }

    if (!adaptedData.customerEmail) {
      return NextResponse.json(
        { error: "L'email du client est requis" },
        { status: 400 }
      );
    }

    // NOTE IMPORTANTE SUR LE PROCESSUS DE RÉSERVATION:
    // À ce stade, nous créons une entrée dans la base de données avec un statut "pending".
    // L'événement Google Calendar ne sera créé qu'après le paiement confirmé.
    //
    // Ce processus en deux étapes permet:
    // 1. De réserver le créneau immédiatement pour éviter qu'un autre client ne le prenne
    // 2. De garder le statut "pending" jusqu'à confirmation du paiement
    // 3. De nettoyer régulièrement les réservations non payées via une tâche cron
    //
    // Une alternative serait de créer la réservation uniquement après paiement,
    // mais cela nécessiterait un système de "hold" temporaire sur les créneaux.

    // Create new booking with the adapted data (sans ajouter au calendrier)
    const booking = await Booking.create(adaptedData);

    console.log("Réservation créée avec succès, ID:", booking._id);

    // Ne pas créer l'événement dans Google Calendar maintenant
    // L'événement sera créé lors de la confirmation du paiement

    return NextResponse.json(booking, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating booking:", error);

    // Handle validation errors
    if (error instanceof Error && error.name === "ValidationError") {
      const validationError = error as ValidationError;
      const validationErrors = Object.values(validationError.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        { error: "Validation Error", messages: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Import des utilitaires de services
import { getPricePerHour } from "@/lib/services";
