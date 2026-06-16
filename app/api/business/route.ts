import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const business = await prisma.business.findFirst({
      include: {
        products: true,
        employees: true,
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json(business);
  } catch (error: any) {
    console.error('Error fetching business:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
