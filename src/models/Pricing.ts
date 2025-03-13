import mongoose, { Schema, Document } from 'mongoose';

export interface IFeature {
  text: string;
  included: boolean;
}

export interface IPricing extends Document {
  title: string;
  price: number;
  description: string;
  features: IFeature[];
  popular: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const FeatureSchema: Schema = new Schema({
  text: {
    type: String,
    required: [true, 'Le texte de la fonctionnalité est requis'],
    trim: true,
  },
  included: {
    type: Boolean,
    default: true,
  },
});

const PricingSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre est requis'],
      trim: true,
      maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères'],
    },
    price: {
      type: Number,
      required: [true, 'Le prix est requis'],
      min: [0, 'Le prix doit être positif'],
    },
    description: {
      type: String,
      required: [true, 'La description est requise'],
      trim: true,
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères'],
    },
    features: {
      type: [FeatureSchema],
      required: [true, 'Les fonctionnalités sont requises'],
      validate: {
        validator: function(features: IFeature[]) {
          return features.length > 0;
        },
        message: 'Au moins une fonctionnalité est requise',
      },
    },
    popular: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.Pricing || mongoose.model<IPricing>('Pricing', PricingSchema); 