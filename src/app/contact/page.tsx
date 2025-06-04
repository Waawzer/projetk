"use client";

import Image from "next/image";
import { FiMapPin, FiPhone, FiMail, FiClock } from "react-icons/fi";
import Navbar from "@/components/Navbar";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Contactez-nous
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Une question, un projet ou une demande spécifique ? N&apos;hésitez
            pas à nous contacter.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 min-h-[600px]">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold mb-8">
                Informations de Contact
              </h2>

              <div className="space-y-6 mb-10">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <FiMapPin className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Adresse</h3>
                    <p className="text-gray-400">
                      Villeurbanne, secteur Charpennes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <FiPhone className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Téléphone</h3>
                    <p className="text-gray-400">+33 6 12 34 56 78</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <FiMail className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Email</h3>
                    <p className="text-gray-400">contact@kasarstudio.fr</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <FiClock className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Horaires</h3>
                    <p className="text-gray-400">Lundi - Samedi: 10h - 22h</p>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <Image
                  src="/images/micro.png"
                  alt="Carte de localisation"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center"></div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-8">
                Envoyez-nous un message
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Questions Fréquentes
          </h2>

          <div className="max-w-3xl mx-auto space-y-8">
            <div className="card">
              <h3 className="text-xl font-bold mb-3">
                Quel est le délai de réponse à un message ?
              </h3>
              <p className="text-gray-400">
                Nous nous efforçons de répondre à tous les messages dans un
                délai de 24 heures ouvrées. Pour les demandes urgentes, nous
                vous recommandons de nous appeler directement.
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-3">
                Comment puis-je réserver une visite du studio ?
              </h3>
              <p className="text-gray-400">
                Vous pouvez demander une visite du studio en utilisant le
                formulaire de contact ci-dessus ou en nous appelant directement.
                Les visites sont gratuites et sans engagement.
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-3">
                Proposez-vous des tarifs spéciaux pour les projets à long terme
                ?
              </h3>
              <p className="text-gray-400">
                Oui, nous proposons des tarifs dégressifs pour les projets
                nécessitant plusieurs jours d&apos;enregistrement ou de
                production. Contactez-nous pour discuter de votre projet et
                obtenir un devis personnalisé.
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
