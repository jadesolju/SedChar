'use client';
import { formatCount } from '@/shared/thaiTagParser';

interface CharacterCounterProps {
  count: number;
  maxTarget: number;
  usagePercent: number;
  isSafe: boolean;
}

export function CharacterCounter({ count, maxTarget, usagePercent, isSafe }: CharacterCounterProps) {
  const barColor = usagePercent > 100
    ? 'bg-red-500'
    : usagePercent > 85
      ? 'bg-amber-500'
      : 'bg-green-500';

  const textColor = usagePercent > 100
    ? 'text-red-500'
    : usagePercent > 85
      ? 'text-amber-500'
      : 'text-muted-foreground';

  const barWidth = Math.min(usagePercent, 100);

  return (
    <div className="space-y-1.5">
      {/* Bar */}
      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${barWidth}%` }}
          role="progressbar"
          aria-valuenow={usagePercent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {/* Labels */}
      <div className={`flex justify-between items-center text-xs font-mono ${textColor}`}>
        <span>{formatCount(count)} ตัวอักษร</span>
        <span className={isSafe ? 'text-muted-foreground' : 'text-red-500 font-semibold'}>
          {isSafe ? `เหลือ ${formatCount(maxTarget - count)}` : `เกิน ${formatCount(count - maxTarget)} ตัว`}
          {' / '}max {formatCount(maxTarget)}
        </span>
      </div>
    </div>
  );
}
