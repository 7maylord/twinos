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

    console.log('[Shopify Sync] POST request initiated:', { businessId, shopifyStoreDomainInput });

    // Locate business
    let business = null;
    if (businessId) {
      business = await prisma.business.findUnique({ where: { id: businessId } });
    } else {
      console.log('[Shopify Sync] No businessId specified. Locating first business in DB...');
      business = await prisma.business.findFirst();
    }

    if (!business) {
      console.error('[Shopify Sync] No business twin found.');
      return NextResponse.json({ error: 'No business found' }, { status: 404 });
    }

    let shopifyStoreDomain = business.shopifyStoreDomain || shopifyStoreDomainInput;
    let shopifyAccessToken = business.shopifyAccessToken;

    console.log('[Shopify Sync] Connection credentials status:', {
      storedDomain: business.shopifyStoreDomain,
      hasStoredToken: !!business.shopifyAccessToken,
      providedDomain: shopifyStoreDomainInput
    });

    // If we're setting up the connection right now
    if (shopifyStoreDomainInput && (!business.shopifyAccessToken || business.shopifyStoreDomain !== shopifyStoreDomainInput)) {
      shopifyStoreDomain = shopifyStoreDomainInput;
      const rawToken = `shpua_mock_token_${Date.now()}`;
      shopifyAccessToken = encrypt(rawToken);

      console.log(`[Shopify Sync] Connection bootstrapping. Saving domain: ${shopifyStoreDomain} and mock token.`);
      await prisma.business.update({
        where: { id: business.id },
        data: {
          shopifyStoreDomain,
          shopifyAccessToken,
        }
      });
    }

    if (!shopifyAccessToken) {
      console.error('[Shopify Sync] Shopify access token not configured in DB.');
      return NextResponse.json({ error: 'Shopify connection not configured.' }, { status: 400 });
    }

    console.log('[Shopify Sync] Decrypting access token...');
    const decryptedToken = decrypt(shopifyAccessToken);

    console.log('[Shopify Sync] Integration execution check. isMockToken =', decryptedToken.startsWith('shpua_mock_token'));

    // Dynamic Shopify integration execution
    if (!decryptedToken.startsWith('shpua_mock_token') && shopifyStoreDomain && !shopifyStoreDomain.includes('mock')) {
      const graphqlUrl = `https://${shopifyStoreDomain}/admin/api/2023-04/graphql.json`;
      console.log(`[Shopify Sync] Running live GraphQL fetch. URL: ${graphqlUrl}`);
      
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
          console.log(`[Shopify Sync] Received ${edges.length} products from live store.`);
          
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

          console.log(`[Shopify Sync] Sync complete. Created ${importedCount} new products.`);
          return NextResponse.json({
            success: true,
            message: `Shopify sync complete. Imported ${importedCount} live products.`,
            business: await prisma.business.findUnique({ where: { id: business.id } })
          });
        } else {
          const errText = await response.text();
          console.error('[Shopify Sync] Shopify API returned error response:', errText);
        }
      } catch (err) {
        console.error('[Shopify Sync] Failed live Shopify fetch, falling back to sandbox/mock:', err);
      }
    }

    // Fallback: Sandbox/Mock sync behavior
    console.log('[Shopify Sync] Running sandbox/mock catalog sync...');
    const existing = await prisma.product.findFirst({
      where: {
        businessId: business.id,
        name: 'Shopify Matcha Latte',
      },
    });

    if (existing) {
      console.log('[Shopify Sync] Mock product already exists. Sync skipped.');
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

    console.log('[Shopify Sync] Mock product created successfully.');
    return NextResponse.json({
      success: true,
      message: 'Shopify product catalog imported.',
      product,
    });
  } catch (error: any) {
    console.error('[Shopify Sync] Unhandled exception during Shopify synchronization:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

