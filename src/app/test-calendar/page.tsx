"use client";

import { useState } from "react";

interface TestResult {
  success?: boolean;
  error?: string;
  message?: string;
  eventsFound?: number;
  testEventCreated?: boolean;
  events?: any[];
  slots?: any[];
  [key: string]: any;
}

export default function CalendarTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dateToCheck, setDateToCheck] = useState(getTomorrowDate());

  // Récupérer la date de demain au format YYYY-MM-DD
  function getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }

  // Fonction pour tester l'API Google Calendar
  const testCalendarAPI = async () => {
    setIsLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const response = await fetch("/api/calendar-test");
      const data = await response.json();

      if (response.ok) {
        setTestResult(data);
      } else {
        setError(
          data.error ||
            "Une erreur est survenue lors du test de l&apos;API Calendar"
        );
      }
    } catch (error) {
      setError(
        "Erreur lors de la communication avec l&apos;API: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour tester l'API de débogage du calendrier
  const checkCalendarEvents = async () => {
    setIsLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const response = await fetch(`/api/debug-calendar?date=${dateToCheck}`);
      const data = await response.json();

      if (response.ok) {
        setTestResult(data);
      } else {
        setError(
          data.error ||
            "Une erreur est survenue lors de la récupération des événements"
        );
      }
    } catch (error) {
      setError(
        "Erreur lors de la communication avec l&apos;API: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour tester l'API d'availability
  const checkAvailability = async () => {
    setIsLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const response = await fetch(
        `/api/availability?date=${dateToCheck}&duration=1`
      );
      const data = await response.json();

      if (response.ok) {
        setTestResult(data);
      } else {
        setError(
          data.error ||
            "Une erreur est survenue lors de la récupération des créneaux disponibles"
        );
      }
    } catch (error) {
      setError(
        "Erreur lors de la communication avec l&apos;API: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">
        Test de l&apos;API Google Calendar
      </h1>

      <div className="mb-8 bg-card p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-medium mb-4">
          Diagnostiquer l&apos;API Calendar
        </h2>

        <button
          onClick={testCalendarAPI}
          disabled={isLoading}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg mr-2"
        >
          {isLoading ? "Test en cours..." : "Tester l&apos;API Calendar"}
        </button>
      </div>

      <div className="mb-8 bg-card p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-medium mb-4">
          Vérifier les événements pour une date
        </h2>

        <div className="mb-4">
          <label className="block mb-2">Date à vérifier:</label>
          <input
            type="date"
            value={dateToCheck}
            onChange={(e) => setDateToCheck(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-card-hover border border-gray-700 focus:border-primary focus:ring-primary mb-4"
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={checkCalendarEvents}
              disabled={isLoading}
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg"
            >
              {isLoading ? "Vérification..." : "Vérifier les événements"}
            </button>

            <button
              onClick={checkAvailability}
              disabled={isLoading}
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg"
            >
              {isLoading
                ? "Vérification..."
                : "Vérifier les créneaux disponibles"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/30 rounded-lg p-4 mb-6">
          <h3 className="text-error font-medium mb-2">Erreur</h3>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {testResult && (
        <div className="bg-card p-6 rounded-xl shadow-lg overflow-hidden">
          <h3 className="text-xl font-medium mb-4">Résultats</h3>

          <div className="bg-card-hover p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm whitespace-pre-wrap break-all">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
