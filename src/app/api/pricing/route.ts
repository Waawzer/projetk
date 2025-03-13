import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Pricing from '@/models/Pricing';

export async function GET() {
  try {
    await dbConnect();
    
    // Get pricing plans sorted by order
    const pricingPlans = await Pricing.find()
      .sort({ order: 1 });
    
    return NextResponse.json(pricingPlans);
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 