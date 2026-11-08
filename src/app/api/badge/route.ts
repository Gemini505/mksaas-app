import { getDb } from '@/db';
import { domain as domainTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const WIDTH = 410;
const HEIGHT = 100;
const DR_MAX = 100;

type Theme = 'light' | 'dark';

function buildBadgeSvg(
  domain: string,
  dr: number,
  theme: Theme,
  width: number,
  height: number
): string {
  const isLight = theme === 'light';
  const bg = isLight ? '#ffffff' : '#252525';
  const textColor = isLight ? '#111111' : '#ffffff';
  const labelColor = isLight ? '#6b7280' : '#9ca3af';
  const trackColor = isLight ? '#e5e7eb' : '#404040';

  const cx = 50;
  const cy = height / 2;
  const r = 30;
  const strokeWidth = 8;
  const clampedDr = Math.min(DR_MAX, Math.max(0, Number(dr) || 0));
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (clampedDr / DR_MAX) * circumference;

  const gradientId = `dr-gradient-${theme}`;

  // Trend icon: 3-segment zigzag + arrowhead, segments 1 & 3 parallel (slope=-6/7)
  const p1x = width - 74;
  const p1y = cy + 6; // start
  const p2x = width - 60;
  const p2y = cy - 6; // first bend (rise, dx=14 dy=-12)
  const p3x = width - 46;
  const p3y = cy + 6; // second bend (dip, dx=14 dy=+12)
  const p4x = width - 25;
  const p4y = cy - 12; // tip (rise, dx=21 dy=-18, 1.5x seg1, parallel)

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#facc15"/>
      <stop offset="30%" style="stop-color:#f59e0b"/>
      <stop offset="60%" style="stop-color:#f97316"/>
      <stop offset="100%" style="stop-color:#dc2626"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="${bg}" rx="8" ry="8"/>
  <!-- Progress ring track -->
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${trackColor}" stroke-width="${strokeWidth}"/>
  <!-- Progress ring fill -->
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#${gradientId})" stroke-width="${strokeWidth}"
    stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}"
    transform="rotate(-90 ${cx} ${cy})" stroke-linecap="round"/>
  <!-- DR value (centered, bold) -->
  <text x="${cx}" y="${cy}" dominant-baseline="central" text-anchor="middle" fill="${textColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="28">${Math.round(clampedDr)}</text>
  <!-- Domain name (large, bold) -->
  <text x="100" y="${cy - 4}" fill="${textColor}" font-family="system-ui, sans-serif" font-weight="700" font-size="26">${escapeXml(domain)}</text>
  <!-- Label -->
  <text x="100" y="${cy + 18}" fill="${labelColor}" font-family="system-ui, sans-serif" font-size="12" font-weight="600" letter-spacing="0.05em">CERTIFIED DOMAIN RATING</text>
  <!-- Trend-up icon: 3-segment zigzag + arrowhead -->
  <polyline points="${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y} ${p4x},${p4y}" stroke="${textColor}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <polyline points="${p4x - 10},${p4y} ${p4x},${p4y} ${p4x},${p4y + 10}" stroke="${textColor}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain') ?? '';
  const theme = (searchParams.get('theme') ?? 'light') as Theme;
  const w = Math.min(
    600,
    Math.max(180, parseInt(searchParams.get('w') ?? String(WIDTH), 10) || WIDTH)
  );
  const h = Math.min(
    120,
    Math.max(
      50,
      parseInt(searchParams.get('h') ?? String(HEIGHT), 10) || HEIGHT
    )
  );

  const trimmedDomain = domain.trim();
  if (!trimmedDomain) {
    return NextResponse.json({ error: 'Missing domain' }, { status: 400 });
  }

  // Query DR value from database by domain
  const db = await getDb();
  const result = await db
    .select({ domainRating: domainTable.domainRating })
    .from(domainTable)
    .where(eq(domainTable.url, trimmedDomain))
    .limit(1);

  const dr = result.length > 0 ? (result[0].domainRating ?? 0) : 0;
  const svg = buildBadgeSvg(trimmedDomain, dr, theme, w, h);

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
