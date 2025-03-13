'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

export default function EditUserPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const router = useRouter();
  const { id } = params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  
  // État du formulaire
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        
        // Simuler une requête API
        // Dans une application réelle, vous feriez un appel à votre API
        setTimeout(() => {
          // Données fictives pour la démonstration
          const mockUser = {
            id,
            name: 'Utilisateur ' + id,
            email: `user${id}@example.com`,
            role: 'user'
          };
          
          setUser(mockUser);
          setName(mockUser.name);
          setEmail(mockUser.email);
          setRole(mockUser.role);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        setError('Impossible de charger les données de l\'utilisateur');
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, [id]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation du formulaire
    if (!name.trim()) {
      setError('Le nom est requis');
      return;
    }
    
    if (!email.trim()) {
      setError('L\'email est requis');
      return;
    }
    
    try {
      // Simuler une requête API pour mettre à jour l'utilisateur
      // Dans une application réelle, vous feriez un appel à votre API
      setTimeout(() => {
        // Rediriger vers la liste des utilisateurs
        router.push('/admin/users');
      }, 1000);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      setError('Erreur lors de la mise à jour de l\'utilisateur');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-6 rounded-lg">
        <p className="text-lg font-medium">{error}</p>
        <button
          onClick={() => router.push('/admin/users')}
          className="mt-4 px-4 py-2 bg-card hover:bg-card-hover text-white rounded-lg transition-colors"
        >
          Retour à la liste
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Modifier l'utilisateur</h1>
          <p className="text-gray-400 mt-1">Modifiez les informations de l'utilisateur</p>
        </div>
        <Link
          href="/admin/users"
          className="flex items-center text-gray-400 hover:text-white"
        >
          <FiArrowLeft className="mr-2" />
          Retour à la liste
        </Link>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-card border border-gray-800 rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Nom complet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Nom de l'utilisateur"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="email@exemple.com"
            />
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">
              Rôle <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <Link
            href="/admin/users"
            className="bg-gray-700 text-white px-4 py-2 rounded-md mr-4 hover:bg-gray-600"
          >
            Annuler
          </Link>
          <button
            type="submit"
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md flex items-center"
          >
            <FiSave className="mr-2" />
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
} 