"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiArrowUp,
  FiArrowDown,
  FiStar,
} from "react-icons/fi";

interface Feature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  _id: string;
  title: string;
  price: number;
  description: string;
  features: Feature[];
  popular: boolean;
  order: number;
  createdAt: string;
}

export default function PricingPage() {
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<PricingPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const fetchPricingPlans = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/admin/pricing");

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des tarifs");
      }

      const data = await response.json();
      setPricingPlans(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des tarifs:", error);
      setError(
        "Impossible de charger les tarifs. Veuillez réessayer plus tard."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (plan: PricingPlan) => {
    setPlanToDelete(plan);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!planToDelete) return;

    try {
      setIsLoading(true);

      const response = await fetch(
        `/api/admin/pricing?id=${planToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du tarif");
      }

      // Mettre à jour l'état local après la suppression
      setPricingPlans(
        pricingPlans.filter((plan) => plan._id !== planToDelete._id)
      );
      setShowDeleteModal(false);
      setPlanToDelete(null);

      // Afficher une notification de succès (non implémentée dans cet exemple)
    } catch (error) {
      console.error("Erreur lors de la suppression du tarif:", error);
      setError(
        "Erreur lors de la suppression du tarif. Veuillez réessayer plus tard."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPlanToDelete(null);
  };

  const handleMoveUp = async (planId: string) => {
    const planIndex = pricingPlans.findIndex((plan) => plan._id === planId);
    if (planIndex <= 0) return; // Déjà en haut

    try {
      setIsLoading(true);

      const currentPlan = pricingPlans[planIndex];
      const newOrder = pricingPlans[planIndex - 1].order;

      const response = await fetch("/api/admin/pricing", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: currentPlan._id,
          order: newOrder,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la modification de l'ordre");
      }

      // Récupérer les plans mis à jour
      const updatedPlans = await response.json();
      setPricingPlans(updatedPlans);
    } catch (error) {
      console.error("Erreur lors de la modification de l'ordre:", error);
      setError(
        "Erreur lors de la modification de l'ordre. Veuillez réessayer plus tard."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveDown = async (planId: string) => {
    const planIndex = pricingPlans.findIndex((plan) => plan._id === planId);
    if (planIndex >= pricingPlans.length - 1) return; // Déjà en bas

    try {
      setIsLoading(true);

      const currentPlan = pricingPlans[planIndex];
      const newOrder = pricingPlans[planIndex + 1].order;

      const response = await fetch("/api/admin/pricing", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: currentPlan._id,
          order: newOrder,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la modification de l'ordre");
      }

      // Récupérer les plans mis à jour
      const updatedPlans = await response.json();
      setPricingPlans(updatedPlans);
    } catch (error) {
      console.error("Erreur lors de la modification de l'ordre:", error);
      setError(
        "Erreur lors de la modification de l'ordre. Veuillez réessayer plus tard."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && pricingPlans.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            Gestion des tarifs
          </h1>
          <p className="text-gray-400 mt-2">
            Gérez les tarifs affichés sur votre site
          </p>
        </div>
        <Link
          href="/admin/pricing/new"
          className="mt-4 md:mt-0 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg flex items-center justify-center transition-all duration-200 shadow-lg shadow-primary/20"
        >
          <FiPlus className="mr-2" />
          Ajouter un tarif
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-lg mb-6 animate-fade-in">
          {error}
          <button
            onClick={fetchPricingPlans}
            className="ml-4 text-red-500 hover:text-red-400 underline hover:no-underline transition-all duration-200"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Pricing plans list */}
      {pricingPlans.length === 0 ? (
        <div className="bg-card border border-gray-800 rounded-xl p-12 text-center shadow-xl">
          <div className="bg-background/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiStar className="text-primary" size={32} />
          </div>
          <h3 className="text-xl font-medium text-gray-200">
            Aucun tarif trouvé
          </h3>
          <p className="mt-2 text-gray-400">
            Vous n&apos;avez pas encore ajouté de tarifs
          </p>
          <Link
            href="/admin/pricing/new"
            className="mt-6 inline-flex items-center px-4 py-2 rounded-lg text-primary hover:text-white hover:bg-primary/20 transition-all duration-200"
          >
            <FiPlus className="mr-2" />
            Créer votre premier tarif
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-gray-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Prix (€/h)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Fonctionnalités
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Ordre
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {pricingPlans.map((plan) => (
                  <tr
                    key={plan._id}
                    className="group hover:bg-background/50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-200">
                        {plan.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                        {plan.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-primary">
                        {plan.price} €
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                        {plan.features.length} fonctionnalités
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {plan.popular ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                          <FiStar className="mr-1" size={12} />
                          Populaire
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-400">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-300">
                          {plan.order}
                        </span>
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => handleMoveUp(plan._id)}
                            disabled={plan.order === 1}
                            className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            <FiArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => handleMoveDown(plan._id)}
                            disabled={plan.order === pricingPlans.length}
                            className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            <FiArrowDown size={14} />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end items-center space-x-3">
                        <Link
                          href={`/admin/pricing/${plan._id}/edit`}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
                        >
                          <FiEdit2 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(plan)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && planToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-black/75 backdrop-blur-sm"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-card rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-800">
              <div className="bg-card px-6 pt-6 pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 sm:mx-0 sm:h-10 sm:w-10">
                    <FiTrash2 className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-medium text-gray-200">
                      Supprimer le tarif
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">
                        Êtes-vous sûr de vouloir supprimer le tarif &quot;
                        {planToDelete.title}&quot; ? Cette action est
                        irréversible.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-background/50 px-6 py-4 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-500 text-base font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200"
                >
                  Supprimer
                </button>
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-700 shadow-sm px-4 py-2 bg-card text-base font-medium text-gray-300 hover:bg-background focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
