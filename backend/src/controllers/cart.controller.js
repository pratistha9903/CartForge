import {
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  getCartByUserId,
  clearCart,
  completeCheckout,
  serializeCart,
} from '../services/cart.service.js';
import { calculatePricing } from '../services/pricing.service.js';

export async function addItemHandler(req, res, next) {
  try {
    const { userId, productId, name, price, quantity, category, imageUrl } = req.body;
    const cart = await addItemToCart(userId, {
      productId,
      name,
      price,
      quantity,
      category,
      imageUrl: imageUrl || '',
    });
    res.status(200).json({ success: true, data: serializeCart(cart) });
  } catch (error) {
    if (error.code === 'USER_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    next(error);
  }
}

export async function updateQuantityHandler(req, res, next) {
  try {
    const { userId, quantity } = req.body;
    const cart = await updateItemQuantity(userId, req.params.productId, quantity);
    res.json({ success: true, data: serializeCart(cart) });
  } catch (error) {
    if (error.code === 'CART_NOT_FOUND' || error.code === 'ITEM_NOT_FOUND') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

export async function removeItemHandler(req, res, next) {
  try {
    const { userId } = req.body;
    const cart = await removeItemFromCart(userId, req.params.productId);
    res.json({ success: true, data: serializeCart(cart) });
  } catch (error) {
    if (error.code === 'CART_NOT_FOUND' || error.code === 'ITEM_NOT_FOUND') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

export async function getCartHandler(req, res, next) {
  try {
    const cart = await getCartByUserId(req.params.userId);
    if (!cart) {
      return res.json({
        success: true,
        data: { userId: req.params.userId, items: [], itemCount: 0 },
      });
    }
    res.json({ success: true, data: serializeCart(cart) });
  } catch (error) {
    if (error.code === 'USER_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    next(error);
  }
}

export async function checkoutHandler(req, res, next) {
  try {
    const cart = await getCartByUserId(req.params.userId);
    if (!cart || cart.items.length === 0) {
      return res.json({
        success: true,
        data: {
          userId: req.params.userId,
          subtotal: 0,
          discount: 0,
          finalTotal: 0,
          appliedTier: 'None',
        },
      });
    }

    const pricing = calculatePricing(cart.items);
    res.json({
      success: true,
      data: {
        userId: req.params.userId,
        items: cart.items,
        subtotal: pricing.subtotal,
        tierDiscount: pricing.tierDiscount,
        diversityBonus: pricing.diversityBonus,
        discount: pricing.discount,
        finalTotal: pricing.finalTotal,
        appliedTier: pricing.appliedTier,
        uniqueCategories: pricing.uniqueCategories,
        campaign: pricing.campaign,
        tiers: pricing.tiers,
      },
    });
  } catch (error) {
    if (error.code === 'USER_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    next(error);
  }
}

export async function clearCartHandler(req, res, next) {
  try {
    const cart = await clearCart(req.params.userId);
    res.json({ success: true, data: serializeCart(cart) });
  } catch (error) {
    if (error.code === 'USER_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    next(error);
  }
}

export async function completeCheckoutHandler(req, res, next) {
  try {
    const order = await completeCheckout(req.params.userId);
    res.json({ success: true, data: order, message: 'Order placed successfully' });
  } catch (error) {
    if (error.code === 'USER_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (error.code === 'EMPTY_CART') {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }
    next(error);
  }
}

export async function healthHandler(_req, res) {
  res.json({ success: true, data: { status: 'healthy', timestamp: new Date().toISOString() } });
}
