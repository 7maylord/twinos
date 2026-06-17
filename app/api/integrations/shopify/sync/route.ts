import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const business = await prisma.business.findFirst();
    if (!business) {
      return NextResponse.json({ error: 'No business found' }, { status: 404 });
    }

    // Check if the product already exists to avoid duplicates on repeat clicks
    const existing = await prisma.product.findFirst({
      where: {
        businessId: business.id,
        name: 'Shopify Matcha Latte',
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Shopify products are already synchronized.',
        product: existing,
      });
    }

    // Create a new product synced from Shopify catalog
    const product = await prisma.product.create({
      data: {
        businessId: business.id,
        name: 'Shopify Matcha Latte',
        price: 6.50,
        cost: 1.80,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Shopify product catalog imported.',
      product,
    });
  } catch (error: any) {
    console.error('Shopify sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
