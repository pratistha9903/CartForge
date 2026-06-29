import { Router } from 'express';
import { listOrdersHandler, getOrderHandler } from '../controllers/order.controller.js';
import { validate, userIdParamRules } from '../validators/cart.validator.js';
import { param } from 'express-validator';

const orderIdRules = [
  param('orderId').trim().notEmpty().withMessage('orderId is required'),
  ...userIdParamRules,
];

const router = Router();

router.get('/:userId', validate(userIdParamRules), listOrdersHandler);
router.get('/:userId/:orderId', validate(orderIdRules), getOrderHandler);

export default router;
