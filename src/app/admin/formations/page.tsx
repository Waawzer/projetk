"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiCheck,
  FiXCircle,
  FiCalendar,
  FiUsers,
  FiClock,
  FiTag,
} from "react-icons/fi";

interface Formation {
  _id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  duration: number;
  price: number;
  maxParticipants: number;
  imageUrl?: string;
  objectives?: string[];
  prerequisites?: string[];
  syllabus?: {
    title: string;
    description: string;
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function FormationsAdminPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formationToDelete, setFormationToDelete] = useState<Formation | null>(
    null
  );

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/formations");

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des formations");
      }

      const data = await response.json();
      setFormations(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des formations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (formation: Formation) => {
    setFormationToDelete(formation);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!formationToDelete) return;

    try {
      const response = await fetch(
        `/api/admin/formations?id=${formationToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la formation");
      }

      setFormations(formations.filter((f) => f._id !== formationToDelete._id));
      setShowDeleteModal(false);
      setFormationToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de la formation:", error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setFormationToDelete(null);
  };

  const toggleActive = async (formation: Formation) => {
    try {
      const response = await fetch("/api/admin/formations", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: formation._id,
          isActive: !formation.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la formation");
      }

      // Mise à jour de l'état local
      setFormations(
        formations.map((f) =>
          f._id === formation._id ? { ...f, isActive: !f.isActive } : f
        )
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la formation:", error);
    }
  };

  const filteredFormations = formations.filter(
    (formation) =>
      formation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formation.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Gestion des formations</h1>
          <p className="text-gray-400 mt-1">
            Gérez les formations proposées par votre studio
          </p>
        </div>
        <Link
          href="/admin/formations/new"
          className="mt-4 md:mt-0 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center justify-center"
        >
          <FiPlus className="mr-2" />
          Nouvelle formation
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher une formation..."
            className="bg-gray-700 text-white w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setSearchTerm("")}
            >
              <FiX className="text-gray-400 hover:text-white" />
            </button>
          )}
        </div>
      </div>

      {filteredFormations.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <FiCalendar className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Aucune formation trouvée
          </h3>
          <p className="text-gray-400 mb-6">
            {searchTerm
              ? "Aucune formation ne correspond à votre recherche."
              : "Vous n'avez pas encore créé de formations."}
          </p>
          <Link
            href="/admin/formations/new"
            className="inline-flex items-center bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg"
          >
            <FiPlus className="mr-2" />
            Créer une formation
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFormations.map((formation) => (
            <div
              key={formation._id}
              className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg border-l-4 ${
                formation.isActive ? "border-green-500" : "border-gray-600"
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold mb-2 pr-10">
                    {formation.title}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleActive(formation)}
                      className={`p-2 rounded-full ${
                        formation.isActive
                          ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                          : "bg-gray-600/20 text-gray-400 hover:bg-gray-600/30"
                      }`}
                      title={formation.isActive ? "Désactiver" : "Activer"}
                    >
                      {formation.isActive ? <FiCheck /> : <FiXCircle />}
                    </button>
                  </div>
                </div>
                <p className="text-gray-300 mb-4 line-clamp-2">
                  {formation.description}
                </p>
                <div className="flex flex-wrap gap-4 text-gray-400 mb-4">
                  <div className="flex items-center">
                    <FiClock className="mr-1" />
                    <span>{formation.duration}h</span>
                  </div>
                  <div className="flex items-center">
                    <FiUsers className="mr-1" />
                    <span>{formation.maxParticipants} pers. max</span>
                  </div>
                  <div className="flex items-center">
                    <FiTag className="mr-1" />
                    <span>{formation.price}€</span>
                  </div>
                </div>
                <div className="flex justify-between mt-6">
                  <Link
                    href={`/admin/formations/edit/${formation._id}`}
                    className="flex items-center text-blue-400 hover:text-blue-300"
                  >
                    <FiEdit2 className="mr-1" />
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(formation)}
                    className="flex items-center text-red-400 hover:text-red-300"
                  >
                    <FiTrash2 className="mr-1" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirmer la suppression</h3>
            <p className="mb-6">
              Êtes-vous sûr de vouloir supprimer la formation &quot;
              <span className="font-semibold">{formationToDelete?.title}</span>
              &quot; ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
