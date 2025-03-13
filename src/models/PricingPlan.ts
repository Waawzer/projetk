import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPricingPlan {
  title: string;
  price: number;
  description: string;
  features: {
    text: string;
    included: boolean;
  }[];
  popular: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPricingPlanDocument extends IPricingPlan, Document {}

const FeatureSchema = new Schema({
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

const PricingPlanSchema = new Schema<IPricingPlanDocument>(
  {
    title: {
      type: String,
      required: [true, 'Le titre est requis'],
      trim: true,
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
    },
    features: {
      type: [FeatureSchema],
      required: [true, 'Au moins une fonctionnalité est requise'],
      validate: {
        validator: function(v: { text: string; included: boolean }[]) {
          return Array.isArray(v) && v.length > 0;
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
      required: [true, 'L\'ordre est requis'],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const PricingPlanModel = (mongoose.models.PricingPlan || mongoose.model<IPricingPlanDocument>('PricingPlan', PricingPlanSchema)) as Model<IPricingPlanDocument>;

export default PricingPlanModel; 