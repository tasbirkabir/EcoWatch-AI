import { NextRequest, NextResponse } from 'next/server';
import { fetchReportUpdates, insertReportUpdate, fetchReportById } from '@/lib/db';
import { compareBeforeAfterImages } from '@/lib/gemini';
import { RecoveryStatus } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await fetchReportUpdates(id);
    return NextResponse.json(updates);
  } catch (error: any) {
    console.error('Error fetching report updates:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch updates' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, image_url, description } = body;

    if (!image_url || !description) {
      return NextResponse.json({ error: 'Missing required update fields' }, { status: 400 });
    }

    // 1. Fetch the original report to get the "before" image
    const report = await fetchReportById(id);
    if (!report) {
      return NextResponse.json({ error: 'Original report not found' }, { status: 404 });
    }

    // 2. Call Gemini comparison service (Image 1 = before, Image 2 = after)
    let comparisonResult;
    try {
      comparisonResult = await compareBeforeAfterImages(report.image_url, image_url);
    } catch (aiError) {
      console.error('Gemini image comparison failed:', aiError);
      // Fallback default
      comparisonResult = {
        improvement_pct: 50,
        pollution_reduced: 50,
        recovery_status: 'Improving' as RecoveryStatus,
        description: 'Cleanup progress submitted. Visual monitoring active.'
      };
    }

    // 3. Save the recovery update
    const savedUpdate = await insertReportUpdate({
      report_id: id,
      user_id: userId || null,
      image_url,
      description,
      improvement_pct: comparisonResult.improvement_pct,
      pollution_reduced: comparisonResult.pollution_reduced,
      recovery_status: comparisonResult.recovery_status,
    });

    return NextResponse.json(savedUpdate, { status: 201 });
  } catch (error: any) {
    console.error('Error creating report update:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit update' }, { status: 500 });
  }
}
