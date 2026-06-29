import { Router } from 'express';
import {
  addItemHandler,
  updateQuantityHandler,
  removeItemHandler,
  getCartHandler,
  checkoutHandler,
  completeCheckoutHandler,
  clearCartHandler,
  healthHandler,
} from '../controllers/cart.controller.js';
import {
  validate,
  addItemRules,
  updateQuantityRules,
  removeItemRules,
  userIdParamRules,
} from '../validators/cart.validator.js';

const router = Router();

router.get('/health', healthHandler);
router.post('/items', validate(addItemRules), addItemHandler);
router.patch('/items/:productId', validate(updateQuantityRules), updateQuantityHandler);
router.delete('/items/:productId', validate(removeItemRules), removeItemHandler);
router.get('/:userId/checkout', validate(userIdParamRules), checkoutHandler);
router.post('/:userId/complete', validate(userIdParamRules), completeCheckoutHandler);
router.delete('/:userId', validate(userIdParamRules), clearCartHandler);
router.get('/:userId', validate(userIdParamRules), getCartHandler);

export default router;
