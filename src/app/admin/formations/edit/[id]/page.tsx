"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiSave, FiTrash2, FiPlus } from "react-icons/fi";

interface FormData {
  title: string;
  description: string;
  longDescription: string;
  duration: number;
  price: number;
  maxParticipants: number;
  imageUrl: string;
  objectives: string[];
  prerequisites: string[];
  syllabus: { title: string; description: string }[];
  isActive: boolean;
  format: "présentiel" | "distanciel" | "hybride";
  nbSessions: number;
}

export default function EditFormationPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    longDescription: "",
    duration: 1,
    price: 0,
    maxParticipants: 1,
    imageUrl: "",
    objectives: [""],
    prerequisites: [""],
    syllabus: [{ title: "", description: "" }],
    isActive: true,
    format: "présentiel",
    nbSessions: 1,
  });

  useEffect(() => {
    const fetchFormation = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/formations?id=${id}`);

        if (!response.ok) {
          throw new Error("Formation non trouvée");
        }

        const data = await response.json();
        setFormData({
          title: data.title || "",
          description: data.description || "",
          longDescription: data.longDescription || "",
          duration: data.duration || 1,
          price: data.price || 0,
          maxParticipants: data.maxParticipants || 1,
          imageUrl: data.imageUrl || "",
          objectives: data.objectives?.length ? data.objectives : [""],
          prerequisites: data.prerequisites?.length ? data.prerequisites : [""],
          syllabus: data.syllabus?.length
            ? data.syllabus
            : [{ title: "", description: "" }],
          isActive: data.isActive ?? true,
          format: data.format || "présentiel",
          nbSessions: data.nbSessions || 1,
        });
      } catch (err) {
        console.error("Erreur lors de la récupération de la formation:", err);
        setError("Impossible de charger la formation");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchFormation();
    }
  }, [id]);

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

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData({ ...formData, objectives: newObjectives });
  };

  const handleAddObjective = () => {
    setFormData({ ...formData, objectives: [...formData.objectives, ""] });
  };

  const handleRemoveObjective = (index: number) => {
    const newObjectives = [...formData.objectives];
    newObjectives.splice(index, 1);
    setFormData({ ...formData, objectives: newObjectives });
  };

  const handlePrerequisiteChange = (index: number, value: string) => {
    const newPrerequisites = [...formData.prerequisites];
    newPrerequisites[index] = value;
    setFormData({ ...formData, prerequisites: newPrerequisites });
  };

  const handleAddPrerequisite = () => {
    setFormData({
      ...formData,
      prerequisites: [...formData.prerequisites, ""],
    });
  };

  const handleRemovePrerequisite = (index: number) => {
    const newPrerequisites = [...formData.prerequisites];
    newPrerequisites.splice(index, 1);
    setFormData({ ...formData, prerequisites: newPrerequisites });
  };

  const handleSyllabusChange = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    const newSyllabus = [...formData.syllabus];
    newSyllabus[index] = { ...newSyllabus[index], [field]: value };
    setFormData({ ...formData, syllabus: newSyllabus });
  };

  const handleAddSyllabus = () => {
    setFormData({
      ...formData,
      syllabus: [...formData.syllabus, { title: "", description: "" }],
    });
  };

  const handleRemoveSyllabus = (index: number) => {
    const newSyllabus = [...formData.syllabus];
    newSyllabus.splice(index, 1);
    setFormData({ ...formData, syllabus: newSyllabus });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Filtrer les données vides
      const cleanedFormData = {
        id: id,
        ...formData,
        objectives: formData.objectives.filter((item) => item.trim() !== ""),
        prerequisites: formData.prerequisites.filter(
          (item) => item.trim() !== ""
        ),
        syllabus: formData.syllabus.filter(
          (item) => item.title.trim() !== "" || item.description.trim() !== ""
        ),
      };

      const response = await fetch("/api/admin/formations", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la mise à jour de la formation"
        );
      }

      // Rediriger vers la liste des formations
      router.push("/admin/formations");
      router.refresh();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-lg">
        {error}
        <div className="mt-4">
          <Link
            href="/admin/formations"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
          >
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link
            href="/admin/formations"
            className="mr-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700"
          >
            <FiArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold">Modifier la formation</h1>
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
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Détails de la formation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Durée (heures) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="duration"
                required
                min="1"
                value={formData.duration}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-primary"
              />
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
                Prix (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Max. participants <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="maxParticipants"
                required
                min="1"
                value={formData.maxParticipants}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="mt-4">
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
              <span className="ml-2 text-sm text-gray-300">
                Formation active
              </span>
            </label>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Objectifs</h2>

          {formData.objectives.map((objective, index) => (
            <div key={index} className="flex items-center mb-3">
              <input
                type="text"
                value={objective}
                onChange={(e) => handleObjectiveChange(index, e.target.value)}
                className="flex-grow bg-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-primary"
                placeholder="Objectif de la formation..."
              />
              <button
                type="button"
                onClick={() => handleRemoveObjective(index)}
                className="ml-2 p-2.5 text-red-500 hover:text-red-400 focus:outline-none"
                disabled={formData.objectives.length <= 1}
              >
                <FiTrash2 />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddObjective}
            className="flex items-center text-primary hover:text-primary-hover mt-2"
          >
            <FiPlus className="mr-1" /> Ajouter un objectif
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Prérequis</h2>

          {formData.prerequisites.map((prerequisite, index) => (
            <div key={index} className="flex items-center mb-3">
              <input
                type="text"
                value={prerequisite}
                onChange={(e) =>
                  handlePrerequisiteChange(index, e.target.value)
                }
                className="flex-grow bg-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-primary"
                placeholder="Prérequis pour la formation..."
              />
              <button
                type="button"
                onClick={() => handleRemovePrerequisite(index)}
                className="ml-2 p-2.5 text-red-500 hover:text-red-400 focus:outline-none"
                disabled={formData.prerequisites.length <= 1}
              >
                <FiTrash2 />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddPrerequisite}
            className="flex items-center text-primary hover:text-primary-hover mt-2"
          >
            <FiPlus className="mr-1" /> Ajouter un prérequis
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Programme</h2>

          {formData.syllabus.map((item, index) => (
            <div
              key={index}
              className="mb-6 pb-6 border-b border-gray-700 last:border-0"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">Module {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => handleRemoveSyllabus(index)}
                  className="p-2 text-red-500 hover:text-red-400 focus:outline-none"
                  disabled={formData.syllabus.length <= 1}
                >
                  <FiTrash2 />
                </button>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) =>
                    handleSyllabusChange(index, "title", e.target.value)
                  }
                  className="w-full bg-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-primary"
                  placeholder="Titre du module..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={item.description}
                  onChange={(e) =>
                    handleSyllabusChange(index, "description", e.target.value)
                  }
                  rows={3}
                  className="w-full bg-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-primary"
                  placeholder="Contenu du module..."
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddSyllabus}
            className="flex items-center text-primary hover:text-primary-hover mt-2"
          >
            <FiPlus className="mr-1" /> Ajouter un module
          </button>
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/formations"
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
