import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clickid = searchParams.get('clickid');
    
    if (!clickid) {
      // If no clickid, redirect to main app
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Get headers for logging
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const ipAddress = headersList.get('x-forwarded-for') || 
                     headersList.get('x-real-ip') || 
                     'unknown';

    // Prepare query parameters for logging
    const queryParams: Record<string, string | string[] | undefined> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    // Create redirect URL to Telegram bot
    const redirectUrl = `https://t.me/test_tma_213124214_bot/testtap?startapp=${encodeURIComponent(clickid)}`;

    try {
      // Log the click to database
      await logClick({
        clickid,
        originalUrl: `https://tap-tma-test.vercel.app/api/click?${searchParams.toString()}`,
        queryParams,
        userAgent,
        ipAddress,
        redirectUrl
      });
    } catch (error) {
      console.error('Failed to log click:', error);
      // Continue with redirect even if logging fails
    }

    // Redirect to Telegram bot
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error in click handler:', error);
    return NextResponse.redirect(new URL('/', req.url));
  }
}

async function logClick(data: {
  clickid: string;
  originalUrl: string;
  queryParams: Record<string, string | string[] | undefined>;
  userAgent: string;
  ipAddress: string;
  redirectUrl: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/v1/ad/click-log`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to log click: ${response.status}`);
  }
}
