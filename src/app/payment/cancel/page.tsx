"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-xl shadow-lg p-6 md:p-8 text-center">
          <div className="w-16 h-16 bg-yellow-500/10 text-yellow-500 flex items-center justify-center rounded-full mx-auto mb-4">
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>

          <h2 className="text-xl font-bold mb-2">Paiement annulé</h2>
          <p className="text-gray-400 mb-6">
            Votre paiement a été annulé. Aucun montant n&apos;a été débité.
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
      </div>
      <Footer />
    </div>
  );
}
