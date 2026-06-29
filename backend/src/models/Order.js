import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    category: String,
    imageUrl: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], default: [] },
    subtotal: { type: Number, required: true },
    tierDiscount: { type: Number, default: 0 },
    diversityBonus: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    finalTotal: { type: Number, required: true },
    appliedTier: { type: String, default: 'None' },
    uniqueCategories: { type: Number, default: 0 },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
