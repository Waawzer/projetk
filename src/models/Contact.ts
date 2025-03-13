import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  service: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema: Schema = new Schema(
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
    service: {
      type: String,
      required: [true, 'Le service est requis'],
      enum: {
        values: ['recording', 'mixing', 'mastering', 'production', 'other'],
        message: 'Service non valide',
      },
    },
    message: {
      type: String,
      required: [true, 'Le message est requis'],
      trim: true,
      minlength: [10, 'Le message doit contenir au moins 10 caractères'],
      maxlength: [2000, 'Le message ne peut pas dépasser 2000 caractères'],
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient querying
ContactSchema.index({ read: 1 });
ContactSchema.index({ createdAt: -1 });

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema); 