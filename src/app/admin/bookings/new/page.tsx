'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiSave, FiArrowLeft, FiCalendar, FiClock } from 'react-icons/fi';

export default function NewBookingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  // État du formulaire
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('120');
  const [notes, setNotes] = useState('');
  
  // Obtenir la date minimale (aujourd'hui)
  const today = new Date().toISOString().split('T')[0];
  
  // Liste des services disponibles
  const serviceOptions = [
    { value: '', label: 'Sélectionnez un service' },
    { value: 'recording', label: 'Enregistrement' },
    { value: 'mixing', label: 'Mixage' },
    { value: 'mastering', label: 'Mastering' },
    { value: 'production', label: 'Production' },
  ];
  
  // Liste des durées disponibles
  const durationOptions = [
    { value: '60', label: '1 heure' },
    { value: '120', label: '2 heures' },
    { value: '180', label: '3 heures' },
    { value: '240', label: '4 heures' },
    { value: '300', label: '5 heures' },
    { value: '360', label: '6 heures' },
    { value: '420', label: '7 heures' },
    { value: '480', label: '8 heures' },
  ];
  
  // Validation de l'email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation du formulaire
    if (!customerName.trim()) {
      setFormError('Le nom du client est requis.');
      return;
    }
    
    if (!customerEmail.trim()) {
      setFormError('L\'email du client est requis.');
      return;
    }
    
    if (!isValidEmail(customerEmail)) {
      setFormError('L\'email n\'est pas valide.');
      return;
    }
    
    if (!service) {
      setFormError('Le service est requis.');
      return;
    }
    
    if (!date) {
      setFormError('La date est requise.');
      return;
    }
    
    if (!time) {
      setFormError('L\'heure est requise.');
      return;
    }
    
    setIsSubmitting(true);
    setFormError('');
    
    try {
      // Créer l'objet de réservation
      const bookingData = {
        customerName,
        customerEmail,
        service,
        date,
        time,
        duration: parseInt(duration),
        notes,
        status: 'pending'
      };
      
      // Appel API pour créer la réservation
      const response = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création de la réservation');
      }
      
      const data = await response.json();
      
      setFormSuccess('La réservation a été créée avec succès !');
      
      // Rediriger vers la liste des réservations après 2 secondes
      setTimeout(() => {
        router.push('/admin/bookings');
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      setFormError('Une erreur est survenue lors de la création de la réservation. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Ajouter une réservation</h1>
          <p className="text-gray-400 mt-1">Créez une nouvelle réservation pour un client</p>
        </div>
        <Link
          href="/admin/bookings"
          className="flex items-center text-gray-400 hover:text-white"
        >
          <FiArrowLeft className="mr-2" />
          Retour à la liste
        </Link>
      </div>
      
      {formError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-lg mb-6">
          {formError}
        </div>
      )}
      
      {formSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-500 p-4 rounded-lg mb-6">
          {formSuccess}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations du client */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium">Informations du client</h2>
            
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-300 mb-1">
                Nom du client <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Nom complet du client"
              />
            </div>
            
            <div>
              <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-300 mb-1">
                Email du client <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="customerEmail"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="email@exemple.com"
              />
            </div>
            
            <div>
              <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-1">
                Service <span className="text-red-500">*</span>
              </label>
              <select
                id="service"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                {serviceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Détails de la réservation */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium">Détails de la réservation</h2>
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={today}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
                <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-1">
                Heure <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  id="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
                <FiClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">
                Durée <span className="text-red-500">*</span>
              </label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Informations supplémentaires sur la réservation..."
          ></textarea>
        </div>
        
        <div className="mt-8 flex justify-end">
          <Link
            href="/admin/bookings"
            className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 mr-4"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md flex items-center ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                Création en cours...
              </>
            ) : (
              <>
                <FiSave className="mr-2" />
                Créer la réservation
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 