import { NextRequest, NextResponse } from 'next/server';
import databaseService from '@/lib/database';

export async function GET() {
  try {
    const entries = await databaseService.getAllEntries();
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Convert date string back to Date object
    const entryData = {
      ...body,
      date: new Date(body.date),
      clusterPeriod: body.clusterPeriod ? {
        ...body.clusterPeriod,
        periodStart: body.clusterPeriod.periodStart ? new Date(body.clusterPeriod.periodStart) : undefined,
        expectedEnd: body.clusterPeriod.expectedEnd ? new Date(body.clusterPeriod.expectedEnd) : undefined
      } : undefined
    };

    const newEntry = await databaseService.createEntry(entryData);
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating entry:', error);
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    );
  }
}
