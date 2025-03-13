import mongoose, { Schema, Document } from 'mongoose';

export interface ITrack extends Document {
  title: string;
  artist: string;
  coverImage: string;
  audioUrl: string;
  duration: string;
  genre: string;
  releaseDate: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TrackSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre est requis'],
      trim: true,
    },
    artist: {
      type: String,
      required: [true, 'L\'artiste est requis'],
      trim: true,
    },
    coverImage: {
      type: String,
      required: [true, 'L\'image de couverture est requise'],
    },
    audioUrl: {
      type: String,
      required: [true, 'L\'URL audio est requise'],
    },
    duration: {
      type: String,
      required: [true, 'La durée est requise'],
    },
    genre: {
      type: String,
      required: [true, 'Le genre est requis'],
      trim: true,
    },
    releaseDate: {
      type: String,
      required: [true, 'La date de sortie est requise'],
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Vérifier si le modèle existe déjà pour éviter les erreurs en développement avec hot-reload
export default mongoose.models.Track || mongoose.model<ITrack>('Track', TrackSchema); 