import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PricingPlan from '@/models/PricingPlan';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const popular = searchParams.get('popular');
    
    // Build query
    const query: Record<string, boolean> = {};
    if (popular === 'true') {
      query.popular = true;
    }
    
    // Get pricing plans
    const pricingPlans = await PricingPlan.find(query)
      .sort({ order: 1 });
    
    // Convertir les documents Mongoose en objets simples
    const formattedPlans = pricingPlans.map(plan => plan.toObject());
    
    return NextResponse.json(formattedPlans);
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 