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
  FiBookOpen,
  FiTag,
  FiFilter,
} from "react-icons/fi";

interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  category: string;
  level: "débutant" | "intermédiaire" | "avancé" | "tous niveaux";
  pricePerHour: number;
  imageUrl?: string;
  instructor?: string;
  benefits?: string[];
  contenus?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CoursesAdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/courses");

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des cours");
      }

      const data = await response.json();
      setCourses(data);

      // Extraire les catégories uniques
      const uniqueCategories = Array.from(
        new Set(data.map((course: Course) => course.category))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Erreur lors de la récupération des cours:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;

    try {
      const response = await fetch(
        `/api/admin/courses?id=${courseToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du cours");
      }

      setCourses(courses.filter((c) => c._id !== courseToDelete._id));
      setShowDeleteModal(false);
      setCourseToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression du cours:", error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCourseToDelete(null);
  };

  const toggleActive = async (course: Course) => {
    try {
      const response = await fetch("/api/admin/courses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: course._id,
          isActive: !course.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du cours");
      }

      // Mise à jour de l'état local
      setCourses(
        courses.map((c) =>
          c._id === course._id ? { ...c, isActive: !c.isActive } : c
        )
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du cours:", error);
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "débutant":
        return "Débutant";
      case "intermédiaire":
        return "Intermédiaire";
      case "avancé":
        return "Avancé";
      case "tous niveaux":
        return "Tous niveaux";
      default:
        return level;
    }
  };

  const filteredCourses = courses.filter((course) => {
    // Filtrer par catégorie
    if (filterCategory !== "all" && course.category !== filterCategory) {
      return false;
    }

    // Filtrer par terme de recherche
    return (
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-[600px]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Gestion des cours particuliers</h1>
          <p className="text-gray-400 mt-1">
            Gérez les cours particuliers proposés par votre studio
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="mt-4 md:mt-0 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center justify-center"
        >
          <FiPlus className="mr-2" />
          Nouveau cours
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un cours..."
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
          <div className="flex items-center">
            <FiFilter className="text-gray-400 mr-2" />
            <select
              className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <FiCalendar className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Aucun cours trouvé</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || filterCategory !== "all"
              ? "Aucun cours ne correspond à vos critères de recherche."
              : "Vous n'avez pas encore créé de cours particuliers."}
          </p>
          <Link
            href="/admin/courses/new"
            className="inline-flex items-center bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg"
          >
            <FiPlus className="mr-2" />
            Créer un cours
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course._id}
              className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg border-l-4 ${
                course.isActive ? "border-green-500" : "border-gray-600"
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold mb-2 pr-10">
                    {course.title}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleActive(course)}
                      className={`p-2 rounded-full ${
                        course.isActive
                          ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                          : "bg-gray-600/20 text-gray-400 hover:bg-gray-600/30"
                      }`}
                      title={course.isActive ? "Désactiver" : "Activer"}
                    >
                      {course.isActive ? <FiCheck /> : <FiXCircle />}
                    </button>
                  </div>
                </div>
                <p className="text-gray-300 mb-4 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex flex-wrap gap-4 text-gray-400 mb-4">
                  <div className="flex items-center">
                    <FiBookOpen className="mr-1" />
                    <span>{course.category}</span>
                  </div>
                  <div className="flex items-center">
                    <FiCalendar className="mr-1" />
                    <span>{getLevelLabel(course.level)}</span>
                  </div>
                  <div className="flex items-center">
                    <FiTag className="mr-1" />
                    <span>{course.pricePerHour}€/h</span>
                  </div>
                </div>
                <div className="flex justify-between mt-6">
                  <Link
                    href={`/admin/courses/edit/${course._id}`}
                    className="flex items-center text-blue-400 hover:text-blue-300"
                  >
                    <FiEdit2 className="mr-1" />
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(course)}
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
              Êtes-vous sûr de vouloir supprimer le cours &quot;
              <span className="font-semibold">{courseToDelete?.title}</span>
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
