import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/[0.06] bg-surface-900/50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                <ShoppingBag className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold text-white">CartForge</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
              Intelligent e-commerce with tiered rewards, transparent pricing, and a seamless shopping experience.
            </p>
          </div>

          <div>
            <h4 className="section-label mb-4">Shop</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/" className="hover:text-white">All Products</Link></li>
              <li><Link to="/signup" className="hover:text-white">Create Account</Link></li>
              <li><Link to="/login" className="hover:text-white">Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="section-label mb-4">Rewards</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>Silver — 10% off ₹1,000+</li>
              <li>Gold — 15% off ₹5,000+</li>
              <li>Platinum — 20% off ₹10,000+</li>
              <li>₹200 diversity bonus</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} CartForge. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-slate-600">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
