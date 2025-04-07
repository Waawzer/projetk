"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiCheck,
  FiClock,
  FiUsers,
  FiDollarSign,
  FiArrowLeft,
  FiHome,
  FiCalendar,
} from "react-icons/fi";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

interface Formation {
  _id: string;
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

export default function FormationDetailsPage() {
  const params = useParams();
  const { id } = params;

  const [formation, setFormation] = useState<Formation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFormation = async () => {
      try {
        const response = await fetch(`/api/formations?id=${id}`);
        if (!response.ok) {
          throw new Error(
            "Impossible de récupérer les détails de la formation"
          );
        }
        const data = await response.json();
        setFormation(data);
      } catch (err) {
        console.error("Erreur lors du chargement de la formation:", err);
        setError("Erreur lors du chargement de la formation");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchFormation();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center pt-32 pb-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !formation) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-2">Erreur</h2>
              <p>{error || "Formation non trouvée"}</p>
              <Link
                href="/formations"
                className="mt-4 inline-flex items-center text-white bg-primary px-4 py-2 rounded-lg"
              >
                <FiArrowLeft className="mr-2" /> Retour aux formations
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-20 relative">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-background z-0"></div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-40 md:w-64 h-40 md:h-64 rounded-full bg-purple-500/10 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 md:w-80 h-40 md:h-80 rounded-full bg-blue-500/10 blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/formations"
              className="inline-flex items-center text-gray-400 hover:text-white mb-6"
            >
              <FiArrowLeft className="mr-2" /> Retour aux formations
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                {formation.title}
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                {formation.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-card/50 p-5 rounded-xl flex items-center">
                  <FiClock className="text-primary mr-3" size={24} />
                  <div>
                    <h3 className="font-medium text-sm text-gray-400">Durée</h3>
                    <p className="text-lg">{formation.duration} heures</p>
                  </div>
                </div>

                <div className="bg-card/50 p-5 rounded-xl flex items-center">
                  <FiUsers className="text-primary mr-3" size={24} />
                  <div>
                    <h3 className="font-medium text-sm text-gray-400">
                      Participants
                    </h3>
                    <p className="text-lg">
                      Max. {formation.maxParticipants} participants
                    </p>
                  </div>
                </div>

                <div className="bg-card/50 p-5 rounded-xl flex items-center">
                  <FiDollarSign className="text-primary mr-3" size={24} />
                  <div>
                    <h3 className="font-medium text-sm text-gray-400">Prix</h3>
                    <p className="text-lg">{formation.price} €</p>
                  </div>
                </div>

                <div className="bg-card/50 p-5 rounded-xl flex items-center">
                  <FiHome className="text-primary mr-3" size={24} />
                  <div>
                    <h3 className="font-medium text-sm text-gray-400">
                      Format
                    </h3>
                    <p className="text-lg">{formation.format}</p>
                  </div>
                </div>

                <div className="bg-card/50 p-5 rounded-xl flex items-center">
                  <FiCalendar className="text-primary mr-3" size={24} />
                  <div>
                    <h3 className="font-medium text-sm text-gray-400">
                      Sessions
                    </h3>
                    <p className="text-lg">
                      {formation.nbSessions}{" "}
                      {formation.nbSessions > 1 ? "sessions" : "session"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Formation Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {formation.longDescription && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-card rounded-xl p-6"
                  >
                    <h2 className="text-2xl font-bold mb-4">
                      À propos de cette formation
                    </h2>
                    <div className="text-gray-300 space-y-4">
                      <p>{formation.longDescription}</p>
                    </div>
                  </motion.div>
                )}

                {formation.syllabus && formation.syllabus.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-card rounded-xl p-6"
                  >
                    <h2 className="text-2xl font-bold mb-4">Programme</h2>
                    <div className="space-y-6">
                      {formation.syllabus.map((module, index) => (
                        <div
                          key={index}
                          className="border-b border-gray-800 pb-4 last:border-0 last:pb-0"
                        >
                          <h3 className="text-lg font-semibold mb-2">
                            {index + 1}. {module.title}
                          </h3>
                          <p className="text-gray-300">{module.description}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-card rounded-xl p-6"
                >
                  <h2 className="text-xl font-bold mb-4">
                    Ce que vous apprendrez
                  </h2>
                  <ul className="space-y-3">
                    {formation.objectives.map((objective, index) => (
                      <li key={index} className="flex">
                        <span className="text-emerald-400 mr-2 mt-1">
                          <FiCheck size={16} />
                        </span>
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {formation.prerequisites &&
                  formation.prerequisites.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="bg-card rounded-xl p-6"
                    >
                      <h2 className="text-xl font-bold mb-4">Prérequis</h2>
                      <ul className="space-y-3">
                        {formation.prerequisites.map((prerequisite, index) => (
                          <li key={index} className="flex">
                            <span className="text-primary mr-2 mt-1">•</span>
                            <span>{prerequisite}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl p-6 text-center"
                >
                  <h2 className="text-xl font-bold mb-2">Inscrivez-vous</h2>
                  <p className="text-gray-300 mb-4">
                    Réservez votre place dès maintenant
                  </p>
                  <Link href="/reservation">
                    <button className="w-full py-3 px-8 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg hover:shadow-purple-500/20 text-white">
                      Réserver ma place
                    </button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
