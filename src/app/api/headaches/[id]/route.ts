import { NextRequest, NextResponse } from 'next/server';
import databaseService from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;
    
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

    const updatedEntry = await databaseService.updateEntry(id, entryData);
    
    if (!updatedEntry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error('Error updating entry:', error);
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const deleted = await databaseService.deleteEntry(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    );
  }
}
