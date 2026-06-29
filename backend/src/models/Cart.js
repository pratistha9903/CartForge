import mongoose from 'mongoose';
import { getCartExpiryDate } from '../config/cart.config.js';

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, max: 99 },
    category: { type: String, required: true, trim: true, maxlength: 100 },
    imageUrl: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: { type: [cartItemSchema], default: [] },
    status: {
      type: String,
      enum: ['active', 'checked_out', 'expired'],
      default: 'active',
    },
    expiresAt: {
      type: Date,
      default: () => getCartExpiryDate(),
    },
  },
  { timestamps: true }
);

cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Cart = mongoose.model('Cart', cartSchema);
