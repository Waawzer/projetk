"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiCheck,
  FiMusic,
  FiBookOpen,
  FiUsers,
  FiClock,
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

export default function FormationsPage() {
  // Animation refs
  const headerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLElement>(null);

  // State pour les formations
  const [formations, setFormations] = useState<Formation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const response = await fetch("/api/formations");
        if (!response.ok) {
          throw new Error("Impossible de récupérer les formations");
        }
        const data = await response.json();
        // Filtrer pour n'afficher que les formations actives
        const activeFormations = data.filter(
          (formation: Formation) => formation.isActive
        );
        setFormations(activeFormations);
      } catch (err) {
        console.error("Erreur lors du chargement des formations:", err);
        setError("Erreur lors du chargement des formations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormations();
  }, []);

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      <Navbar />

      {/* Header */}
      <motion.section
        ref={headerRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="pt-32 pb-20 relative"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-background z-0"></div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-40 md:w-64 h-40 md:h-64 rounded-full bg-purple-500/10 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 md:w-80 h-40 md:h-80 rounded-full bg-blue-500/10 blur-3xl"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
              Nos Formations
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Développez vos compétences musicales avec nos formations
              professionnelles adaptées à tous les niveaux
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Formation Content */}
      <motion.section
        ref={contentRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="py-16 md:py-20"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-lg mb-6">
                {error}
              </div>
            ) : formations.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">
                  Aucune formation disponible pour le moment
                </h2>
                <p className="text-gray-400">
                  Revenez bientôt pour découvrir nos nouvelles formations!
                </p>
              </div>
            ) : (
              <div className="space-y-12">
                {formations.map((formation, index) => (
                  <motion.div
                    key={formation._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="relative rounded-2xl overflow-hidden border border-white/10"
                  >
                    {index === 0 && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                        POPULAIRE
                      </div>
                    )}

                    <div className="p-8 bg-card backdrop-blur-sm">
                      <div className="flex items-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                          <FiMusic className="text-primary" size={24} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold">
                          {formation.title}
                        </h2>
                      </div>

                      <p className="text-gray-300 mb-6 text-lg">
                        {formation.description}
                      </p>

                      <div className="bg-card/50 p-6 rounded-xl mb-8">
                        <h3 className="text-xl font-semibold mb-4">
                          Ce que vous apprendrez
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {formation.objectives
                            .slice(0, 6)
                            .map((objective, idx) => (
                              <div key={idx} className="flex items-start">
                                <span className="text-emerald-400 mr-2 mt-1">
                                  <FiCheck size={16} />
                                </span>
                                <span>{objective}</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1 bg-card/50 p-5 rounded-xl">
                          <div className="flex items-center mb-2">
                            <FiClock className="text-primary mr-2" />
                            <h4 className="font-medium">Durée</h4>
                          </div>
                          <p>{formation.duration} heures</p>
                        </div>

                        <div className="flex-1 bg-card/50 p-5 rounded-xl">
                          <div className="flex items-center mb-2">
                            <FiUsers className="text-primary mr-2" />
                            <h4 className="font-medium">Participants</h4>
                          </div>
                          <p>Max. {formation.maxParticipants} participants</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-card/50 p-5 rounded-xl">
                          <div className="flex items-center mb-2">
                            <FiBookOpen className="text-primary mr-2" />
                            <h4 className="font-medium">Prix</h4>
                          </div>
                          <p>{formation.price} €</p>
                        </div>

                        <div className="bg-card/50 p-5 rounded-xl">
                          <div className="flex items-center mb-2">
                            <FiHome className="text-primary mr-2" />
                            <h4 className="font-medium">Format</h4>
                          </div>
                          <p>{formation.format}</p>
                        </div>

                        <div className="bg-card/50 p-5 rounded-xl">
                          <div className="flex items-center mb-2">
                            <FiCalendar className="text-primary mr-2" />
                            <h4 className="font-medium">Sessions</h4>
                          </div>
                          <p>
                            {formation.nbSessions}{" "}
                            {formation.nbSessions > 1 ? "sessions" : "session"}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-center mt-8">
                        <Link href={`/formations/${formation._id}`}>
                          <button className="py-3 px-8 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg hover:shadow-purple-500/20 text-white">
                            Voir les détails
                          </button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <p className="text-lg text-gray-300 mb-6">
                Vous souhaitez une formation plus personnalisée ? Découvrez nos
                cours particuliers.
              </p>
              <Link href="/cours-particuliers">
                <button className="py-3 px-8 rounded-xl font-medium transition-all duration-300 bg-white/10 hover:bg-white/20 text-white">
                  Voir les cours particuliers
                </button>
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
      <Footer />
    </main>
  );
}
