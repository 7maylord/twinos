import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getActiveBusiness } from '@/lib/auth-helpers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    let targetBusinessId = null;
    const activeBusiness = await getActiveBusiness();
    if (activeBusiness) {
      targetBusinessId = activeBusiness.id;
    }

    if (Array.isArray(body)) {
      if (!targetBusinessId) {
        return NextResponse.json({ error: 'No business profile found' }, { status: 400 });
      }

      const created = [];
      for (const item of body) {
        const { name, role, department, salary, businessId } = item;
        if (!name || !role || salary === undefined) continue;

        const employee = await prisma.employee.create({
          data: {
            businessId: businessId || targetBusinessId,
            name,
            role,
            department: department || null,
            salary: Number(salary),
          },
        });
        created.push(employee);
      }
      return NextResponse.json({ success: true, count: created.length, data: created });
    }

    const { name, role, department, salary, businessId } = body;

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
        department: department || null,
        salary: Number(salary),
      },
    });

    return NextResponse.json(employee);
  } catch (error: any) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, role, department, salary } = body;

    if (!id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    const activeBusiness = await getActiveBusiness();
    if (!activeBusiness) {
      return NextResponse.json({ error: 'No active business' }, { status: 401 });
    }

    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing || existing.businessId !== activeBusiness.id) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (department !== undefined) updateData.department = department || null;
    if (salary !== undefined) updateData.salary = Number(salary);

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(employee);
  } catch (error: any) {
    console.error('Error updating employee:', error);
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

    const activeBusiness = await getActiveBusiness();
    if (!activeBusiness) {
      return NextResponse.json({ error: 'No active business' }, { status: 401 });
    }

    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing || existing.businessId !== activeBusiness.id) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
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
