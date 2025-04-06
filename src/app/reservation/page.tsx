"use client";

import Image from "next/image";
import { FiCalendar, FiCreditCard, FiCheckCircle } from "react-icons/fi";
import Navbar from "@/components/Navbar";
import BookingForm from "@/components/BookingForm";
import Footer from "@/components/Footer";

export default function ReservationPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Réservation</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Réservez votre session en quelques clics et donnez vie à votre
            projet musical
          </p>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <BookingForm />
            </div>

            {/* Sidebar */}
            <div>
              <div className="sticky top-32">
                <div className="bg-card-hover rounded-xl overflow-hidden mb-8">
                  <div className="relative h-48 w-full">
                    <Image
                      src="https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=600&auto=format&fit=crop"
                      alt="Studio d'enregistrement"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-4">
                      Pourquoi nous choisir ?
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <FiCheckCircle className="text-primary mt-1 mr-3 flex-shrink-0" />
                        <span className="text-gray-300">
                          Équipement professionnel haut de gamme
                        </span>
                      </li>
                      <li className="flex items-start">
                        <FiCheckCircle className="text-primary mt-1 mr-3 flex-shrink-0" />
                        <span className="text-gray-300">
                          Ingénieurs du son expérimentés
                        </span>
                      </li>
                      <li className="flex items-start">
                        <FiCheckCircle className="text-primary mt-1 mr-3 flex-shrink-0" />
                        <span className="text-gray-300">
                          Acoustique parfaite pour un son optimal
                        </span>
                      </li>
                      <li className="flex items-start">
                        <FiCheckCircle className="text-primary mt-1 mr-3 flex-shrink-0" />
                        <span className="text-gray-300">
                          Ambiance créative et inspirante
                        </span>
                      </li>
                      <li className="flex items-start">
                        <FiCheckCircle className="text-primary mt-1 mr-3 flex-shrink-0" />
                        <span className="text-gray-300">
                          Accompagnement personnalisé
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-card-hover rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">
                    Informations importantes
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <FiCalendar className="text-primary" size={18} />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">
                          Politique d&apos;annulation
                        </h4>
                        <p className="text-sm text-gray-400">
                          Annulation gratuite jusqu&apos;à 48h avant la session.
                          Au-delà, l&apos;acompte n&apos;est pas remboursable.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <FiCreditCard className="text-primary" size={18} />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Paiement</h4>
                        <p className="text-sm text-gray-400">
                          Un acompte de 50% est requis pour confirmer votre
                          réservation. Le solde est payable à la fin de la
                          session.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Ce que disent nos clients
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop"
                    alt="Avatar"
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold">Thomas Durand</h3>
                  <p className="text-sm text-gray-400">Chanteur</p>
                </div>
              </div>
              <p className="text-gray-300">
                &quot;Une expérience incroyable ! L&apos;équipe est
                professionnelle et attentive, le matériel est de qualité et
                l&apos;ambiance est parfaite pour créer. Je recommande vivement
                ce studio.&quot;
              </p>
            </div>

            <div className="card">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop"
                    alt="Avatar"
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold">Sophie Martin</h3>
                  <p className="text-sm text-gray-400">Guitariste</p>
                </div>
              </div>
              <p className="text-gray-300">
                &quot;J&apos;ai enregistré mon premier EP dans ce studio et je
                ne pouvais pas être plus satisfaite. Le son est impeccable et
                les conseils de l&apos;ingénieur ont vraiment amélioré mes
                morceaux.&quot;
              </p>
            </div>

            <div className="card">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=100&auto=format&fit=crop"
                    alt="Avatar"
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold">Marc Dubois</h3>
                  <p className="text-sm text-gray-400">Producteur</p>
                </div>
              </div>
              <p className="text-gray-300">
                &quot;En tant que producteur, j&apos;ai travaillé dans de
                nombreux studios, mais celui-ci offre un rapport qualité-prix
                exceptionnel. L&apos;acoustique est parfaite et l&apos;équipe
                est très compétente.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
