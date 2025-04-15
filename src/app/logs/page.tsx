"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogsPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/view-logs");

      if (!response.ok) {
        if (response.status === 404) {
          setError(
            "Aucun fichier de log trouvé. Effectuez d'abord un paiement avec Stripe."
          );
        } else {
          setError(
            `Erreur lors de la récupération des logs (${response.status}): ${response.statusText}`
          );
        }
        setLogs([]);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setLogs(data.logs);
      } else {
        setError(data.message || "Erreur inconnue");
      }
    } catch (err) {
      setError(
        `Exception: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const refreshLogs = () => {
    fetchLogs();
  };

  const goToHome = () => {
    router.push("/");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Logs de Paiement Stripe</h1>
        <div className="space-x-2">
          <button
            onClick={refreshLogs}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Rafraîchir
          </button>
          <button
            onClick={goToHome}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Retour
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <div className="mt-4">
            <p>Essayez de suivre ces étapes :</p>
            <ol className="list-decimal ml-6 mt-2 space-y-1">
              <li>Effectuez un paiement avec Stripe</li>
              <li>
                Vérifiez que le dossier 'logs' existe à la racine du projet
              </li>
              <li>Redémarrez le serveur Next.js</li>
            </ol>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-4 text-gray-600">
            {logs.length} entrées de log{logs.length !== 1 && "s"} trouvée
            {logs.length !== 1 && "s"}
          </p>
          <div className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto">
            <pre className="whitespace-pre-wrap break-words font-mono text-sm">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className={`py-1 ${
                      log.includes("ERREUR")
                        ? "text-red-400"
                        : log.includes("POINT CRITIQUE")
                        ? "text-yellow-400"
                        : log.includes("succès")
                        ? "text-green-400"
                        : ""
                    }`}
                  >
                    {log}
                  </div>
                ))
              ) : (
                <p>Aucun log disponible.</p>
              )}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
