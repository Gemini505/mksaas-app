'use client';

import Container from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { getExternalUrl } from '@/lib/urls';
import { GlobeIcon } from 'lucide-react';
import Link from 'next/link';
import { DomainDrChart } from './domain-dr-chart';
import { DomainMetricsSection } from './domain-metrics-section';

interface PublicProduct {
  id: string;
  url: string;
  name: string;
  description: string | null;
  logo: string | null;
  ogImage: string | null;
  domainRating: number | null;
  drHistory: Array<{ date: string; value: number | null }>;
}

interface ProductPageClientProps {
  product: PublicProduct;
  domain: string;
}

export function ProductPageClient({ product, domain }: ProductPageClientProps) {
  return (
    <Container className="px-4 py-8 md:py-12 space-y-8">
      {/* Header Section — same as product detail layout */}
      <Card className="shadow-none">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="flex-1 min-w-0 w-full sm:w-auto">
              <div className="flex items-start gap-4">
                {product.logo ? (
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                    <img
                      src={product.logo}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <GlobeIcon className="size-10 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-2">
                  <CardTitle className="text-2xl md:text-3xl">
                    {product.name}
                  </CardTitle>
                  {product.description && (
                    <p className="text-muted-foreground max-w-2xl leading-relaxed line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-4">
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="cursor-pointer"
                    >
                      <Link
                        href={getExternalUrl(product.url)}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="cursor-pointer flex items-center gap-2"
                      >
                        <GlobeIcon className="size-4 shrink-0" />
                        Website
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            {product.ogImage && (
              <Link
                href={getExternalUrl(product.url)}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="relative w-full sm:w-64 shrink-0 overflow-hidden rounded-lg border aspect-video max-h-48 group cursor-pointer"
              >
                <img
                  src={product.ogImage}
                  alt={`${product.name} preview`}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Domain Rating Section — same grid as ProductOverview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[280px_1fr]">
        <DomainMetricsSection domainRating={product.domainRating} />
        <DomainDrChart data={product.drHistory} />
      </div>
    </Container>
  );
}
