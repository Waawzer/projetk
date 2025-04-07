"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiSave, FiArrowLeft, FiCalendar, FiAlertCircle } from "react-icons/fi";
import DatePickerWithAvailability from "@/components/DatePickerWithAvailability";
import TimeSlotPicker from "@/components/TimeSlotPicker";

export default function NewBookingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // État du formulaire
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("2");
  const [notes, setNotes] = useState("");

  // Informations supplémentaires pour l'affichage des prix
  const [totalPrice, setTotalPrice] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);

  // Calculer les prix lorsque le service ou la durée change
  useEffect(() => {
    if (service && duration) {
      const pricePerHour = getPricePerHour(service);
      const durationValue = parseInt(duration);
      const total = pricePerHour * durationValue;

      setTotalPrice(total);
      setDepositAmount(total * 0.5);
    } else {
      setTotalPrice(0);
      setDepositAmount(0);
    }
  }, [service, duration]);

  // Obtenir la date minimale (aujourd'hui)
  const today = new Date();

  // Liste des services disponibles
  const serviceOptions = [
    { value: "", label: "Sélectionnez un service", price: 0 },
    { value: "recording", label: "Enregistrement", price: 60 },
    { value: "mixing", label: "Mixage", price: 50 },
    { value: "mastering", label: "Mastering", price: 40 },
    { value: "production", label: "Production", price: 70 },
  ];

  // Liste des durées disponibles
  const durationOptions = [
    { value: "2", label: "2 heures" },
    { value: "3", label: "3 heures" },
    { value: "4", label: "4 heures" },
    { value: "6", label: "Demi-journée (6 heures)" },
    { value: "10", label: "Journée complète (10 heures)" },
  ];

  // Fonction pour obtenir le prix par heure selon le service
  const getPricePerHour = (serviceType: string): number => {
    switch (serviceType) {
      case "recording":
        return 60;
      case "mixing":
        return 50;
      case "mastering":
        return 40;
      case "production":
        return 70;
      default:
        return 0;
    }
  };

  // Validation de l'email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Valider la saisie avant soumission
  const validateForm = (): boolean => {
    // Validation du formulaire
    if (!customerName.trim()) {
      setFormError("Le nom du client est requis.");
      return false;
    }

    if (!customerEmail.trim()) {
      setFormError("L'email du client est requis.");
      return false;
    }

    if (!isValidEmail(customerEmail)) {
      setFormError("L'email n'est pas valide.");
      return false;
    }

    if (!service) {
      setFormError("Le service est requis.");
      return false;
    }

    if (!date) {
      setFormError("La date est requise.");
      return false;
    }

    if (!time) {
      setFormError("L'heure est requise.");
      return false;
    }

    return true;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      // Convertir la date au format YYYY-MM-DD
      const formattedDate = date!.toISOString().split("T")[0];

      // Créer l'objet de réservation
      const bookingData = {
        customerName,
        customerEmail,
        customerPhone,
        service,
        date: formattedDate,
        time,
        duration: parseInt(duration),
        totalPrice,
        depositAmount,
        depositPaid: false, // Par défaut, l'acompte n'est pas payé
        remainingAmount: totalPrice - depositAmount,
        remainingPaid: false,
        notes,
        status: "confirmed", // Pour les réservations admin, on confirme directement
        addToGoogleCalendar: true, // Ajouter à Google Calendar
      };

      // Appel API pour créer la réservation
      const response = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la création de la réservation"
        );
      }

      setFormSuccess(
        "La réservation a été créée avec succès et ajoutée au calendrier Google !"
      );

      // Rediriger vers la liste des réservations après 2 secondes
      setTimeout(() => {
        router.push("/admin/bookings");
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la création de la réservation:", error);
      setFormError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la création de la réservation. Veuillez réessayer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Ajouter une réservation</h1>
          <p className="text-gray-400 mt-1">
            Créez une nouvelle réservation pour un client
          </p>
        </div>
        <Link
          href="/admin/bookings"
          className="flex items-center text-gray-400 hover:text-white"
        >
          <FiArrowLeft className="mr-2" />
          Retour à la liste
        </Link>
      </div>

      {formError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-lg mb-6 flex items-start">
          <FiAlertCircle className="flex-shrink-0 mr-2 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {formSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-500 p-4 rounded-lg mb-6">
          {formSuccess}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations du client */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium">Informations du client</h2>

            <div>
              <label
                htmlFor="customerName"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Nom du client <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Nom complet du client"
              />
            </div>

            <div>
              <label
                htmlFor="customerEmail"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email du client <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="customerEmail"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="email@exemple.com"
              />
            </div>

            <div>
              <label
                htmlFor="customerPhone"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Téléphone du client
              </label>
              <input
                type="tel"
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Numéro de téléphone"
              />
            </div>

            <div>
              <label
                htmlFor="service"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Service <span className="text-red-500">*</span>
              </label>
              <select
                id="service"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                {serviceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} {option.price > 0 && `- ${option.price}€/h`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Détails de la réservation */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium">Détails de la réservation</h2>

            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Durée <span className="text-red-500">*</span>
              </label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Date <span className="text-red-500">*</span>
              </label>
              <DatePickerWithAvailability
                selectedDate={date}
                onDateChange={(selectedDate) => {
                  setDate(selectedDate);
                  setTime(""); // Réinitialiser le créneau horaire
                }}
                minDate={today}
              />
            </div>

            <div>
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Heure <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {date ? (
                  <TimeSlotPicker
                    date={date}
                    duration={parseInt(duration)}
                    selectedTimeSlot={time}
                    onTimeSlotSelect={(selectedTime) => setTime(selectedTime)}
                  />
                ) : (
                  <div className="bg-gray-700 border border-gray-600 rounded-md shadow-sm p-4 text-gray-400">
                    <FiCalendar className="inline mr-2" />
                    Veuillez d&apos;abord sélectionner une date
                  </div>
                )}
              </div>
            </div>

            {/* Informations de prix */}
            {service && duration && (
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-2">
                  Informations de prix
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-400">Prix par heure:</div>
                  <div className="text-right">{getPricePerHour(service)}€</div>
                  <div className="text-gray-400">Prix total:</div>
                  <div className="text-right font-medium">{totalPrice}€</div>
                  <div className="text-gray-400">Acompte (50%):</div>
                  <div className="text-right">{depositAmount}€</div>
                  <div className="text-gray-400">Reste à payer:</div>
                  <div className="text-right">
                    {totalPrice - depositAmount}€
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Informations supplémentaires sur la réservation..."
          ></textarea>
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            href="/admin/bookings"
            className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 mr-4"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md flex items-center ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                Création en cours...
              </>
            ) : (
              <>
                <FiSave className="mr-2" />
                Créer la réservation
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
