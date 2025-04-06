import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    await dbConnect();
    const bookingId = params.bookingId;

    console.log(`Récupération des détails de la réservation: ${bookingId}`);

    // Vérifier que l'ID est valide
    if (!bookingId || bookingId.length !== 24) {
      return NextResponse.json(
        { error: "ID de réservation invalide" },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    console.log(`Réservation trouvée: ${bookingId}`);

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Erreur lors de la récupération de la réservation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la réservation" },
      { status: 500 }
    );
  }
}
