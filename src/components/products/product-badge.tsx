'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { extractDomain, getBaseUrl, getProductPageUrl } from '@/lib/urls';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useProduct } from './product-context';

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);
  return { copy, copied };
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const { copy, copied } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(text)}
      className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-accent"
    >
      {copied ? (
        <CheckIcon className="size-3.5 text-green-600" />
      ) : (
        <CopyIcon className="size-3.5" />
      )}
      {copied ? 'Copied' : label}
    </button>
  );
}

export function ProductBadge() {
  const product = useProduct();
  const domain = extractDomain(product.url);
  const baseUrl = getBaseUrl().replace(/\/$/, '');
  const productLink = `${baseUrl}${getProductPageUrl(product.url)}`;
  const badgeApi = (theme: 'light' | 'dark') =>
    `${baseUrl}/api/badge?domain=${encodeURIComponent(domain)}&theme=${theme}`;

  const embedLight = `<a href="${productLink}" target="_blank" rel="noopener noreferrer"><img src="${badgeApi('light')}" alt="Domain Rating - ${escapeHtml(domain)}" width="410" height="100" /></a>`;
  const embedDark = `<a href="${productLink}" target="_blank" rel="noopener noreferrer"><img src="${badgeApi('dark')}" alt="Domain Rating - ${escapeHtml(domain)}" width="410" height="100" /></a>`;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Badge</CardTitle>
          <CardDescription>
            Embed this badge on your site to show Domain Rating and link back to
            this product page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Light</p>
                <CopyButton text={embedLight} label="Copy HTML" />
              </div>
              <a
                href={productLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:opacity-90"
              >
                <img
                  src={badgeApi('light')}
                  alt={`Domain Rating ${domain}`}
                  width={410}
                  height={100}
                  className="h-auto max-w-[280px]"
                />
              </a>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Dark</p>
                <CopyButton text={embedDark} label="Copy HTML" />
              </div>
              <a
                href={productLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:opacity-90"
              >
                <img
                  src={badgeApi('dark')}
                  alt={`Domain Rating ${domain}`}
                  width={410}
                  height={100}
                  className="h-auto max-w-[280px]"
                />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
