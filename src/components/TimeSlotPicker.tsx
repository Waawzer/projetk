"use client";

import { useState, useEffect } from "react";
import { FiClock, FiRefreshCw, FiAlertCircle, FiInfo } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

interface TimeSlot {
  start: string;
  end: string;
}

interface TimeSlotPickerProps {
  date: Date | null;
  duration: number | string;
  onTimeSlotSelect: (timeSlot: string) => void;
  selectedTimeSlot: string;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  date,
  duration,
  onTimeSlotSelect,
  selectedTimeSlot,
}) => {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTimeGroup, setActiveTimeGroup] = useState<string>("all");
  const [loadedSlots, setLoadedSlots] = useState<Record<string, TimeSlot[]>>(
    {}
  );

  // Créer une clé unique pour cette combinaison date+durée
  const slotCacheKey = date
    ? `${date.toISOString().split("T")[0]}_${duration}`
    : "";

  useEffect(() => {
    if (!date) {
      setAvailableSlots([]);
      return;
    }

    // Si les créneaux pour cette date et cette durée sont déjà chargés, les utiliser
    if (slotCacheKey && loadedSlots[slotCacheKey]) {
      console.log(`Utilisation des créneaux mis en cache pour ${slotCacheKey}`);
      setAvailableSlots(loadedSlots[slotCacheKey]);
      return;
    }

    const fetchAvailableSlots = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Correction: utiliser une date locale pour éviter le décalage d'un jour
        // Au lieu de toISOString qui utilise UTC et peut causer un décalage
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;

        console.log(
          `Chargement des créneaux pour ${formattedDate} avec durée ${duration}h`
        );
        console.log(`Date sélectionnée (objet Date): ${date.toLocaleString()}`);
        console.log(`Date formattée pour l'API: ${formattedDate}`);

        const response = await fetch(
          `/api/availability?date=${formattedDate}&duration=${duration}`
        );

        if (!response.ok) {
          throw new Error(
            "Erreur lors de la récupération des créneaux disponibles"
          );
        }

        const data = await response.json();

        // Vérifier côté client que les créneaux ne dépassent pas 22h
        const hardClosingTime = 22; // Heure de fermeture stricte (22h)
        const filteredSlots = data.slots.filter((slot) => {
          const [hour, minute] = slot.end.split(":").map(Number);
          return (
            hour < hardClosingTime || (hour === hardClosingTime && minute === 0)
          );
        });

        setAvailableSlots(filteredSlots);

        // Mettre en cache les créneaux pour cette date et cette durée
        if (slotCacheKey) {
          setLoadedSlots((prev) => ({
            ...prev,
            [slotCacheKey]: filteredSlots,
          }));
        }

        // Si aucun créneau n'est disponible, afficher un message
        if (filteredSlots.length === 0) {
          setError(
            "Aucun créneau disponible pour cette date. Veuillez sélectionner une autre date."
          );
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Une erreur est survenue"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [date, duration, slotCacheKey, loadedSlots]);

  const formatDate = (date: Date | null) => {
    if (!date) return "Sélectionnez une date";

    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Groupe les créneaux par période de la journée
  const groupTimeSlots = () => {
    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];
    const evening: TimeSlot[] = [];

    availableSlots.forEach((slot) => {
      const hour = parseInt(slot.start.split(":")[0]);

      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 17) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  };

  const { morning, afternoon, evening } = groupTimeSlots();

  // Filtrer les créneaux selon le groupe actif
  const filteredSlots =
    activeTimeGroup === "all"
      ? availableSlots
      : activeTimeGroup === "morning"
      ? morning
      : activeTimeGroup === "afternoon"
      ? afternoon
      : evening;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-3">
        Créneaux disponibles le {formatDate(date)}
      </h3>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <FiRefreshCw className="animate-spin text-primary mr-2" size={20} />
          <span>Chargement des créneaux disponibles...</span>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-error/10 border border-error/30 rounded-lg p-4 flex items-start">
          <FiAlertCircle className="text-error mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!isLoading && !error && availableSlots.length > 0 && (
        <>
          {/* Filtres de période */}
          <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
            <button
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                activeTimeGroup === "all"
                  ? "bg-primary text-white"
                  : "bg-card-hover text-gray-300 hover:text-white"
              }`}
              onClick={() => setActiveTimeGroup("all")}
            >
              Tous ({availableSlots.length})
            </button>
            {morning.length > 0 && (
              <button
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  activeTimeGroup === "morning"
                    ? "bg-primary text-white"
                    : "bg-card-hover text-gray-300 hover:text-white"
                }`}
                onClick={() => setActiveTimeGroup("morning")}
              >
                Matin ({morning.length})
              </button>
            )}
            {afternoon.length > 0 && (
              <button
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  activeTimeGroup === "afternoon"
                    ? "bg-primary text-white"
                    : "bg-card-hover text-gray-300 hover:text-white"
                }`}
                onClick={() => setActiveTimeGroup("afternoon")}
              >
                Après-midi ({afternoon.length})
              </button>
            )}
            {evening.length > 0 && (
              <button
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  activeTimeGroup === "evening"
                    ? "bg-primary text-white"
                    : "bg-card-hover text-gray-300 hover:text-white"
                }`}
                onClick={() => setActiveTimeGroup("evening")}
              >
                Soir ({evening.length})
              </button>
            )}
          </div>

          {/* Créneaux disponibles */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTimeGroup}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4"
            >
              {filteredSlots.map((slot, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15, delay: index * 0.03 }}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                    selectedTimeSlot === slot.start
                      ? "bg-primary text-white border-primary ring-2 ring-primary ring-offset-2 ring-offset-card transform scale-105 shadow-lg"
                      : "bg-card-hover border-gray-700 hover:border-primary/50"
                  }`}
                  onClick={() => onTimeSlotSelect(slot.start)}
                >
                  <FiClock
                    className={`mb-1 ${
                      selectedTimeSlot === slot.start
                        ? "text-white"
                        : "text-primary"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      selectedTimeSlot === slot.start ? "text-white" : ""
                    }`}
                  >
                    {slot.start}
                  </span>
                  <span
                    className={`text-xs ${
                      selectedTimeSlot === slot.start
                        ? "text-white opacity-90"
                        : "opacity-80"
                    }`}
                  >
                    → {slot.end}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Infos sur la durée */}
          <div className="mt-4 flex items-start text-sm text-gray-400 bg-card-hover p-3 rounded-lg">
            <FiInfo className="mt-0.5 mr-2 flex-shrink-0 text-primary" />
            <p>
              Les créneaux affichés ont une durée de {duration} heure(s). Vous
              pouvez modifier la durée pour voir d&apos;autres disponibilités.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default TimeSlotPicker;
