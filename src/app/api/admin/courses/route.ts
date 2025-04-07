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

interface CourseData {
  id?: string;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  level: "débutant" | "intermédiaire" | "avancé" | "tous niveaux";
  pricePerHour: number;
  imageUrl: string;
  instructor: string;
  benefits: string[];
  contenus: string[];
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

// GET: Récupérer tous les cours ou un cours spécifique par ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

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
    } else {
      // Récupérer tous les cours
      const courses = await db
        .collection("courses")
        .find({})
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

// POST: Créer un nouveau cours
export async function POST(request: Request) {
  try {
    const data: CourseData = await request.json();

    // Validation
    if (
      !data.title ||
      !data.description ||
      !data.category ||
      !data.pricePerHour
    ) {
      return NextResponse.json(
        { error: "Données de cours incomplètes" },
        { status: 400 }
      );
    }

    const db = await getMongoDb();

    await db.collection("courses").insertOne({
      title: data.title,
      description: data.description,
      longDescription: data.longDescription || "",
      category: data.category,
      level: data.level || "tous niveaux",
      pricePerHour: data.pricePerHour,
      imageUrl: data.imageUrl || "",
      instructor: data.instructor || "",
      benefits: data.benefits || [],
      contenus: data.contenus || [],
      isActive: data.isActive !== undefined ? data.isActive : true,
      format: data.format || "présentiel",
      nbSessions: data.nbSessions || 1,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Erreur lors de la création du cours:", errorMessage);
    return NextResponse.json(
      { error: "Erreur lors de la création du cours" },
      { status: 500 }
    );
  }
}

// PUT: Mettre à jour un cours existant
export async function PUT(request: Request) {
  try {
    const data: CourseData = await request.json();

    if (!data.id) {
      return NextResponse.json(
        { error: "ID de cours manquant" },
        { status: 400 }
      );
    }

    const db = await getMongoDb();

    // Convertir l'ID en ObjectId pour MongoDB
    const courseId = new ObjectId(data.id);

    // Préparer les données pour la mise à jour
    const updateData = {
      title: data.title,
      description: data.description,
      longDescription: data.longDescription || "",
      category: data.category,
      level: data.level || "tous niveaux",
      pricePerHour: data.pricePerHour,
      imageUrl: data.imageUrl || "",
      instructor: data.instructor || "",
      benefits: data.benefits || [],
      contenus: data.contenus || [],
      isActive: data.isActive !== undefined ? data.isActive : true,
      format: data.format || "présentiel",
      nbSessions: data.nbSessions || 1,
    };

    const result = await db
      .collection("courses")
      .updateOne({ _id: courseId }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Cours non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Erreur lors de la mise à jour du cours:", errorMessage);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du cours" },
      { status: 500 }
    );
  }
}

// DELETE: Supprimer un cours
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de cours manquant" },
        { status: 400 }
      );
    }

    const db = await getMongoDb();

    const result = await db.collection("courses").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Cours non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Erreur lors de la suppression du cours:", errorMessage);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du cours" },
      { status: 500 }
    );
  }
}
