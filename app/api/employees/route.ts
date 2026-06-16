import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    let targetBusinessId = null;
    const defaultBusiness = await prisma.business.findFirst();
    if (defaultBusiness) {
      targetBusinessId = defaultBusiness.id;
    }

    if (Array.isArray(body)) {
      if (!targetBusinessId) {
        return NextResponse.json({ error: 'No business profile found' }, { status: 400 });
      }

      const created = [];
      for (const item of body) {
        const { name, role, salary, businessId } = item;
        if (!name || !role || salary === undefined) continue;

        const employee = await prisma.employee.create({
          data: {
            businessId: businessId || targetBusinessId,
            name,
            role,
            salary: Number(salary),
          },
        });
        created.push(employee);
      }
      return NextResponse.json({ success: true, count: created.length, data: created });
    }

    const { name, role, salary, businessId } = body;

    if (!name || !role || salary === undefined) {
      return NextResponse.json({ error: 'Name, role, and salary are required' }, { status: 400 });
    }

    const targetId = businessId || targetBusinessId;
    if (!targetId) {
      return NextResponse.json({ error: 'No business profile found' }, { status: 400 });
    }

    const employee = await prisma.employee.create({
      data: {
        businessId: targetId,
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
