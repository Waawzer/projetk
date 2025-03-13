import mongoose, { Schema, Document } from 'mongoose';

export interface ITrack extends Document {
  title: string;
  artist: string;
  coverImage: string;
  audioUrl: string;
  duration: number;
  genre: string;
  releaseDate: Date;
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
      maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères'],
    },
    artist: {
      type: String,
      required: [true, 'L\'artiste est requis'],
      trim: true,
      maxlength: [100, 'Le nom de l\'artiste ne peut pas dépasser 100 caractères'],
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
      type: Number,
      required: [true, 'La durée est requise'],
      min: [0, 'La durée doit être positive'],
    },
    genre: {
      type: String,
      required: [true, 'Le genre est requis'],
      trim: true,
    },
    releaseDate: {
      type: Date,
      default: Date.now,
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

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.Track || mongoose.model<ITrack>('Track', TrackSchema); 