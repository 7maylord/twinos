import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { encrypt } from '@/lib/encryption';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // businessId
    const realmId = searchParams.get('realmId'); // QBO Company ID

    if (!state) {
      return NextResponse.json({ error: 'state (businessId) is required' }, { status: 400 });
    }

    if (!code) {
      return NextResponse.json({ error: 'code is required' }, { status: 400 });
    }

    const business = await prisma.business.findUnique({
      where: { id: state }
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const clientId = process.env.QBO_CLIENT_ID;
    const clientSecret = process.env.QBO_CLIENT_SECRET;
    const redirectUri = process.env.QBO_REDIRECT_URI || 'http://localhost:3000/api/integrations/quickbooks/callback';

    let accessToken = '';
    let refreshToken = '';
    let tokenExpiresIn = 3600; // 1 hour default
    let refreshTokenExpiresIn = 100 * 24 * 3600; // 100 days default
    let companyId = realmId || 'mock-company-id';

    if (clientId && clientSecret && code !== 'mock-oauth-auth-code') {
      // Real code exchange with Intuit
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
        console.error('QBO token exchange failed:', errText);
        throw new Error(`Token exchange failed: ${errText}`);
      }

      const tokenData = await response.json();
      accessToken = tokenData.access_token;
      refreshToken = tokenData.refresh_token;
      tokenExpiresIn = tokenData.expires_in;
      refreshTokenExpiresIn = tokenData.x_refresh_token_expires_in || (100 * 24 * 3600);
    } else {
      // Mock code exchange behavior
      accessToken = `mock-access-token-${Date.now()}`;
      refreshToken = `mock-refresh-token-${Date.now()}`;
    }

    // Encrypt the tokens before saving to database
    const encryptedAccess = encrypt(accessToken);
    const encryptedRefresh = encrypt(refreshToken);

    const now = Date.now();
    const tokenExpiresAt = new Date(now + tokenExpiresIn * 1000);
    const refreshTokenExpiresAt = new Date(now + refreshTokenExpiresIn * 1000);

    // Save tokens and connection details to the business
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

    const settingsUrl = new URL('/dashboard/settings', request.url);
    settingsUrl.searchParams.set('tab', 'integrations');
    settingsUrl.searchParams.set('status', 'success');
    
    return NextResponse.redirect(settingsUrl.toString());
  } catch (error: any) {
    console.error('QBO OAuth callback error:', error);
    const settingsUrl = new URL('/dashboard/settings', request.url);
    settingsUrl.searchParams.set('tab', 'integrations');
    settingsUrl.searchParams.set('status', 'error');
    settingsUrl.searchParams.set('message', error.message);
    return NextResponse.redirect(settingsUrl.toString());
  }
}
