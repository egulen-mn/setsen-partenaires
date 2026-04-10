/**
 * POST /api/places/autocomplete
 *
 * Server-side proxy for Google Places Autocomplete (New).
 * Requires a valid partenaires_session cookie (logged-in partner).
 * API key stays server-side — never sent to the browser.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const session = request.cookies.get('partenaires_session');
  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
  }

  let body: { input: string; sessionToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const input = (body.input ?? '').trim();
  if (!input || input.length > 200) {
    return NextResponse.json({ predictions: [] });
  }

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://partenaires.setsen.fr';

  const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'Referer': siteUrl,
    },
    body: JSON.stringify({
      input,
      ...(body.sessionToken ? { sessionToken: body.sessionToken } : {}),
      includedPrimaryTypes: ['street_address', 'subpremise', 'premise', 'route', 'establishment'],
      languageCode: 'fr',
      regionCode: 'FR',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[places/autocomplete] Google API error:', res.status, text);
    return NextResponse.json({ predictions: [], error: `Google API ${res.status}` }, { status: 502 });
  }

  const data = await res.json();

  const suggestions = data.suggestions ?? [];
  const predictions = suggestions
    .filter((s: any) => s.placePrediction)
    .map((s: any) => {
      const p = s.placePrediction;
      return {
        placeId: p.placeId ?? p.place?.split('/').pop() ?? '',
        description: p.text?.text ?? p.structuredFormat?.mainText?.text ?? '',
        mainText: p.structuredFormat?.mainText?.text ?? '',
        secondaryText: p.structuredFormat?.secondaryText?.text ?? '',
      };
    });

  return NextResponse.json({ predictions });
}
