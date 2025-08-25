import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeUpdater } from '@/lib/ai/knowledge-update/KnowledgeUpdater';

export async function POST(request: NextRequest) {
  try {
    // Admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.includes('admin-key')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, topics, userId } = body;

    const updater = new KnowledgeUpdater();

    if (action === 'weekly-update') {
      // Phase 10.2.2: Perform weekly automated update
      const result = await updater.performWeeklyUpdate();
      
      return NextResponse.json({
        success: true,
        newKnowledge: result.newKnowledge.length,
        conflicts: result.conflicts.length,
        applied: result.applied,
        summary: result.newKnowledge.slice(0, 3).map(k => ({
          topic: k.topic,
          source: k.source,
          credibility: k.credibility
        }))
      });
    }

    if (action === 'search-topics' && topics) {
      // Phase 10.2.1: Search specific topics
      const updates = await updater.searchLatestResearch(topics);
      
      return NextResponse.json({
        success: true,
        updates: updates,
        count: updates.length
      });
    }

    if (action === 'filter-user' && userId) {
      // Phase 10.2.6: Filter by user preferences
      const allUpdates = await updater.searchLatestResearch([
        'protein synthesis',
        'cardio training',
        'recovery methods'
      ]);
      
      const filtered = await updater.filterByUserPreferences(allUpdates, userId);
      
      return NextResponse.json({
        success: true,
        total: allUpdates.length,
        filtered: filtered.length,
        updates: filtered
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Knowledge update error:', error);
    return NextResponse.json(
      { error: error.message || 'Knowledge update failed' },
      { status: 500 }
    );
  }
}