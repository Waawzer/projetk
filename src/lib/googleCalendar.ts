import { google, calendar_v3 } from "googleapis";

// Étendre les scopes pour avoir accès en lecture et écriture
const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.events.readonly",
  "https://www.googleapis.com/auth/calendar.readonly",
];
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";

// Initialiser l'authentification avec les identifiants
const getCalendarClient = (): calendar_v3.Calendar => {
  try {
    // Vérifier que les variables d'environnement sont définies
    if (!process.env.GOOGLE_CLIENT_EMAIL) {
      console.error("Erreur: GOOGLE_CLIENT_EMAIL n'est pas défini");
      throw new Error("GOOGLE_CLIENT_EMAIL n'est pas défini");
    }

    if (!process.env.GOOGLE_PRIVATE_KEY) {
      console.error("Erreur: GOOGLE_PRIVATE_KEY n'est pas défini");
      throw new Error("GOOGLE_PRIVATE_KEY n'est pas défini");
    }

    if (!CALENDAR_ID) {
      console.error(
        "Erreur: GOOGLE_CALENDAR_ID n'est pas défini, utilisation du calendrier 'primary'"
      );
    }

    // Nettoyer la clé privée (plusieurs façons possibles selon le format)
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;

    // Remplacer les échappements de nouvelle ligne par de vraies nouvelles lignes
    if (privateKey?.includes("\\n")) {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }

    console.log(
      "Tentative d'authentification avec le compte de service:",
      process.env.GOOGLE_CLIENT_EMAIL
    );
    console.log("Calendrier cible:", CALENDAR_ID);

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: privateKey,
      scopes: SCOPES,
    });

    return google.calendar({ version: "v3", auth });
  } catch (error) {
    console.error(
      "Erreur lors de l'initialisation du client Google Calendar:",
      error
    );
    throw error;
  }
};

// Récupérer les événements pour une journée spécifique
export async function getEventsForDay(
  dateStr: string
): Promise<calendar_v3.Schema$Event[]> {
  try {
    // Création de la date de manière fiable sans décalage de fuseau horaire
    // Format de dateStr attendu: YYYY-MM-DD
    const [year, month, day] = dateStr.split("-").map(Number);

    // Créer la date en utilisant les composants individuels (mois est 0-indexé en JS)
    const date = new Date(year, month - 1, day);

    console.log(`Date précise demandée: ${dateStr}`);
    console.log(`Date interprétée: ${date.toISOString().split("T")[0]}`);

    // Important: Définir le début et la fin de la journée dans le fuseau horaire local
    // On ajoute une marge de sécurité de +/- 12h pour être sûr de couvrir toute la journée quelle que soit la timezone

    // Début: minuit le jour même - 12h
    const startDate = new Date(date);
    startDate.setHours(-12, 0, 0, 0);

    // Fin: minuit le jour suivant + 12h
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(12, 0, 0, 0);

    // Définir les limites exactes de la journée pour le filtrage ultérieur
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    console.log(
      `Récupération des événements avec marge étendue pour le ${date.toLocaleDateString()}`
    );
    console.log(`  Date de début étendue: ${startDate.toLocaleString()}`);
    console.log(`  Date de fin étendue: ${endDate.toLocaleString()}`);

    // Récupérer les événements sur une période étendue
    const allEvents = await getCalendarEvents(startDate, endDate);

    // Filtrer pour ne garder que les événements qui chevauchent la journée demandée
    const filteredEvents = allEvents.filter((event) => {
      // Convertir les dates de l'événement en objets Date
      const eventStart = event.start?.dateTime
        ? new Date(event.start.dateTime)
        : new Date(event.start.date);

      const eventEnd = event.end?.dateTime
        ? new Date(event.end.dateTime)
        : new Date(event.end.date);

      // Un événement chevauche la journée si:
      // (début de l'événement <= fin de la journée) ET (fin de l'événement >= début de la journée)
      const overlapsDay = eventStart <= dayEnd && eventEnd >= dayStart;

      if (!overlapsDay) {
        console.log(
          `Événement "${
            event.summary
          }" exclu: ne chevauche pas le ${date.toLocaleDateString()}`
        );
      }

      return overlapsDay;
    });

    console.log(
      `Après filtrage: ${filteredEvents.length}/${allEvents.length} événements concernent ce jour`
    );

    return filteredEvents;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des événements du jour:",
      error
    );
    throw error;
  }
}

