"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import {
  FiCheck,
  FiHome,
  FiHeadphones,
  FiUsers,
  FiClock,
  FiBookOpen,
} from "react-icons/fi";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function CoursParticuliersPage() {
  // Animation refs
  const headerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLElement>(null);

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
              Cours Particuliers
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Bénéficiez d&apos;un accompagnement personnalisé pour développer
              vos compétences musicales
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Cours Particuliers Content */}
      <motion.section
        ref={contentRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="py-16 md:py-20"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-16">
            {/* Cours 1: S'enregistrer chez soi */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative rounded-2xl overflow-hidden border border-white/10"
            >
              <div className="p-8 bg-card backdrop-blur-sm">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <FiHome className="text-primary" size={24} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">
                    S&apos;enregistrer chez soi (distanciel)
                  </h2>
                </div>

                <p className="text-gray-300 mb-6 text-lg">
                  Apprenez à créer votre propre studio à domicile et à maîtriser
                  les techniques d&apos;enregistrement. Ce cours particulier
                  vous guidera à travers toutes les étapes, de l&apos;équipement
                  à la création de templates personnalisés.
                </p>

                <div className="bg-card/50 p-6 rounded-xl mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    Ce que vous apprendrez
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <span className="text-emerald-400 mr-2 mt-1">
                        <FiCheck size={16} />
                      </span>
                      <span>Comment s&apos;équiper efficacement</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-emerald-400 mr-2 mt-1">
                        <FiCheck size={16} />
                      </span>
                      <span>Bases sur les logiciels d&apos;enregistrement</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-emerald-400 mr-2 mt-1">
                        <FiCheck size={16} />
                      </span>
                      <span>Techniques d&apos;enregistrement optimales</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-emerald-400 mr-2 mt-1">
                        <FiCheck size={16} />
                      </span>
                      <span>Création de templates personnalisés</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 bg-card/50 p-5 rounded-xl">
                    <div className="flex items-center mb-2">
                      <FiClock className="text-primary mr-2" />
                      <h4 className="font-medium">Durée</h4>
                    </div>
                    <p>4 sessions de 1h (personnalisable)</p>
                  </div>

                  <div className="flex-1 bg-card/50 p-5 rounded-xl">
                    <div className="flex items-center mb-2">
                      <FiUsers className="text-primary mr-2" />
                      <h4 className="font-medium">Format</h4>
                    </div>
                    <p>Cours individuel en visioconférence</p>
                  </div>
                </div>

                <div className="flex justify-center mt-8">
                  <Link href="/reservation">
                    <button className="py-3 px-8 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg hover:shadow-purple-500/20 text-white">
                      Réserver un cours
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Cours 2: Cours de mixage */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative rounded-2xl overflow-hidden border border-white/10"
            >
              <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                POPULAIRE
              </div>

              <div className="p-8 bg-card backdrop-blur-sm">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <FiHeadphones className="text-primary" size={24} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">
                    Cours de mixage (4h)
                  </h2>
                </div>

                <p className="text-gray-300 mb-6 text-lg">
                  Un cours intensif de 4 heures pour maîtriser les bases du
                  mixage et obtenir un suivi personnalisé de vos projets. Vous
                  aurez également accès à une communauté d&apos;artistes pour
                  échanger et progresser ensemble.
                </p>

                <div className="bg-card/50 p-6 rounded-xl mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    Ce que vous apprendrez
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <span className="text-emerald-400 mr-2 mt-1">
                        <FiCheck size={16} />
                      </span>
                      <span>Bases essentielles du mixage</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-emerald-400 mr-2 mt-1">
                        <FiCheck size={16} />
                      </span>
                      <span>Suivi personnalisé de vos projets</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-emerald-400 mr-2 mt-1">
                        <FiCheck size={16} />
                      </span>
                      <span>Accès à une communauté d&apos;artistes</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-emerald-400 mr-2 mt-1">
                        <FiCheck size={16} />
                      </span>
                      <span>Feedback sur vos productions</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 bg-card/50 p-5 rounded-xl">
                    <div className="flex items-center mb-2">
                      <FiClock className="text-primary mr-2" />
                      <h4 className="font-medium">Durée</h4>
                    </div>
                    <p>4 heures (en une ou plusieurs sessions)</p>
                  </div>

                  <div className="flex-1 bg-card/50 p-5 rounded-xl">
                    <div className="flex items-center mb-2">
                      <FiBookOpen className="text-primary mr-2" />
                      <h4 className="font-medium">Niveau</h4>
                    </div>
                    <p>Débutant à intermédiaire</p>
                  </div>
                </div>

                <div className="flex justify-center mt-8">
                  <Link href="/reservation">
                    <button className="py-3 px-8 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg hover:shadow-purple-500/20 text-white">
                      Réserver un cours
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>

            <div className="text-center mt-12">
              <p className="text-lg text-gray-300 mb-6">
                Vous préférez une formation en groupe ? Découvrez nos formations
                collectives.
              </p>
              <Link href="/formations">
                <button className="py-3 px-8 rounded-xl font-medium transition-all duration-300 bg-white/10 hover:bg-white/20 text-white">
                  Voir les formations
                </button>
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
