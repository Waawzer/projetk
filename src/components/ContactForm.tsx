'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiSend, FiCheck, FiAlertCircle } from 'react-icons/fi';

interface FormData {
  name: string;
  email: string;
  service: string;
  message: string;
}

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<FormData>();
  
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real application, you would send the data to your API
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      
      // if (!response.ok) throw new Error('Une erreur est survenue lors de l\'envoi du message.');
      
      console.log('Form data submitted:', data);
      setSubmitSuccess(true);
      reset();
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const serviceOptions = [
    { value: '', label: 'Sélectionnez un service' },
    { value: 'recording', label: 'Enregistrement' },
    { value: 'mixing', label: 'Mixage' },
    { value: 'mastering', label: 'Mastering' },
    { value: 'production', label: 'Production' },
    { value: 'other', label: 'Autre' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="form-group">
          <label htmlFor="name">Nom complet</label>
          <input
            id="name"
            type="text"
            placeholder="Votre nom"
            className={`${errors.name ? 'border-error' : ''}`}
            {...register('name', { 
              required: 'Le nom est requis',
              minLength: { value: 2, message: 'Le nom doit contenir au moins 2 caractères' }
            })}
          />
          {errors.name && (
            <p className="text-error text-sm mt-1">{errors.name.message}</p>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="votre@email.com"
            className={`${errors.email ? 'border-error' : ''}`}
            {...register('email', { 
              required: 'L\'email est requis',
              pattern: { 
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                message: 'Adresse email invalide'
              }
            })}
          />
          {errors.email && (
            <p className="text-error text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="service">Service</label>
          <select
            id="service"
            className={`${errors.service ? 'border-error' : ''}`}
            {...register('service', { 
              required: 'Veuillez sélectionner un service'
            })}
          >
            {serviceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.service && (
            <p className="text-error text-sm mt-1">{errors.service.message}</p>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            rows={5}
            placeholder="Votre message..."
            className={`${errors.message ? 'border-error' : ''}`}
            {...register('message', { 
              required: 'Le message est requis',
              minLength: { value: 10, message: 'Le message doit contenir au moins 10 caractères' }
            })}
          ></textarea>
          {errors.message && (
            <p className="text-error text-sm mt-1">{errors.message.message}</p>
          )}
        </div>
        
        {submitError && (
          <div className="bg-error/10 border border-error/30 text-error rounded-lg p-4 flex items-center">
            <FiAlertCircle className="mr-2 flex-shrink-0" />
            <p>{submitError}</p>
          </div>
        )}
        
        {submitSuccess && (
          <div className="bg-success/10 border border-success/30 text-success rounded-lg p-4 flex items-center">
            <FiCheck className="mr-2 flex-shrink-0" />
            <p>Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.</p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex items-center justify-center ${
            isSubmitting ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Envoi en cours...
            </>
          ) : (
            <>
              <FiSend className="mr-2" />
              Envoyer le message
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ContactForm; 