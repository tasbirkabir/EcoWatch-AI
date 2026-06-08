import { NextRequest, NextResponse } from 'next/server';
import { fetchReports, insertReport, insertAIAnalysis } from '@/lib/db';
import { analyzeIncidentImage } from '@/lib/gemini';
import { IncidentCategory, IncidentSeverity } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const reports = await fetchReports({ category, severity, status, search });
    return NextResponse.json(reports);
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, latitude, longitude, location_name, image_url, user_id } = body;

    if (!title || !description || !category || !latitude || !longitude || !location_name || !image_url) {
      return NextResponse.json({ error: 'Missing required report fields' }, { status: 400 });
    }

    // 1. Insert report into database (initializes with Pending status and base risk score)
    const report = await insertReport({
      title,
      description,
      category: category as IncidentCategory,
      latitude: Number(latitude),
      longitude: Number(longitude),
      location_name,
      image_url,
      severity: 'Medium', // Default, will be updated by Gemini
      user_id: user_id || null,
    });

    // 2. Trigger Gemini AI analysis in background or synchronously for immediate UI feedback
    let analysisResult;
    try {
      analysisResult = await analyzeIncidentImage(image_url, category);
    } catch (aiError) {
      console.error('Gemini Image Analysis failed:', aiError);
      // Fail-safe default
      analysisResult = {
        detected_issue: `${category} Incident`,
        confidence: 75,
        severity: 'Medium' as IncidentSeverity,
        environmental_impact: 'Ecosystem analysis could not be calculated. Visual validation pending.'
      };
    }

    // 3. Insert AI Analysis into the database linked to the report
    const savedAnalysis = await insertAIAnalysis({
      report_id: report.id,
      detected_issue: analysisResult.detected_issue,
      confidence: analysisResult.confidence,
      severity: analysisResult.severity,
      environmental_impact: analysisResult.environmental_impact,
      raw_response: analysisResult,
    });

    // 4. Update the report's severity and risk score in db based on AI results
    // For local mock, this happens inline in db.ts since it references mockDb and updates it.
    // For Supabase, let's run an update
    const { supabase, isSupabaseConfigured } = await import('@/lib/db');
    if (isSupabaseConfigured() && supabase) {
      const { calculateRiskScore } = await import('@/lib/risk');
      const { score } = calculateRiskScore(analysisResult.severity, { confirm: 0, dispute: 0 }, category);
      await supabase
        .from('reports')
        .update({
          severity: analysisResult.severity,
          risk_score: score
        })
        .eq('id', report.id);
    } else {
      // Inline mock update
      const globalForMock = globalThis as any;
      if (globalForMock.mockDb) {
        const idx = globalForMock.mockDb.reports.findIndex((r: any) => r.id === report.id);
        if (idx >= 0) {
          globalForMock.mockDb.reports[idx].severity = analysisResult.severity;
          // Recalculate risk score in mock
          const { calculateRiskScore } = await import('@/lib/risk');
          globalForMock.mockDb.reports[idx].risk_score = calculateRiskScore(
            analysisResult.severity,
            { confirm: 0, dispute: 0 },
            category
          ).score;
        }
      }
    }

    // Retrieve fresh report data with correct severity
    const { fetchReportById } = await import('@/lib/db');
    const updatedReport = await fetchReportById(report.id);

    return NextResponse.json({
      report: updatedReport || report,
      analysis: savedAnalysis
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit report' }, { status: 500 });
  }
}
