import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PricingPlan from '@/models/PricingPlan';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const popular = searchParams.get('popular');
    const id = searchParams.get('id');

    // Si un ID est fourni, récupérer un tarif spécifique
    if (id) {
      const pricingPlan = await PricingPlan.findById(id);
      
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
    let query: any = {};

    if (popular !== null) {
      query.popular = popular === 'true';
    }

    // Exécuter la requête
    const pricingPlans = await PricingPlan.find(query).sort({ order: 1 });

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
      await PricingPlan.updateMany({ popular: true }, { popular: false });
    }
    
    // Déterminer l'ordre si non spécifié
    if (!data.order) {
      const lastPlan = await PricingPlan.findOne().sort({ order: -1 });
      data.order = lastPlan ? lastPlan.order + 1 : 1;
    }
    
    const newPlan = new PricingPlan(data);
    await newPlan.save();

    return NextResponse.json(newPlan, { status: 201 });
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
      await PricingPlan.updateMany({ _id: { $ne: id }, popular: true }, { popular: false });
    }

    const updatedPlan = await PricingPlan.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

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

    const deletedPlan = await PricingPlan.findByIdAndDelete(id);

    if (!deletedPlan) {
      return NextResponse.json(
        { error: 'Forfait non trouvé' },
        { status: 404 }
      );
    }

    // Réorganiser les ordres des forfaits restants
    const remainingPlans = await PricingPlan.find().sort({ order: 1 });
    for (let i = 0; i < remainingPlans.length; i++) {
      await PricingPlan.findByIdAndUpdate(remainingPlans[i]._id, { order: i + 1 });
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

    const plan = await PricingPlan.findById(id);
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
      await PricingPlan.updateMany(
        { order: { $gt: oldOrder, $lte: newOrder } },
        { $inc: { order: -1 } }
      );
    } else if (newOrder < oldOrder) {
      // Déplacer vers le haut
      await PricingPlan.updateMany(
        { order: { $gte: newOrder, $lt: oldOrder } },
        { $inc: { order: 1 } }
      );
    }

    // Mettre à jour l'ordre du forfait
    plan.order = newOrder;
    await plan.save();

    // Récupérer tous les forfaits mis à jour
    const updatedPlans = await PricingPlan.find().sort({ order: 1 });

    return NextResponse.json(updatedPlans);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'ordre des forfaits:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'ordre des forfaits' },
      { status: 500 }
    );
  }
} 