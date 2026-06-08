import { NextRequest, NextResponse } from 'next/server';
import { fetchIncidentById, updateIncidentStatus, fetchAIAnalysisByIncidentId } from '@/lib/db';
import { IncidentStatus } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    const incident = await fetchIncidentById(id, userId);
    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    const aiAnalysis = await fetchAIAnalysisByIncidentId(id);

    return NextResponse.json({
      incident,
      analysis: aiAnalysis
    });
  } catch (error: any) {
    console.error('Error fetching incident details:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch incident details' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, assignedOrgId } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const updated = await updateIncidentStatus(id, status as IncidentStatus, assignedOrgId);
    
    // Fetch full detail after update
    const incident = await fetchIncidentById(id);

    return NextResponse.json(incident || updated);
  } catch (error: any) {
    console.error('Error updating incident:', error);
    return NextResponse.json({ error: error.message || 'Failed to update incident' }, { status: 500 });
  }
}
