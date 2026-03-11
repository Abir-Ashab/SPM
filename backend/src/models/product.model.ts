import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
  imageEmbedding?: number[];
  textEmbedding?: number[];
  metadata: {
    brand?: string;
    tags?: string[];
    specifications?: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    imageUrl: {
      type: String,
    },
    imageEmbedding: {
      type: [Number],
    },
    textEmbedding: {
      type: [Number],
    },
    metadata: {
      brand: String,
      tags: [String],
      specifications: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for text search
productSchema.index({ name: 'text', description: 'text', category: 'text' });

export const Product = mongoose.model<IProduct>('Product', productSchema);
