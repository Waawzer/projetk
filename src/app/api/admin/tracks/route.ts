import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Track from '@/models/Track';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const genre = searchParams.get('genre') || '';
    const featured = searchParams.get('featured');

    // Construire la requête
    let query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } },
      ];
    }

    if (genre) {
      query.genre = { $regex: `^${genre}$`, $options: 'i' };
    }

    if (featured !== null) {
      query.featured = featured === 'true';
    }

    // Exécuter la requête
    const tracks = await Track.find(query).sort({ createdAt: -1 });

    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Erreur lors de la récupération des musiques:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des musiques' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const data = await request.json();
    const newTrack = new Track(data);
    await newTrack.save();

    return NextResponse.json(newTrack, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la musique:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la musique' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const data = await request.json();
    const { id } = data;

    const updatedTrack = await Track.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedTrack) {
      return NextResponse.json(
        { error: 'Musique non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTrack);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la musique:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la musique' },
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
        { error: 'ID de musique manquant' },
        { status: 400 }
      );
    }

    const deletedTrack = await Track.findByIdAndDelete(id);

    if (!deletedTrack) {
      return NextResponse.json(
        { error: 'Musique non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la musique:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la musique' },
      { status: 500 }
    );
  }
} 