import { prisma } from '@/lib/db';
import { decrypt, encrypt } from '@/lib/encryption';

export async function getValidQboToken(businessId: string): Promise<string> {
  console.log(`[QBO Token Helper] Retrieving token for businessId: ${businessId}`);
  const business = await prisma.business.findUnique({
    where: { id: businessId }
  });

  if (!business || !business.qboAccessToken) {
    console.error('[QBO Token Helper] Business not found or no QBO access token stored.');
    throw new Error('QuickBooks Online account not connected.');
  }

  const now = new Date();
  
  // If the token is not expired (with 1 minute buffer), return the decrypted token
  if (business.qboTokenExpiresAt && business.qboTokenExpiresAt.getTime() > now.getTime() + 60000) {
    console.log('[QBO Token Helper] Stored token is valid. Decrypting and returning.');
    return decrypt(business.qboAccessToken);
  }

  // Token is expired, try to refresh it
  console.log('[QBO Token Helper] Stored token is expired. Attempting token refresh...');
  if (!business.qboRefreshToken) {
    console.error('[QBO Token Helper] No refresh token found on business record. Cannot refresh.');
    throw new Error('QuickBooks Online credentials expired and no refresh token found.');
  }

  const clientId = process.env.QBO_CLIENT_ID;
  const clientSecret = process.env.QBO_CLIENT_SECRET;
  const decryptedRefreshToken = decrypt(business.qboRefreshToken);

  console.log('[QBO Token Helper] Keys check:', {
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    isMockRefreshToken: decryptedRefreshToken.startsWith('mock-refresh-token')
  });

  let newAccessToken = '';
  let newRefreshToken = '';
  let tokenExpiresIn = 3600;
  let refreshTokenExpiresIn = 100 * 24 * 3600;

  if (clientId && clientSecret && !decryptedRefreshToken.startsWith('mock-refresh-token')) {
    console.log('[QBO Token Helper] Refreshing live token with Intuit servers...');
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
        grant_type: 'refresh_token',
        refresh_token: decryptedRefreshToken
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[QBO Token Helper] Intuit server rejected refresh request:', errText);
      throw new Error(`Token refresh failed: ${errText}`);
    }

    const tokenData = await response.json();
    console.log('[QBO Token Helper] Token refresh succeeded. Parsing payload.');
    newAccessToken = tokenData.access_token;
    newRefreshToken = tokenData.refresh_token;
    tokenExpiresIn = tokenData.expires_in;
    refreshTokenExpiresIn = tokenData.x_refresh_token_expires_in || (100 * 24 * 3600);
  } else {
    console.log('[QBO Token Helper] Offline bypass mode. Generating new mock refresh/access tokens.');
    newAccessToken = `mock-access-token-${Date.now()}`;
    newRefreshToken = `mock-refresh-token-${Date.now()}`;
  }

  console.log('[QBO Token Helper] Encrypting refreshed credentials and saving back to database...');
  const encryptedAccess = encrypt(newAccessToken);
  const encryptedRefresh = encrypt(newRefreshToken);

  const tokenExpiresAt = new Date(Date.now() + tokenExpiresIn * 1000);
  const refreshTokenExpiresAt = new Date(Date.now() + refreshTokenExpiresIn * 1000);

  await prisma.business.update({
    where: { id: businessId },
    data: {
      qboAccessToken: encryptedAccess,
      qboRefreshToken: encryptedRefresh,
      qboTokenExpiresAt: tokenExpiresAt,
      qboRefreshTokenExpiresAt: refreshTokenExpiresAt,
    }
  });

  console.log('[QBO Token Helper] Token refresh process completed successfully.');
  return newAccessToken;
}
