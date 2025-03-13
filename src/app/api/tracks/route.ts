import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Track from '@/models/Track';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 10;
    
    // Build query
    const query: any = {};
    if (featured === 'true') {
      query.featured = true;
    }
    
    // Get tracks
    const tracks = await Track.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

interface ValidationError extends Error {
  name: string;
  errors: {
    [key: string]: {
      message: string;
    };
  };
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    // Parse request body
    const body = await request.json();
    
    // Create new track
    const track = await Track.create(body);
    
    return NextResponse.json(track, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating track:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      const validationError = error as ValidationError;
      const validationErrors = Object.values(validationError.errors).map(err => err.message);
      return NextResponse.json(
        { error: 'Validation Error', messages: validationErrors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 