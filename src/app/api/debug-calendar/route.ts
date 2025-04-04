import { NextRequest, NextResponse } from "next/server";
import { getCalendarEvents } from "@/lib/googleCalendar";

export async function GET(req: NextRequest) {
  try {
    // Récupérer les paramètres de requête
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    const daysParam = searchParams.get("days") || "1";

    if (!dateStr) {
      return NextResponse.json(
        { error: "Le paramètre 'date' est requis (format YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    // Valider le format de date
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return NextResponse.json(
        { error: "Format de date invalide. Utilisez le format 'YYYY-MM-DD'" },
        { status: 400 }
      );
    }

    // Nombre de jours à récupérer (à partir de la date spécifiée)
    const days = parseInt(daysParam);
    if (isNaN(days) || days < 1 || days > 31) {
      return NextResponse.json(
        { error: "Le paramètre 'days' doit être un nombre entre 1 et 31" },
        { status: 400 }
      );
    }

    // Construire les dates de début et de fin
    const startDate = new Date(dateStr);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days - 1);
    endDate.setHours(23, 59, 59, 999);

    console.log(
      `DEBUG: Recherche d'événements du ${startDate.toISOString()} au ${endDate.toISOString()}`
    );

    // Récupérer tous les événements dans cette plage
    const events = await getCalendarEvents(startDate, endDate);

    // Préparer une réponse détaillée
    const formattedEvents = events.map((event) => {
      // Déterminer si c'est un événement d'une journée entière ou avec une heure précise
      const isAllDay = !event.start?.dateTime;

      // Formater les dates de début et de fin
      let start, end;
      if (isAllDay) {
        start = event.start?.date;
        end = event.end?.date;
      } else {
        start = new Date(event.start?.dateTime || "").toLocaleString();
        end = new Date(event.end?.dateTime || "").toLocaleString();
      }

      return {
        id: event.id,
        summary: event.summary,
        description: event.description,
        start,
        end,
        isAllDay,
        status: event.status,
        creator: event.creator,
        created: event.created,
        updated: event.updated,
        attendees: event.attendees,
        // Informations brutes pour le débogage
        rawStart: event.start,
        rawEnd: event.end,
      };
    });

    return NextResponse.json({
      date: dateStr,
      days,
      totalEvents: events.length,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      events: formattedEvents,
    });
  } catch (error) {
    console.error("Erreur lors du débogage du calendrier:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des événements",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
