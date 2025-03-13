'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiSave, FiArrowLeft, FiUpload, FiMusic, FiX } from 'react-icons/fi';

export default function NewTrackPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  // État du formulaire
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioFileName, setAudioFileName] = useState('');
  const [featured, setFeatured] = useState(false);
  
  // Gestion de l'upload d'image
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setFormError('Le fichier sélectionné n\'est pas une image valide.');
      return;
    }
    
    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormError('L\'image ne doit pas dépasser 5MB.');
      return;
    }
    
    setCoverImageFile(file);
    
    // Créer un aperçu de l'image
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    setFormError('');
  };
  
  // Gestion de l'upload audio
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Vérifier le type de fichier
    if (!file.type.startsWith('audio/')) {
      setFormError('Le fichier sélectionné n\'est pas un fichier audio valide.');
      return;
    }
    
    // Vérifier la taille du fichier (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setFormError('Le fichier audio ne doit pas dépasser 20MB.');
      return;
    }
    
    setAudioFile(file);
    setAudioFileName(file.name);
    setFormError('');
  };
  
  // Supprimer l'image sélectionnée
  const handleRemoveCoverImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview('');
  };
  
  // Supprimer le fichier audio sélectionné
  const handleRemoveAudioFile = () => {
    setAudioFile(null);
    setAudioFileName('');
  };
  
  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation du formulaire
    if (!title.trim()) {
      setFormError('Le titre est requis.');
      return;
    }
    
    if (!artist.trim()) {
      setFormError('L\'artiste est requis.');
      return;
    }
    
    if (!genre.trim()) {
      setFormError('Le genre est requis.');
      return;
    }
    
    if (!coverImageFile) {
      setFormError('L\'image de couverture est requise.');
      return;
    }
    
    if (!audioFile) {
      setFormError('Le fichier audio est requis.');
      return;
    }
    
    setIsSubmitting(true);
    setFormError('');
    
    try {
      // Dans une application réelle, vous utiliseriez FormData pour envoyer les fichiers
      // Pour cette démonstration, nous allons simuler l'upload et envoyer les URLs
      
      // Simuler l'upload des fichiers et obtenir des URLs
      // Dans une application réelle, vous utiliseriez un service de stockage comme AWS S3
      const coverImageUrl = coverImagePreview; // Utiliser l'aperçu comme URL (pour la démo)
      const audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // URL fictive pour la démo
      
      // Calculer la durée (dans une application réelle, vous l'extrairiez du fichier audio)
      const duration = Math.floor(Math.random() * 300) + 120; // Durée aléatoire entre 120 et 420 secondes
      
      // Créer l'objet de données pour la musique
      const trackData = {
        title,
        artist,
        coverImage: coverImageUrl,
        audioUrl,
        duration,
        genre,
        releaseDate: new Date().toISOString().split('T')[0], // Date du jour
        featured,
      };
      
      // Envoyer les données à l'API
      const response = await fetch('/api/admin/tracks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'ajout de la musique');
      }
      
      setFormSuccess('La musique a été ajoutée avec succès !');
      
      // Rediriger vers la liste des musiques après 2 secondes
      setTimeout(() => {
        router.push('/admin/tracks');
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la musique:', error);
      setFormError('Une erreur est survenue lors de l\'ajout de la musique. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Liste des genres musicaux
  const genreOptions = [
    { value: '', label: 'Sélectionnez un genre' },
    { value: 'pop', label: 'Pop' },
    { value: 'rock', label: 'Rock' },
    { value: 'hip-hop', label: 'Hip-Hop' },
    { value: 'rnb', label: 'R&B' },
    { value: 'electronic', label: 'Électronique' },
    { value: 'jazz', label: 'Jazz' },
    { value: 'classical', label: 'Classique' },
    { value: 'acoustic', label: 'Acoustique' },
    { value: 'indie', label: 'Indie' },
    { value: 'other', label: 'Autre' },
  ];
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Ajouter une musique</h1>
          <p className="text-gray-400 mt-1">Ajoutez une nouvelle musique à votre galerie</p>
        </div>
        <Link
          href="/admin/tracks"
          className="flex items-center text-gray-400 hover:text-white"
        >
          <FiArrowLeft className="mr-2" />
          Retour à la liste
        </Link>
      </div>
      
      {formError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-lg mb-6">
          {formError}
        </div>
      )}
      
      {formSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-500 p-4 rounded-lg mb-6">
          {formSuccess}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-card border border-gray-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations de base */}
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Titre de la musique"
              />
            </div>
            
            <div>
              <label htmlFor="artist" className="block text-sm font-medium text-gray-300 mb-1">
                Artiste <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Nom de l'artiste"
              />
            </div>
            
            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-gray-300 mb-1">
                Genre <span className="text-red-500">*</span>
              </label>
              <select
                id="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                {genreOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-700 rounded bg-background"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-300">
                Mettre en avant sur la page d'accueil
              </label>
            </div>
          </div>
          
          {/* Upload de fichiers */}
          <div className="space-y-6">
            {/* Upload d'image */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Image de couverture <span className="text-red-500">*</span>
              </label>
              
              {!coverImagePreview ? (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-400">
                      <label
                        htmlFor="cover-image-upload"
                        className="relative cursor-pointer bg-background rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none"
                      >
                        <span>Télécharger une image</span>
                        <input
                          id="cover-image-upload"
                          name="cover-image-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleCoverImageChange}
                        />
                      </label>
                      <p className="pl-1">ou glisser-déposer</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF jusqu'à 5MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-1 relative rounded-md overflow-hidden h-48">
                  <img
                    src={coverImagePreview}
                    alt="Aperçu"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveCoverImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              )}
            </div>
            
            {/* Upload audio */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Fichier audio <span className="text-red-500">*</span>
              </label>
              
              {!audioFileName ? (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <FiMusic className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-400">
                      <label
                        htmlFor="audio-upload"
                        className="relative cursor-pointer bg-background rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none"
                      >
                        <span>Télécharger un fichier audio</span>
                        <input
                          id="audio-upload"
                          name="audio-upload"
                          type="file"
                          accept="audio/*"
                          className="sr-only"
                          onChange={handleAudioFileChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      MP3, WAV, OGG jusqu'à 20MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-1 flex items-center justify-between bg-background/50 p-3 rounded-md border border-gray-700">
                  <div className="flex items-center">
                    <FiMusic className="text-primary mr-2" />
                    <span className="text-sm truncate max-w-xs">{audioFileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveAudioFile}
                    className="text-red-500 hover:text-red-400"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <Link
            href="/admin/tracks"
            className="bg-gray-700 text-white px-4 py-2 rounded-md mr-4 hover:bg-gray-600"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
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