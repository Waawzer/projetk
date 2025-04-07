import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFormation {
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  duration: number; // en heures
  price: number;
  maxParticipants: number;
  imageUrl?: string;
  objectives?: string[];
  prerequisites?: string[];
  syllabus?: {
    title: string;
    description: string;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFormationDocument extends IFormation, Document {}

const FormationSchema = new Schema<IFormationDocument>(
  {
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Le slug est requis"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "La description courte est requise"],
      trim: true,
    },
    longDescription: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, "La durée est requise"],
      min: [1, "La durée minimale est de 1 heure"],
    },
    price: {
      type: Number,
      required: [true, "Le prix est requis"],
      min: [0, "Le prix ne peut pas être négatif"],
    },
    maxParticipants: {
      type: Number,
      required: [true, "Le nombre maximum de participants est requis"],
      min: [1, "Au moins 1 participant est requis"],
    },
    imageUrl: {
      type: String,
    },
    objectives: {
      type: [String],
    },
    prerequisites: {
      type: [String],
    },
    syllabus: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware pour générer automatiquement le slug à partir du titre
FormationSchema.pre<IFormationDocument>("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Supprimer les caractères spéciaux
      .replace(/\s+/g, "-") // Remplacer les espaces par des tirets
      .replace(/--+/g, "-"); // Éviter les tirets multiples
  }
  next();
});

const FormationModel = (mongoose.models.Formation ||
  mongoose.model<IFormationDocument>(
    "Formation",
    FormationSchema
  )) as Model<IFormationDocument>;

export default FormationModel;
