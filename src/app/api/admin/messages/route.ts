import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ContactModel from '@/models/Contact';
import { FilterQuery } from 'mongoose';
import { IContactDocument } from '@/models/Contact';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const read = searchParams.get('read');
    const service = searchParams.get('service') || '';

    // Construire la requête
    let query: FilterQuery<IContactDocument> = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    if (read !== null) {
      query.read = read === 'true';
    }

    if (service) {
      query.service = { $regex: `^${service}$`, $options: 'i' };
    }

    // Exécuter la requête
    const messages = await ContactModel.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const data = await request.json();
    const newMessage = await ContactModel.create({
      ...data,
      read: false,
    });

    return NextResponse.json(newMessage.toJSON(), { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du message:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du message' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const data = await request.json();
    const { id } = data;

    const updatedMessage = await ContactModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedMessage) {
      return NextResponse.json(
        { error: 'Message non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du message:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du message' },
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
        { error: 'ID de message manquant' },
        { status: 400 }
      );
    }

    const deletedMessage = await ContactModel.findByIdAndDelete(id).lean();

    if (!deletedMessage) {
      return NextResponse.json(
        { error: 'Message non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du message' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    
    const data = await request.json();
    const { id, read } = data;

    const updatedMessage = await ContactModel.findByIdAndUpdate(
      id,
      { read },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedMessage) {
      return NextResponse.json(
        { error: 'Message non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de lecture du message:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du statut de lecture du message' },
      { status: 500 }
    );
  }
} 