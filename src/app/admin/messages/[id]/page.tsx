'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiMail, FiUser, FiCalendar, FiClock, FiTag, FiCheck, FiX } from 'react-icons/fi';

export default function MessageDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const router = useRouter();
  const { id } = params;
  
  const [message, setMessage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/messages/${id}`);
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du message');
        }
        
        const data = await response.json();
        setMessage(data);
      } catch (error) {
        console.error('Erreur:', error);
        setError('Impossible de charger le message. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessage();
  }, [id]);
  
  const toggleReadStatus = async () => {
    try {
      setIsUpdating(true);
      
      const response = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          read: !message.read,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }
      
      const updatedMessage = await response.json();
      setMessage(updatedMessage);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de mettre à jour le statut. Veuillez réessayer plus tard.');
    } finally {
      setIsUpdating(false);
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
          onClick={() => router.push('/admin/messages')}
          className="mt-4 px-4 py-2 bg-card hover:bg-card-hover text-white rounded-lg transition-colors"
        >
          Retour à la liste
        </button>
      </div>
    );
  }
  
  if (!message) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 p-6 rounded-lg">
        <p className="text-lg font-medium">Message non trouvé</p>
        <button
          onClick={() => router.push('/admin/messages')}
          className="mt-4 px-4 py-2 bg-card hover:bg-card-hover text-white rounded-lg transition-colors"
        >
          Retour à la liste
        </button>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Détail du message</h1>
          <p className="text-gray-400">Consultez et gérez les informations du message</p>
        </div>
        <Link
          href="/admin/messages"
          className="flex items-center px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200"
        >
          <FiArrowLeft className="mr-2" />
          Retour à la liste
        </Link>
      </div>
      
      <div className="bg-card border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        {/* En-tête du message */}
        <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{message.name}</h2>
            <div className="flex items-center text-gray-400 mt-1">
              <FiMail className="mr-2" />
              <a href={`mailto:${message.email}`} className="hover:text-primary transition-colors">
                {message.email}
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              message.read 
                ? 'bg-green-500/20 text-green-500' 
                : 'bg-yellow-500/20 text-yellow-500'
            }`}>
              {message.read ? 'Lu' : 'Non lu'}
            </span>
            
            <button
              onClick={toggleReadStatus}
              disabled={isUpdating}
              className={`flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                message.read
                  ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                  : 'bg-green-500/20 hover:bg-green-500/30 text-green-500'
              }`}
            >
              {isUpdating ? (
                <span className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent mr-1"></span>
              ) : message.read ? (
                <FiX className="mr-1" />
              ) : (
                <FiCheck className="mr-1" />
              )}
              Marquer comme {message.read ? 'non lu' : 'lu'}
            </button>
          </div>
        </div>
        
        {/* Informations du message */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1 flex items-center">
                  <FiUser className="mr-2" />
                  Nom
                </h3>
                <p className="text-lg">{message.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1 flex items-center">
                  <FiMail className="mr-2" />
                  Email
                </h3>
                <p className="text-lg">
                  <a href={`mailto:${message.email}`} className="hover:text-primary transition-colors">
                    {message.email}
                  </a>
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1 flex items-center">
                  <FiTag className="mr-2" />
                  Service
                </h3>
                <p className="text-lg capitalize">{message.service}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1 flex items-center">
                  <FiCalendar className="mr-2" />
                  Date de réception
                </h3>
                <p className="text-lg">{formatDate(message.createdAt)}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400 mb-1 flex items-center">
              <FiClock className="mr-2" />
              Message
            </h3>
            <div className="bg-background/50 p-6 rounded-lg border border-gray-800 whitespace-pre-wrap">
              {message.message}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 