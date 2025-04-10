"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiCheck,
  FiDollarSign,
  FiArrowLeft,
  FiUser,
  FiHome,
  FiCalendar,
  FiBookOpen,
} from "react-icons/fi";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

interface Course {
  _id: string;
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

export default function CourseDetailsPage() {
  const params = useParams();
  const { id } = params;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses?id=${id}`);
        if (!response.ok) {
          throw new Error("Impossible de récupérer les détails du cours");
        }
        const data = await response.json();
        setCourse(data);
      } catch (err) {
        console.error("Erreur lors du chargement du cours:", err);
        setError("Erreur lors du chargement du cours");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCourse();
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

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-2">Erreur</h2>
              <p>{error || "Cours non trouvé"}</p>
              <Link
                href="/cours-particuliers"
                className="mt-4 inline-flex items-center text-white bg-primary px-4 py-2 rounded-lg"
              >
                <FiArrowLeft className="mr-2" /> Retour aux cours
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
              href="/cours-particuliers"
              className="inline-flex items-center text-gray-400 hover:text-white mb-6"
            >
              <FiArrowLeft className="mr-2" /> Retour aux cours particuliers
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 text-xs rounded-full bg-primary/20 text-primary">
                  {course.category}
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-gray-700/50">
                  {course.level}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                {course.title}
              </h1>
              <p className="text-xl text-gray-300 mb-8">{course.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-card/50 p-5 rounded-xl flex items-center">
                  <FiDollarSign className="text-primary mr-3" size={24} />
                  <div>
                    <h3 className="font-medium text-sm text-gray-400">Prix</h3>
                    <p className="text-lg">{course.pricePerHour}€ / heure</p>
                  </div>
                </div>

                <div className="bg-card/50 p-5 rounded-xl flex items-center">
                  <FiBookOpen className="text-primary mr-3" size={24} />
                  <div>
                    <h3 className="font-medium text-sm text-gray-400">
                      Niveau
                    </h3>
                    <p className="text-lg">{course.level}</p>
                  </div>
                </div>

                <div className="bg-card/50 p-5 rounded-xl flex items-center">
                  <FiHome className="text-primary mr-3" size={24} />
                  <div>
                    <h3 className="font-medium text-sm text-gray-400">
                      Format
                    </h3>
                    <p className="text-lg">{course.format}</p>
                  </div>
                </div>

                <div className="bg-card/50 p-5 rounded-xl flex items-center">
                  <FiCalendar className="text-primary mr-3" size={24} />
                  <div>
                    <h3 className="font-medium text-sm text-gray-400">
                      Sessions
                    </h3>
                    <p className="text-lg">
                      {course.nbSessions}{" "}
                      {course.nbSessions > 1 ? "sessions" : "session"}
                    </p>
                  </div>
                </div>
              </div>

              {course.instructor && (
                <div className="flex gap-6 flex-wrap mb-8">
                  <div className="bg-card/50 p-5 rounded-xl flex items-center">
                    <FiUser className="text-primary mr-3" size={24} />
                    <div>
                      <h3 className="font-medium text-sm text-gray-400">
                        Instructeur
                      </h3>
                      <p className="text-lg">{course.instructor}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto min-h-[600px]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {course.longDescription && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-card rounded-xl p-6"
                  >
                    <h2 className="text-2xl font-bold mb-4">
                      À propos de ce cours
                    </h2>
                    <div className="text-gray-300 space-y-4">
                      <p>{course.longDescription}</p>
                    </div>
                  </motion.div>
                )}

                {course.contenus && course.contenus.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-card rounded-xl p-6"
                  >
                    <h2 className="text-2xl font-bold mb-4">
                      Contenu du cours
                    </h2>
                    <div className="space-y-4">
                      <ul className="space-y-3">
                        {course.contenus.map((contenu, index) => (
                          <li key={index} className="flex">
                            <span className="text-primary mr-2 mt-0.5">•</span>
                            <span>{contenu}</span>
                          </li>
                        ))}
                      </ul>
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
                    {course.benefits.map((benefit, index) => (
                      <li key={index} className="flex">
                        <span className="text-emerald-400 mr-2 mt-1">
                          <FiCheck size={16} />
                        </span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl p-6 text-center"
                >
                  <h2 className="text-xl font-bold mb-2">
                    Réservez votre cours
                  </h2>
                  <p className="text-gray-300 mb-4">
                    Commencez dès maintenant votre apprentissage personnalisé
                  </p>
                  <Link href="/reservation">
                    <button className="w-full py-3 px-8 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg hover:shadow-purple-500/20 text-white">
                      Réserver une session
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
