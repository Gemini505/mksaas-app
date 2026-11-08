'use client';

import { getFaviconUrl, getProductPageUrl } from '@/lib/urls';
import type { LeaderboardItem } from '@/actions/get-leaderboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

function RankCell({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return <span className="font-medium tabular-nums">{rank}</span>;
}

function LeaderboardTable({
  items,
  emptyMessage,
}: {
  items: LeaderboardItem[];
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">{emptyMessage}</p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 pl-4 pr-4 text-center">Rank</TableHead>
            <TableHead className="pl-4">Website</TableHead>
            <TableHead className="w-20 pl-4 text-right">DR</TableHead>
            <TableHead className="w-24 pl-4 pr-6 text-right">Growth</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const href = getProductPageUrl(item.url);
            return (
              <TableRow
                key={item.productId}
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() =>
                  window.open(href, '_blank', 'noopener,noreferrer')
                }
              >
                <TableCell className="w-16 pl-4 pr-4 text-center align-middle">
                  <a
                    href={href}
                    rel="nofollow noopener noreferrer"
                    target="_blank"
                    className="sr-only"
                  >
                    {item.name}
                  </a>
                  <RankCell rank={item.rank} />
                </TableCell>
                <TableCell className="pl-4 align-middle">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={getFaviconUrl(item.url)}
                      alt=""
                      className="size-6 shrink-0 rounded"
                      width={24}
                      height={24}
                    />
                    <span className="font-medium truncate">{item.name}</span>
                  </div>
                </TableCell>
                <TableCell className="w-20 pl-4 text-right tabular-nums align-middle">
                  {item.dr ?? '—'}
                </TableCell>
                <TableCell className="w-24 pl-4 pr-6 text-right align-middle">
                  <span
                    className={cn(
                      'tabular-nums font-medium',
                      item.growth > 0 && 'text-green-600 dark:text-green-400',
                      item.growth < 0 && 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {item.growth > 0 ? `+${item.growth}` : item.growth}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

interface LeaderboardClientProps {
  weekly: LeaderboardItem[];
  monthly: LeaderboardItem[];
}

export function LeaderboardClient({ weekly, monthly }: LeaderboardClientProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Leaderboard
        </h1>
        <p className="text-muted-foreground">
          Top products by Domain Rating growth
        </p>
      </div>

      <Tabs defaultValue="week" className="w-full">
        <TabsList className="grid w-full max-w-xs grid-cols-2 mx-auto">
          <TabsTrigger value="week" className="cursor-pointer">
            This Week
          </TabsTrigger>
          <TabsTrigger value="month" className="cursor-pointer">
            This Month
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="week"
          className="mt-6 w-full max-w-3xl mx-auto px-2"
        >
          <LeaderboardTable
            items={weekly}
            emptyMessage="No public products yet, or no DR history for this week."
          />
        </TabsContent>
        <TabsContent
          value="month"
          className="mt-6 w-full max-w-3xl mx-auto px-2"
        >
          <LeaderboardTable
            items={monthly}
            emptyMessage="No public products yet, or no DR history for this month."
          />
        </TabsContent>
      </Tabs>

      <p className="text-center text-xs text-muted-foreground">
        * Ranking is based on DR growth which is updated every week
      </p>
    </div>
  );
}
