import { NextRequest, NextResponse } from 'next/server';
import { fetchIncidents, insertIncident, insertAIAnalysis } from '@/lib/db';
import { analyzeIncidentImage } from '@/lib/gemini';
import { IncidentCategory, IncidentSeverity } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const assignedOrgId = searchParams.get('assignedOrgId') || undefined;

    const incidents = await fetchIncidents({ category, severity, status, search, assignedOrgId });
    return NextResponse.json(incidents);
  } catch (error: any) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch incidents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, latitude, longitude, location_name, image_url, user_id, additional_notes } = body;

    if (!title || !description || !category || !latitude || !longitude || !location_name || !image_url) {
      return NextResponse.json({ error: 'Missing required incident fields' }, { status: 400 });
    }

    // 1. Insert incident (initializes with Pending status)
    const incident = await insertIncident({
      title,
      description,
      category: category as IncidentCategory,
      latitude: Number(latitude),
      longitude: Number(longitude),
      location_name,
      image_url,
      severity: 'Moderate', // Default, will update via Gemini
      user_id: user_id || null,
      additional_notes: additional_notes || null
    });

    // 2. Trigger Gemini Vision Image Diagnostics
    let analysisResult;
    try {
      analysisResult = await analyzeIncidentImage(image_url, category);
    } catch (aiError) {
      console.error('Gemini Diagnostics failed:', aiError);
      analysisResult = {
        detected_issue: `${category} Incident`,
        confidence: 75,
        severity: 'Moderate' as IncidentSeverity,
        environmental_impact: 'Ecosystem diagnostics could not be dynamically verified. Visual validation pending.',
        recommended_action: 'Cordon off site and request physical inspection by local wardens.'
      };
    }

    // 3. Save AI analysis results
    const savedAnalysis = await insertAIAnalysis({
      incident_id: incident.id,
      detected_issue: analysisResult.detected_issue,
      confidence: analysisResult.confidence,
      severity: analysisResult.severity,
      environmental_impact: analysisResult.environmental_impact,
      recommended_action: analysisResult.recommended_action,
      raw_response: analysisResult
    });

    // 4. Update severity and risk scores in database
    const { supabase, isSupabaseConfigured } = await import('@/lib/db');
    if (isSupabaseConfigured() && supabase) {
      const { calculateRiskScore } = await import('@/lib/risk');
      const scoreData = calculateRiskScore(analysisResult.severity, { confirm: 0, dispute: 0 }, category, 5, 5, 2);
      
      // Update incident composite
      await supabase.from('incidents').update({
        severity: analysisResult.severity,
        risk_score: scoreData.score
      }).eq('id', incident.id);

      // Update risk scores parameters breakdown
      await supabase.from('risk_scores').update({
        base_severity: analysisResult.severity === 'Critical' ? 10 : analysisResult.severity === 'High' ? 8 : analysisResult.severity === 'Moderate' ? 5 : 2,
        composite_score: scoreData.score
      }).eq('incident_id', incident.id);
    } else {
      // Mock update
      const globalForMock = globalThis as any;
      if (globalForMock.mockDb) {
        const idx = globalForMock.mockDb.incidents.findIndex((r: any) => r.id === incident.id);
        if (idx >= 0) {
          globalForMock.mockDb.incidents[idx].severity = analysisResult.severity;
          
          const { calculateRiskScore } = await import('@/lib/risk');
          const scoreData = calculateRiskScore(analysisResult.severity, { confirm: 0, dispute: 0 }, category, 5, 5, 2);
          globalForMock.mockDb.incidents[idx].risk_score = scoreData.score;
          
          const rbIdx = globalForMock.mockDb.riskScores.findIndex((r: any) => r.incident_id === incident.id);
          if (rbIdx >= 0) {
            globalForMock.mockDb.riskScores[rbIdx].base_severity = analysisResult.severity === 'Critical' ? 10 : analysisResult.severity === 'High' ? 8 : analysisResult.severity === 'Moderate' ? 5 : 2;
            globalForMock.mockDb.riskScores[rbIdx].composite_score = scoreData.score;
          }
        }
      }
    }

    const { fetchIncidentById } = await import('@/lib/db');
    const updated = await fetchIncidentById(incident.id);

    return NextResponse.json({
      incident: updated || incident,
      analysis: savedAnalysis
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error submitting incident:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit incident' }, { status: 500 });
  }
}
