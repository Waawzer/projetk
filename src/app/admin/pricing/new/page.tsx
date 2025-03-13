'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiSave, FiArrowLeft, FiPlus, FiTrash } from 'react-icons/fi';

interface Feature {
  text: string;
  included: boolean;
}

export default function NewPricingPlanPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  // État du formulaire
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState<Feature[]>([
    { text: '', included: true }
  ]);
  const [popular, setPopular] = useState(false);
  
  // Ajouter une fonctionnalité
  const addFeature = () => {
    setFeatures([...features, { text: '', included: true }]);
  };
  
  // Supprimer une fonctionnalité
  const removeFeature = (index: number) => {
    if (features.length <= 1) return; // Garder au moins une fonctionnalité
    const newFeatures = [...features];
    newFeatures.splice(index, 1);
    setFeatures(newFeatures);
  };
  
  // Mettre à jour le texte d'une fonctionnalité
  const updateFeatureText = (index: number, text: string) => {
    const newFeatures = [...features];
    newFeatures[index].text = text;
    setFeatures(newFeatures);
  };
  
  // Mettre à jour l'inclusion d'une fonctionnalité
  const updateFeatureIncluded = (index: number, included: boolean) => {
    const newFeatures = [...features];
    newFeatures[index].included = included;
    setFeatures(newFeatures);
  };
  
  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation du formulaire
    if (!title.trim()) {
      setFormError('Le titre est requis.');
      return;
    }
    
    if (!price.trim() || isNaN(Number(price)) || Number(price) < 0) {
      setFormError('Le prix doit être un nombre positif.');
      return;
    }
    
    if (!description.trim()) {
      setFormError('La description est requise.');
      return;
    }
    
    // Vérifier que toutes les fonctionnalités ont un texte
    const emptyFeatureIndex = features.findIndex(feature => !feature.text.trim());
    if (emptyFeatureIndex !== -1) {
      setFormError(`La fonctionnalité ${emptyFeatureIndex + 1} ne peut pas être vide.`);
      return;
    }
    
    setIsSubmitting(true);
    setFormError('');
    
    try {
      // Créer l'objet de données pour le tarif
      const pricingData = {
        title,
        price: Number(price),
        description,
        features,
        popular,
      };
      
      // Envoyer les données à l'API
      const response = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pricingData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'ajout du tarif');
      }
      
      setFormSuccess('Le tarif a été ajouté avec succès !');
      
      // Rediriger vers la liste des tarifs après 2 secondes
      setTimeout(() => {
        router.push('/admin/pricing');
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du tarif:', error);
      setFormError('Une erreur est survenue lors de l\'ajout du tarif. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Ajouter un tarif</h1>
          <p className="text-gray-400 mt-1">Ajoutez une nouvelle formule tarifaire à votre site</p>
        </div>
        <Link
          href="/admin/pricing"
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
      
      <form onSubmit={handleSubmit} className="bg-card border border-gray-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations de base */}
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Titre du tarif"
              />
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
                Prix (€/h) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="1"
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Prix par heure"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Description du tarif"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="popular"
                checked={popular}
                onChange={(e) => setPopular(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-700 rounded bg-background"
              />
              <label htmlFor="popular" className="ml-2 block text-sm text-gray-300">
                Mettre en avant comme tarif populaire
              </label>
            </div>
          </div>
          
          {/* Fonctionnalités */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Fonctionnalités <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addFeature}
                className="text-primary hover:text-primary-hover text-sm flex items-center"
              >
                <FiPlus className="mr-1" size={14} />
                Ajouter
              </button>
            </div>
            
            <div className="space-y-3 mt-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`feature-${index}`}
                      checked={feature.included}
                      onChange={(e) => updateFeatureIncluded(index, e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-700 rounded bg-background"
                    />
                    <label htmlFor={`feature-${index}`} className="sr-only">
                      Fonctionnalité incluse
                    </label>
                  </div>
                  <input
                    type="text"
                    value={feature.text}
                    onChange={(e) => updateFeatureText(index, e.target.value)}
                    className={`flex-1 px-3 py-2 bg-background border ${
                      feature.included 
                        ? 'border-primary/30 text-white focus:border-primary' 
                        : 'border-gray-700 text-gray-400'
                    } rounded-md shadow-sm focus:outline-none focus:ring-primary`}
                    placeholder="Texte de la fonctionnalité"
                  />
                  <div className="flex-shrink-0 w-24 text-xs">
                    <span className={`px-2 py-1 rounded-full ${
                      feature.included 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-gray-800 text-gray-400'
                    }`}>
                      {feature.included ? 'Incluse' : 'Non incluse'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    disabled={features.length <= 1}
                    className="text-red-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <FiTrash size={18} />
                  </button>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-gray-400 mt-2">
              Cochez la case pour les fonctionnalités incluses, décochez-la pour les fonctionnalités non incluses.
            </p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <Link
            href="/admin/pricing"
            className="bg-gray-700 text-white px-4 py-2 rounded-md mr-4 hover:bg-gray-600"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                Enregistrement...
              </>
            ) : (
              <>
                <FiSave className="mr-2" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 