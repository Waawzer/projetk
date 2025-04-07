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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const category = searchParams.get("category");

    const db = await getMongoDb();

    if (id) {
      // Récupérer un cours spécifique par ID
      const course = await db.collection("courses").findOne({
        _id: new ObjectId(id),
      });

      if (!course) {
        return NextResponse.json(
          { error: "Cours non trouvé" },
          { status: 404 }
        );
      }

      return NextResponse.json(course);
    } else if (category) {
      // Récupérer tous les cours d'une catégorie spécifique
      const courses = await db
        .collection("courses")
        .find({ category, isActive: true })
        .sort({ title: 1 })
        .toArray();
      return NextResponse.json(courses);
    } else {
      // Récupérer tous les cours actifs
      const courses = await db
        .collection("courses")
        .find({ isActive: true })
        .sort({ title: 1 })
        .toArray();
      return NextResponse.json(courses);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Erreur lors de la récupération des cours:", errorMessage);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des cours" },
      { status: 500 }
    );
  }
}
