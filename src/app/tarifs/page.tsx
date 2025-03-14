'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';
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
  
  // Refs pour les animations au scroll
  const headerRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);
  const faqRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  
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
        
        {/* Floating elements - ajustés pour être moins intrusifs sur mobile */}
        <div className="absolute top-20 left-10 w-40 md:w-64 h-40 md:h-64 rounded-full bg-purple-500/10 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 md:w-80 h-40 md:h-80 rounded-full bg-blue-500/10 blur-3xl"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">Nos Tarifs</h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Des formules adaptées à tous vos besoins musicaux, avec un excellent rapport qualité-prix
            </p>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Pricing Cards */}
      <motion.section 
        ref={pricingRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="py-16 md:py-20"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className={`relative rounded-2xl overflow-hidden ${
                  plan.popular ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/20' : 'border border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                    POPULAIRE
                  </div>
                )}
                
                <div className="p-6 bg-card backdrop-blur-sm">
                  <h3 className="text-xl font-bold mb-2">{plan.title}</h3>
                  <div className="flex items-end mb-4">
                    <span className="text-3xl font-bold">{plan.price}€</span>
                    <span className="text-gray-400 ml-1">/heure</span>
                  </div>
                  <p className="text-gray-400 mb-6 min-h-[60px]">{plan.description}</p>
                  
                  <button 
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg hover:shadow-purple-500/20 text-white' 
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    Réserver
                  </button>
                </div>
                
                <div className="p-6 bg-card/50">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className={`mr-2 mt-1 ${feature.included ? 'text-emerald-400' : 'text-gray-500'}`}>
                          <FiCheck size={16} />
                        </span>
                        <span className={feature.included ? 'text-gray-300' : 'text-gray-500 line-through'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-12 md:mt-16 text-center"
          >
            <p className="text-gray-400 mb-6">
              Tous nos tarifs sont indiqués par heure. Des forfaits pour demi-journée (6h) et journée complète (10h) sont disponibles avec des réductions.
            </p>
            <Link 
              href="/contact" 
              className="text-primary hover:text-primary-hover inline-flex items-center font-medium group"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500 group-hover:from-purple-500 group-hover:to-blue-600 transition-all duration-300">
                Besoin d'une formule personnalisée ? Contactez-nous
              </span>
              <FiArrowRight className="ml-2 text-blue-500 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Image Section - Amélioré pour mobile */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-16 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background via-purple-900/20 to-background z-0"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:w-1/2"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
                Un studio d'exception pour des résultats exceptionnels
              </h2>
              <p className="text-gray-300 mb-6">
                Notre studio est équipé des dernières technologies audio pour garantir une qualité sonore irréprochable. Nos ingénieurs du son expérimentés vous accompagnent tout au long du processus pour donner vie à votre vision musicale.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Acoustique parfaitement traitée",
                  "Équipement haut de gamme",
                  "Ingénieurs certifiés",
                  "Ambiance créative et inspirante"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mr-3 flex-shrink-0">
                      <FiCheck size={14} className="text-white" />
                    </span>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="lg:w-1/2 relative w-full"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20 border border-white/10">
                <Image
                  src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop"
                  alt="Studio d'enregistrement professionnel"
                  width={600}
                  height={400}
                  className="object-cover w-full h-[300px] md:h-[400px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60"></div>
              </div>
              
              {/* Floating elements - ajustés pour mobile */}
              <div className="absolute -top-10 -right-10 w-20 md:w-40 h-20 md:h-40 rounded-full bg-purple-500/20 blur-3xl -z-10"></div>
              <div className="absolute -bottom-10 -left-10 w-20 md:w-40 h-20 md:h-40 rounded-full bg-blue-500/20 blur-3xl -z-10"></div>
            </motion.div>
          </div>
        </div>
      </motion.section>
      
      {/* FAQ Section */}
      <motion.section 
        ref={faqRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-16 md:py-20"
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl font-bold mb-8 md:mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500"
          >
            Questions Fréquentes
          </motion.h2>
          
          <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
            {[
              {
                question: "Comment se déroule une session d'enregistrement ?",
                answer: "Une session d'enregistrement commence par une discussion sur votre projet, suivie de la mise en place du matériel. Nous procédons ensuite à l'enregistrement des différentes pistes, avec les conseils de notre ingénieur du son pour obtenir le meilleur résultat possible."
              },
              {
                question: "Combien de temps faut-il pour enregistrer une chanson ?",
                answer: "La durée varie selon la complexité du morceau et le nombre d'instruments. En moyenne, comptez 3 à 4 heures pour un morceau simple, et jusqu'à une journée complète pour des compositions plus élaborées."
              },
              {
                question: "Puis-je apporter mes propres instruments ?",
                answer: "Absolument ! Nous vous encourageons à apporter vos instruments personnels pour capturer votre son unique. Notre studio dispose également d'une sélection d'instruments de qualité si nécessaire."
              },
              {
                question: "Quel est le délai pour recevoir les fichiers finaux ?",
                answer: "Pour le mixage, comptez environ 1 semaine par morceau. Pour le mastering, le délai est généralement de 2 à 3 jours. Ces délais peuvent varier en fonction de la complexité du projet et de notre charge de travail actuelle."
              },
              {
                question: "Comment fonctionne le paiement ?",
                answer: "Un acompte de 50% est requis pour confirmer votre réservation. Le solde est payable à la fin de la session ou à la livraison des fichiers finaux. Nous acceptons les paiements par carte bancaire, PayPal ou virement bancaire."
              }
            ].map((faq, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="card border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300"
              >
                <div className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-white">{faq.question}</h3>
                  <p className="text-sm md:text-base text-gray-400">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      
      {/* CTA Section */}
      <motion.section 
        ref={ctaRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-16 md:py-20 relative"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-background z-0"></div>
        
        {/* Floating elements - ajustés pour mobile */}
        <div className="absolute top-10 right-10 w-32 md:w-64 h-32 md:h-64 rounded-full bg-purple-500/10 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-32 md:w-80 h-32 md:h-80 rounded-full bg-blue-500/10 blur-3xl"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
              Prêt à concrétiser votre projet musical ?
            </h2>
            <p className="text-gray-300 max-w-3xl mx-auto mb-6 md:mb-8">
              Réservez dès maintenant une session dans notre studio et bénéficiez de notre expertise pour réaliser votre vision musicale.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              href="/reservation" 
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 md:px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 transform hover:scale-105"
            >
              Réserver une session
            </Link>
            <Link 
              href="/contact" 
              className="bg-transparent border border-white/30 hover:border-white/50 hover:bg-white/5 text-white px-6 md:px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
            >
              Nous contacter
            </Link>
          </motion.div>
        </div>
      </motion.section>
      
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