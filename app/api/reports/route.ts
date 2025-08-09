import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValidAdminRequest } from '@/lib/admin';

// List vibe reports with venue info for admin. Supports optional query params: flagged, limit, offset
export async function GET(request: Request) {
  if (!isValidAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'www-authenticate': 'api-key' } });
  }
  const { searchParams } = new URL(request.url);
  const flaggedParam = searchParams.get('flagged');
  const limit = Number(searchParams.get('limit') || 50);
  const offset = Number(searchParams.get('offset') || 0);

  const where: any = {};
  if (flaggedParam === 'true') where.flagged = true;
  if (flaggedParam === 'false') where.flagged = false;

  const [total, reports] = await Promise.all([
    prisma.vibeReport.count({ where }),
    prisma.vibeReport.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      include: { venue: { select: { id: true, name: true, slug: true } } },
      take: Math.max(1, Math.min(200, limit)),
      skip: Math.max(0, offset),
    }),
  ]);

  return NextResponse.json({ vibeReports: reports, total });
}

// Soft-delete (flag) a report by id
export async function PATCH(request: Request) {
  if (!isValidAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'www-authenticate': 'api-key' } });
  }
  const body = await request.json().catch(() => null) as { id?: string; flagged?: boolean } | null;
  if (!body?.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const flagged = body.flagged ?? true;

  const updated = await prisma.vibeReport.update({
    where: { id: body.id },
    data: { flagged },
    include: { venue: { select: { id: true, name: true, slug: true } } },
  });
  return NextResponse.json({ success: true, vibeReport: updated });
}