// Récupérer tous les événements entre deux dates
export async function getCalendarEvents(
  startDate: Date,
  endDate: Date
): Promise<calendar_v3.Schema$Event[]> {
  try {
    // Formater les dates pour l'API Google Calendar
    const timeMin = startDate.toISOString();
    const timeMax = endDate.toISOString();

    console.log(`Recherche d'événements entre ${timeMin} et ${timeMax}`);

    const calendar = getCalendarClient();
    console.log(
      `Récupération des événements du calendrier ${CALENDAR_ID} entre ${startDate.toISOString()} et ${endDate.toISOString()}`
    );

    // Assurons-nous que les dates sont formatées correctement pour l'API
    const timeMinFormatted = startDate.toISOString();
    const timeMaxFormatted = endDate.toISOString();

    console.log(
      `Dates formatées pour l'API: ${timeMinFormatted} à ${timeMaxFormatted}`
    );

    // Ajouter un gestionnaire d'erreur spécifique
    try {
      const response = await calendar.events.list({
        calendarId: CALENDAR_ID,
        timeMin: timeMinFormatted,
        timeMax: timeMaxFormatted,
        singleEvents: true,
        orderBy: "startTime",
        // Augmentons le nombre maximum d'événements à récupérer
        maxResults: 100,
      });

      console.log(`Événements récupérés: ${response.data.items?.length || 0}`);

      if (response.data.items?.length) {
        response.data.items.forEach((event, index) => {
          console.log(`Événement ${index + 1}: ${event.summary}`);
          console.log(`  Début: ${event.start?.dateTime || event.start?.date}`);
          console.log(`  Fin: ${event.end?.dateTime || event.end?.date}`);
          console.log(
            `  Type: ${event.start?.dateTime ? "horaire" : "journée entière"}`
          );

          // Ajouter plus d'informations pour le debug
          const startAsDate = event.start?.dateTime
            ? new Date(event.start.dateTime)
            : new Date(event.start.date);

          const endAsDate = event.end?.dateTime
            ? new Date(event.end.dateTime)
            : new Date(event.end.date);

          console.log(
            `  Heure de début (formatée): ${startAsDate.toLocaleString()}`
          );
          console.log(
            `  Heure de fin (formatée): ${endAsDate.toLocaleString()}`
          );
          console.log(`  Status: ${event.status || "non défini"}`);
          console.log(`  ID: ${event.id}`);
        });
      } else {
        console.log(
          "ATTENTION: Aucun événement trouvé dans le calendrier pour cette période"
        );
        console.log(
          "Vérifiez les permissions du compte de service et les événements dans le calendrier"
        );
      }

      return response.data.items || [];
    } catch (apiError) {
      console.error("Erreur de l'API Google Calendar:", apiError);
      console.error("Détails:", JSON.stringify(apiError, null, 2));
      throw new Error(
        `Erreur de l'API Google Calendar: ${
          apiError instanceof Error ? apiError.message : String(apiError)
        }`
      );
    }
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des événements du calendrier:",
      error
    );
    throw error;
  }
}

// Ajouter un événement au calendrier
export async function createCalendarEvent(
  summary: string,
  description: string,
  startDateTime: Date,
  endDateTime: Date,
  email?: string
): Promise<calendar_v3.Schema$Event> {
  try {
    const calendar = getCalendarClient();

    // Ajouter l'email au descriptif si fourni (au lieu d'inviter)
    const enhancedDescription = email
      ? `${description}\n\nEmail du client: ${email}`
      : description;

    const event: calendar_v3.Schema$Event = {
      summary,
      description: enhancedDescription,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "Europe/Paris",
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "Europe/Paris",
      },
    };

    // Ne pas ajouter d'invités car cela nécessite une délégation à l'échelle du domaine
    // que nous n'avons probablement pas configurée
    // Nous allons simplement ajouter l'email au descriptif de l'événement

    // Tentative de création de l'événement sans invités
    try {
      const response = await calendar.events.insert({
        calendarId: CALENDAR_ID,
        requestBody: event,
      });

      console.log("Événement créé avec succès sans invités");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de l'événement:", error);
      throw error;
    }
  } catch (error) {
    console.error(
      "Erreur lors de la création de l'événement dans le calendrier:",
      error
    );
    throw error;
  }
}

