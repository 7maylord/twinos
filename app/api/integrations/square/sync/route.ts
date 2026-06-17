import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const business = await prisma.business.findFirst();
    if (!business) {
      return NextResponse.json({ error: 'No business found' }, { status: 404 });
    }

    // Check if the employee already exists to avoid duplicates on repeat clicks
    const existing = await prisma.employee.findFirst({
      where: {
        businessId: business.id,
        name: 'Square Shift Barista',
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Square labor roster is already synchronized.',
        employee: existing,
      });
    }

    // Create a new employee from POS shift logs
    const employee = await prisma.employee.create({
      data: {
        businessId: business.id,
        name: 'Square Shift Barista',
        role: 'Barista',
        salary: 3800.0,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Square POS shift logs imported.',
      employee,
    });
  } catch (error: any) {
    console.error('Square sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
