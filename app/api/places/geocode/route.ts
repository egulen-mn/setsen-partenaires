/**
 * POST /api/places/geocode
 *
 * Resolves a Google Place ID to a formatted address and lat/lng
 * using the Geocoding API (cheaper than Place Details).
 * Requires a valid partenaires_session cookie (logged-in partner).
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

  let body: { placeId: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const placeId = (body.placeId ?? '').trim();
  if (!placeId) {
    return NextResponse.json({ error: 'placeId is required' }, { status: 400 });
  }

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?place_id=${encodeURIComponent(placeId)}&key=${apiKey}&language=fr`,
    { cache: 'no-store' },
  );

  if (!res.ok) {
    const text = await res.text();
    console.error('[places/geocode] Geocoding API error:', res.status, text);
    return NextResponse.json({ error: `Geocoding API ${res.status}` }, { status: 502 });
  }

  const data = await res.json();

  if (data.status !== 'OK' || !data.results?.length) {
    return NextResponse.json({ error: `Geocoding status: ${data.status}` }, { status: 404 });
  }

  const result = data.results[0];
  const location = result.geometry?.location;

  return NextResponse.json({
    formattedAddress: result.formatted_address ?? '',
    lat: location?.lat ?? null,
    lng: location?.lng ?? null,
    placeId,
  });
}
