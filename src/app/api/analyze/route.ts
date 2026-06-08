import { NextRequest, NextResponse } from 'next/server';
import { analyzeIncidentImage } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image_url, category } = body;

    if (!image_url) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    const categoryHint = category || 'General';
    const analysis = await analyzeIncidentImage(image_url, categoryHint);

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Error in analyze API:', error);
    return NextResponse.json({ error: error.message || 'Image analysis failed' }, { status: 500 });
  }
}
