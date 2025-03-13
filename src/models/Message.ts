import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  name: string;
  email: string;
  service: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'L\'email est requis'],
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
    message: {
      type: String,
      required: [true, 'Le message est requis'],
      trim: true,
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

// Vérifier si le modèle existe déjà pour éviter les erreurs en développement avec hot-reload
export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema); 