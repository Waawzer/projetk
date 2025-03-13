'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiMusic, FiDollarSign, FiCalendar, FiMail, FiUsers, FiArrowRight } from 'react-icons/fi';

interface DashboardStats {
  tracks: {
    total: number;
    featured: number;
    newThisMonth: number;
  };
  pricing: {
    total: number;
    popular: number;
  };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
  };
  messages: {
    total: number;
    unread: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    date: string;
    status?: string;
    read?: boolean;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/admin/stats');
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des statistiques');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        setError('Impossible de charger les statistiques. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const statCards = stats ? [
    {
      title: 'Musiques',
      value: stats.tracks.total,
      icon: <FiMusic size={24} />,
      href: '/admin/tracks',
      color: 'bg-blue-500/10 text-blue-500',
      badge: stats.tracks.featured > 0 ? {
        value: stats.tracks.featured,
        label: 'En vedette',
        color: 'bg-blue-500/20 text-blue-500',
      } : undefined,
    },
    {
      title: 'Tarifs',
      value: stats.pricing.total,
      icon: <FiDollarSign size={24} />,
      href: '/admin/pricing',
      color: 'bg-green-500/10 text-green-500',
      badge: stats.pricing.popular > 0 ? {
        value: stats.pricing.popular,
        label: 'Populaire',
        color: 'bg-green-500/20 text-green-500',
      } : undefined,
    },
    {
      title: 'Réservations',
      value: stats.bookings.total,
      icon: <FiCalendar size={24} />,
      href: '/admin/bookings',
      color: 'bg-purple-500/10 text-purple-500',
      badge: stats.bookings.pending > 0 ? {
        value: stats.bookings.pending,
        label: 'En attente',
        color: 'bg-yellow-500/20 text-yellow-500',
      } : undefined,
    },
    {
      title: 'Messages',
      value: stats.messages.total,
      icon: <FiMail size={24} />,
      href: '/admin/messages',
      color: 'bg-red-500/10 text-red-500',
      badge: stats.messages.unread > 0 ? {
        value: stats.messages.unread,
        label: 'Non lus',
        color: 'bg-red-500/20 text-red-500',
      } : undefined,
    },
  ] : [];

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <FiCalendar className="text-purple-500" />;
      case 'message':
        return <FiMail className="text-red-500" />;
      case 'track':
        return <FiMusic className="text-blue-500" />;
      default:
        return <FiUsers className="text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">Erreur</h2>
        <p className="text-gray-400 text-center">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-gray-400 mt-1">Bienvenue dans l'interface d'administration de votre site</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-card hover:bg-card-hover border border-gray-800 rounded-lg p-6 transition-all duration-200 hover:shadow-lg"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{card.title}</p>
                <h3 className="text-2xl font-bold">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-full ${card.color}`}>
                {card.icon}
              </div>
            </div>
            {card.badge && (
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-4 ${card.badge.color}`}>
                {card.badge.value} {card.badge.label}
              </div>
            )}
          </Link>
        ))}
      </div>
      
      {/* Recent Activity */}
      <div className="bg-card border border-gray-800 rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="font-bold">Activités récentes</h2>
          <Link href="/admin/activities" className="text-primary text-sm flex items-center hover:underline">
            Voir tout <FiArrowRight className="ml-1" size={14} />
          </Link>
        </div>
        <div className="divide-y divide-gray-800">
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity) => (
              <div key={activity.id} className="px-6 py-4 flex items-start">
                <div className="mr-4 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{activity.title}</h3>
                  <p className="text-gray-400 text-sm">{activity.description}</p>
                  <p className="text-gray-500 text-xs mt-1">{formatDate(activity.date)}</p>
                </div>
                {activity.type === 'message' && activity.read !== undefined && (
                  <div className={`px-2 py-1 rounded text-xs ${activity.read ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {activity.read ? 'Lu' : 'Non lu'}
                  </div>
                )}
                {activity.type === 'booking' && activity.status && (
                  <div className={`px-2 py-1 rounded text-xs ${
                    activity.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                    activity.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                    'bg-red-500/20 text-red-500'
                  }`}>
                    {activity.status === 'pending' ? 'En attente' :
                     activity.status === 'confirmed' ? 'Confirmé' : 'Annulé'}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-400">
              Aucune activité récente
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-card border border-gray-800 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="font-bold">Actions rapides</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/tracks/new"
            className="flex items-center p-4 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
          >
            <FiMusic className="mr-3" size={20} />
            <span>Ajouter une musique</span>
          </Link>
          <Link
            href="/admin/pricing/new"
            className="flex items-center p-4 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
          >
            <FiDollarSign className="mr-3" size={20} />
            <span>Ajouter un tarif</span>
          </Link>
          <Link
            href="/admin/bookings/new"
            className="flex items-center p-4 bg-purple-500/10 text-purple-500 rounded-lg hover:bg-purple-500/20 transition-colors"
          >
            <FiCalendar className="mr-3" size={20} />
            <span>Créer une réservation</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 