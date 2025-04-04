import { NextRequest, NextResponse } from "next/server";
import { getAvailableTimeSlots } from "@/lib/googleCalendar";

export async function GET(req: NextRequest) {
  try {
    // Récupérer les paramètres de la requête
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const durationParam = searchParams.get("duration");

    // Validation des paramètres
    if (!date) {
      return NextResponse.json(
        { error: "Le paramètre 'date' est requis" },
        { status: 400 }
      );
    }

    // Convertir et valider la durée (en heures) - par défaut 1 heure
    const duration = durationParam ? parseFloat(durationParam) : 1;
    if (isNaN(duration) || duration <= 0) {
      return NextResponse.json(
        { error: "La durée doit être un nombre positif (en heures)" },
        { status: 400 }
      );
    }

    console.log(
      `API: Recherche des créneaux pour le ${date} avec durée ${duration}h`
    );

    // Vérification supplémentaire de la date
    const [year, month, day] = date.split("-").map(Number);

    // La date est déjà au format YYYY-MM-DD, il n'y a pas besoin de conversion supplémentaire
    // Mais on vérifie quand même que les valeurs sont valides
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return NextResponse.json(
        {
          error: "Date invalide: mois doit être entre 1-12 et jour entre 1-31",
        },
        { status: 400 }
      );
    }

    console.log(
      `Date demandée: ${date} (Année: ${year}, Mois: ${month}, Jour: ${day})`
    );

    // Format de date attendu: 'YYYY-MM-DD'
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Format de date invalide. Utilisez le format 'YYYY-MM-DD'" },
        { status: 400 }
      );
    }

    // Récupérer les créneaux disponibles
    const slots = await getAvailableTimeSlots(date, duration);

    return NextResponse.json({
      date,
      duration,
      slots,
    });
  } catch (error) {
    console.error("Erreur API disponibilité:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des créneaux disponibles" },
      { status: 500 }
    );
  }
}
