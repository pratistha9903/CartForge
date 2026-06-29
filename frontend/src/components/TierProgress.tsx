import { Crown, Star, Gem, Award } from 'lucide-react';
import type { CheckoutSummary } from '../types';
import { formatINR } from '../data/products';

const tierIcons: Record<string, typeof Crown> = {
  None: Award,
  Silver: Star,
  Gold: Crown,
  Platinum: Gem,
};

interface TierProgressProps {
  checkout: CheckoutSummary;
}

export function TierProgress({ checkout }: TierProgressProps) {
  const tierName = checkout.appliedTier;
  const Icon = tierIcons[tierName] || Award;
  const maxTier = 10000;
  const progressPercent = Math.min(100, (checkout.subtotal / maxTier) * 100);
  const nextTier = checkout.campaign?.nextTier;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-surface-850 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
          <Icon className="h-5 w-5 text-accent-light" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Reward tier
          </p>
          <p className="font-semibold text-white">{tierName}</p>
        </div>
        {checkout.campaign?.activeTier.discountPercent ? (
          <span className="ml-auto rounded-md bg-accent/15 px-2.5 py-1 text-xs font-bold text-accent-light">
            {checkout.campaign.activeTier.discountPercent}% OFF
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <div className="mb-2 flex justify-between text-[11px] text-slate-500">
          <span>{formatINR(checkout.subtotal)}</span>
          <span>Platinum at {formatINR(maxTier)}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-800">
          <div
            className="h-full rounded-full bg-accent transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {nextTier && (
        <p className="mt-3 text-xs text-slate-500">
          Add <span className="font-semibold text-slate-300">{formatINR(nextTier.amountToUnlock)}</span> more for{' '}
          <span className="font-semibold text-slate-300">{nextTier.name}</span> rewards
        </p>
      )}
    </div>
  );
}
