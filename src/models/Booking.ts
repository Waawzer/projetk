import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  name: string;
  email: string;
  phone: string;
  date: Date;
  startTime: string;
  endTime: string;
  service: string;
  duration: number;
  notes?: string;
  totalPrice: number;
  depositAmount: number;
  depositPaid: boolean;
  paymentMethod: 'card' | 'paypal';
  paymentId?: string;
  googleCalendarEventId?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
      maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
    },
    email: {
      type: String,
      required: [true, 'L\'email est requis'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir un email valide'],
    },
    phone: {
      type: String,
      required: [true, 'Le numéro de téléphone est requis'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'La date est requise'],
    },
    startTime: {
      type: String,
      required: [true, 'L\'heure de début est requise'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:MM)'],
    },
    endTime: {
      type: String,
      required: [true, 'L\'heure de fin est requise'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:MM)'],
    },
    service: {
      type: String,
      required: [true, 'Le service est requis'],
      enum: {
        values: ['recording', 'mixing', 'mastering', 'production'],
        message: 'Service non valide',
      },
    },
    duration: {
      type: Number,
      required: [true, 'La durée est requise'],
      min: [1, 'La durée minimale est de 1 heure'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Les notes ne peuvent pas dépasser 1000 caractères'],
    },
    totalPrice: {
      type: Number,
      required: [true, 'Le prix total est requis'],
      min: [0, 'Le prix total doit être positif'],
    },
    depositAmount: {
      type: Number,
      required: [true, 'Le montant de l\'acompte est requis'],
      min: [0, 'Le montant de l\'acompte doit être positif'],
    },
    depositPaid: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      required: [true, 'La méthode de paiement est requise'],
      enum: {
        values: ['card', 'paypal'],
        message: 'Méthode de paiement non valide',
      },
    },
    paymentId: {
      type: String,
      trim: true,
    },
    googleCalendarEventId: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      required: [true, 'Le statut est requis'],
      enum: {
        values: ['pending', 'confirmed', 'cancelled'],
        message: 'Statut non valide',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient querying
BookingSchema.index({ date: 1, startTime: 1 });
BookingSchema.index({ email: 1 });
BookingSchema.index({ status: 1 });

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema); 