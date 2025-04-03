import axios from 'axios';
import { TrackDTO } from '@/types/track';

// Configuration des identifiants Spotify
const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;
const SPOTIFY_USER_ID = process.env.NEXT_PUBLIC_SPOTIFY_USER_ID; // Votre ID utilisateur Spotify

// Fonction pour obtenir un token d'accès
const getAccessToken = async (): Promise<string> => {
  try {
    const tokenResponse = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      },
      data: 'grant_type=client_credentials'
    });

    return tokenResponse.data.access_token;
  } catch (error) {
    console.error('Erreur lors de l\'obtention du token Spotify:', error);
    throw error;
  }
};

// Fonction pour convertir les tracks Spotify en format compatible avec notre application
const convertSpotifyTrackToDTO = (spotifyTrack: any): TrackDTO => {
  return {
    id: spotifyTrack.id,
    title: spotifyTrack.name,
    artist: spotifyTrack.artists.map((artist: any) => artist.name).join(', '),
    coverImage: spotifyTrack.album.images[0]?.url || '',
    audioUrl: spotifyTrack.preview_url || '',
    duration: formatDuration(spotifyTrack.duration_ms)
  };
};

// Formater la durée de millisecondes à format "mm:ss"
const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Obtenir les tracks d'une playlist spécifique
export const getPlaylistTracks = async (playlistId: string): Promise<TrackDTO[]> => {
  try {
    const token = await getAccessToken();
    
    const response = await axios({
      method: 'get',
      url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Filtrer les tracks qui ont une preview_url (échantillon audio)
    const tracksWithPreview = response.data.items
      .filter((item: any) => item.track && item.track.preview_url)
      .map((item: any) => convertSpotifyTrackToDTO(item.track));
    
    return tracksWithPreview;
  } catch (error) {
    console.error('Erreur lors de la récupération des tracks Spotify:', error);
    return [];
  }
};

// Obtenir les playlists de l'utilisateur
export const getUserPlaylists = async (): Promise<any[]> => {
  try {
    const token = await getAccessToken();
    
    const response = await axios({
      method: 'get',
      url: `https://api.spotify.com/v1/users/${SPOTIFY_USER_ID}/playlists`,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data.items;
  } catch (error) {
    console.error('Erreur lors de la récupération des playlists:', error);
    return [];
  }
};

// Obtenir les tracks populaires d'un artiste
export const getArtistTopTracks = async (artistId: string): Promise<TrackDTO[]> => {
  try {
    const token = await getAccessToken();
    
    const response = await axios({
      method: 'get',
      url: `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=FR`,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Filtrer les tracks qui ont une preview_url (échantillon audio)
    const tracksWithPreview = response.data.tracks
      .filter((track: any) => track.preview_url)
      .map((track: any) => convertSpotifyTrackToDTO(track));
    
    return tracksWithPreview;
  } catch (error) {
    console.error('Erreur lors de la récupération des tops tracks:', error);
    return [];
  }
};

// Rechercher dans Spotify
export const searchSpotify = async (query: string, type: string = 'track'): Promise<TrackDTO[]> => {
  try {
    const token = await getAccessToken();
    
    const response = await axios({
      method: 'get',
      url: `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=20`,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (type === 'track') {
      // Filtrer les tracks qui ont une preview_url (échantillon audio)
      const tracksWithPreview = response.data.tracks.items
        .filter((track: any) => track.preview_url)
        .map((track: any) => convertSpotifyTrackToDTO(track));
      
      return tracksWithPreview;
    }
    
    return [];
  } catch (error) {
    console.error('Erreur lors de la recherche Spotify:', error);
    return [];
  }
}; 