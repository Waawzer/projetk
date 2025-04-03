'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiPlay, FiPause, FiMusic, FiList } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import AudioPlayer from '@/components/AudioPlayer';
import { TrackDTO } from '@/types/track';
import { getUserPlaylists, getPlaylistTracks, searchSpotify } from '@/lib/spotify';

export default function MusicPage() {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [selectedPlaylistName, setSelectedPlaylistName] = useState<string>('');
  const [tracks, setTracks] = useState<TrackDTO[]>([]);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Récupérer les playlists de l'utilisateur
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const userPlaylists = await getUserPlaylists();
        setPlaylists(userPlaylists);
        
        // Sélectionner automatiquement la première playlist
        if (userPlaylists.length > 0) {
          setSelectedPlaylist(userPlaylists[0].id);
          setSelectedPlaylistName(userPlaylists[0].name);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des playlists:', error);
      }
    };
    
    fetchPlaylists();
  }, []);
  
  // Récupérer les tracks de la playlist sélectionnée
  useEffect(() => {
    const fetchPlaylistTracks = async () => {
      if (selectedPlaylist) {
        setIsLoading(true);
        try {
          const playlistTracks = await getPlaylistTracks(selectedPlaylist);
          setTracks(playlistTracks);
        } catch (error) {
          console.error('Erreur lors de la récupération des tracks:', error);
          setTracks([]);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchPlaylistTracks();
  }, [selectedPlaylist]);
  
  // Fonction de recherche
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsLoading(true);
      try {
        const searchResults = await searchSpotify(searchQuery);
        setTracks(searchResults);
        setSelectedPlaylist(null);
        setSelectedPlaylistName(`Résultats pour "${searchQuery}"`);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handlePlaylistSelect = (playlistId: string, playlistName: string) => {
    setSelectedPlaylist(playlistId);
    setSelectedPlaylistName(playlistName);
    setSelectedTrackIndex(null);
    setSearchQuery('');
  };
  
  const handleTrackSelect = (index: number) => {
    setSelectedTrackIndex(index);
  };
  
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="pt-32 pb-12 md:pb-20 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
            Ma Bibliothèque Musicale
          </h1>
          <p className="text-gray-400 max-w-3xl mb-8">
            Découvrez ma sélection musicale directement depuis Spotify
          </p>
          
          {/* Barre de recherche */}
          <div className="flex mb-8">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Rechercher des titres, artistes..."
              className="flex-1 bg-card border border-gray-700 text-white px-4 py-3 rounded-l-lg focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-r-lg hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              Rechercher
            </button>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar with playlists */}
            <div className="lg:w-1/4">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FiList className="mr-2" /> Mes Playlists
              </h2>
              <div className="bg-background rounded-xl p-4 space-y-2 max-h-[600px] overflow-y-auto">
                {playlists.length === 0 ? (
                  <p className="text-gray-400">Chargement des playlists...</p>
                ) : (
                  playlists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => handlePlaylistSelect(playlist.id, playlist.name)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${
                        selectedPlaylist === playlist.id
                          ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      {playlist.images && playlist.images[0] ? (
                        <Image
                          src={playlist.images[0].url}
                          alt={playlist.name}
                          width={40}
                          height={40}
                          className="rounded mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center mr-3">
                          <FiMusic />
                        </div>
                      )}
                      <span className="line-clamp-1">{playlist.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
            
            {/* Main content with tracks */}
            <div className="lg:w-3/4">
              <h2 className="text-xl font-bold mb-6">{selectedPlaylistName || 'Sélectionnez une playlist'}</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : tracks.length === 0 ? (
                <div className="bg-background rounded-xl p-8 text-center">
                  <FiMusic className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-400">
                    {selectedPlaylist ? 'Cette playlist ne contient pas de previews audio disponibles.' : 'Sélectionnez une playlist pour afficher ses titres.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {tracks.map((track, index) => (
                    <div
                      key={track.id}
                      className="group relative aspect-square transition-all duration-300 hover:transform hover:scale-105"
                    >
                      <div className="relative w-full h-full rounded-xl overflow-hidden">
                        <Image
                          src={track.coverImage}
                          alt={`${track.title} by ${track.artist}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 md:opacity-0 md:group-hover:opacity-90 transition-all duration-300">
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                            <button
                              onClick={() => handleTrackSelect(index)}
                              className="text-white hover:bg-white/5 transition-colors border border-white/20 hover:border-white/40 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transform hover:scale-110 mb-2 md:mb-4"
                            >
                              <FiPlay className="w-5 h-5 md:w-6 md:h-6 translate-x-[1px]" />
                            </button>
                            <h3 className="text-white font-bold text-center text-sm md:text-base line-clamp-1">{track.title}</h3>
                            <p className="text-gray-300 text-xs md:text-sm text-center line-clamp-1">{track.artist}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Audio Player */}
      {selectedTrackIndex !== null && (
        <AudioPlayer 
          tracks={tracks} 
          initialTrackIndex={selectedTrackIndex}
          onClose={() => setSelectedTrackIndex(null)}
        />
      )}
    </main>
  );
} 