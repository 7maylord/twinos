import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    console.log('[QBO Connect] GET request triggered. businessId parameter:', businessId);

    if (!businessId) {
      console.warn('[QBO Connect] Missing businessId. Returning 400.');
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
    }

    const clientId = process.env.QBO_CLIENT_ID || 'mock-client-id';
    const origin = new URL(request.url).origin;
    const redirectUri = process.env.QBO_REDIRECT_URI || `${origin}/api/integrations/quickbooks/callback`;
    const state = businessId;

    console.log(`[QBO Connect] Configuration: QBO_CLIENT_ID=${process.env.QBO_CLIENT_ID ? 'set' : 'mock'}, QBO_REDIRECT_URI=${redirectUri}`);

    // For developer testing / local sandbox without keys:
    if (clientId === 'mock-client-id' || !process.env.QBO_CLIENT_ID) {
      const mockCallbackUrl = `${redirectUri}?code=mock-oauth-auth-code&state=${state}&realmId=mock-company-id`;
      console.log('[QBO Connect] Bypassing Intuit OAuth flow. Redirecting directly to callback URL:', mockCallbackUrl);
      return NextResponse.redirect(mockCallbackUrl);
    }

    // Construct Intuit OAuth consent screen URL
    const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&response_type=code&scope=com.intuit.quickbooks.accounting&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
    console.log('[QBO Connect] Live OAuth Mode. Redirecting to Intuit:', authUrl);

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('[QBO Connect] Exception in connect redirect:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
