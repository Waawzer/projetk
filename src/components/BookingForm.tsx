"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  FiCalendar,
  FiClock,
  FiCreditCard,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import { FaPaypal } from "react-icons/fa";
import TimeSlotPicker from "./TimeSlotPicker";
import DatePickerWithAvailability from "./DatePickerWithAvailability";

interface FormData {
  name: string;
  email: string;
  phone: string;
  date: Date;
  time: string;
  service: string;
  duration: string;
  notes: string;
  paymentMethod: "card" | "paypal";
}

const BookingForm = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [isProcessingPayPal, setIsProcessingPayPal] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      service: "",
      duration: "2",
      paymentMethod: "card",
    },
  });

  const selectedService = watch("service");
  const selectedDuration = watch("duration");

  // Effet pour vérifier si l'utilisateur revient de PayPal (avec des paramètres dans l'URL)
  useEffect(() => {
    // Nous n'avons plus besoin de vérifier les paramètres d'URL ici
    // car c'est maintenant la page payment/success qui s'en occupe
  }, []);

  // Calculate deposit amount (50% of total)
  const getPricePerHour = () => {
    switch (selectedService) {
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
  };

  const getTotalPrice = () => {
    return getPricePerHour() * parseInt(selectedDuration || "1");
  };

  const getDepositAmount = () => {
    return getTotalPrice() * 0.5;
  };

  const nextStep = () => {
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  // Fonction pour créer un paiement PayPal et rediriger l'utilisateur
  const handlePayPalPayment = async (bookingId: string, data: FormData) => {
    try {
      setIsProcessingPayPal(true);

      // Déterminer le service label pour PayPal
      const serviceLabel = (() => {
        switch (data.service) {
          case "recording":
            return "Enregistrement";
          case "mixing":
            return "Mixage";
          case "mastering":
            return "Mastering";
          case "production":
            return "Production";
          default:
            return data.service;
        }
      })();

      // Créer un paiement PayPal
      const response = await fetch("/api/payment/paypal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: getDepositAmount(),
          bookingId: bookingId,
          service: serviceLabel,
          customerName: data.name,
          customerEmail: data.email,
          returnUrl: `${window.location.origin}/payment/success?bookingId=${bookingId}&type=deposit`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la création du paiement PayPal"
        );
      }

      const paymentData = await response.json();

      // Rediriger vers la page de paiement PayPal
      window.location.href = paymentData.approveUrl;
    } catch (error) {
      console.error("Erreur PayPal:", error);
      setBookingError(
        error instanceof Error ? error.message : "Erreur lors du paiement"
      );
      setIsProcessingPayPal(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setBookingError("");

    try {
      // Format the date and time for the API
      const bookingDate = new Date(data.date);
      const [hours, minutes] = data.time.split(":").map(Number);
      bookingDate.setHours(hours, minutes, 0);

      // Prepare booking data
      const bookingData = {
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone,
        service: data.service,
        date: bookingDate.toISOString(),
        time: data.time,
        duration: parseInt(data.duration),
        notes: data.notes,
        totalPrice: getTotalPrice(),
        depositAmount: getDepositAmount(),
        depositPaid: false,
        paymentMethod: data.paymentMethod,
        status: "pending",
      };

      // Log des données envoyées pour debug
      console.log("Données de réservation à envoyer:", bookingData);

      // Send booking data to API
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur API réservation:", errorData);
        throw new Error(
          errorData.error ||
            "Une erreur est survenue lors de la création de la réservation."
        );
      }

      // Récupérer l'ID de la réservation créée
      const booking = await response.json();
      const newBookingId = booking._id;
      setCurrentBookingId(newBookingId);

      // Si PayPal est sélectionné, rediriger vers PayPal
      if (data.paymentMethod === "paypal") {
        await handlePayPalPayment(newBookingId, data);
        return; // Sortir de la fonction car nous allons rediriger
      }

      // Pour les autres méthodes de paiement ou en cas de succès sans redirection
      setBookingSuccess(true);
      reset();
      setStep(1);

      // Reset success message after 5 seconds
      setTimeout(() => {
        setBookingSuccess(false);
      }, 5000);
    } catch (error) {
      setBookingError(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceOptions = [
    { value: "", label: "Sélectionnez un service", price: 0 },
    { value: "recording", label: "Enregistrement", price: 60 },
    { value: "mixing", label: "Mixage", price: 50 },
    { value: "mastering", label: "Mastering", price: 40 },
    { value: "production", label: "Production", price: 70 },
  ];

  const durationOptions = [
    { value: "2", label: "2 heures" },
    { value: "3", label: "3 heures" },
    { value: "4", label: "4 heures" },
    { value: "6", label: "Demi-journée (6 heures)" },
    { value: "10", label: "Journée complète (10 heures)" },
  ];

  if (bookingSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-card rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success/20 rounded-full mb-4">
            <FiCheck className="text-success" size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Réservation confirmée !</h2>
          <p className="text-gray-400">
            Votre réservation a été confirmée et un email de confirmation vous a
            été envoyé.
            {currentBookingId && (
              <span className="block mt-2 text-xs">
                Réf: {currentBookingId}
              </span>
            )}
          </p>
        </div>

        <div className="bg-card-hover p-6 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-4">
            Détails de la réservation
          </h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <FiCalendar className="text-primary mr-3" />
              <div>
                <p className="text-sm text-gray-400">Date</p>
                <p className="font-medium">Lundi 15 Avril 2023</p>
              </div>
            </div>
            <div className="flex items-center">
              <FiClock className="text-primary mr-3" />
              <div>
                <p className="text-sm text-gray-400">Heure</p>
                <p className="font-medium">14:00 - 16:00</p>
              </div>
            </div>
            <div className="flex items-center">
              <FiCreditCard className="text-primary mr-3" />
              <div>
                <p className="text-sm text-gray-400">Acompte payé</p>
                <p className="font-medium">60,00 €</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="flex justify-between items-center mb-8">
        <div className="w-full flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 1 ? "bg-primary text-white" : "bg-gray-700 text-gray-400"
            }`}
          >
            <FiCreditCard size={18} />
          </div>
          <div
            className={`flex-1 h-1 mx-2 ${
              step >= 2 ? "bg-primary" : "bg-gray-700"
            }`}
          ></div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 2 ? "bg-primary text-white" : "bg-gray-700 text-gray-400"
            }`}
          >
            <FiCalendar size={18} />
          </div>
          <div
            className={`flex-1 h-1 mx-2 ${
              step >= 3 ? "bg-primary" : "bg-gray-700"
            }`}
          ></div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 3 ? "bg-primary text-white" : "bg-gray-700 text-gray-400"
            }`}
          >
            <FiClock size={18} />
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-card rounded-xl shadow-lg overflow-hidden"
      >
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">
              Informations personnelles
            </h2>

            <div className="space-y-4">
              <div className="form-group">
                <label htmlFor="name">Nom complet</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Votre nom"
                  className={`${errors.name ? "border-error" : ""}`}
                  {...register("name", {
                    required: "Le nom est requis",
                    minLength: {
                      value: 2,
                      message: "Le nom doit contenir au moins 2 caractères",
                    },
                  })}
                />
                {errors.name && (
                  <p className="text-error text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  className={`${errors.email ? "border-error" : ""}`}
                  {...register("email", {
                    required: "L&apos;email est requis",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Adresse email invalide",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-error text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Téléphone</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Votre numéro de téléphone"
                  className={`${errors.phone ? "border-error" : ""}`}
                  {...register("phone", {
                    required: "Le numéro de téléphone est requis",
                    pattern: {
                      value: /^[0-9+\s()-]{8,15}$/,
                      message: "Numéro de téléphone invalide",
                    },
                  })}
                />
                {errors.phone && (
                  <p className="text-error text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={nextStep}
                className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg"
                disabled={
                  !isValid || !!errors.name || !!errors.email || !!errors.phone
                }
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Service and Date */}
        {step === 2 && (
          <div className="bg-card p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">
              Choisissez une date et un horaire
            </h2>

            <div className="mb-6">
              <label className="block mb-2 font-medium">Service</label>
              <select
                id="service"
                className={`w-full px-3 py-2 rounded-lg bg-card-hover border border-gray-700 focus:border-primary focus:ring-primary ${
                  errors.service ? "border-error" : ""
                }`}
                {...register("service", {
                  required: "Le service est requis",
                })}
              >
                {serviceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} {option.price > 0 && `- ${option.price} €/h`}
                  </option>
                ))}
              </select>
              {errors.service && (
                <p className="mt-1 text-error text-sm">
                  {errors.service.message}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium">Durée</label>
              <select
                id="duration"
                className={`w-full px-3 py-2 rounded-lg bg-card-hover border border-gray-700 focus:border-primary focus:ring-primary ${
                  errors.duration ? "border-error" : ""
                }`}
                {...register("duration", {
                  required: "La durée est requise",
                })}
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.duration && (
                <p className="mt-1 text-error text-sm">
                  {errors.duration.message}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium">
                Date de la réservation
              </label>
              <Controller
                name="date"
                control={control}
                rules={{ required: "Veuillez sélectionner une date" }}
                render={({ field }) => (
                  <DatePickerWithAvailability
                    selectedDate={field.value}
                    onDateChange={(date) => {
                      field.onChange(date);
                      setValue("time", ""); // Reset time when date changes
                    }}
                    minDate={new Date()}
                  />
                )}
              />
              {errors.date && (
                <p className="mt-1 text-error text-sm">{errors.date.message}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium">
                Heure de la réservation
              </label>
              <Controller
                name="time"
                control={control}
                rules={{ required: "Veuillez sélectionner un créneau horaire" }}
                render={({ field }) => (
                  <TimeSlotPicker
                    date={watch("date")}
                    duration={Number(selectedDuration)}
                    selectedTimeSlot={field.value}
                    onTimeSlotSelect={(time) => {
                      field.onChange(time);
                      // Pas besoin d'autres actions ici qui pourraient interférer avec la navigation
                    }}
                  />
                )}
              />
              {errors.time && (
                <p className="mt-1 text-error text-sm">{errors.time.message}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium">
                Notes ou demandes spéciales
              </label>
              <textarea
                id="notes"
                placeholder="Si vous avez des demandes spécifiques, merci de nous en informer ici."
                className="w-full px-3 py-2 rounded-lg bg-card-hover border border-gray-700 focus:border-primary focus:ring-primary h-32"
                {...register("notes")}
              ></textarea>
            </div>

            <div className="bg-card-hover p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-3">Résumé de votre réservation</h3>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Service</span>
                <span>
                  {selectedService &&
                    serviceOptions.find((opt) => opt.value === selectedService)
                      ?.label}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Durée</span>
                <span>
                  {selectedDuration &&
                    durationOptions.find(
                      (opt) => opt.value === selectedDuration
                    )?.label}
                </span>
              </div>
              {watch("date") && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Date</span>
                  <span>
                    {watch("date").toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              {watch("time") && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Créneau horaire</span>
                  <span className="font-medium text-primary">
                    {watch("time")}
                  </span>
                </div>
              )}
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Prix total estimé</span>
                <span className="font-medium">{getTotalPrice()} €</span>
              </div>
              <div className="flex justify-between border-t border-gray-700 pt-2 mt-2">
                <span className="text-gray-400">Acompte (50%)</span>
                <span className="font-medium text-primary">
                  {getDepositAmount()} €
                </span>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg"
              >
                Précédent
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={
                  !watch("service") ||
                  !watch("date") ||
                  !watch("time") ||
                  !watch("duration")
                }
                className={`${
                  !watch("service") ||
                  !watch("date") ||
                  !watch("time") ||
                  !watch("duration")
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-primary hover:bg-primary-hover"
                } text-white px-6 py-3 rounded-lg`}
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">
              Paiement de l&apos;acompte
            </h2>

            <div className="mb-6 p-4 bg-card-hover rounded-lg">
              <h3 className="text-lg font-medium mb-2">
                Récapitulatif de la réservation
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span>
                    {
                      serviceOptions.find((s) => s.value === selectedService)
                        ?.label
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{watch("date")?.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Heure:</span>
                  <span>{watch("time")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Durée:</span>
                  <span>{selectedDuration} heure(s)</span>
                </div>
                <div className="flex justify-between font-medium text-primary pt-2 border-t border-gray-700">
                  <span>Acompte à payer (50%):</span>
                  <span>{getDepositAmount()}€</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Méthode de paiement</h3>

              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-700 rounded-lg cursor-pointer hover:bg-card-hover transition-colors">
                  <input
                    type="radio"
                    value="card"
                    className="mr-3"
                    {...register("paymentMethod")}
                  />
                  <div className="flex items-center">
                    <div className="flex space-x-2 mr-3">
                      <div className="w-10 h-6 bg-blue-600 rounded"></div>
                      <div className="w-10 h-6 bg-red-500 rounded"></div>
                      <div className="w-10 h-6 bg-yellow-500 rounded"></div>
                    </div>
                    <span>Carte bancaire</span>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-700 rounded-lg cursor-pointer hover:bg-card-hover transition-colors">
                  <input
                    type="radio"
                    value="paypal"
                    className="mr-3"
                    {...register("paymentMethod")}
                  />
                  <div className="flex items-center">
                    <div className="w-16 h-6 bg-blue-700 rounded flex items-center justify-center text-white text-sm font-bold mr-3">
                      PayPal
                    </div>
                    <span>PayPal</span>
                  </div>
                </label>
              </div>
            </div>

            {bookingError && (
              <div className="mb-6 bg-error/10 border border-error/30 text-error rounded-lg p-4 flex items-center">
                <FiAlertCircle className="mr-2 flex-shrink-0" />
                <p>{bookingError}</p>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg"
                disabled={isSubmitting || isProcessingPayPal}
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isProcessingPayPal}
                className={`flex items-center justify-center px-6 py-3 rounded-lg ${
                  isSubmitting || isProcessingPayPal
                    ? "bg-primary/70 cursor-not-allowed"
                    : "bg-primary hover:bg-primary-hover"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Traitement en cours...
                  </>
                ) : isProcessingPayPal ? (
                  <>
                    <FaPaypal className="animate-pulse mr-2" />
                    Redirection vers PayPal...
                  </>
                ) : (
                  <>
                    {watch("paymentMethod") === "paypal" ? (
                      <FaPaypal className="mr-2" />
                    ) : (
                      <FiCreditCard className="mr-2" />
                    )}
                    Payer {getDepositAmount()}€
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default BookingForm;
