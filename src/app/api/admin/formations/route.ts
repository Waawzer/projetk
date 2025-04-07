import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

// Vérifier si la chaîne de connexion MongoDB est définie
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error(
    "Veuillez définir la variable d'environnement MONGODB_URI dans le fichier .env.local"
  );
}

interface FormationData {
  id?: string;
  title: string;
  description: string;
  longDescription: string;
  duration: number;
  price: number;
  maxParticipants: number;
  imageUrl: string;
  objectives: string[];
  prerequisites: string[];
  syllabus: { title: string; description: string }[];
  isActive: boolean;
  format: "présentiel" | "distanciel" | "hybride";
  nbSessions: number;
}

// Connexion directe à MongoDB pour cette API
async function getMongoDb() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(MONGODB_URI);
  }
  return mongoose.connection.db;
}

// GET: Récupérer toutes les formations ou une formation spécifique par ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const db = await getMongoDb();

    if (id) {
      // Récupérer une formation spécifique par ID
      const formation = await db.collection("formations").findOne({
        _id: new ObjectId(id),
      });

      if (!formation) {
        return NextResponse.json(
          { error: "Formation non trouvée" },
          { status: 404 }
        );
      }

      return NextResponse.json(formation);
    } else {
      // Récupérer toutes les formations
      const formations = await db
        .collection("formations")
        .find({})
        .sort({ title: 1 })
        .toArray();
      return NextResponse.json(formations);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      "Erreur lors de la récupération des formations:",
      errorMessage
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération des formations" },
      { status: 500 }
    );
  }
}

// POST: Créer une nouvelle formation
export async function POST(request: Request) {
  try {
    const data: FormationData = await request.json();

    // Validation
    if (!data.title || !data.description || !data.duration || !data.price) {
      return NextResponse.json(
        { error: "Données de formation incomplètes" },
        { status: 400 }
      );
    }

    const db = await getMongoDb();

    await db.collection("formations").insertOne({
      title: data.title,
      description: data.description,
      longDescription: data.longDescription || "",
      duration: data.duration,
      price: data.price,
      maxParticipants: data.maxParticipants,
      imageUrl: data.imageUrl || "",
      objectives: data.objectives || [],
      prerequisites: data.prerequisites || [],
      syllabus: data.syllabus || [],
      isActive: data.isActive !== undefined ? data.isActive : true,
      format: data.format || "présentiel",
      nbSessions: data.nbSessions || 1,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Erreur lors de la création de la formation:", errorMessage);
    return NextResponse.json(
      { error: "Erreur lors de la création de la formation" },
      { status: 500 }
    );
  }
}

// PUT: Mettre à jour une formation existante
export async function PUT(request: Request) {
  try {
    const data: FormationData = await request.json();

    if (!data.id) {
      return NextResponse.json(
        { error: "ID de formation manquant" },
        { status: 400 }
      );
    }

    const db = await getMongoDb();

    // Convertir l'ID en ObjectId pour MongoDB
    const formationId = new ObjectId(data.id);

    // Préparer les données pour la mise à jour
    const updateData = {
      title: data.title,
      description: data.description,
      longDescription: data.longDescription || "",
      duration: data.duration,
      price: data.price,
      maxParticipants: data.maxParticipants,
      imageUrl: data.imageUrl || "",
      objectives: data.objectives || [],
      prerequisites: data.prerequisites || [],
      syllabus: data.syllabus || [],
      isActive: data.isActive !== undefined ? data.isActive : true,
      format: data.format || "présentiel",
      nbSessions: data.nbSessions || 1,
    };

    const result = await db
      .collection("formations")
      .updateOne({ _id: formationId }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Formation non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      "Erreur lors de la mise à jour de la formation:",
      errorMessage
    );
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la formation" },
      { status: 500 }
    );
  }
}

// DELETE: Supprimer une formation
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de formation manquant" },
        { status: 400 }
      );
    }

    const db = await getMongoDb();

    const result = await db.collection("formations").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Formation non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      "Erreur lors de la suppression de la formation:",
      errorMessage
    );
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la formation" },
      { status: 500 }
    );
  }
}
