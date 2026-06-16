import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role, salary, businessId } = body;

    if (!name || !role || salary === undefined) {
      return NextResponse.json({ error: 'Name, role, and salary are required' }, { status: 400 });
    }

    let targetBusinessId = businessId;
    if (!targetBusinessId) {
      const defaultBusiness = await prisma.business.findFirst();
      if (!defaultBusiness) {
        return NextResponse.json({ error: 'No business profile found' }, { status: 400 });
      }
      targetBusinessId = defaultBusiness.id;
    }

    const employee = await prisma.employee.create({
      data: {
        businessId: targetBusinessId,
        name,
        role,
        salary: Number(salary),
      },
    });

    return NextResponse.json(employee);
  } catch (error: any) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
