'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiTrash2, FiSearch, FiX, FiFilter, FiCheck, FiClock, FiXCircle, FiCalendar, FiEye } from 'react-icons/fi';
import React from 'react';

interface Booking {
  _id: string;
  customerName: string;
  customerEmail: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
  createdAt: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer les réservations depuis l'API
        const response = await fetch('/api/admin/bookings');
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des réservations');
        }
        
        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des réservations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, []);

  const handleDeleteClick = (booking: Booking) => {
    setBookingToDelete(booking);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!bookingToDelete) return;
    
    try {
      // Appel API pour supprimer la réservation
      const response = await fetch(`/api/admin/bookings?id=${bookingToDelete._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la réservation');
      }
      
      setBookings(bookings.filter(booking => booking._id !== bookingToDelete._id));
      setShowDeleteModal(false);
      setBookingToDelete(null);
      
      // Si la réservation supprimée est celle qui est actuellement affichée, fermer le modal
      if (selectedBooking && selectedBooking._id === bookingToDelete._id) {
        setSelectedBooking(null);
        setShowBookingModal(false);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la réservation:', error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setBookingToDelete(null);
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedBooking(null);
  };

  const handleStatusChange = async (bookingId: string, newStatus: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      // Appel API pour mettre à jour le statut
      const response = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: bookingId, status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }
      
      const updatedBooking = await response.json();
      
      setBookings(bookings.map(booking =>
        booking._id === bookingId ? { ...booking, status: newStatus } : booking
      ));
      
      // Mettre à jour le modal si la réservation est actuellement affichée
      if (selectedBooking && selectedBooking._id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const formatDateTime = (dateString: string, timeString: string) => {
    return `${formatDate(dateString)} à ${timeString}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h${remainingMinutes ? remainingMinutes : '00'}`;
  };

  const getServiceLabel = (service: string) => {
    switch (service) {
      case 'recording':
        return 'Enregistrement';
      case 'mixing':
        return 'Mixage';
      case 'mastering':
        return 'Mastering';
      case 'production':
        return 'Production';
      default:
        return service;
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'En attente',
          icon: FiClock,
          className: 'bg-yellow-500/20 text-yellow-500',
        };
      case 'confirmed':
        return {
          label: 'Confirmée',
          icon: FiCheck,
          className: 'bg-green-500/20 text-green-500',
        };
      case 'cancelled':
        return {
          label: 'Annulée',
          icon: FiXCircle,
          className: 'bg-red-500/20 text-red-500',
        };
      default:
        return {
          label: status,
          icon: FiClock,
          className: 'bg-gray-500/20 text-gray-500',
        };
    }
  };

  const filteredBookings = bookings.filter(booking => {
    // Filtrer par statut
    if (filterStatus !== 'all' && booking.status !== filterStatus) return false;
    
    // Filtrer par terme de recherche
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.customerName.toLowerCase().includes(searchLower) ||
      booking.customerEmail.toLowerCase().includes(searchLower) ||
      getServiceLabel(booking.service).toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Gestion des réservations</h1>
          <p className="text-gray-400 mt-1">Gérez les réservations de vos clients</p>
        </div>
        <Link
          href="/admin/bookings/new"
          className="mt-4 md:mt-0 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center justify-center"
        >
          <FiPlus className="mr-2" />
          Nouvelle réservation
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, email ou service..."
              className="bg-gray-700 text-white w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchTerm('')}
              >
                <FiX className="text-gray-400 hover:text-white" />
              </button>
            )}
          </div>
          <div className="flex items-center">
            <FiFilter className="text-gray-400 mr-2" />
            <select
              className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmées</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <FiCalendar className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Aucune réservation trouvée</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || filterStatus !== 'all'
              ? 'Aucune réservation ne correspond à vos critères de recherche.'
              : 'Vous n\'avez pas encore de réservations.'}
          </p>
          <Link
            href="/admin/bookings/new"
            className="inline-flex items-center bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg"
          >
            <FiPlus className="mr-2" />
            Créer une réservation
          </Link>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date & Heure</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredBookings.map((booking) => {
                  const StatusIcon = getStatusConfig(booking.status).icon;
                  return (
                    <tr key={booking._id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-white">{booking.customerName}</div>
                        <div className="text-sm text-gray-400">{booking.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-white">{getServiceLabel(booking.service)}</div>
                        <div className="text-sm text-gray-400">Durée: {formatDuration(booking.duration)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-white">{formatDateTime(booking.date, booking.time)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusConfig(booking.status).className}`}>
                          <StatusIcon className="mr-1" />
                          {getStatusConfig(booking.status).label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewBooking(booking)}
                            className="text-blue-400 hover:text-blue-300 focus:outline-none"
                            title="Voir les détails"
                          >
                            <FiEye />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(booking)}
                            className="text-red-400 hover:text-red-300 focus:outline-none"
                            title="Supprimer"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirmer la suppression</h3>
            <p className="mb-6">
              Êtes-vous sûr de vouloir supprimer la réservation de{' '}
              <span className="font-semibold">{bookingToDelete?.customerName}</span> ?
              Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails de réservation */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Détails de la réservation</h3>
              <button
                onClick={closeBookingModal}
                className="text-gray-400 hover:text-white"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-gray-400 text-sm mb-1">Client</h4>
                <p className="font-medium">{selectedBooking.customerName}</p>
                <p className="text-gray-300">{selectedBooking.customerEmail}</p>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm mb-1">Service</h4>
                <p className="font-medium">{getServiceLabel(selectedBooking.service)}</p>
                <p className="text-gray-300">Durée: {formatDuration(selectedBooking.duration)}</p>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm mb-1">Date et heure</h4>
                <p className="font-medium">{formatDateTime(selectedBooking.date, selectedBooking.time)}</p>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm mb-1">Statut</h4>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusConfig(selectedBooking.status).className} mr-3`}>
                    {React.createElement(getStatusConfig(selectedBooking.status).icon, { className: "mr-1" })}
                    {getStatusConfig(selectedBooking.status).label}
                  </span>
                  <select
                    value={selectedBooking.status}
                    onChange={(e) => handleStatusChange(selectedBooking._id, e.target.value as any)}
                    className="bg-gray-700 text-white px-2 py-1 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>
              </div>
            </div>
            
            {selectedBooking.notes && (
              <div className="mb-6">
                <h4 className="text-gray-400 text-sm mb-1">Notes</h4>
                <p className="bg-gray-700 p-3 rounded-lg">{selectedBooking.notes}</p>
              </div>
            )}
            
            <div className="flex justify-between">
              <button
                onClick={() => handleDeleteClick(selectedBooking)}
                className="flex items-center text-red-400 hover:text-red-300"
              >
                <FiTrash2 className="mr-1" />
                Supprimer
              </button>
              <button
                onClick={closeBookingModal}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 