export function getCartTtlHours() {
  const hours = Number(process.env.CART_TTL_HOURS);
  return Number.isFinite(hours) && hours > 0 ? hours : 24;
}

export function getCartExpiryDate(from = Date.now()) {
  return new Date(from + getCartTtlHours() * 60 * 60 * 1000);
}
