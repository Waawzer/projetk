import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  try {
    // Vérifier les variables d'environnement
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!clientEmail || !privateKey || !calendarId) {
      return NextResponse.json(
        {
          error: "Configuration de Google Calendar incomplète",
          clientEmail: clientEmail ? "Défini" : "Non défini",
          privateKey: privateKey ? "Défini" : "Non défini",
          calendarId: calendarId ? "Défini" : "Non défini",
        },
        { status: 500 }
      );
    }

    // Tentative d'authentification
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events",
      ],
    });

    const calendar = google.calendar({ version: "v3", auth });

    // Test 1: Vérifier que l'authentification fonctionne
    try {
      const calendarInfo = await calendar.calendars.get({
        calendarId: calendarId,
      });

      console.log("Calendrier trouvé:", calendarInfo.data.summary);
    } catch (error) {
      console.error("Erreur lors de l'accès au calendrier:", error);
      return NextResponse.json(
        {
          error: "Échec de l'accès au calendrier",
          message: error instanceof Error ? error.message : String(error),
          step: "get_calendar",
        },
        { status: 500 }
      );
    }

    // Test 2: Lister quelques événements
    try {
      const now = new Date();
      const oneMonthLater = new Date();
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

      const events = await calendar.events.list({
        calendarId: calendarId,
        timeMin: now.toISOString(),
        timeMax: oneMonthLater.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
      });

      const numberOfEvents = events.data.items?.length || 0;

      // Ajouter des logs détaillés
      console.log(`Nombre d'événements trouvés: ${numberOfEvents}`);
      if (events.data.items && events.data.items.length > 0) {
        events.data.items.forEach((event, index) => {
          console.log(`Événement ${index + 1}: ${event.summary}`);
        });
      }

      // Test 3: Créer un événement de test
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(11, 0, 0, 0);

      const eventResponse = await calendar.events.insert({
        calendarId: calendarId,
        requestBody: {
          summary: "Événement de test API",
          description:
            "Ceci est un événement créé automatiquement pour tester l'API",
          start: {
            dateTime: tomorrow.toISOString(),
            timeZone: "Europe/Paris",
          },
          end: {
            dateTime: tomorrowEnd.toISOString(),
            timeZone: "Europe/Paris",
          },
        },
      });

      return NextResponse.json({
        success: true,
        calendarId: calendarId,
        eventsFound: numberOfEvents,
        testEventCreated: !!eventResponse.data.id,
        testEventId: eventResponse.data.id,
        message:
          "Authentification et API Google Calendar fonctionnent correctement",
      });
    } catch (error) {
      console.error("Erreur lors du test des événements:", error);
      return NextResponse.json(
        {
          error: "Échec de la récupération ou création d'événements",
          message: error instanceof Error ? error.message : String(error),
          step: "events_test",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erreur dans le test de l'API Calendar:", error);
    return NextResponse.json(
      {
        error: "Erreur lors du test de l'API Calendar",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
