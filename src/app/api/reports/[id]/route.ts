import { NextRequest, NextResponse } from 'next/server';
import { fetchReportById, fetchAIAnalysisByReportId } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    const report = await fetchReportById(id, userId);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const aiAnalysis = await fetchAIAnalysisByReportId(id);

    return NextResponse.json({
      report,
      analysis: aiAnalysis
    });
  } catch (error: any) {
    console.error('Error fetching report details:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch report details' }, { status: 500 });
  }
}
