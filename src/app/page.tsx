'use client';

import Image from "next/image";
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { FiMusic, FiHeadphones, FiMic, FiSliders, FiCalendar, FiPlay } from 'react-icons/fi';
import AudioPlayer from '@/components/AudioPlayer';
import Navbar from '@/components/Navbar';
import BrandLogo from '@/components/BrandLogo';
import { TrackDTO } from '@/types/track';

// Données d'exemple pour les musiques
const exampleTracks: TrackDTO[] = [
  {
    id: '1',
    title: 'Midnight Dreams',
    artist: 'Sarah Johnson',
    coverImage: 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?q=80&w=500&h=500&auto=format&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: '3:58',
  },
  {
    id: '2',
    title: 'Urban Echoes',
    artist: 'The Rhythm Collective',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=500&h=500&auto=format&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: '3:04',
  },
  {
    id: '3',
    title: 'Electric Sunset',
    artist: 'Neon Waves',
    coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=500&h=500&auto=format&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: '3:30',
  },
  {
    id: '4',
    title: 'Acoustic Memories',
    artist: 'Emma Taylor',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=500&h=500&auto=format&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: '3:15',
  },
];

export default function Home() {
  const [tracks, setTracks] = useState<TrackDTO[]>(exampleTracks);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number | null>(null);
  
  // Refs pour les animations au scroll
  const aboutSectionRef = useRef<HTMLElement>(null);
  const musicSectionRef = useRef<HTMLElement>(null);
  const ctaSectionRef = useRef<HTMLElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const serviceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // État pour suivre les éléments visibles
  const [visibleSections, setVisibleSections] = useState({
    about: false,
    music: false,
    cta: false,
    services: Array(4).fill(false),
    tracks: Array(tracks.length).fill(false)
  });
  
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setIsLoading(true);
        // Récupérer les musiques depuis l'API
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/tracks`, { 
          cache: 'no-store' 
        });
        
        if (!res.ok) {
          console.warn('Impossible de récupérer les musiques depuis l\'API, utilisation des données d\'exemple');
          setTracks(exampleTracks);
          return;
        }
        
        const data = await res.json();
        
        // Si aucune musique n'est retournée par l'API, utiliser les données d'exemple
        if (!data || data.length === 0) {
          console.warn('Aucune musique retournée par l\'API, utilisation des données d\'exemple');
          setTracks(exampleTracks);
        } else {
          // Transformer les données pour correspondre à l'interface TrackDTO
          const formattedTracks: TrackDTO[] = data.map((track: any) => ({
            id: track._id.toString(),
            title: track.title,
            artist: track.artist,
            coverImage: track.coverImage,
            audioUrl: track.audioUrl,
            duration: track.duration
          }));
          setTracks(formattedTracks);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des musiques:', error);
        // En cas d'erreur, retourner les données d'exemple
        console.warn('Utilisation des données d\'exemple suite à une erreur');
        setTracks(exampleTracks);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTracks();
  }, []);
  
  // Effet pour les animations au scroll
  useEffect(() => {
    // Fonction pour vérifier si un élément est visible
    const isElementInView = (el: HTMLElement, offset = 0) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      // Ajuster le seuil pour les appareils mobiles
      const mobileThreshold = window.innerWidth < 768 ? window.innerHeight * 0.2 : offset;
      return (
        rect.top <= window.innerHeight - mobileThreshold &&
        rect.bottom >= 0
      );
    };
    
    // Fonction pour mettre à jour les éléments visibles
    const handleScroll = () => {
      // Effet parallaxe pour l'image de fond du hero
      if (heroImageRef.current) {
        const scrollPos = window.scrollY;
        // Réduire l'effet de parallaxe sur mobile
        const parallaxFactor = window.innerWidth < 768 ? 0.2 : 0.4;
        heroImageRef.current.style.transform = `translateY(${scrollPos * parallaxFactor}px)`;
      }
      
      // Vérifier les sections principales
      setVisibleSections(prev => ({
        ...prev,
        about: aboutSectionRef.current ? isElementInView(aboutSectionRef.current, 100) : false,
        music: musicSectionRef.current ? isElementInView(musicSectionRef.current, 100) : false,
        cta: ctaSectionRef.current ? isElementInView(ctaSectionRef.current, 100) : false,
        services: serviceRefs.current.map(ref => ref ? isElementInView(ref, 100) : false),
        tracks: trackRefs.current.map(ref => ref ? isElementInView(ref, 100) : false)
      }));
    };
    
    // Initialiser les refs pour les tracks
    trackRefs.current = trackRefs.current.slice(0, tracks.length);
    
    // Ajouter l'écouteur d'événement
    window.addEventListener('scroll', handleScroll);
    // Déclencher une fois au chargement
    handleScroll();
    
    // Déclencher à nouveau après un court délai pour s'assurer que tout est chargé
    const timer = setTimeout(() => {
      handleScroll();
    }, 300);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [tracks.length]);
  
  const handleTrackSelect = (index: number) => {
    setSelectedTrackIndex(index);
  };

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
            Donnez vie à votre musique dans notre studio d'enregistrement professionnel
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
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
        className={`py-20 bg-gradient-to-b from-background to-card transition-all duration-1000 ease-in-out ${
          visibleSections.about ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className={`transition-all duration-700 ease-in-out ${
              visibleSections.about ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Notre Studio</h2>
              <p className="text-gray-400 max-w-3xl mx-auto">
                Un espace créatif équipé des meilleurs outils pour donner vie à vos projets musicaux
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <FiMic size={28} />, title: "Enregistrement", desc: "Microphones haut de gamme et acoustique parfaite pour capturer chaque nuance de votre son." },
              { icon: <FiSliders size={28} />, title: "Mixage", desc: "Équilibre parfait entre les différentes pistes pour créer un son harmonieux et professionnel." },
              { icon: <FiHeadphones size={28} />, title: "Mastering", desc: "Finalisation de votre projet pour un son cohérent sur toutes les plateformes d'écoute." },
              { icon: <FiMusic size={28} />, title: "Production", desc: "Accompagnement artistique complet pour développer votre univers musical unique." }
            ].map((service, index) => (
              <div 
                key={service.title}
                ref={el => { serviceRefs.current[index] = el; }}
                className={`card text-center p-6 flex flex-col items-center transition-all duration-700 ease-in-out ${
                  visibleSections.services[index] 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-8 opacity-0'
                }`}
                style={{ 
                  transitionDelay: `${index * 100}ms`,
                  willChange: 'transform, opacity'
                }}
              >
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 transition-transform duration-500 hover:scale-110">
                  <div className="text-white">{service.icon}</div>
                </div>
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-gray-400">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Music Player Section */}
      <section 
        ref={musicSectionRef}
        className={`py-20 bg-card transition-all duration-1000 ease-in-out ${
          visibleSections.music ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className={`transition-transform duration-700 ${
              visibleSections.music ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Nos Productions</h2>
              <p className="text-gray-400 max-w-3xl mx-auto">
                Découvrez quelques-uns des projets réalisés dans notre studio
              </p>
            </div>
          </div>
          
          {/* Grid of Tracks */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {tracks.map((track, index) => (
              <div 
                key={track.id} 
                ref={el => { trackRefs.current[index] = el; }}
                className={`group relative aspect-square transition-all duration-700 ${
                  visibleSections.tracks[index] 
                    ? 'translate-y-0 opacity-100 rotate-0' 
                    : 'translate-y-16 opacity-0 rotate-3'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative w-full h-full rounded-xl overflow-hidden">
                  <Image
                    src={track.coverImage}
                    alt={`${track.title} by ${track.artist}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 md:opacity-0 md:group-hover:opacity-90 transition-all duration-300">
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      <button
                        onClick={() => handleTrackSelect(index)}
                        className="text-white hover:bg-white/5 transition-colors border border-white/20 hover:border-white/40 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transform hover:scale-110 mb-2 md:mb-4"
                      >
                        <FiPlay className="w-5 h-5 md:w-6 md:h-6 translate-x-[1px]" />
                      </button>
                      <h3 className="text-white font-bold text-center text-sm md:text-base line-clamp-1">{track.title}</h3>
                      <p className="text-gray-300 text-xs md:text-sm text-center line-clamp-1">{track.artist}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Audio Player */}
          {selectedTrackIndex !== null && (
            <div className="mt-8">
              <AudioPlayer 
                tracks={tracks} 
                initialTrackIndex={selectedTrackIndex}
                onClose={() => setSelectedTrackIndex(null)}
              />
            </div>
          )}
        </div>
      </section>
      
      {/* CTA Section */}
      <section 
        ref={ctaSectionRef}
        className={`py-20 bg-gradient-to-b from-card to-background transition-all duration-1000 ${
          visibleSections.cta ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à donner vie à votre projet ?</h2>
          <p className="text-gray-400 max-w-3xl mx-auto mb-8">
            Réservez dès maintenant une session dans notre studio et bénéficiez de notre expertise pour réaliser votre vision musicale.
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
              <p className="text-gray-400 mt-2">Votre partenaire musical professionnel</p>
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
