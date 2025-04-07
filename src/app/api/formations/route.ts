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

// Connexion directe à MongoDB pour cette API
async function getMongoDb() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(MONGODB_URI);
  }
  return mongoose.connection.db;
}

// GET: Récupérer toutes les formations actives ou une formation spécifique par ID
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
      // Récupérer toutes les formations actives
      const formations = await db
        .collection("formations")
        .find({ isActive: true })
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
