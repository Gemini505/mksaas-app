'use server';

import { getDb } from '@/db';
import { domain, domainDrHistory, product } from '@/db/schema';
import { and, desc, eq } from 'drizzle-orm';

/**
 * Get public product data by domain name (no auth required).
 * Used for the public product page (/p/[domain]).
 */
export async function getProductByDomainAction(domainName: string) {
  try {
    const trimmed = domainName.trim().toLowerCase();
    if (!trimmed) {
      return { success: false, error: 'Domain name is required' };
    }

    const db = await getDb();

    // Query product + domain info by domain URL
    const results = await db
      .select({
        id: product.id,
        url: product.url,
        name: product.name,
        description: product.description,
        logo: product.logo,
        ogImage: product.ogImage,
        domainId: product.domainId,
        domainRating: domain.domainRating,
      })
      .from(product)
      .innerJoin(domain, eq(product.domainId, domain.id))
      .where(and(eq(domain.url, trimmed), eq(product.private, false)))
      .limit(1);

    if (results.length === 0) {
      return { success: false, error: 'Product not found' };
    }

    const prod = results[0];

    // Fetch DR history (last 12 months) for the chart
    const drHistoryRecords = await db
      .select()
      .from(domainDrHistory)
      .where(eq(domainDrHistory.domainId, prod.domainId))
      .orderBy(desc(domainDrHistory.createdAt))
      .limit(12);

    const drHistory = [...drHistoryRecords].reverse().map((r) => ({
      date: r.createdAt.toISOString().split('T')[0],
      value: r.domainRating,
    }));

    return {
      success: true,
      data: { ...prod, drHistory },
    };
  } catch (error) {
    console.error('Get product by domain error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch product',
    };
  }
}
