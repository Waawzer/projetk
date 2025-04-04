"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  FiMusic,
  FiHeadphones,
  FiMic,
  FiSliders,
  FiCalendar,
} from "react-icons/fi";
import Navbar from "@/components/Navbar";
import BrandLogo from "@/components/BrandLogo";
import SpotifyPlayer from "@/components/SpotifyPlayer";

// Remplacer par l'ID de votre playlist Spotify
const FEATURED_PLAYLIST_ID = "6AyMzevO4BVYnSlS3UNeZG?si=c43fdaffeb254a81"; // ID de votre playlist personnelle

export default function Home() {
  // Refs pour les animations au scroll
  const aboutSectionRef = useRef<HTMLElement>(null);
  const musicSectionRef = useRef<HTMLElement>(null);
  const ctaSectionRef = useRef<HTMLElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const serviceRefs = useRef<(HTMLDivElement | null)[]>([]);

  // État pour suivre les éléments visibles
  const [visibleSections, setVisibleSections] = useState({
    about: false,
    music: false,
    cta: false,
    services: Array(4).fill(false),
  });

  // Effet pour les animations au scroll
  useEffect(() => {
    // Fonction pour vérifier si un élément est visible
    const isElementInView = (el: HTMLElement, offset = 0) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();

      // Ajuster le seuil pour les appareils mobiles - utiliser un pourcentage plus élevé
      const isMobile = window.innerWidth < 768;
      const threshold = isMobile ? window.innerHeight * 0.3 : offset;

      // Calculer le pourcentage de visibilité de l'élément
      const elementHeight = rect.height;
      const visibleHeight =
        Math.min(window.innerHeight, rect.bottom) - Math.max(0, rect.top);
      const visibilityPercentage = Math.max(0, visibleHeight) / elementHeight;

      // L'élément est considéré comme visible s'il est suffisamment dans la fenêtre
      return (
        rect.top <= window.innerHeight - threshold &&
        rect.bottom >= threshold &&
        visibilityPercentage > 0.1 // Au moins 10% de l'élément doit être visible
      );
    };

    // Fonction pour mettre à jour les éléments visibles
    const handleScroll = () => {
      // Effet parallaxe pour l'image de fond du hero
      if (heroImageRef.current) {
        const scrollPos = window.scrollY;
        // Réduire l'effet de parallaxe sur mobile
        const parallaxFactor = window.innerWidth < 768 ? 0.2 : 0.4;
        heroImageRef.current.style.transform = `translateY(${
          scrollPos * parallaxFactor
        }px)`;
      }

      // Vérifier les sections principales
      setVisibleSections((prev) => ({
        ...prev,
        about: aboutSectionRef.current
          ? isElementInView(aboutSectionRef.current, 100)
          : false,
        music: musicSectionRef.current
          ? isElementInView(musicSectionRef.current, 100)
          : false,
        cta: ctaSectionRef.current
          ? isElementInView(ctaSectionRef.current, 100)
          : false,
        services: serviceRefs.current.map((ref) =>
          ref ? isElementInView(ref, 50) : false
        ),
      }));
    };

    // Ajouter l'écouteur d'événement
    window.addEventListener("scroll", handleScroll);
    // Déclencher une fois au chargement
    handleScroll();

    // Déclencher à nouveau après un court délai pour s'assurer que tout est chargé
    const timer = setTimeout(() => {
      handleScroll();
    }, 300);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <div className="absolute inset-0 z-0" ref={heroImageRef}>
          <Image
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop"
            alt="Studio d'enregistrement"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        </div>

        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white flex items-center justify-center animate-fade-in">
            <BrandLogo width={280} height={80} className="animate-fade-in" />
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto animate-slide-up">
            Donnez vie à votre musique dans notre studio d&apos;enregistrement
            professionnel
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in"
            style={{ animationDelay: "0.5s" }}
          >
            <Link
              href="/reservation"
              className="bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center transition-all duration-300 hover:scale-105"
            >
              <FiCalendar className="mr-2" />
              Réserver une session
            </Link>
            <Link
              href="/tarifs"
              className="bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
            >
              Voir nos tarifs
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-scroll-down"></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        ref={aboutSectionRef}
        className={`py-20 bg-gradient-to-b from-background to-card transition-all duration-1500 ease-in-out ${
          visibleSections.about ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div
              className={`transition-all duration-700 ease-in-out ${
                visibleSections.about
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Notre Studio
              </h2>
              <p className="text-gray-400 max-w-3xl mx-auto">
                Un espace créatif équipé des meilleurs outils pour donner vie à
                vos projets musicaux
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FiMic size={28} />,
                title: "Enregistrement",
                desc: "Microphones haut de gamme et acoustique parfaite pour capturer chaque nuance de votre son.",
              },
              {
                icon: <FiSliders size={28} />,
                title: "Mixage",
                desc: "Équilibre parfait entre les différentes pistes pour créer un son harmonieux et professionnel.",
              },
              {
                icon: <FiHeadphones size={28} />,
                title: "Mastering",
                desc: "Finalisation de votre projet pour un son cohérent sur toutes les plateformes d'écoute.",
              },
              {
                icon: <FiMusic size={28} />,
                title: "Production",
                desc: "Accompagnement artistique complet pour développer votre univers musical unique.",
              },
            ].map((service, index) => (
              <div
                key={service.title}
                ref={(el) => {
                  serviceRefs.current[index] = el;
                }}
                className={`card text-center p-6 flex flex-col items-center transition-all duration-1000 ease-in-out ${
                  visibleSections.services[index]
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
                style={{
                  transitionDelay: `${index * 150}ms`,
                  willChange: "transform, opacity",
                }}
              >
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 transition-transform duration-500 hover:scale-110">
                  <div className="text-white">{service.icon}</div>
                </div>
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-gray-400">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spotify Player Section */}
      <section
        ref={musicSectionRef}
        className={`py-20 bg-card transition-all duration-1500 ease-in-out ${
          visibleSections.music ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div
              className={`transition-transform duration-700 ${
                visibleSections.music
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Nos Productions
              </h2>
              <p className="text-gray-400 max-w-3xl mx-auto">
                Découvrez quelques-uns des projets réalisés dans notre studio
              </p>
            </div>
          </div>

          {/* Spotify Player */}
          <div className="max-w-4xl mx-auto">
            <div className="shadow-xl shadow-black/30 rounded-xl overflow-hidden">
              <SpotifyPlayer playlistId={FEATURED_PLAYLIST_ID} />
            </div>

            <div className="mt-8 text-center">
              <a
                href={`https://open.spotify.com/playlist/${FEATURED_PLAYLIST_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors"
              >
                <span>Écouter la playlist complète sur Spotify</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaSectionRef}
        className={`py-20 bg-gradient-to-b from-card to-background transition-all duration-1500 ${
          visibleSections.cta ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à donner vie à votre projet ?
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto mb-8">
            Réservez dès maintenant une session dans notre studio et bénéficiez
            de notre expertise pour réaliser votre vision musicale.
          </p>
          <Link
            href="/reservation"
            className="bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5 text-white px-8 py-3 rounded-lg font-medium inline-flex items-center transition-all duration-300 hover:scale-110"
          >
            <FiCalendar className="mr-2" />
            Réserver une session
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-background border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <BrandLogo width={150} height={40} />
              </h3>
              <p className="text-gray-400 mt-2">
                Votre partenaire musical professionnel
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div>
                <h4 className="text-white font-medium mb-3">Contact</h4>
                <p className="text-gray-400">contact@kasarstudio.fr</p>
                <p className="text-gray-400">+33 1 23 45 67 89</p>
              </div>

              <div>
                <h4 className="text-white font-medium mb-3">Adresse</h4>
                <p className="text-gray-400">123 Rue de la Musique</p>
                <p className="text-gray-400">75001 Paris, France</p>
              </div>

              <div>
                <h4 className="text-white font-medium mb-3">Horaires</h4>
                <p className="text-gray-400">Lun - Sam: 9h - 22h</p>
                <p className="text-gray-400">Dimanche: Sur rendez-vous</p>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Kasar Studio. Tous droits réservés.
          </div>
        </div>
      </footer>
    </main>
  );
}
