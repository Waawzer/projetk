"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const capturePayment = async () => {
      try {
        // Récupérer les paramètres d'URL
        const token = searchParams.get("token"); // PayPal
        const payerId = searchParams.get("PayerID"); // PayPal
        let sessionId = searchParams.get("session_id"); // Stripe

        // Gestion spéciale pour le cas où l'URL contient d'autres paramètres (solution pour le problème d'URL)
        if (!sessionId) {
          // Vérifier si session_id est dans un autre paramètre
          for (const [key] of Array.from(searchParams.entries())) {
            if (key.includes("session_id")) {
              const match = key.match(/session_id=([^&]+)/);
              if (match && match[1]) {
                sessionId = match[1];
                console.log("Session ID extrait de:", key, "->", sessionId);
                break;
              }
            }
          }
        }

        // Récupérer notre paramètre d'ID de réservation
        const bookingId = searchParams.get("bookingId");
        const type = searchParams.get("type") || "deposit";

        console.log("URL Params:", {
          token,
          payerId,
          sessionId,
          bookingId,
          type,
        });

        // Si nous venons de PayPal, nous aurons un token et un PayerID
        if (token && payerId && bookingId) {
          console.log("Capture de paiement PayPal avec token:", token);

          const response = await fetch(
            `/api/payment/paypal/capture?type=${type}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: token,
                bookingId: bookingId,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            console.error("Erreur de l'API:", errorData);
            throw new Error(
              errorData.error || "Erreur lors de la capture du paiement"
            );
          }

          const result = await response.json();
          console.log("Résultat de la capture PayPal:", result);

          setStatus("success");

          // Nettoyer l'URL
          if (typeof window !== "undefined") {
            window.history.replaceState({}, document.title, "/payment/success");
          }
          return;
        }

        // Si nous venons de Stripe, nous aurons un session_id
        if (sessionId && bookingId) {
          console.log(
            "Vérification du paiement Stripe avec sessionId:",
            sessionId
          );

          // Pour Stripe, le paiement est déjà capturé automatiquement
          // Mais nous devons vérifier le statut pour confirmer
          const response = await fetch(
            `/api/payment/stripe/check?session_id=${sessionId}&bookingId=${bookingId}&type=${type}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            console.error("Erreur de l'API Stripe:", errorData);
            throw new Error(
              errorData.error || "Erreur lors de la vérification du paiement"
            );
          }

          const result = await response.json();
          console.log("Résultat de la vérification Stripe:", result);

          setStatus("success");

          // Nettoyer l'URL
          if (typeof window !== "undefined") {
            window.history.replaceState({}, document.title, "/payment/success");
          }
          return;
        }

        // Si nous sommes arrivés ici sans paramètres de paiement
        if (!token && !payerId && !sessionId) {
          // Peut-être que l'utilisateur a actualisé la page après un paiement réussi
          setStatus("success");
          return;
        }

        // Paramètres manquants
        throw new Error("Paramètres de paiement manquants ou incomplets");
      } catch (error) {
        console.error("Erreur lors du traitement du paiement:", error);
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors du traitement du paiement"
        );
      }
    };

    capturePayment();
  }, [searchParams]);

  return (
    <div className="flex-grow flex items-center justify-center p-4 min-h-[600px]">
      <div className="max-w-md w-full bg-card rounded-xl shadow-lg p-6 md:p-8">
        {status === "loading" && (
          <div className="text-center">
            <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-bold mb-2">
              Traitement du paiement en cours
            </h2>
            <p className="text-gray-400">
              Veuillez patienter pendant que nous finalisons votre
              transaction...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto mb-4">
              <svg
                className="w-8 h-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Paiement réussi !</h2>
            <p className="text-gray-400 mb-6">
              Votre paiement a été traité avec succès et votre réservation est
              confirmée.
            </p>

            <div className="flex flex-col space-y-3">
              <Link
                href="/reservation"
                className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-colors"
              >
                Retour à la page de réservation
              </Link>
              <Link
                href="/"
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-error/10 text-error flex items-center justify-center rounded-full mx-auto mb-4">
              <svg
                className="w-8 h-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Une erreur est survenue</h2>
            <p className="text-gray-400 mb-6">
              {errorMessage ||
                "Impossible de traiter le paiement. Veuillez réessayer ou contacter le support."}
            </p>

            <div className="flex flex-col space-y-3">
              <Link
                href="/reservation"
                className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-colors"
              >
                Retour à la page de réservation
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <Suspense
        fallback={
          <div className="flex-grow flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-card rounded-xl shadow-lg p-6 md:p-8 text-center">
              <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <h2 className="text-xl font-bold mb-2">Chargement...</h2>
            </div>
          </div>
        }
      >
        <PaymentSuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
}
