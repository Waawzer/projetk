import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { createCalendarEvent } from "@/lib/googleCalendar";

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

    // Calculate end time based on start time and duration
    const startTime = body.startTime;
    const duration = parseInt(body.duration);

    // Simple calculation for end time (doesn't handle day changes)
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const endHour = startHour + Math.floor(duration);
    const endMinute = startMinute;
    const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
      .toString()
      .padStart(2, "0")}`;

    // Calculate total price and deposit amount
    const pricePerHour = getPricePerHour(body.service);
    const totalPrice = pricePerHour * duration;
    const depositAmount = totalPrice * 0.5;

    // Create booking data
    const bookingData = {
      ...body,
      endTime,
      totalPrice,
      depositAmount,
      depositPaid: false,
      status: "pending",
    };

    // Create new booking
    const booking = await Booking.create(bookingData);

    // Ajouter la réservation au calendrier Google
    try {
      // Créer la date et l'heure de début
      const bookingDate = new Date(body.date);
      const [hours, minutes] = startTime.split(":").map(Number);
      bookingDate.setHours(hours, minutes, 0);

      // Créer la date et l'heure de fin
      const endDateTime = new Date(
        bookingDate.getTime() + duration * 60 * 60 * 1000
      );

      // Formatage du service pour le titre
      const serviceLabel = (() => {
        switch (body.service) {
          case "recording":
            return "Enregistrement";
          case "mixing":
            return "Mixage";
          case "mastering":
            return "Mastering";
          case "production":
            return "Production";
          default:
            return body.service;
        }
      })();

      // Créer un événement dans Google Calendar
      await createCalendarEvent(
        `[Kasar Studio] ${serviceLabel} - ${body.name}`,
        `Client: ${body.name}\nEmail: ${body.email}\nTéléphone: ${
          body.phone
        }\nDurée: ${duration}h\nNotes: ${
          body.notes || "Aucune"
        }\nPrix: ${totalPrice}€`,
        bookingDate,
        endDateTime,
        body.email
      );
    } catch (calendarError) {
      console.error(
        "Erreur lors de la création de l'événement dans Google Calendar:",
        calendarError
      );
      // Continuer même si l'ajout au calendrier échoue
    }

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

// Helper function to get price per hour based on service
function getPricePerHour(service: string): number {
  switch (service) {
    case "recording":
      return 60;
    case "mixing":
      return 50;
    case "mastering":
      return 40;
    case "production":
      return 70;
    default:
      return 50;
  }
}
