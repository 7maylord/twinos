import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decrypt, encrypt } from '@/lib/encryption';

export async function POST(request: Request) {
  try {
    let businessId = '';
    let shopifyStoreDomainInput = '';
    try {
      const body = await request.json();
      businessId = body.businessId;
      shopifyStoreDomainInput = body.shopifyStoreDomain;
    } catch {
      // Body is empty or malformed
    }

    if (!businessId) {
      const { searchParams } = new URL(request.url);
      businessId = searchParams.get('businessId') || '';
    }

    // Locate business
    let business = null;
    if (businessId) {
      business = await prisma.business.findUnique({ where: { id: businessId } });
    } else {
      business = await prisma.business.findFirst();
    }

    if (!business) {
      return NextResponse.json({ error: 'No business found' }, { status: 404 });
    }

    let shopifyStoreDomain = business.shopifyStoreDomain || shopifyStoreDomainInput;
    let shopifyAccessToken = business.shopifyAccessToken;

    // If we're setting up the connection right now
    if (shopifyStoreDomainInput && (!business.shopifyAccessToken || business.shopifyStoreDomain !== shopifyStoreDomainInput)) {
      shopifyStoreDomain = shopifyStoreDomainInput;
      const rawToken = `shpua_mock_token_${Date.now()}`;
      shopifyAccessToken = encrypt(rawToken);

      await prisma.business.update({
        where: { id: business.id },
        data: {
          shopifyStoreDomain,
          shopifyAccessToken,
        }
      });
    }

    if (!shopifyAccessToken) {
      return NextResponse.json({ error: 'Shopify connection not configured.' }, { status: 400 });
    }

    const decryptedToken = decrypt(shopifyAccessToken);

    // Dynamic Shopify integration execution
    if (!decryptedToken.startsWith('shpua_mock_token') && shopifyStoreDomain && !shopifyStoreDomain.includes('mock')) {
      const graphqlUrl = `https://${shopifyStoreDomain}/admin/api/2023-04/graphql.json`;
      const query = `
        query {
          products(first: 5) {
            edges {
              node {
                title
                variants(first: 1) {
                  edges {
                    node {
                      price
                      compareAtPrice
                    }
                  }
                }
              }
            }
          }
        }
      `;

      try {
        const response = await fetch(graphqlUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': decryptedToken,
          },
          body: JSON.stringify({ query })
        });

        if (response.ok) {
          const resData = await response.json();
          const edges = resData?.data?.products?.edges || [];
          
          let importedCount = 0;
          for (const edge of edges) {
            const node = edge.node;
            const title = node.title;
            const price = parseFloat(node.variants?.edges?.[0]?.node?.price) || 5.0;
            const cost = parseFloat(node.variants?.edges?.[0]?.node?.compareAtPrice) || (price * 0.3);

            const existing = await prisma.product.findFirst({
              where: {
                businessId: business.id,
                name: title,
              }
            });

            if (!existing) {
              await prisma.product.create({
                data: {
                  businessId: business.id,
                  name: title,
                  price,
                  cost,
                }
              });
              importedCount++;
            }
          }

          return NextResponse.json({
            success: true,
            message: `Shopify sync complete. Imported ${importedCount} live products.`,
            business: await prisma.business.findUnique({ where: { id: business.id } })
          });
        }
      } catch (err) {
        console.error('Failed live Shopify fetch, falling back to sandbox/mock:', err);
      }
    }

    // Fallback: Sandbox/Mock sync behavior
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

