import type { Product } from '../types';

export const products: Product[] = [
  {
    productId: 'P101',
    name: 'Aura Pro Wireless Mouse',
    price: 500,
    category: 'Electronics',
    description: 'Ergonomic wireless mouse with silent clicks.',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    badge: 'Best Seller',
  },
  {
    productId: 'P102',
    name: 'Chronos Elite Smartwatch',
    price: 3499,
    category: 'Electronics',
    description: 'Health tracking, GPS, and premium finish.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
  },
  {
    productId: 'P103',
    name: 'Nike Sneakers',
    price: 2499,
    category: 'Footwear',
    description: 'Lightweight design for maximum comfort.',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    badge: 'New',
  },
  {
    productId: 'P104',
    name: 'Alpine Shell Jacket',
    price: 3999,
    category: 'Fashion',
    description: 'Waterproof, breathable mountain shell.',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
  },
  {
    productId: 'P105',
    name: 'Nomad Travel Backpack',
    price: 1299,
    category: 'Accessories',
    description: '35L capacity with laptop sleeve.',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
  },
  {
    productId: 'P106',
    name: 'Milk and Honey-Handbook',
    price: 799,
    category: 'Education',
    description: 'Comprehensive guide to modern AI concepts.',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
  },
  {
    productId: 'P107',
    name: 'ZenFlow Yoga Mat',
    price: 999,
    category: 'Fitness',
    description: 'Eco-friendly cork surface with alignment guides.',
    imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop',
  },
  {
    productId: 'P108',
    name: 'Lumi Desk Lamp',
    price: 1499,
    category: 'Home',
    description: 'Adjustable color temperature with charging base.',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop',
  },
];

export function formatINR(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
