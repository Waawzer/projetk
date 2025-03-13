import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Contact from '@/models/Contact';

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
    
    // Create new contact message
    const contact = await Contact.create(body);
    
    // In a real application, you would send an email notification
    // to the admin and/or an auto-reply to the user
    
    return NextResponse.json(
      { success: true, message: 'Message envoyé avec succès', id: contact._id },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating contact message:', error);
    
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