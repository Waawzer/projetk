'use client';

import { useState, useEffect } from 'react';
import { FiMail, FiEye, FiTrash2, FiSearch, FiX, FiFilter, FiCheck } from 'react-icons/fi';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  service: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'read' | 'unread'>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer les messages depuis l'API
        const response = await fetch('/api/admin/messages');
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des messages');
        }
        
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des messages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
  }, []);

  const handleDeleteClick = (message: ContactMessage) => {
    setMessageToDelete(message);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!messageToDelete) return;
    
    try {
      // Appel API pour supprimer le message
      const response = await fetch(`/api/admin/messages?id=${messageToDelete._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du message');
      }
      
      setMessages(messages.filter(message => message._id !== messageToDelete._id));
      setShowDeleteModal(false);
      setMessageToDelete(null);
      
      // Si le message supprimé est celui qui est actuellement affiché, fermer le modal
      if (selectedMessage && selectedMessage._id === messageToDelete._id) {
        setSelectedMessage(null);
        setShowMessageModal(false);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setMessageToDelete(null);
  };

  const handleViewMessage = async (message: ContactMessage) => {
    // Marquer le message comme lu s'il ne l'est pas déjà
    if (!message.read) {
      try {
        // Appel API pour marquer le message comme lu
        const response = await fetch('/api/admin/messages', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: message._id, read: true }),
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la mise à jour du statut de lecture');
        }
        
        const updatedMessage = await response.json();
        
        setMessages(messages.map(m => 
          m._id === message._id ? { ...m, read: true } : m
        ));
      } catch (error) {
        console.error('Erreur lors de la mise à jour du statut de lecture:', error);
      }
    }
    
    setSelectedMessage(message);
    setShowMessageModal(true);
  };

  const closeMessageModal = () => {
    setShowMessageModal(false);
    setSelectedMessage(null);
  };

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
      case 'other':
        return 'Autre';
      default:
        return service;
    }
  };

  const filteredMessages = messages.filter(message => {
    // Filtrer par statut de lecture
    if (filterStatus === 'read' && !message.read) return false;
    if (filterStatus === 'unread' && message.read) return false;
    
    // Filtrer par terme de recherche
    const searchLower = searchTerm.toLowerCase();
    return (
      message.name.toLowerCase().includes(searchLower) ||
      message.email.toLowerCase().includes(searchLower) ||
      message.message.toLowerCase().includes(searchLower) ||
      getServiceLabel(message.service).toLowerCase().includes(searchLower)
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Messages de contact</h1>
        <p className="text-gray-400 mt-1">Gérez les messages envoyés via le formulaire de contact</p>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, email ou contenu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 text-white w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
              <option value="all">Tous les messages</option>
              <option value="unread">Non lus</option>
              <option value="read">Lus</option>
            </select>
          </div>
        </div>
      </div>
      
      {filteredMessages.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <FiMail className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Aucun message trouvé</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || filterStatus !== 'all'
              ? 'Aucun message ne correspond à vos critères de recherche.'
              : 'Vous n\'avez pas encore reçu de messages.'}
          </p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Expéditeur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredMessages.map((message) => (
                  <tr key={message._id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">{message.name}</div>
                      <div className="text-sm text-gray-400">{message.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white">{getServiceLabel(message.service)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white truncate max-w-xs">{message.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white">{formatDate(message.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        message.read 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-blue-500/20 text-blue-500'
                      }`}>
                        {message.read 
                          ? <><FiCheck className="mr-1" /> Lu</> 
                          : <><FiMail className="mr-1" /> Non lu</>
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewMessage(message)}
                          className="text-blue-400 hover:text-blue-300 focus:outline-none"
                          title="Voir le message"
                        >
                          <FiEye />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(message)}
                          className="text-red-400 hover:text-red-300 focus:outline-none"
                          title="Supprimer"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
              Êtes-vous sûr de vouloir supprimer le message de{' '}
              <span className="font-semibold">{messageToDelete?.name}</span> ?
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

      {/* Modal de détails du message */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Message de {selectedMessage.name}</h3>
              <button
                onClick={closeMessageModal}
                className="text-gray-400 hover:text-white"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-gray-400 text-sm mb-1">Expéditeur</h4>
                <p className="font-medium">{selectedMessage.name}</p>
                <p className="text-gray-300">{selectedMessage.email}</p>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm mb-1">Service</h4>
                <p className="font-medium">{getServiceLabel(selectedMessage.service)}</p>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm mb-1">Date</h4>
                <p className="font-medium">{formatDate(selectedMessage.createdAt)}</p>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm mb-1">Statut</h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedMessage.read 
                    ? 'bg-green-500/20 text-green-500' 
                    : 'bg-blue-500/20 text-blue-500'
                }`}>
                  {selectedMessage.read 
                    ? <><FiCheck className="mr-1" /> Lu</> 
                    : <><FiMail className="mr-1" /> Non lu</>
                  }
                </span>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-gray-400 text-sm mb-1">Message</h4>
              <div className="bg-gray-700 p-4 rounded-lg whitespace-pre-wrap">{selectedMessage.message}</div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => handleDeleteClick(selectedMessage)}
                className="flex items-center text-red-400 hover:text-red-300"
              >
                <FiTrash2 className="mr-1" />
                Supprimer
              </button>
              <button
                onClick={closeMessageModal}
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