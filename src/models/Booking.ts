import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBooking {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  service: string;
  date: string;
  time: string;
  endTime?: string;
  duration: number;
  totalPrice?: number;
  depositAmount?: number;
  depositPaid?: boolean;
  remainingAmount?: number;
  remainingPaid?: boolean;
  remainingPaymentDate?: Date;
  remainingPaymentMethod?: "cash" | "card" | "transfer" | "paypal";
  paymentMethod?: "card" | "paypal";
  paymentId?: string;
  paymentDate?: Date;
  googleCalendarEventId?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBookingDocument extends IBooking, Document {}

const BookingSchema = new Schema<IBookingDocument>(
  {
    customerName: {
      type: String,
      required: [true, "Le nom du client est requis"],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, "L'email du client est requis"],
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Veuillez fournir une adresse email valide",
      ],
    },
    customerPhone: {
      type: String,
      trim: true,
    },
    service: {
      type: String,
      required: [true, "Le service est requis"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "La date est requise"],
    },
    time: {
      type: String,
      required: [true, "L'heure est requise"],
    },
    endTime: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, "La durée est requise"],
      min: [1, "La durée minimale est de 2 heure"],
    },
    totalPrice: {
      type: Number,
    },
    depositAmount: {
      type: Number,
    },
    depositPaid: {
      type: Boolean,
      default: false,
    },
    remainingAmount: {
      type: Number,
    },
    remainingPaid: {
      type: Boolean,
      default: false,
    },
    remainingPaymentDate: {
      type: Date,
    },
    remainingPaymentMethod: {
      type: String,
      enum: ["cash", "card", "transfer", "paypal"],
    },
    paymentMethod: {
      type: String,
      enum: ["card", "paypal"],
    },
    paymentId: {
      type: String,
    },
    paymentDate: {
      type: Date,
    },
    googleCalendarEventId: {
      type: String,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "cancelled", "completed"],
        message:
          "Le statut doit être pending, confirmed, cancelled ou completed",
      },
      default: "pending",
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

const BookingModel = (mongoose.models.Booking ||
  mongoose.model<IBookingDocument>(
    "Booking",
    BookingSchema
  )) as Model<IBookingDocument>;

export default BookingModel;
