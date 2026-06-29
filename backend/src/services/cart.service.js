import { Cart } from '../models/Cart.js';
import { User } from '../models/User.js';
import { getCartExpiryDate } from '../config/cart.config.js';
import { calculatePricing } from './pricing.service.js';
import { createOrder } from './order.service.js';

export async function ensureUserExists(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.code = 'USER_NOT_FOUND';
    throw error;
  }
  return user;
}

export async function getOrCreateCart(userId) {
  await ensureUserExists(userId);

  let cart = await Cart.findOne({ userId, status: 'active' });
  if (!cart) {
    cart = await Cart.create({ userId, items: [], expiresAt: getCartExpiryDate() });
  }
  return cart;
}

export async function addItemToCart(userId, itemPayload) {
  const cart = await getOrCreateCart(userId);
  const existingIndex = cart.items.findIndex(
    (item) => item.productId === itemPayload.productId
  );

  if (existingIndex >= 0) {
    cart.items[existingIndex].quantity = Math.min(
      99,
      cart.items[existingIndex].quantity + itemPayload.quantity
    );
    cart.items[existingIndex].name = itemPayload.name;
    cart.items[existingIndex].price = itemPayload.price;
    cart.items[existingIndex].category = itemPayload.category;
    if (itemPayload.imageUrl) {
      cart.items[existingIndex].imageUrl = itemPayload.imageUrl;
    }
  } else {
    cart.items.push(itemPayload);
  }

  cart.expiresAt = getCartExpiryDate();
  await cart.save();
  return cart;
}

export async function updateItemQuantity(userId, productId, quantity) {
  const cart = await Cart.findOne({ userId, status: 'active' });
  if (!cart) {
    const error = new Error('Cart not found');
    error.code = 'CART_NOT_FOUND';
    throw error;
  }

  const item = cart.items.find((i) => i.productId === productId);
  if (!item) {
    const error = new Error('Product not found in cart');
    error.code = 'ITEM_NOT_FOUND';
    throw error;
  }

  item.quantity = quantity;
  cart.expiresAt = getCartExpiryDate();
  await cart.save();
  return cart;
}

export async function removeItemFromCart(userId, productId) {
  const cart = await Cart.findOne({ userId, status: 'active' });
  if (!cart) {
    const error = new Error('Cart not found');
    error.code = 'CART_NOT_FOUND';
    throw error;
  }

  const initialLength = cart.items.length;
  cart.items = cart.items.filter((item) => item.productId !== productId);

  if (cart.items.length === initialLength) {
    const error = new Error('Product not found in cart');
    error.code = 'ITEM_NOT_FOUND';
    throw error;
  }

  cart.expiresAt = getCartExpiryDate();
  await cart.save();
  return cart;
}

export async function getCartByUserId(userId) {
  await ensureUserExists(userId);
  return Cart.findOne({ userId, status: 'active' });
}

export async function clearCart(userId) {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  cart.expiresAt = getCartExpiryDate();
  await cart.save();
  return cart;
}

export async function completeCheckout(userId) {
  const cart = await Cart.findOne({ userId, status: 'active' });
  if (!cart || cart.items.length === 0) {
    const error = new Error('Cart is empty');
    error.code = 'EMPTY_CART';
    throw error;
  }

  const pricing = calculatePricing(cart.items);
  const order = await createOrder(userId, cart.items, pricing);

  cart.items = [];
  cart.expiresAt = getCartExpiryDate();
  await cart.save();

  return order;
}

export function serializeCart(cart) {
  return {
    userId: cart.userId.toString(),
    items: cart.items,
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    status: cart.status,
    expiresAt: cart.expiresAt,
    updatedAt: cart.updatedAt,
  };
}
