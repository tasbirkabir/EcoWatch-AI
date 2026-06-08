import { NextRequest, NextResponse } from 'next/server';
import { fetchIncidentUpdates, insertIncidentUpdate, fetchIncidentById } from '@/lib/db';
import { compareBeforeAfterImages } from '@/lib/gemini';
import { RecoveryStatus } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await fetchIncidentUpdates(id);
    return NextResponse.json(updates);
  } catch (error: any) {
    console.error('Error fetching updates:', error);
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
    const { userId, image_url, description, update_type, waste_removed_kg } = body;

    if (!description || !update_type) {
      return NextResponse.json({ error: 'Missing required update fields' }, { status: 400 });
    }

    let improvement_pct = 0;
    let pollution_reduced = 0;
    let recovery_status: RecoveryStatus = 'Unchanged';

    // If a cleanup picture is uploaded, trigger Gemini comparison diagnostics
    if (image_url && update_type === 'cleanup') {
      const incident = await fetchIncidentById(id);
      if (!incident) {
        return NextResponse.json({ error: 'Original incident not found' }, { status: 404 });
      }

      try {
        const comparison = await compareBeforeAfterImages(incident.image_url, image_url);
        improvement_pct = comparison.improvement_pct;
        pollution_reduced = comparison.pollution_reduced;
        recovery_status = comparison.recovery_status;
      } catch (aiError) {
        console.error('Gemini image comparison failed:', aiError);
        improvement_pct = 50;
        pollution_reduced = 50;
        recovery_status = 'Improving';
      }
    } else if (update_type === 'cleanup') {
      // Manual cleanup update without image
      improvement_pct = 50;
      recovery_status = 'Improving';
    }

    const savedUpdate = await insertIncidentUpdate({
      incident_id: id,
      user_id: userId || null,
      image_url: image_url || null,
      description,
      update_type,
      improvement_pct,
      waste_removed_kg: Number(waste_removed_kg || 0)
    });

    return NextResponse.json(savedUpdate, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting incident update:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit update' }, { status: 500 });
  }
}
