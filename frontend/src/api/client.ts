import type { Cart, CartItem, CheckoutSummary, OrderConfirmation } from '../types';
import type { User } from '../types/auth';

const API_BASE = '/api';

class ApiClient {
  private user: User | null = null;

  getUser() {
    return this.user;
  }

  setUser(user: User | null) {
    this.user = user;
    if (user) {
      localStorage.setItem('cartforge_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cartforge_user');
    }
  }

  loadUserFromStorage(): User | null {
    const stored = localStorage.getItem('cartforge_user');
    if (stored) {
      this.user = JSON.parse(stored) as User;
    }
    return this.user;
  }

  requireUserId(): string {
    if (!this.user?.id) {
      throw new Error('Please login to continue');
    }
    return this.user.id;
  }

  private async parseResponse<T>(res: Response): Promise<T> {
    const json = await res.json();
    if (!json.success) {
      const msg = json.message || json.errors?.[0] || 'Request failed';
      throw new Error(msg);
    }
    return json.data as T;
  }

  async register(name: string, email: string, password: string): Promise<User> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const user = await this.parseResponse<User>(res);
    this.setUser(user);
    return user;
  }

  async login(email: string, password: string): Promise<User> {
    const res = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const user = await this.parseResponse<User>(res);
    this.setUser(user);
    return user;
  }

  async getCart(): Promise<Cart> {
    const userId = this.requireUserId();
    const res = await fetch(`${API_BASE}/cart/${userId}`);
    return this.parseResponse<Cart>(res);
  }

  async addItem(item: Omit<CartItem, 'quantity'> & { quantity?: number }): Promise<Cart> {
    const userId = this.requireUserId();
    const res = await fetch(`${API_BASE}/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, quantity: 1, ...item }),
    });
    return this.parseResponse<Cart>(res);
  }

  async updateItem(productId: string, quantity: number): Promise<Cart> {
    const userId = this.requireUserId();
    const res = await fetch(`${API_BASE}/cart/items/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, quantity }),
    });
    return this.parseResponse<Cart>(res);
  }

  async removeItem(productId: string): Promise<Cart> {
    const userId = this.requireUserId();
    const res = await fetch(`${API_BASE}/cart/items/${productId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return this.parseResponse<Cart>(res);
  }

  async clearCart(): Promise<Cart> {
    const userId = this.requireUserId();
    const res = await fetch(`${API_BASE}/cart/${userId}`, { method: 'DELETE' });
    return this.parseResponse<Cart>(res);
  }

  async checkout(): Promise<CheckoutSummary> {
    const userId = this.requireUserId();
    const res = await fetch(`${API_BASE}/cart/${userId}/checkout`);
    return this.parseResponse<CheckoutSummary>(res);
  }

  async completeCheckout(): Promise<OrderConfirmation> {
    const userId = this.requireUserId();
    const res = await fetch(`${API_BASE}/cart/${userId}/complete`, { method: 'POST' });
    return this.parseResponse<OrderConfirmation>(res);
  }

  async getOrders(): Promise<OrderConfirmation[]> {
    const userId = this.requireUserId();
    const res = await fetch(`${API_BASE}/orders/${userId}`);
    return this.parseResponse<OrderConfirmation[]>(res);
  }

  async getOrder(orderId: string): Promise<OrderConfirmation> {
    const userId = this.requireUserId();
    const res = await fetch(`${API_BASE}/orders/${userId}/${orderId}`);
    return this.parseResponse<OrderConfirmation>(res);
  }
}

export const api = new ApiClient();
