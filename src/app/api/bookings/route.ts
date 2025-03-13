import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

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
    
    // Calculate end time based on start time and duration
    const startTime = body.startTime;
    const duration = parseInt(body.duration);
    
    // Simple calculation for end time (doesn't handle day changes)
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const endHour = startHour + Math.floor(duration);
    const endMinute = startMinute;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    
    // Calculate total price and deposit amount
    const pricePerHour = getPricePerHour(body.service);
    const totalPrice = pricePerHour * duration;
    const depositAmount = totalPrice * 0.5;
    
    // Create booking data
    const bookingData = {
      ...body,
      endTime,
      totalPrice,
      depositAmount,
      depositPaid: false,
      status: 'pending'
    };
    
    // Create new booking
    const booking = await Booking.create(bookingData);
    
    // In a real application, you would:
    // 1. Process the payment
    // 2. Update the booking with payment information
    // 3. Add the booking to Google Calendar
    
    return NextResponse.json(booking, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating booking:', error);
    
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

// Helper function to get price per hour based on service
function getPricePerHour(service: string): number {
  switch (service) {
    case 'recording':
      return 60;
    case 'mixing':
      return 50;
    case 'mastering':
      return 40;
    case 'production':
      return 70;
    default:
      return 50;
  }
} 