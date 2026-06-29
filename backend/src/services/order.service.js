import { Order } from '../models/Order.js';
import { randomUUID } from 'node:crypto';

export function serializeOrder(order) {
  return {
    orderId: order.orderId,
    userId: order.userId.toString(),
    items: order.items,
    subtotal: order.subtotal,
    tierDiscount: order.tierDiscount,
    diversityBonus: order.diversityBonus,
    discount: order.discount,
    finalTotal: order.finalTotal,
    appliedTier: order.appliedTier,
    uniqueCategories: order.uniqueCategories,
    status: order.status,
    completedAt: order.createdAt,
    createdAt: order.createdAt,
  };
}

export async function createOrder(userId, cartItems, pricing) {
  const order = await Order.create({
    orderId: `CF-${randomUUID().slice(0, 8).toUpperCase()}`,
    userId,
    items: cartItems.map((item) => ({ ...item.toObject?.() ?? item })),
    subtotal: pricing.subtotal,
    tierDiscount: pricing.tierDiscount,
    diversityBonus: pricing.diversityBonus,
    discount: pricing.discount,
    finalTotal: pricing.finalTotal,
    appliedTier: pricing.appliedTier,
    uniqueCategories: pricing.uniqueCategories,
  });

  return serializeOrder(order);
}

export async function getOrdersByUserId(userId) {
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });
  return orders.map(serializeOrder);
}

export async function getOrderByOrderId(orderId, userId) {
  const order = await Order.findOne({ orderId, userId });
  if (!order) {
    const error = new Error('Order not found');
    error.code = 'ORDER_NOT_FOUND';
    throw error;
  }
  return serializeOrder(order);
}
