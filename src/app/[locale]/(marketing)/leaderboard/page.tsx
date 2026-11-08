import { LeaderboardClient } from '@/components/leaderboard/leaderboard-client';
import Container from '@/components/layout/container';
import { getLeaderboardAction } from '@/actions/get-leaderboard';
import { constructMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return constructMetadata({
    title: 'Leaderboard | ' + t('title'),
    description:
      'Top products by Domain Rating (DR) growth. Monitor DR and climb the leaderboard.',
    locale,
    pathname: '/leaderboard',
  });
}

export default async function LeaderboardPage() {
  const result = await getLeaderboardAction();

  if (!result?.data?.success || !result.data.data) {
    return (
      <Container className="px-4 py-12 md:py-16">
        <p className="text-center text-muted-foreground">
          Failed to load leaderboard. Please try again later.
        </p>
      </Container>
    );
  }

  const { weekly, monthly } = result.data.data;

  return (
    <Container className="px-4 py-12 md:py-16">
      <LeaderboardClient weekly={weekly} monthly={monthly} />
    </Container>
  );
}
