import { getProductByDomainAction } from '@/actions/get-product-by-domain';
import { ProductPageClient } from '@/components/products/product-page-client';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ domain: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { domain } = await params;
  const decodedDomain = decodeURIComponent(domain);
  const result = await getProductByDomainAction(decodedDomain);

  if (!result.success || !result.data) {
    return { title: 'Product Not Found' };
  }

  return {
    title: `${result.data.name} - Domain Rating`,
    description:
      result.data.description ?? `Domain Rating for ${decodedDomain}`,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { domain } = await params;
  const decodedDomain = decodeURIComponent(domain);
  const result = await getProductByDomainAction(decodedDomain);

  if (!result.success || !result.data) {
    notFound();
  }

  return <ProductPageClient product={result.data} domain={decodedDomain} />;
}
