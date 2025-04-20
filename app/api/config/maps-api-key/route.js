import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Read the API key from environment variables
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key is not configured' },
        { status: 500 }
      );
    }
    
    // Return the API key to the client
    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error('Error fetching Google Maps API key:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve Google Maps API key' },
      { status: 500 }
    );
  }
} 