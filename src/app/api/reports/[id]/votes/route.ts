import { NextRequest, NextResponse } from 'next/server';
import { castVote } from '@/lib/db';
import { VoteType } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, voteType } = body;

    if (!userId || !voteType || !['confirm', 'dispute'].includes(voteType)) {
      return NextResponse.json({ error: 'Missing or invalid vote fields' }, { status: 400 });
    }

    const updatedReport = await castVote(id, userId, voteType as VoteType);
    return NextResponse.json(updatedReport);
  } catch (error: any) {
    console.error('Error casting vote:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit validation' }, { status: 500 });
  }
}
