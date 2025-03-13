import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBooking {
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

export interface IBookingDocument extends IBooking, Document {}

const BookingSchema = new Schema<IBookingDocument>(
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

const BookingModel = (mongoose.models.Booking || mongoose.model<IBookingDocument>('Booking', BookingSchema)) as Model<IBookingDocument>;

export default BookingModel; 