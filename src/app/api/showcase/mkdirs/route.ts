import { getDb } from '@/db';
import { domain, product } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// Basic authentication
function validateBasicAuth(request: Request): boolean {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString(
    'utf-8'
  );
  const [username, password] = credentials.split(':');

  const expectedUsername = process.env.CRON_JOBS_USERNAME;
  const expectedPassword = process.env.CRON_JOBS_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    console.error(
      'Basic auth credentials not configured in environment variables'
    );
    return false;
  }

  return username === expectedUsername && password === expectedPassword;
}

/**
 * GET /api/showcase/mkdirs
 *
 * Returns all products with template = 'mkdirs'.
 * Requires Basic Auth (CRON_JOBS_USERNAME / CRON_JOBS_PASSWORD).
 */
export async function GET(request: Request) {
  if (!validateBasicAuth(request)) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Showcase API"' },
    });
  }

  try {
    const db = await getDb();

    const items = await db
      .select({
        id: product.id,
        name: product.name,
        description: product.description,
        url: product.url,
        image: product.ogImage,
        logo: product.logo,
        dr: domain.domainRating,
        createdAt: product.createdAt,
      })
      .from(product)
      .innerJoin(domain, eq(product.domainId, domain.id))
      .where(eq(product.template, 'mkdirs'));

    // Sort by DR descending
    const data = items
      .sort((a, b) => (b.dr ?? 0) - (a.dr ?? 0))
      .map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        url: item.url,
        image: item.image,
        logo: item.logo,
        order: item.dr,
      }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Showcase API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch showcase data' },
      { status: 500 }
    );
  }
}
