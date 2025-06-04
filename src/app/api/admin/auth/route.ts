import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Secret JWT depuis les variables d'environnement
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET doit être défini dans les variables d'environnement"
  );
}

// Identifiants admin depuis les variables d'environnement
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
  throw new Error(
    "ADMIN_USERNAME et ADMIN_PASSWORD doivent être définis dans les variables d'environnement"
  );
}

export async function POST(request: NextRequest) {
  try {
    console.log("API Auth: Tentative d'authentification...");

    const body = await request.json();
    const { username, password } = body;

    console.log("API Auth: Vérification des identifiants pour:", username);

    // Vérifier les identifiants avec les variables d'environnement
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      console.log(
        "API Auth: Échec d'authentification - identifiants incorrects"
      );
      return NextResponse.json(
        { error: "Identifiants incorrects" },
        { status: 401 }
      );
    }

    // Générer un token JWT
    console.log("API Auth: Identifiants valides, génération du token JWT");
    const token = jwt.sign(
      {
        username,
        role: "admin",
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Retourner le token
    console.log("API Auth: Token généré avec succès");
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Erreur d'authentification:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'authentification" },
      { status: 500 }
    );
  }
}
