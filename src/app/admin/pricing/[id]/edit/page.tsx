'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiSave, FiArrowLeft, FiPlus, FiTrash } from 'react-icons/fi';

interface Feature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  _id: string;
  title: string;
  price: number;
  description: string;
  features: Feature[];
  popular: boolean;
  order: number;
}

export default function EditPricingPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const router = useRouter();
  const [id, setId] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(true);
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
  const [order, setOrder] = useState(0);
  
  // Récupérer l'ID depuis les paramètres
  useEffect(() => {
    const getParams = async () => {
      try {
        const resolvedParams = await params;
        setId(resolvedParams.id);
      } catch (error) {
        console.error('Error resolving params:', error);
        setFormError('Erreur lors de la récupération des paramètres');
      }
    };
    
    getParams();
  }, [params]);
  
  // Charger les données du tarif
  useEffect(() => {
    if (!id) return;
    
    const fetchPricingPlan = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/admin/pricing?id=${id}`);
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du tarif');
        }
        
        const data: PricingPlan = await response.json();
        
        // Remplir le formulaire avec les données
        setTitle(data.title);
        setPrice(data.price.toString());
        setDescription(data.description);
        setFeatures(data.features || [{ text: '', included: true }]);
        setPopular(data.popular);
        setOrder(data.order);
      } catch (error) {
        console.error('Erreur lors de la récupération du tarif:', error);
        setFormError('Impossible de charger les données du tarif. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPricingPlan();
  }, [id]);
  
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
        id,
        title,
        price: Number(price),
        description,
        features,
        popular,
        order,
      };
      
      // Envoyer les données à l'API
      const response = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pricingData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du tarif');
      }
      
      setFormSuccess('Le tarif a été mis à jour avec succès !');
      
      // Rediriger vers la liste des tarifs après 2 secondes
      setTimeout(() => {
        router.push('/admin/pricing');
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du tarif:', error);
      setFormError('Une erreur est survenue lors de la mise à jour du tarif. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            Modifier un tarif
          </h1>
          <p className="text-gray-400 mt-2">Modifiez les informations de cette formule tarifaire</p>
        </div>
        <Link
          href="/admin/pricing"
          className="flex items-center px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200"
        >
          <FiArrowLeft className="mr-2" />
          Retour à la liste
        </Link>
      </div>
      
      {formError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-lg mb-6 animate-fade-in">
          {formError}
        </div>
      )}
      
      {formSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-500 p-4 rounded-lg mb-6 animate-fade-in">
          {formSuccess}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-card border border-gray-800 rounded-xl p-8 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informations de base */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-200 mb-6">Informations générales</h2>
            
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="Titre du tarif"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="price" className="block text-sm font-medium text-gray-300">
                Prix (€/h) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="1"
                className="w-full px-4 py-3 bg-background border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="Prix par heure"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-background border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Description du tarif"
              />
            </div>
            
            <div className="flex items-center bg-background/50 p-4 rounded-lg border border-gray-700">
              <input
                type="checkbox"
                id="popular"
                checked={popular}
                onChange={(e) => setPopular(e.target.checked)}
                className="h-5 w-5 text-primary focus:ring-primary border-gray-700 rounded bg-background transition-all duration-200"
              />
              <label htmlFor="popular" className="ml-3 block text-sm text-gray-300">
                Mettre en avant comme tarif populaire
              </label>
            </div>
          </div>
          
          {/* Fonctionnalités */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-200">
                Fonctionnalités <span className="text-red-500">*</span>
              </h2>
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center px-4 py-2 rounded-lg text-primary hover:text-white hover:bg-primary/20 transition-all duration-200"
              >
                <FiPlus className="mr-2" size={16} />
                Ajouter
              </button>
            </div>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className={`group flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                    feature.included 
                      ? 'bg-primary/5 border-primary/30' 
                      : 'bg-background border-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`feature-${index}`}
                      checked={feature.included}
                      onChange={(e) => updateFeatureIncluded(index, e.target.checked)}
                      className="h-5 w-5 text-primary focus:ring-primary border-gray-700 rounded bg-background transition-all duration-200"
                    />
                  </div>
                  <input
                    type="text"
                    value={feature.text}
                    onChange={(e) => updateFeatureText(index, e.target.value)}
                    className={`flex-1 px-3 py-2 bg-transparent border-0 focus:ring-0 ${
                      feature.included 
                        ? 'text-white placeholder-gray-400' 
                        : 'text-gray-400 placeholder-gray-600'
                    }`}
                    placeholder="Texte de la fonctionnalité"
                  />
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      feature.included 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-gray-800 text-gray-400'
                    }`}>
                      {feature.included ? 'Incluse' : 'Non incluse'}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      disabled={features.length <= 1}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <FiTrash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-gray-400 mt-4">
              Cochez la case pour les fonctionnalités incluses, décochez-la pour les fonctionnalités non incluses.
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end space-x-4">
          <Link
            href="/admin/pricing"
            className="px-6 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-200"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-2"></span>
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