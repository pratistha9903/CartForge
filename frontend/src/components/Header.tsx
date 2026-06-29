import { Link } from 'react-router-dom';
import { ShoppingBag, LogOut, ChevronDown, Search, LayoutDashboard, Package } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  itemCount: number;
}

export function Header({ itemCount }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const navLink = (to: string, label: string) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
          active ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:text-white'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-surface-950/90 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
              <ShoppingBag className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">CartForge</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLink('/', 'Shop')}
            {isAuthenticated && (
              <>
                {navLink('/dashboard', 'Dashboard')}
                {navLink('/orders', 'Order History')}
              </>
            )}
          </nav>
        </div>

        <div className="hidden flex-1 max-w-md lg:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              placeholder="Search products..."
              className="input-field py-2.5 pl-10 text-sm"
              readOnly
              onFocus={(e) => e.target.blur()}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-surface-850 transition-colors hover:border-white/15"
          >
            <ShoppingBag className="h-[18px] w-[18px] text-slate-300" />
            {itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-surface-850 py-1.5 pl-1.5 pr-3 transition-colors hover:border-white/15"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/20 text-xs font-bold text-accent-light">
                  {initials}
                </div>
                <span className="hidden max-w-[100px] truncate text-sm font-medium text-slate-200 sm:block">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 animate-fade-in overflow-hidden rounded-xl border border-white/10 bg-surface-850 shadow-card">
                    <div className="border-b border-white/5 px-4 py-3">
                      <p className="truncate text-sm font-medium text-white">{user.name}</p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-slate-300 transition-colors hover:bg-white/[0.04] hover:text-white"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-slate-300 transition-colors hover:bg-white/[0.04] hover:text-white"
                    >
                      <Package className="h-4 w-4" />
                      Order History
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-slate-300 transition-colors hover:bg-white/[0.04] hover:text-red-300"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-secondary hidden px-4 py-2.5 sm:inline-flex">
                Sign in
              </Link>
              <Link to="/signup" className="btn-primary px-4 py-2.5">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
