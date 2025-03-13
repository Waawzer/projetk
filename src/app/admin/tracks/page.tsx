'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiMusic, FiStar } from 'react-icons/fi';

interface Track {
  _id: string;
  title: string;
  artist: string;
  coverImage: string;
  audioUrl: string;
  duration: number;
  genre: string;
  releaseDate: string;
  featured: boolean;
  createdAt: string;
}

export default function TracksPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState<Track | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/tracks');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des musiques');
      }
      
      const data = await response.json();
      setTracks(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des musiques:', error);
      setError('Impossible de charger les musiques. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const handleDeleteClick = (track: Track) => {
    setTrackToDelete(track);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!trackToDelete) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/admin/tracks?id=${trackToDelete._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la musique');
      }
      
      // Mettre à jour l'état local après la suppression
      setTracks(tracks.filter(track => track._id !== trackToDelete._id));
      setShowDeleteModal(false);
      setTrackToDelete(null);
      
      // Afficher une notification de succès (non implémentée dans cet exemple)
    } catch (error) {
      console.error('Erreur lors de la suppression de la musique:', error);
      setError('Erreur lors de la suppression de la musique. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTrackToDelete(null);
  };

  const filteredTracks = tracks.filter(track => 
    track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && tracks.length === 0) {
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
          <h1 className="text-2xl font-bold">Gestion des musiques</h1>
          <p className="text-gray-400 mt-1">Gérez les musiques affichées sur votre site</p>
        </div>
        <Link
          href="/admin/tracks/new"
          className="mt-4 md:mt-0 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center justify-center"
        >
          <FiPlus className="mr-2" />
          Ajouter une musique
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-lg mb-6">
          {error}
          <button 
            onClick={fetchTracks}
            className="ml-4 underline hover:no-underline"
          >
            Réessayer
          </button>
        </div>
      )}
      
      {/* Search and filters */}
      <div className="bg-card border border-gray-800 rounded-lg p-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par titre, artiste ou genre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 py-2 w-full bg-background border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <FiX />
            </button>
          )}
        </div>
      </div>
      
      {/* Tracks list */}
      {filteredTracks.length === 0 ? (
        <div className="bg-card border border-gray-800 rounded-lg p-8 text-center">
          <FiMusic className="mx-auto text-gray-500" size={48} />
          <h3 className="mt-4 text-xl font-medium">Aucune musique trouvée</h3>
          <p className="mt-2 text-gray-400">
            {searchTerm
              ? `Aucun résultat pour "${searchTerm}"`
              : "Vous n'avez pas encore ajouté de musiques"}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 text-primary hover:underline"
            >
              Effacer la recherche
            </button>
          )}
        </div>
      ) : (
        <div className="bg-card border border-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Musique
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Genre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Durée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date d'ajout
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredTracks.map((track) => (
                  <tr key={track._id} className="hover:bg-background/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded overflow-hidden relative">
                          <Image
                            src={track.coverImage}
                            alt={track.title}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium">{track.title}</div>
                          <div className="text-sm text-gray-400">{track.artist}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {track.genre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatDuration(track.duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatDate(track.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {track.featured ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                          <FiStar className="mr-1" size={12} />
                          Mis en avant
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700/20 text-gray-400">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/admin/tracks/${track._id}/edit`}
                          className="text-blue-500 hover:text-blue-400"
                        >
                          <FiEdit2 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(track)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <FiTrash2 size={18} />
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
      
      {/* Delete confirmation modal */}
      {showDeleteModal && trackToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-card rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-card px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 sm:mx-0 sm:h-10 sm:w-10">
                    <FiTrash2 className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium">
                      Supprimer la musique
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">
                        Êtes-vous sûr de vouloir supprimer la musique "{trackToDelete.title}" par {trackToDelete.artist} ? Cette action est irréversible.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-card-hover px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-500 text-base font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Supprimer
                </button>
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-700 shadow-sm px-4 py-2 bg-card text-base font-medium text-gray-300 hover:bg-background focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 