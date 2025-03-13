import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PricingPlanModel from '@/models/PricingPlan';
import { FilterQuery } from 'mongoose';
import { IPricingPlanDocument } from '@/models/PricingPlan';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const popular = searchParams.get('popular');
    const id = searchParams.get('id');

    // Si un ID est fourni, récupérer un tarif spécifique
    if (id) {
      const pricingPlan = await PricingPlanModel.findById(id).lean();
      
      if (!pricingPlan) {
        return NextResponse.json(
          { error: 'Forfait non trouvé' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(pricingPlan);
    }

    // Sinon, récupérer tous les tarifs
    // Construire la requête
    let query: FilterQuery<IPricingPlanDocument> = {};

    if (popular !== null) {
      query.popular = popular === 'true';
    }

    // Exécuter la requête
    const pricingPlans = await PricingPlanModel.find(query).sort({ order: 1 }).lean();

    return NextResponse.json(pricingPlans);
  } catch (error) {
    console.error('Erreur lors de la récupération des forfaits:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des forfaits' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const data = await request.json();
    
    // Si le forfait est marqué comme populaire, désactiver les autres forfaits populaires
    if (data.popular) {
      await PricingPlanModel.updateMany({ popular: true }, { popular: false });
    }
    
    // Déterminer l'ordre si non spécifié
    if (!data.order) {
      const lastPlan = await PricingPlanModel.findOne().sort({ order: -1 }).lean();
      data.order = lastPlan ? lastPlan.order + 1 : 1;
    }
    
    const newPlan = await PricingPlanModel.create(data);

    return NextResponse.json(newPlan.toJSON(), { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du forfait:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du forfait' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const data = await request.json();
    const { id } = data;
    
    // Si le forfait est marqué comme populaire, désactiver les autres forfaits populaires
    if (data.popular) {
      await PricingPlanModel.updateMany(
        { _id: { $ne: id }, popular: true } as FilterQuery<IPricingPlanDocument>,
        { popular: false }
      );
    }

    const updatedPlan = await PricingPlanModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedPlan) {
      return NextResponse.json(
        { error: 'Forfait non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du forfait:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du forfait' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de forfait manquant' },
        { status: 400 }
      );
    }

    const deletedPlan = await PricingPlanModel.findByIdAndDelete(id).lean();

    if (!deletedPlan) {
      return NextResponse.json(
        { error: 'Forfait non trouvé' },
        { status: 404 }
      );
    }

    // Réorganiser les ordres des forfaits restants
    const remainingPlans = await PricingPlanModel.find().sort({ order: 1 }).lean();
    for (let i = 0; i < remainingPlans.length; i++) {
      await PricingPlanModel.findByIdAndUpdate(remainingPlans[i]._id, { order: i + 1 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du forfait:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du forfait' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    
    const data = await request.json();
    const { id, order } = data;

    const plan = await PricingPlanModel.findById(id).lean();
    if (!plan) {
      return NextResponse.json(
        { error: 'Forfait non trouvé' },
        { status: 404 }
      );
    }

    const oldOrder = plan.order;
    const newOrder = order;

    // Mettre à jour les ordres des autres forfaits
    if (newOrder > oldOrder) {
      // Déplacer vers le bas
      await PricingPlanModel.updateMany(
        { order: { $gt: oldOrder, $lte: newOrder } } as FilterQuery<IPricingPlanDocument>,
        { $inc: { order: -1 } }
      );
    } else if (newOrder < oldOrder) {
      // Déplacer vers le haut
      await PricingPlanModel.updateMany(
        { order: { $gte: newOrder, $lt: oldOrder } } as FilterQuery<IPricingPlanDocument>,
        { $inc: { order: 1 } }
      );
    }

    // Mettre à jour l'ordre du forfait
    const updatedPlan = await PricingPlanModel.findByIdAndUpdate(
      id,
      { order: newOrder },
      { new: true, runValidators: true }
    ).lean();

    // Récupérer tous les forfaits mis à jour
    const updatedPlans = await PricingPlanModel.find().sort({ order: 1 }).lean();

    return NextResponse.json(updatedPlans);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'ordre des forfaits:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'ordre des forfaits' },
      { status: 500 }
    );
  }
} 