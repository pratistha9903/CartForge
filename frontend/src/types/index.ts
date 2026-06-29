export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl?: string;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  itemCount: number;
  status?: string;
  expiresAt?: string;
  updatedAt?: string;
}

export interface CampaignTier {
  id: string;
  name: string;
  minSubtotal: number;
  discountPercent: number;
}

export interface CheckoutSummary {
  userId: string;
  items?: CartItem[];
  subtotal: number;
  tierDiscount?: number;
  diversityBonus?: number;
  discount: number;
  finalTotal: number;
  appliedTier: string;
  uniqueCategories?: number;
  campaign?: {
    activeTier: { id: string; name: string; discountPercent: number };
    nextTier: { name: string; minSubtotal: number; amountToUnlock: number } | null;
    diversityBonusApplied: boolean;
  };
  tiers?: CampaignTier[];
}

export interface OrderConfirmation {
  orderId: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  tierDiscount: number;
  diversityBonus: number;
  discount: number;
  finalTotal: number;
  appliedTier: string;
  uniqueCategories: number;
  status: string;
  completedAt: string;
  createdAt?: string;
}

export interface Product {
  productId: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  description: string;
  badge?: string;
}
