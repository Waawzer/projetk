import Image from "next/image";
import Link from 'next/link';
import { FiMusic, FiHeadphones, FiMic, FiSliders, FiCalendar } from 'react-icons/fi';
import AudioPlayer from '@/components/AudioPlayer';
import Navbar from '@/components/Navbar';

// Mock data for tracks (in a real app, this would come from the API)
const mockTracks = [
  {
    id: '1',
    title: 'Midnight Dreams',
    artist: 'Sarah Johnson',
    coverImage: 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?q=80&w=500&h=500&auto=format&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 238,
  },
  {
    id: '2',
    title: 'Urban Echoes',
    artist: 'The Rhythm Collective',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=500&h=500&auto=format&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 184,
  },
  {
    id: '3',
    title: 'Electric Sunset',
    artist: 'Neon Waves',
    coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=500&h=500&auto=format&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 210,
  },
  {
    id: '4',
    title: 'Acoustic Memories',
    artist: 'Emma Taylor',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=500&h=500&auto=format&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: 195,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
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
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Studio <span className="text-primary">Music</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Donnez vie à votre musique dans notre studio d'enregistrement professionnel
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/reservation" 
              className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center"
            >
              <FiCalendar className="mr-2" />
              Réserver une session
            </Link>
            <Link 
              href="/tarifs" 
              className="bg-transparent border border-white/30 hover:bg-white/10 text-white px-8 py-3 rounded-lg font-medium"
            >
              Voir nos tarifs
            </Link>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section className="py-20 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Notre Studio</h2>
            <p className="text-gray-400 max-w-3xl mx-auto">
              Un espace créatif équipé des meilleurs outils pour donner vie à vos projets musicaux
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card text-center p-6 flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <FiMic className="text-primary" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">Enregistrement</h3>
              <p className="text-gray-400">
                Microphones haut de gamme et acoustique parfaite pour capturer chaque nuance de votre son.
              </p>
            </div>
            
            <div className="card text-center p-6 flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <FiSliders className="text-primary" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">Mixage</h3>
              <p className="text-gray-400">
                Équilibre parfait entre les différentes pistes pour créer un son harmonieux et professionnel.
              </p>
            </div>
            
            <div className="card text-center p-6 flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <FiHeadphones className="text-primary" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">Mastering</h3>
              <p className="text-gray-400">
                Finalisation de votre projet pour un son cohérent sur toutes les plateformes d'écoute.
              </p>
            </div>
            
            <div className="card text-center p-6 flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <FiMusic className="text-primary" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">Production</h3>
              <p className="text-gray-400">
                Accompagnement artistique complet pour développer votre univers musical unique.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Music Player Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nos Productions</h2>
            <p className="text-gray-400 max-w-3xl mx-auto">
              Découvrez quelques-uns des projets réalisés dans notre studio
            </p>
          </div>
          
          <AudioPlayer tracks={mockTracks} />
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à donner vie à votre projet ?</h2>
          <p className="text-gray-400 max-w-3xl mx-auto mb-8">
            Réservez dès maintenant une session dans notre studio et bénéficiez de notre expertise pour réaliser votre vision musicale.
          </p>
          <Link 
            href="/reservation" 
            className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg font-medium inline-flex items-center"
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
                <span className="text-primary mr-2">Studio</span>
                <span>Music</span>
              </h3>
              <p className="text-gray-400 mt-2">Votre partenaire musical professionnel</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
              <div>
                <h4 className="text-white font-medium mb-3">Contact</h4>
                <p className="text-gray-400">contact@studiomusic.fr</p>
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
            © {new Date().getFullYear()} Studio Music. Tous droits réservés.
          </div>
        </div>
      </footer>
    </main>
  );
}
