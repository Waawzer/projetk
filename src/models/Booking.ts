import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  customerName: string;
  customerEmail: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Le nom du client est requis'],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, 'L\'email du client est requis'],
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Veuillez fournir une adresse email valide',
      ],
    },
    service: {
      type: String,
      required: [true, 'Le service est requis'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'La date est requise'],
    },
    time: {
      type: String,
      required: [true, 'L\'heure est requise'],
    },
    duration: {
      type: Number,
      required: [true, 'La durée est requise'],
      min: [1, 'La durée minimale est de 1 heure'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'cancelled'],
        message: 'Le statut doit être pending, confirmed ou cancelled',
      },
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Vérifier si le modèle existe déjà pour éviter les erreurs en développement avec hot-reload
export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema); 