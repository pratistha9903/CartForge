import { Link } from 'react-router-dom';
import { type LucideIcon } from 'lucide-react';

interface FormFieldProps {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: LucideIcon;
  required?: boolean;
  minLength?: number;
  hint?: string;
  rightElement?: React.ReactNode;
}

export function FormField({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon: Icon,
  required,
  minLength,
  hint,
  rightElement,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label}
        </label>
        {hint && <span className="text-xs text-slate-500">{hint}</span>}
      </div>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500" />
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
          className={`input-field ${Icon ? 'pl-11' : ''} ${rightElement ? 'pr-11' : ''}`}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
    </div>
  );
}

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  highlights?: string[];
}

export function AuthLayout({ title, subtitle, children, footer, highlights }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-[48%] overflow-hidden bg-surface-900 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-mesh-auth" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-60" />

        <div className="relative z-10 p-12">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent shadow-soft">
              <span className="text-lg font-bold text-white">C</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">CartForge</span>
          </Link>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center px-12 xl:px-16">
          <p className="section-label mb-4">Premium Commerce</p>
          <h1 className="text-balance text-4xl font-bold leading-[1.15] tracking-tight text-white xl:text-5xl">
            Shop smarter with intelligent rewards
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-400">
            Earn tiered discounts as you shop. The more you explore across categories, the more you save.
          </p>

          <ul className="mt-10 space-y-4">
            {(highlights ?? [
              'Up to 20% off on orders above ₹10,000',
              '₹200 diversity bonus on 3+ categories',
              'Secure account with persistent cart',
            ]).map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs text-accent-light">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 border-t border-white/5 p-12">
          <p className="text-sm text-slate-500">
            Trusted by shoppers who value quality, clarity, and transparent pricing.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col bg-surface-950">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
              <span className="text-sm font-bold text-white">C</span>
            </div>
            <span className="font-bold text-white">CartForge</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-[420px] animate-slide-in-right">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-400">{subtitle}</p>
            </div>

            {children}

            <div className="mt-8 text-center text-sm text-slate-500">{footer}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PasswordStrength({ password }: { password: string }) {
  const score =
    password.length >= 8 ? 3 : password.length >= 6 ? 2 : password.length > 0 ? 1 : 0;
  const labels = ['', 'Weak', 'Fair', 'Strong'];
  const colors = ['bg-surface-700', 'bg-red-500', 'bg-warning', 'bg-success'];

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? colors[score] : 'bg-surface-700'}`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500">{labels[score]} password</p>
    </div>
  );
}
