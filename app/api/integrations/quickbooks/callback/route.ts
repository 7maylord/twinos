import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { encrypt } from '@/lib/encryption';
import { verifyBusinessOwnership } from '@/lib/auth-helpers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // businessId
    const realmId = searchParams.get('realmId'); // QBO Company ID

    console.log('[QBO Callback] GET triggered. Query details:', { code, state, realmId });

    if (!state) {
      console.warn('[QBO Callback] Missing state (businessId) param. Aborting.');
      return NextResponse.json({ error: 'state (businessId) is required' }, { status: 400 });
    }

    if (!code) {
      console.warn('[QBO Callback] Missing code param. Aborting.');
      return NextResponse.json({ error: 'code is required' }, { status: 400 });
    }

    if (!(await verifyBusinessOwnership(state))) {
      console.warn('[QBO Callback] state (businessId) does not belong to the caller. Aborting.');
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    console.log('[QBO Callback] Fetching business from database matching ID:', state);
    const business = await prisma.business.findUnique({
      where: { id: state }
    });

    if (!business) {
      console.error('[QBO Callback] Business matching state ID not found in database:', state);
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const clientId = process.env.QBO_CLIENT_ID;
    const clientSecret = process.env.QBO_CLIENT_SECRET;
    const origin = new URL(request.url).origin;
    const redirectUri = process.env.QBO_REDIRECT_URI || `${origin}/api/integrations/quickbooks/callback`;

    console.log('[QBO Callback] Connect keys verification:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      redirectUri
    });

    let accessToken = '';
    let refreshToken = '';
    let tokenExpiresIn = 3600; // 1 hour default
    let refreshTokenExpiresIn = 100 * 24 * 3600; // 100 days default
    let companyId = realmId || 'mock-company-id';

    if (clientId && clientSecret && code !== 'mock-oauth-auth-code') {
      console.log('[QBO Callback] Commencing token exchange request with Intuit servers...');
      const tokenUrl = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
      const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${authHeader}`,
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('[QBO Callback] Intuit server rejected token exchange request:', errText);
        throw new Error(`Token exchange failed: ${errText}`);
      }

      const tokenData = await response.json();
      console.log('[QBO Callback] Received tokens payload from Intuit.');
      accessToken = tokenData.access_token;
      refreshToken = tokenData.refresh_token;
      tokenExpiresIn = tokenData.expires_in;
      refreshTokenExpiresIn = tokenData.x_refresh_token_expires_in || (100 * 24 * 3600);
    } else {
      console.log('[QBO Callback] Bypassing real OAuth API exchange. Generating mock tokens.');
      accessToken = `mock-access-token-${Date.now()}`;
      refreshToken = `mock-refresh-token-${Date.now()}`;
    }

    console.log('[QBO Callback] Encrypting credentials before persisting to SQLite...');
    const encryptedAccess = encrypt(accessToken);
    const encryptedRefresh = encrypt(refreshToken);

    const now = Date.now();
    const tokenExpiresAt = new Date(now + tokenExpiresIn * 1000);
    const refreshTokenExpiresAt = new Date(now + refreshTokenExpiresIn * 1000);

    console.log('[QBO Callback] Updating Business model schema properties...');
    await prisma.business.update({
      where: { id: state },
      data: {
        qboCompanyId: companyId,
        qboAccessToken: encryptedAccess,
        qboRefreshToken: encryptedRefresh,
        qboTokenExpiresAt: tokenExpiresAt,
        qboRefreshTokenExpiresAt: refreshTokenExpiresAt,
      }
    });
    console.log('[QBO Callback] Database upsert complete. Business connected!');

    const settingsUrl = new URL('/dashboard/settings', request.url);
    settingsUrl.searchParams.set('tab', 'integrations');
    settingsUrl.searchParams.set('status', 'success');
    
    console.log('[QBO Callback] Redirecting operator toettings panel:', settingsUrl.toString());
    return NextResponse.redirect(settingsUrl.toString());
  } catch (error: any) {
    console.error('[QBO Callback] Unhandled error during OAuth redirect flow callback:', error);
    const settingsUrl = new URL('/dashboard/settings', request.url);
    settingsUrl.searchParams.set('tab', 'integrations');
    settingsUrl.searchParams.set('status', 'error');
    settingsUrl.searchParams.set('message', error.message);
    return NextResponse.redirect(settingsUrl.toString());
  }
}
