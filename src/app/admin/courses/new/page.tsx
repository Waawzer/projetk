"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiSave, FiTrash2, FiPlus } from "react-icons/fi";

interface FormData {
  title: string;
  description: string;
  longDescription: string;
  category: string;
  level: "débutant" | "intermédiaire" | "avancé" | "tous niveaux";
  pricePerHour: number;
  imageUrl: string;
  instructor: string;
  benefits: string[];
  contenus: string[];
  isActive: boolean;
  format: "présentiel" | "distanciel" | "hybride";
  nbSessions: number;
}

export default function NewCoursePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    longDescription: "",
    category: "",
    level: "tous niveaux",
    pricePerHour: 0,
    imageUrl: "",
    instructor: "",
    benefits: [""],
    contenus: [""],
    isActive: true,
    format: "présentiel",
    nbSessions: 1,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (type === "number") {
      setFormData({ ...formData, [name]: parseFloat(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData({ ...formData, benefits: newBenefits });
  };

  const handleAddBenefit = () => {
    setFormData({ ...formData, benefits: [...formData.benefits, ""] });
  };

  const handleRemoveBenefit = (index: number) => {
    const newBenefits = [...formData.benefits];
    newBenefits.splice(index, 1);
    setFormData({ ...formData, benefits: newBenefits });
  };

  const handleContenuChange = (index: number, value: string) => {
    const newContenus = [...formData.contenus];
    newContenus[index] = value;
    setFormData({ ...formData, contenus: newContenus });
  };

  const handleAddContenu = () => {
    setFormData({ ...formData, contenus: [...formData.contenus, ""] });
  };

  const handleRemoveContenu = (index: number) => {
    const newContenus = [...formData.contenus];
    newContenus.splice(index, 1);
    setFormData({ ...formData, contenus: newContenus });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Filtrer les données vides
      const cleanedFormData = {
        ...formData,
        benefits: formData.benefits.filter((item) => item.trim() !== ""),
        contenus: formData.contenus.filter((item) => item.trim() !== ""),
      };

      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la création du cours"
        );
      }

      // Rediriger vers la liste des cours
      router.push("/admin/courses");
      router.refresh();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link
            href="/admin/courses"
            className="mr-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700"
          >
            <FiArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold">Nouveau cours particulier</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Informations générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-primary"
                placeholder="Ex: Guitare, Chant, Piano..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Niveau <span className="text-red-500">*</span>
              </label>
              <select
                name="level"
                required
                value={formData.level}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-primary"
              >
                <option value="débutant">Débutant</option>
                <option value="intermédiaire">Intermédiaire</option>
                <option value="avancé">Avancé</option>
                <option value="tous niveaux">Tous niveaux</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Image URL
              </label>
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-primary"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Prix par heure (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="pricePerHour"
                required
                min="0"
                step="0.01"
                value={formData.pricePerHour}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Instructeur
              </label>
              <input
                type="text"
                name="instructor"
                value={formData.instructor}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Format <span className="text-red-500">*</span>
              </label>
              <select
                name="format"
                required
                value={formData.format}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-primary"
              >
                <option value="présentiel">Présentiel</option>
                <option value="distanciel">Distanciel</option>
                <option value="hybride">Hybride</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nombre de sessions <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="nbSessions"
                required
                min="1"
                value={formData.nbSessions}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description courte <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full bg-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description longue
              </label>
              <textarea
                name="longDescription"
                value={formData.longDescription}
                onChange={handleChange}
                rows={4}
                className="w-full bg-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded bg-gray-700 border-gray-600 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-300">Cours actif</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">
            Bénéfices pour l&apos;élève
          </h2>

          {formData.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center mb-3">
              <input
                type="text"
                value={benefit}
                onChange={(e) => handleBenefitChange(index, e.target.value)}
                className="flex-grow bg-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-primary"
                placeholder="Ce que l'élève va apprendre ou développer..."
              />
              <button
                type="button"
                onClick={() => handleRemoveBenefit(index)}
                className="ml-2 p-2.5 text-red-500 hover:text-red-400 focus:outline-none"
                disabled={formData.benefits.length <= 1}
              >
                <FiTrash2 />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddBenefit}
            className="flex items-center text-primary hover:text-primary-hover mt-2"
          >
            <FiPlus className="mr-1" /> Ajouter un bénéfice
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Contenus abordés</h2>

          {formData.contenus.map((contenu, index) => (
            <div key={index} className="flex items-center mb-3">
              <input
                type="text"
                value={contenu}
                onChange={(e) => handleContenuChange(index, e.target.value)}
                className="flex-grow bg-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-primary"
                placeholder="Contenu abordé pendant le cours..."
              />
              <button
                type="button"
                onClick={() => handleRemoveContenu(index)}
                className="ml-2 p-2.5 text-red-500 hover:text-red-400 focus:outline-none"
                disabled={formData.contenus.length <= 1}
              >
                <FiTrash2 />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddContenu}
            className="flex items-center text-primary hover:text-primary-hover mt-2"
          >
            <FiPlus className="mr-1" /> Ajouter un contenu
          </button>
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/courses"
            className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg flex items-center"
          >
            {isSubmitting ? (
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
            ) : (
              <FiSave className="mr-2" />
            )}
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}
