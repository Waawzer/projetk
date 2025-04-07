import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICourse {
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  category: string; // ex: "Guitare", "Piano", "Chant", etc.
  level: "débutant" | "intermédiaire" | "avancé" | "tous niveaux";
  pricePerHour: number;
  imageUrl?: string;
  instructor?: string;
  benefits?: string[]; // bénéfices pour l'élève
  contenus?: string[]; // contenus abordés
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourseDocument extends ICourse, Document {}

const CourseSchema = new Schema<ICourseDocument>(
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
    category: {
      type: String,
      required: [true, "La catégorie est requise"],
      trim: true,
    },
    level: {
      type: String,
      required: [true, "Le niveau est requis"],
      enum: {
        values: ["débutant", "intermédiaire", "avancé", "tous niveaux"],
        message:
          "Le niveau doit être débutant, intermédiaire, avancé ou tous niveaux",
      },
    },
    pricePerHour: {
      type: Number,
      required: [true, "Le prix horaire est requis"],
      min: [0, "Le prix ne peut pas être négatif"],
    },
    imageUrl: {
      type: String,
    },
    instructor: {
      type: String,
    },
    benefits: {
      type: [String],
    },
    contenus: {
      type: [String],
    },
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
CourseSchema.pre<ICourseDocument>("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Supprimer les caractères spéciaux
      .replace(/\s+/g, "-") // Remplacer les espaces par des tirets
      .replace(/--+/g, "-"); // Éviter les tirets multiples
  }
  next();
});

const CourseModel = (mongoose.models.Course ||
  mongoose.model<ICourseDocument>(
    "Course",
    CourseSchema
  )) as Model<ICourseDocument>;

export default CourseModel;
