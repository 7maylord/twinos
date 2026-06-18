import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
    }

    const clientId = process.env.QBO_CLIENT_ID || 'mock-client-id';
    const redirectUri = process.env.QBO_REDIRECT_URI || 'http://localhost:3000/api/integrations/quickbooks/callback';
    const state = businessId;

    // For developer testing / local sandbox without keys:
    // Bypasses Intuit's authorization server and redirects directly to the callback to simulate auth consent approval.
    if (clientId === 'mock-client-id' || !process.env.QBO_CLIENT_ID) {
      const mockCallbackUrl = `${redirectUri}?code=mock-oauth-auth-code&state=${state}&realmId=mock-company-id`;
      return NextResponse.redirect(mockCallbackUrl);
    }

    // Construct Intuit OAuth consent screen URL
    const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&response_type=code&scope=com.intuit.quickbooks.accounting&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('QBO connect redirect error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
