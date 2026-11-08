'use server';

import { getDb } from '@/db';
import { domainDrHistory } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';

const getProductOverviewDataSchema = z.object({
  domainId: z.string().min(1, 'Domain ID is required'),
});

export interface ProductOverviewData {
  // DR history from domain_dr_history table
  drHistory: Array<{ date: string; value: number | null }>;
}

/**
 * Get all overview data for a product in a single query
 * Fetches:
 * - DR history from domain_dr_history table
 */
export async function getProductOverviewAction(input: { domainId: string }) {
  try {
    const parsedInput = getProductOverviewDataSchema.parse(input);
    const db = await getDb();

    // Fetch DR history records (last 12 months) from domain_dr_history table
    const drHistoryRecords = await db
      .select()
      .from(domainDrHistory)
      .where(eq(domainDrHistory.domainId, parsedInput.domainId))
      .orderBy(desc(domainDrHistory.createdAt))
      .limit(12);

    // Transform DR history to chart data format (oldest first)
    const drData: Array<{ date: string; value: number | null }> = [];
    const sortedDrRecords = [...drHistoryRecords].reverse();
    for (const record of sortedDrRecords) {
      const date = record.createdAt.toISOString().split('T')[0];
      drData.push({
        date,
        value: record.domainRating,
      });
    }

    return {
      success: true,
      data: {
        drHistory: drData,
      } as ProductOverviewData,
    };
  } catch (error) {
    console.error('Get product overview data error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to get product overview data',
    };
  }
}
