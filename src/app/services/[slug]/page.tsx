'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowLeft, FiCalendar } from 'react-icons/fi';

export default function ServicePage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const router = useRouter();
  const { slug } = params;
  
  const [service, setService] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchService = async () => {
      try {
        setIsLoading(true);
        
        // Dans une application réelle, vous feriez un appel à votre API
        // Simuler une requête API avec un délai
        setTimeout(() => {
          // Données fictives pour la démonstration
          const services = {
            recording: {
              title: 'Enregistrement',
              description: 'Capturez votre son avec une qualité professionnelle dans notre studio équipé des meilleurs microphones et préamplis.',
              longDescription: `Notre service d'enregistrement offre une qualité sonore exceptionnelle grâce à notre acoustique soigneusement conçue et notre équipement haut de gamme. Que vous soyez un artiste solo, un groupe complet ou un projet de podcast, notre équipe expérimentée vous accompagnera pour capturer le meilleur de votre performance.

Nous disposons d'une variété de microphones de qualité studio, de préamplis analogiques et d'une chaîne de traitement qui préserve la chaleur et la dynamique de votre son. Notre ingénieur du son travaillera avec vous pour trouver la configuration idéale pour votre projet.

L'espace d'enregistrement principal peut accueillir confortablement des groupes jusqu'à 6 musiciens, avec des cabines d'isolation disponibles pour les instruments qui nécessitent une séparation acoustique.`,
              image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop',
              price: 60,
              features: [
                'Acoustique professionnelle',
                'Microphones haut de gamme',
                'Préamplis analogiques',
                'Ingénieur du son expérimenté',
                'Cabines d\'isolation',
                'Monitoring de qualité'
              ]
            },
            mixing: {
              title: 'Mixage',
              description: 'Donnez vie à votre musique avec un mixage professionnel qui équilibre parfaitement tous les éléments de votre enregistrement.',
              longDescription: `Le mixage est l'art de transformer des pistes individuelles en une production cohérente et équilibrée. Notre service de mixage professionnel vous aide à obtenir un son de qualité commerciale qui se démarque.

Notre ingénieur de mixage utilise un équipement analogique et numérique de pointe pour façonner chaque élément de votre musique. Nous travaillons en étroite collaboration avec vous pour comprendre votre vision artistique et la traduire dans le mix final.

Le processus comprend l'équilibrage des niveaux, l'égalisation, la compression, l'ajout d'effets et le placement spatial pour créer une image stéréo immersive. Nous offrons également des révisions pour nous assurer que vous êtes entièrement satisfait du résultat final.`,
              image: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=2000&auto=format&fit=crop',
              price: 45,
              features: [
                'Équilibrage précis des niveaux',
                'Traitement dynamique professionnel',
                'Égalisation détaillée',
                'Effets créatifs',
                'Placement stéréo immersif',
                'Révisions incluses'
              ]
            },
            mastering: {
              title: 'Mastering',
              description: 'Finalisez votre projet avec un mastering qui donne à votre musique la cohérence et le volume nécessaires pour briller sur toutes les plateformes.',
              longDescription: `Le mastering est l'étape finale cruciale qui donne à votre musique la touche professionnelle nécessaire pour concurrencer les sorties commerciales. Notre service de mastering transforme vos mixages en morceaux cohérents, équilibrés et prêts à être distribués.

Notre ingénieur de mastering utilise une combinaison d'équipements analogiques haut de gamme et d'outils numériques de précision pour optimiser votre son. Nous traitons chaque projet avec une attention méticuleuse aux détails, en veillant à ce que votre musique sonne de manière optimale sur toutes les plateformes et systèmes de lecture.

Le processus comprend l'égalisation finale, la compression, la limitation, le traitement stéréo et l'optimisation du volume pour atteindre les standards de l'industrie tout en préservant la dynamique musicale essentielle.`,
              image: 'https://images.unsplash.com/photo-1558584673-c834fb1cc3ca?q=80&w=2000&auto=format&fit=crop',
              price: 35,
              features: [
                'Équipement analogique haut de gamme',
                'Optimisation pour toutes les plateformes',
                'Cohérence sonore entre les morceaux',
                'Maximisation du volume',
                'Préservation de la dynamique',
                'Formats adaptés à la distribution'
              ]
            },
            production: {
              title: 'Production',
              description: 'Bénéficiez d\'un accompagnement artistique complet pour développer votre son unique, de la composition à la finalisation.',
              longDescription: `Notre service de production musicale offre un accompagnement artistique complet pour transformer vos idées en productions finies de qualité professionnelle. Que vous partiez d'une simple mélodie ou que vous ayez déjà une démo, notre producteur travaillera avec vous pour développer votre vision artistique.

Nous combinons expertise technique et sensibilité artistique pour vous aider à créer un son unique qui vous représente. Notre approche collaborative vous place au centre du processus créatif, tout en vous faisant bénéficier de notre expérience et de nos connaissances de l'industrie.

Le service comprend l'arrangement musical, la programmation, l'enregistrement, le choix des instruments et des sons, ainsi que le mixage et le mastering. Nous pouvons également faire appel à notre réseau de musiciens de session si votre projet nécessite des instruments spécifiques.`,
              image: 'https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=2000&auto=format&fit=crop',
              price: 75,
              features: [
                'Direction artistique',
                'Arrangement musical',
                'Programmation',
                'Enregistrement',
                'Mixage et mastering',
                'Musiciens de session disponibles'
              ]
            }
          };
          
          if (services[slug as keyof typeof services]) {
            setService(services[slug as keyof typeof services]);
          } else {
            setError('Service non trouvé');
          }
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erreur lors de la récupération du service:', error);
        setError('Impossible de charger les informations du service');
        setIsLoading(false);
      }
    };
    
    fetchService();
  }, [slug]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error || !service) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="bg-card border border-gray-800 rounded-xl p-8 text-center max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Service non trouvé</h1>
            <p className="text-gray-400 mb-6">
              Désolé, le service que vous recherchez n'existe pas ou n'est pas disponible.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src={service.image}
            alt={service.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <Link 
            href="/#services"
            className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Retour aux services
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            {service.title}
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl">
            {service.description}
          </p>
          
          <div className="mt-8 inline-flex items-center bg-primary/20 px-4 py-2 rounded-lg text-primary">
            <span className="text-2xl font-bold">{service.price}€</span>
            <span className="ml-1 text-sm">/heure</span>
          </div>
        </div>
      </section>
      
      {/* Content Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">À propos de ce service</h2>
              <div className="prose prose-invert max-w-none">
                {service.longDescription.split('\n\n').map((paragraph: string, index: number) => (
                  <p key={index} className="mb-4 text-gray-300">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            
            <div>
              <div className="bg-background border border-gray-800 rounded-xl p-6 sticky top-8">
                <h3 className="text-xl font-bold mb-4">Ce qui est inclus</h3>
                <ul className="space-y-3">
                  {service.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex items-center justify-center bg-primary/20 text-primary rounded-full w-5 h-5 text-xs mr-3 mt-0.5">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8">
                  <Link 
                    href="/reservation"
                    className="block w-full bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium text-center transition-colors"
                  >
                    <FiCalendar className="inline-block mr-2" />
                    Réserver une session
                  </Link>
                  
                  <Link 
                    href="/contact"
                    className="block w-full mt-4 bg-transparent border border-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium text-center transition-colors"
                  >
                    Nous contacter
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à donner vie à votre projet ?</h2>
          <p className="text-gray-400 max-w-3xl mx-auto mb-8">
            Réservez dès maintenant une session pour notre service de {service.title.toLowerCase()} et bénéficiez de notre expertise pour réaliser votre vision musicale.
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
    </main>
  );
} 