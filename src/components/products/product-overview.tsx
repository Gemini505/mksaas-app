'use client';

import { useProductOverview } from '@/hooks/use-product-overview';
import { DomainDrChart } from './domain-dr-chart';
import { DomainMetricsSection } from './domain-metrics-section';
import { useProduct } from './product-context';

/**
 * ProductOverview Component
 *
 * Main container component for displaying product analytics and insights.
 * Layout: left side shows DR gauge, right side shows DR trend chart.
 *
 * Data sources:
 * 1. Domain Rating (DR): from domain table via product.domainRating
 * 2. DR History: from domain_dr_history table
 */
export function ProductOverview() {
  // Get the product from the context
  const product = useProduct();

  // Fetch all overview data in a single query from domain_dr_history
  const {
    data: overviewData,
    isLoading,
    isError,
  } = useProductOverview(product.domainId);

  // Extract data from the query result
  const drHistory = isError ? [] : (overviewData?.drHistory ?? []);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[280px_1fr]">
      {/* Left: Domain Rating Gauge */}
      <DomainMetricsSection
        domainRating={product.domainRating}
        isLoading={isLoading}
      />

      {/* Right: DR Trend Chart */}
      <DomainDrChart data={drHistory} isLoading={isLoading} />
    </div>
  );
}
