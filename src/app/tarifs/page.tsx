'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import PricingCard from '@/components/PricingCard';
import BlackHoleLogo from '@/components/BlackHoleLogo';

interface PricingPlan {
  _id: string;
  title: string;
  price: number;
  description: string;
  features: {
    text: string;
    included: boolean;
  }[];
  popular: boolean;
}

// Données d'exemple pour les tarifs
const examplePricingPlans: PricingPlan[] = [
  {
    _id: '1',
    title: 'Enregistrement',
    price: 60,
    description: 'Idéal pour les artistes souhaitant enregistrer leurs morceaux avec un équipement professionnel.',
    features: [
      { text: 'Studio acoustique traité', included: true },
      { text: 'Microphones haut de gamme', included: true },
      { text: 'Ingénieur du son', included: true },
      { text: 'Mixage de base', included: true },
      { text: 'Mastering', included: false },
      { text: 'Production musicale', included: false },
    ],
    popular: false,
  },
  {
    _id: '2',
    title: 'Production Complète',
    price: 120,
    description: 'Notre formule la plus populaire pour une production professionnelle de A à Z.',
    features: [
      { text: 'Studio acoustique traité', included: true },
      { text: 'Microphones haut de gamme', included: true },
      { text: 'Ingénieur du son', included: true },
      { text: 'Mixage professionnel', included: true },
      { text: 'Mastering', included: true },
      { text: 'Production musicale', included: true },
      { text: 'Musiciens de session', included: true },
    ],
    popular: true,
  },
  {
    _id: '3',
    title: 'Mixage',
    price: 50,
    description: 'Pour les artistes ayant déjà enregistré leurs pistes et souhaitant un mixage professionnel.',
    features: [
      { text: 'Mixage professionnel', included: true },
      { text: 'Corrections et ajustements', included: true },
      { text: 'Effets et traitements', included: true },
      { text: 'Mastering', included: false },
      { text: 'Enregistrement', included: false },
      { text: 'Production musicale', included: false },
    ],
    popular: false,
  },
  {
    _id: '4',
    title: 'Mastering',
    price: 40,
    description: 'La touche finale pour donner à votre musique un son professionnel prêt pour la distribution.',
    features: [
      { text: 'Mastering professionnel', included: true },
      { text: 'Optimisation pour streaming', included: true },
      { text: 'Optimisation pour CD/vinyle', included: true },
      { text: 'Mixage', included: false },
      { text: 'Enregistrement', included: false },
      { text: 'Production musicale', included: false },
    ],
    popular: false,
  },
];

export default function PricingPage() {
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        const response = await fetch('/api/pricing');
        
        if (!response.ok) {
          console.warn('Impossible de récupérer les tarifs depuis l\'API, utilisation des données d\'exemple');
          setPricingPlans(examplePricingPlans);
          return;
        }
        
        const data = await response.json();
        
        // Si aucun tarif n'est retourné par l'API, utiliser les données d'exemple
        if (!data || data.length === 0) {
          console.warn('Aucun tarif retourné par l\'API, utilisation des données d\'exemple');
          setPricingPlans(examplePricingPlans);
          return;
        }
        
        setPricingPlans(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des tarifs:', error);
        // En cas d'erreur, retourner les données d'exemple
        console.warn('Utilisation des données d\'exemple suite à une erreur');
        setPricingPlans(examplePricingPlans);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPricingPlans();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Nos Tarifs</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Des formules adaptées à tous vos besoins musicaux, avec un excellent rapport qualité-prix
          </p>
        </div>
      </section>
      
      {/* Pricing Cards */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingPlans.map((plan) => (
              <PricingCard
                key={plan._id}
                title={plan.title}
                price={plan.price}
                description={plan.description}
                features={plan.features}
                popular={plan.popular}
                buttonText="Réserver"
                onButtonClick={() => window.location.href = '/reservation'}
              />
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-gray-400 mb-6">
              Tous nos tarifs sont indiqués par heure. Des forfaits pour demi-journée (6h) et journée complète (10h) sont disponibles avec des réductions.
            </p>
            <Link 
              href="/contact" 
              className="text-primary hover:text-primary-hover inline-flex items-center font-medium"
            >
              Besoin d'une formule personnalisée ? Contactez-nous
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Questions Fréquentes</h2>
          
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="card">
              <h3 className="text-xl font-bold mb-3">Comment se déroule une session d'enregistrement ?</h3>
              <p className="text-gray-400">
                Une session d'enregistrement commence par une discussion sur votre projet, suivie de la mise en place du matériel. Nous procédons ensuite à l'enregistrement des différentes pistes, avec les conseils de notre ingénieur du son pour obtenir le meilleur résultat possible.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-bold mb-3">Combien de temps faut-il pour enregistrer une chanson ?</h3>
              <p className="text-gray-400">
                La durée varie selon la complexité du morceau et le nombre d'instruments. En moyenne, comptez 3 à 4 heures pour un morceau simple, et jusqu'à une journée complète pour des compositions plus élaborées.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-bold mb-3">Puis-je apporter mes propres instruments ?</h3>
              <p className="text-gray-400">
                Absolument ! Nous vous encourageons à apporter vos instruments personnels pour capturer votre son unique. Notre studio dispose également d'une sélection d'instruments de qualité si nécessaire.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-bold mb-3">Quel est le délai pour recevoir les fichiers finaux ?</h3>
              <p className="text-gray-400">
                Pour le mixage, comptez environ 1 semaine par morceau. Pour le mastering, le délai est généralement de 2 à 3 jours. Ces délais peuvent varier en fonction de la complexité du projet et de notre charge de travail actuelle.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-bold mb-3">Comment fonctionne le paiement ?</h3>
              <p className="text-gray-400">
                Un acompte de 50% est requis pour confirmer votre réservation. Le solde est payable à la fin de la session ou à la livraison des fichiers finaux. Nous acceptons les paiements par carte bancaire, PayPal ou virement bancaire.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à concrétiser votre projet musical ?</h2>
          <p className="text-gray-400 max-w-3xl mx-auto mb-8">
            Réservez dès maintenant une session dans notre studio et bénéficiez de notre expertise pour réaliser votre vision musicale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/reservation" 
              className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg font-medium"
            >
              Réserver une session
            </Link>
            <Link 
              href="/contact" 
              className="bg-transparent border border-white/30 hover:bg-white/10 text-white px-8 py-3 rounded-lg font-medium"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-10 bg-background border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <BlackHoleLogo className="text-primary mr-2" size={24} />
                <span className="text-primary mr-1">Kasar</span>
                <span>Studio</span>
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