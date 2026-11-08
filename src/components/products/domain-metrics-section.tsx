'use client';

import { Card } from '@/components/ui/card';
import { Loader2Icon } from 'lucide-react';

interface DomainMetricsSectionProps {
  domainRating: number | null;
  isLoading?: boolean;
}

// SVG circular gauge dimensions
const GAUGE_SIZE = 180;
const STROKE_WIDTH = 12;
const RADIUS = (GAUGE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function DomainMetricsSection({
  domainRating,
  isLoading = false,
}: DomainMetricsSectionProps) {
  const progress = (domainRating ?? 0) / 100;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <Card className="flex h-full flex-col items-center justify-center p-6">
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          {/* Circular Gauge */}
          <div className="relative">
            <svg width={GAUGE_SIZE} height={GAUGE_SIZE} className="-rotate-90">
              {/* Background track */}
              <circle
                cx={GAUGE_SIZE / 2}
                cy={GAUGE_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="currentColor"
                className="text-muted/30"
                strokeWidth={STROKE_WIDTH}
              />
              {/* Progress arc */}
              <circle
                cx={GAUGE_SIZE / 2}
                cy={GAUGE_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="var(--chart-1)"
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            {/* Center value */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-bold tabular-nums">
                {domainRating !== null ? domainRating : 'N/A'}
              </span>
            </div>
          </div>
          {/* Label */}
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Domain Rating
          </p>
        </div>
      )}
    </Card>
  );
}
