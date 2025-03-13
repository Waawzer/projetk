import { Types } from 'mongoose';

export interface Track {
  _id: Types.ObjectId | string;
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

export interface TrackDTO {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  audioUrl: string;
  duration: string;
} 