// Obtenir les créneaux disponibles pour une journée donnée
export async function getAvailableTimeSlots(
  date: string,
  durationInHours: number
): Promise<TimeSlot[]> {
  try {
    console.log(
      `Recherche des créneaux pour le ${date} avec une durée de ${durationInHours}h`
    );

    // S'assurer que la date est exactement celle qui est demandée
    // Format attendu de date: "YYYY-MM-DD"
    const [year, month, day] = date.split("-").map(Number);

    console.log(
      `Date exacte demandée: ${date} (Année: ${year}, Mois: ${month}, Jour: ${day})`
    );

    // Créer une date locale sans décalage horaire
    // Le mois en JavaScript est 0-indexé (0-11), donc on soustrait 1
    const targetDate = new Date(year, month - 1, day);

    // Vérification que la date est bien celle attendue
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth() + 1; // Ajouter 1 pour revenir à 1-12
    const targetDay = targetDate.getDate();

    console.log(`Date créée: ${targetDate.toLocaleString()}`);
    console.log(
      `Composants de la date: Année=${targetYear}, Mois=${targetMonth}, Jour=${targetDay}`
    );

    // Vérifier que nous avons bien la date demandée
    if (targetYear !== year || targetMonth !== month || targetDay !== day) {
      console.error(`⚠️ ERREUR: Décalage de date détecté!`);
      console.error(`Date demandée: ${year}-${month}-${day}`);
      console.error(`Date obtenue: ${targetYear}-${targetMonth}-${targetDay}`);
    }

    const dayOfWeek = targetDate.getDay();

    // En France, les horaires d'ouverture du service sont généralement entre 9h et 20h
    const openingTime = 9; // 9h00
    const hardClosingTime = 22; // 22h00 - heure limite absolue

    // Calcul de l'heure maximum de début en fonction de l'heure de fermeture stricte et de la durée
    const maxStartHour = hardClosingTime - durationInHours;
    console.log(
      `Calcul de l'heure maximum de début: ${hardClosingTime}h - ${durationInHours}h = ${maxStartHour}h`
    );

    // L'heure de fermeture standard est 21h (au lieu de 20h), mais on s'assure que la réservation ne dépasse pas l'heure limite
    const closingTime = Math.min(21, maxStartHour);
    console.log(
      `Heure de fermeture effective: ${closingTime}h (minimum entre 21h et ${maxStartHour}h)`
    );

    // Uniquement le dimanche (0) est fermé, le samedi (6) est ouvert
    if (dayOfWeek === 0) {
      console.log("Jour fermé (dimanche)");
      return [];
    }

    // Vérifier si c'est aujourd'hui
    const now = new Date();
    const isToday =
      now.getFullYear() === targetYear &&
      now.getMonth() + 1 === targetMonth &&
      now.getDate() === targetDay;

    // Si c'est aujourd'hui, adapter l'heure d'ouverture pour ne pas proposer de créneaux déjà passés
    let adjustedOpeningTime = openingTime;

    if (isToday) {
      console.log(
        "La date demandée est aujourd'hui, vérification des heures passées"
      );
      // Ajouter une marge de 2 heures (ne pas proposer de créneaux dans les 2 heures qui viennent)
      const currentHour = now.getHours();
      const safetyMargin = 2; // Marge de sécurité de deux heures
      adjustedOpeningTime = Math.max(openingTime, currentHour + safetyMargin);
      console.log(
        `Heure d'ouverture ajustée: ${adjustedOpeningTime}h (heure actuelle: ${currentHour}h + marge de ${safetyMargin}h)`
      );

      // Si l'heure ajustée dépasse l'heure de fermeture, aucun créneau n'est disponible
      if (adjustedOpeningTime > closingTime) {
        console.log(
          "Tous les créneaux d'aujourd'hui sont déjà passés ou indisponibles"
        );
        return [];
      }
    }

    // Suppression de la vérification spéciale pour le 04/04/2025

    // Récupérer les événements pour la journée
    const events = await getEventsForDay(date);
    console.log(`${events.length} événements trouvés pour la journée`);

    // Debug de chaque événement pour comprendre pourquoi ils ne sont pas détectés
    events.forEach((event, index) => {
      console.log(`Détail de l'événement ${index + 1}: ${event.summary}`);
      if (event.start?.dateTime) {
        console.log(
          `  Start DateTime: ${event.start.dateTime} (${new Date(
            event.start.dateTime
          ).toLocaleString()})`
        );
      }
      if (event.start?.date) {
        console.log(
          `  Start Date: ${event.start.date} (événement journée entière)`
        );
      }
      if (event.end?.dateTime) {
        console.log(
          `  End DateTime: ${event.end.dateTime} (${new Date(
            event.end.dateTime
          ).toLocaleString()})`
        );
      }
      if (event.end?.date) {
        console.log(
          `  End Date: ${event.end.date} (événement journée entière)`
        );
      }
    });

    const reservationDurationMs = durationInHours * 60 * 60 * 1000;
    const slotIntervalMinutes = 60; // Intervalle d'une heure entre les créneaux disponibles
    const slotIntervalMs = slotIntervalMinutes * 60 * 1000;

    // Déterminer les plages horaires déjà réservées
    const busyIntervals: BusyInterval[] = events.map((event) => {
      // S'assurer que la date de début et de fin sont bien des objets Date
      let startDateTime: Date;
      let endDateTime: Date;

      // Gestion des événements toute la journée vs événements avec une heure précise
      if (event.start?.dateTime) {
        // Événement avec une heure précise
        startDateTime = new Date(event.start.dateTime);
        endDateTime = new Date(event.end.dateTime);
      } else {
        // Événement toute la journée
        startDateTime = new Date(event.start.date);
        startDateTime.setHours(0, 0, 0, 0); // Début à minuit

        // Pour les événements toute la journée, la date de fin est exclusive selon l'API Google Calendar
        // (c'est-à-dire qu'elle n'est pas incluse dans l'événement)
        if (event.end?.date) {
          // Si une date de fin est spécifiée, on utilise la veille à 23:59:59
          endDateTime = new Date(event.end.date);
          // Ne pas décrémenter la date ici, car Google renvoie déjà la date du lendemain
        } else {
          // Si pas de date de fin, on utilise la même date
          endDateTime = new Date(startDateTime);
        }

        // Bloquer toute la journée
        endDateTime.setHours(23, 59, 59, 999);
      }

      console.log(
        `Conversion de l'événement "${event.summary}" en intervalle occupé:`
      );
      console.log(
        `  Type: ${
          event.start?.dateTime ? "Horaire précis" : "Journée entière"
        }`
      );
      console.log(
        `  De ${startDateTime.toLocaleString()} à ${endDateTime.toLocaleString()}`
      );

      return {
        start: startDateTime,
        end: endDateTime,
      };
    });

    // Si aucun événement n'a été trouvé via l'API, afficher un avertissement mais ne pas ajouter d'événement synthétique
    if (events.length === 0) {
      console.warn(
        "ATTENTION: Aucun événement n'a été trouvé via l'API Google Calendar."
      );
      console.warn(
        "Vérifiez les permissions du compte de service et que des événements existent dans le calendrier."
      );
    }

    // Suppression complète de l'événement fictif pour le 04/04/2025

    // Générer les créneaux disponibles
    const availableSlots: TimeSlot[] = [];

    // Date de début de la journée (à l'heure d'ouverture)
    const dayStart = new Date(date);
    dayStart.setHours(adjustedOpeningTime, 0, 0, 0);

    // Date de fin de la journée (à l'heure de fermeture)
    const dayEnd = new Date(date);
    dayEnd.setHours(closingTime, 0, 0, 0);

    console.log(
      `Plage de recherche: ${dayStart.toLocaleTimeString()} - ${dayEnd.toLocaleTimeString()}`
    );
    console.log(
      `Durée de réservation: ${durationInHours}h (${
        reservationDurationMs / (60 * 60 * 1000)
      }h)`
    );

    // Vérifier chaque créneau horaire possible
    for (
      let slotStart = new Date(dayStart);
      slotStart <= dayEnd;
      slotStart = new Date(slotStart.getTime() + slotIntervalMs)
    ) {
      const slotEnd = new Date(slotStart.getTime() + reservationDurationMs);

      // Vérifier si le créneau dépasse l'heure de fermeture stricte
      if (
        slotEnd.getHours() > hardClosingTime ||
        (slotEnd.getHours() === hardClosingTime && slotEnd.getMinutes() > 0)
      ) {
        console.log(
          `Créneau ignoré car il dépasse l'heure de fermeture stricte (${hardClosingTime}h): ${slotStart.toLocaleTimeString()} - ${slotEnd.toLocaleTimeString()}`
        );
        continue;
      }

      // Vérifier aussi que le début du créneau n'est pas après l'heure de fermeture standard
      if (slotStart > dayEnd) {
        console.log(
          `Créneau ignoré car le début (${slotStart.toLocaleTimeString()}) est après l'heure de fermeture (${dayEnd.toLocaleTimeString()})`
        );
        continue;
      }

      // Vérifier que le créneau est disponible (ne chevauche aucun événement existant)
      let isAvailable = true;
      for (const interval of busyIntervals) {
        // Chevauchement si:
        // (le début du créneau est avant la fin de l'intervalle occupé) ET
        // (la fin du créneau est après le début de l'intervalle occupé)
        if (slotStart < interval.end && slotEnd > interval.start) {
          isAvailable = false;
          console.log(
            `Créneau indisponible: ${slotStart.toLocaleTimeString()} - ${slotEnd.toLocaleTimeString()} (conflit avec ${interval.start.toLocaleTimeString()} - ${interval.end.toLocaleTimeString()})`
          );

          // Ajouter des logs détaillés sur le conflit
          console.log(`  Détail du conflit:
  - Début du créneau < Fin de l'événement? ${
    slotStart < interval.end ? "Oui" : "Non"
  } (${slotStart.toLocaleString()} < ${interval.end.toLocaleString()})
  - Fin du créneau > Début de l'événement? ${
    slotEnd > interval.start ? "Oui" : "Non"
  } (${slotEnd.toLocaleString()} > ${interval.start.toLocaleString()})`);
          break;
        }
      }

      if (isAvailable) {
        availableSlots.push({
          start: formatTime(slotStart),
          end: formatTime(slotEnd),
        });
        console.log(
          `Créneau disponible: ${formatTime(slotStart)} - ${formatTime(
            slotEnd
          )}`
        );
      }
    }

    return availableSlots;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des créneaux disponibles:",
      error
    );
    throw error;
  }
}

// Interfaces pour la gestion des créneaux
export interface TimeSlot {
  start: string;
  end: string;
}

interface BusyInterval {
  start: Date;
  end: Date;
}

// Formater l'heure au format HH:MM
function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Supprimer un événement dans Google Calendar
export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  try {
    if (!eventId) {
      console.error("ID d'événement manquant pour la suppression");
      return false;
    }

    const calendar = getCalendarClient();

    console.log(
      `Suppression de l'événement Google Calendar avec ID: ${eventId}`
    );

    await calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId: eventId,
    });

    console.log(`Événement Google Calendar supprimé avec succès: ${eventId}`);
    return true;
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de l'événement dans Google Calendar:",
      error
    );
    if (error instanceof Error) {
      console.error("Message d'erreur:", error.message);
    }
    return false;
  }
}
