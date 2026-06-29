import { getOrdersByUserId, getOrderByOrderId } from '../services/order.service.js';

export async function listOrdersHandler(req, res, next) {
  try {
    const orders = await getOrdersByUserId(req.params.userId);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
}

export async function getOrderHandler(req, res, next) {
  try {
    const order = await getOrderByOrderId(req.params.orderId, req.params.userId);
    res.json({ success: true, data: order });
  } catch (error) {
    if (error.code === 'ORDER_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    next(error);
  }
}
