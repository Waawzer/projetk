import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Contact from '@/models/Contact';
import { sendContactNotification } from '@/lib/email';

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
    
    // Envoyer les emails de notification
    try {
      const emailResult = await sendContactNotification(body);
      console.log('Résultat envoi email:', emailResult);
    } catch (emailError) {
      console.error('Erreur détaillée lors de l\'envoi des emails:', emailError);
      // On renvoie l'erreur mais on continue
      return NextResponse.json(
        { 
          success: true, 
          message: 'Message enregistré mais erreur lors de l\'envoi des emails', 
          id: contact._id,
          emailError: emailError instanceof Error ? emailError.message : 'Erreur inconnue'
        },
        { status: 201 }
      );
    }
    
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