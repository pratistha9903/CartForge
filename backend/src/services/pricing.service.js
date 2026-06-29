export const campaignTiers = [
  { id: 'none', name: 'None', minSubtotal: 0, maxSubtotal: 999.99, discountPercent: 0 },
  { id: 'silver', name: 'Silver', minSubtotal: 1000, maxSubtotal: 4999.99, discountPercent: 10 },
  { id: 'gold', name: 'Gold', minSubtotal: 5000, maxSubtotal: 9999.99, discountPercent: 15 },
  { id: 'platinum', name: 'Platinum', minSubtotal: 10000, discountPercent: 20 },
];

export const DIVERSITY_BONUS = 200;
export const MIN_CATEGORIES_FOR_BONUS = 3;

export function getActiveTier(subtotal) {
  let active = campaignTiers[0];
  for (const tier of campaignTiers) {
    if (subtotal >= tier.minSubtotal) active = tier;
  }
  return active;
}

export function getNextTier(subtotal) {
  for (const tier of campaignTiers) {
    if (subtotal < tier.minSubtotal) return tier;
  }
  return null;
}

export function calculatePricing(items) {
  const lineItems = items.map((item) => ({
    productId: item.productId,
    name: item.name,
    category: item.category,
    unitPrice: item.price,
    quantity: item.quantity,
    lineTotal: round(item.price * item.quantity),
  }));

  const subtotal = round(lineItems.reduce((sum, item) => sum + item.lineTotal, 0));
  const uniqueCategories = new Set(
    lineItems.map((item) => item.category.toLowerCase().trim())
  ).size;

  const activeTier = getActiveTier(subtotal);
  const nextTier = getNextTier(subtotal);
  const tierDiscount = round(subtotal * (activeTier.discountPercent / 100));
  const diversityBonus =
    uniqueCategories >= MIN_CATEGORIES_FOR_BONUS ? DIVERSITY_BONUS : 0;
  const discount = round(tierDiscount + diversityBonus);
  const finalTotal = round(Math.max(0, subtotal - discount));

  return {
    userId: null,
    lineItems,
    itemCount: lineItems.reduce((sum, item) => sum + item.quantity, 0),
    uniqueCategories,
    subtotal,
    tierDiscount,
    diversityBonus,
    discount,
    finalTotal,
    appliedTier: activeTier.name,
    campaign: {
      activeTier: {
        id: activeTier.id,
        name: activeTier.name,
        discountPercent: activeTier.discountPercent,
      },
      nextTier: nextTier
        ? {
            name: nextTier.name,
            minSubtotal: nextTier.minSubtotal,
            amountToUnlock: round(nextTier.minSubtotal - subtotal),
          }
        : null,
      diversityBonusApplied: diversityBonus > 0,
    },
    tiers: campaignTiers.map(({ id, name, minSubtotal, discountPercent }) => ({
      id,
      name,
      minSubtotal,
      discountPercent,
    })),
  };
}

function round(value) {
  return Math.round(value * 100) / 100;
}
