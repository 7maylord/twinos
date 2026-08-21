import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getActiveUserEmail, verifyBusinessOwnership, verifyBusinessAccess } from '@/lib/auth-helpers';

// Comments are internal working notes on a scenario — deliberately not exposed
// on the public share link (app/share/[id]/page.tsx never calls this route),
// since opening comment posting to unauthenticated share-link visitors would
// be a new unauthenticated write surface (spam/abuse).

// GET is read-only, so viewers (not just owners) can read the discussion.
// POST stays owner-only below — v1 viewers are read-only everywhere.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const scenario = await prisma.scenario.findUnique({ where: { id }, select: { businessId: true } });
    if (!scenario || !(await verifyBusinessAccess(scenario.businessId))) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }

    const comments = await prisma.scenarioComment.findMany({
      where: { scenarioId: id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(comments);
  } catch (error: any) {
    console.error('Error fetching scenario comments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const text = typeof body.body === 'string' ? body.body.trim() : '';

    if (!text) {
      return NextResponse.json({ error: 'Comment body is required' }, { status: 400 });
    }
    if (text.length > 2000) {
      return NextResponse.json({ error: 'Comment is too long (max 2000 characters)' }, { status: 400 });
    }

    const scenario = await prisma.scenario.findUnique({ where: { id }, select: { businessId: true } });
    if (!scenario || !(await verifyBusinessOwnership(scenario.businessId))) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }

    const authorEmail = await getActiveUserEmail();
    const comment = await prisma.scenarioComment.create({
      data: { scenarioId: id, authorEmail, body: text },
    });

    return NextResponse.json(comment);
  } catch (error: any) {
    console.error('Error creating scenario comment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
