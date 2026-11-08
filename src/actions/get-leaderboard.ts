'use server';

import { getDb } from '@/db';
import { domain, domainDrHistory, product } from '@/db/schema';
import { actionClient } from '@/lib/safe-action';
import { and, eq, gte, inArray } from 'drizzle-orm';

const REF_DAYS_WEEK = 7;
const REF_DAYS_MONTH = 30;
const HISTORY_LOOKBACK_DAYS = 35;
const LEADERBOARD_LIMIT = 50;

export interface LeaderboardItem {
  rank: number;
  productId: string;
  name: string;
  url: string;
  logo: string | null;
  dr: number | null;
  growth: number;
}

/**
 * Get DR value from history at or before the given date (latest record before date).
 */
function getDrAtDate(
  history: { domainId: string; domainRating: number | null; createdAt: Date }[],
  domainId: string,
  beforeDate: Date
): number | null {
  const domainHistory = history
    .filter((h) => h.domainId === domainId && h.createdAt <= beforeDate)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const record = domainHistory[0];
  return record?.domainRating ?? null;
}

/**
 * Get public product leaderboard ranked by DR growth (weekly and monthly).
 * Only products with private = false are included.
 */
export const getLeaderboardAction = actionClient.action(async () => {
  try {
    const db = await getDb();
    const now = new Date();
    const weekAgo = new Date(
      now.getTime() - REF_DAYS_WEEK * 24 * 60 * 60 * 1000
    );
    const monthAgo = new Date(
      now.getTime() - REF_DAYS_MONTH * 24 * 60 * 60 * 1000
    );
    const historyStart = new Date(
      now.getTime() - HISTORY_LOOKBACK_DAYS * 24 * 60 * 60 * 1000
    );

    // Public products with domain (one product per domain; if multiple products share domain, pick one)
    const productsWithDomain = await db
      .select({
        productId: product.id,
        name: product.name,
        url: product.url,
        logo: product.logo,
        domainId: product.domainId,
        dr: domain.domainRating,
      })
      .from(product)
      .innerJoin(domain, eq(product.domainId, domain.id))
      .where(eq(product.private, false))
      .orderBy(product.createdAt);

    if (productsWithDomain.length === 0) {
      return {
        success: true,
        data: { weekly: [], monthly: [] },
      };
    }

    const domainIds = [
      ...new Set(productsWithDomain.map((p) => p.domainId)),
    ] as string[];

    // DR history for these domains in the lookback window
    const historyRows = await db
      .select({
        domainId: domainDrHistory.domainId,
        domainRating: domainDrHistory.domainRating,
        createdAt: domainDrHistory.createdAt,
      })
      .from(domainDrHistory)
      .where(
        and(
          gte(domainDrHistory.createdAt, historyStart),
          inArray(domainDrHistory.domainId, domainIds)
        )
      );

    const history = historyRows.map((r) => ({
      domainId: r.domainId,
      domainRating: r.domainRating,
      createdAt: r.createdAt as Date,
    }));

    const toItem = (
      p: (typeof productsWithDomain)[0],
      growth: number,
      rank: number
    ): LeaderboardItem => ({
      rank,
      productId: p.productId,
      name: p.name,
      url: p.url,
      logo: p.logo,
      dr: p.dr,
      growth,
    });

    // Weekly: growth = current DR - DR at 7 days ago. Exclude products with no
    // history at reference date so new submissions don't inflate growth.
    const withWeeklyGrowth = productsWithDomain
      .map((p) => {
        const current = p.dr ?? 0;
        const past = getDrAtDate(history, p.domainId, weekAgo);
        if (past === null) return null;
        return { ...p, growth: current - past };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);
    const weeklySorted = [...withWeeklyGrowth].sort(
      (a, b) => b.growth - a.growth
    );
    const weekly: LeaderboardItem[] = weeklySorted
      .slice(0, LEADERBOARD_LIMIT)
      .map((p, i) => toItem(p, p.growth, i + 1));

    // Monthly: same rule — exclude when no DR at 30 days ago.
    const withMonthlyGrowth = productsWithDomain
      .map((p) => {
        const current = p.dr ?? 0;
        const past = getDrAtDate(history, p.domainId, monthAgo);
        if (past === null) return null;
        return { ...p, growth: current - past };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);
    const monthlySorted = [...withMonthlyGrowth].sort(
      (a, b) => b.growth - a.growth
    );
    const monthly: LeaderboardItem[] = monthlySorted
      .slice(0, LEADERBOARD_LIMIT)
      .map((p, i) => toItem(p, p.growth, i + 1));

    return {
      success: true,
      data: { weekly, monthly },
    };
  } catch (error) {
    console.error('get leaderboard error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch leaderboard',
    };
  }
});
