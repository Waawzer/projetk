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

interface EditPricingFormProps {
  id: string;
}

export default function EditPricingForm({ id }: EditPricingFormProps) {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  // Form state
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState<Feature[]>([
    { text: '', included: true }
  ]);
  const [popular, setPopular] = useState(false);
  const [order, setOrder] = useState(0);
  
  // Load pricing data
  useEffect(() => {
    const fetchPricingPlan = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/admin/pricing?id=${id}`);
        
        if (!response.ok) {
          throw new Error('Error fetching pricing plan');
        }
        
        const data: PricingPlan = await response.json();
        
        // Fill form with data
        setTitle(data.title);
        setPrice(data.price.toString());
        setDescription(data.description);
        setFeatures(data.features || [{ text: '', included: true }]);
        setPopular(data.popular);
        setOrder(data.order);
      } catch (error) {
        console.error('Error fetching pricing plan:', error);
        setFormError('Unable to load pricing plan data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPricingPlan();
  }, [id]);
  
  // Add feature
  const addFeature = () => {
    setFeatures([...features, { text: '', included: true }]);
  };
  
  // Remove feature
  const removeFeature = (index: number) => {
    if (features.length <= 1) return; // Keep at least one feature
    const newFeatures = [...features];
    newFeatures.splice(index, 1);
    setFeatures(newFeatures);
  };
  
  // Update feature text
  const updateFeatureText = (index: number, text: string) => {
    const newFeatures = [...features];
    newFeatures[index].text = text;
    setFeatures(newFeatures);
  };
  
  // Update feature inclusion
  const updateFeatureIncluded = (index: number, included: boolean) => {
    const newFeatures = [...features];
    newFeatures[index].included = included;
    setFeatures(newFeatures);
  };
  
  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!title.trim()) {
      setFormError('Title is required.');
      return;
    }
    
    if (!price.trim() || isNaN(Number(price)) || Number(price) < 0) {
      setFormError('Price must be a positive number.');
      return;
    }
    
    if (!description.trim()) {
      setFormError('Description is required.');
      return;
    }
    
    // Check that all features have text
    const emptyFeatureIndex = features.findIndex(feature => !feature.text.trim());
    if (emptyFeatureIndex !== -1) {
      setFormError(`Feature ${emptyFeatureIndex + 1} cannot be empty.`);
      return;
    }
    
    setIsSubmitting(true);
    setFormError('');
    
    try {
      // Create pricing data object
      const pricingData = {
        id,
        title,
        price: Number(price),
        description,
        features,
        popular,
        order,
      };
      
      // Send data to API
      const response = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pricingData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error updating pricing plan');
      }
      
      setFormSuccess('Pricing plan updated successfully!');
      
      // Redirect to pricing list after 2 seconds
      setTimeout(() => {
        router.push('/admin/pricing');
      }, 2000);
    } catch (error) {
      console.error('Error updating pricing plan:', error);
      setFormError('An error occurred while updating the pricing plan. Please try again.');
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
            Edit Pricing Plan
          </h1>
          <p className="text-gray-400 mt-2">Modify the information for this pricing plan</p>
        </div>
        <Link
          href="/admin/pricing"
          className="flex items-center px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200"
        >
          <FiArrowLeft className="mr-2" />
          Back to list
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
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-200 mb-6">General Information</h2>
            
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="Pricing plan title"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="price" className="block text-sm font-medium text-gray-300">
                Price (€/h) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="1"
                className="w-full px-4 py-3 bg-background border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="Price per hour"
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
                placeholder="Plan description"
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
                Highlight as popular plan
              </label>
            </div>
          </div>
          
          {/* Features */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-200">
                Features <span className="text-red-500">*</span>
              </h2>
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center px-4 py-2 rounded-lg text-primary hover:text-white hover:bg-primary/20 transition-all duration-200"
              >
                <FiPlus className="mr-2" size={16} />
                Add
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
                    placeholder="Feature text"
                  />
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      feature.included 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-gray-800 text-gray-400'
                    }`}>
                      {feature.included ? 'Included' : 'Not included'}
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
              Check the box for included features, uncheck for non-included features.
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end space-x-4">
          <Link
            href="/admin/pricing"
            className="px-6 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-200"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-2"></span>
                Saving...
              </>
            ) : (
              <>
                <FiSave className="mr-2" />
                Save
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 