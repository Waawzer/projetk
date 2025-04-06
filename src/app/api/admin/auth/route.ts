import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Dans une application réelle, vous utiliseriez un secret stocké dans les variables d'environnement
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-for-development-only";

// Dans une application réelle, vous stockeriez ces informations dans une base de données
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "password",
};

export async function POST(request: NextRequest) {
  try {
    console.log("API Auth: Tentative d'authentification...");
    const body = await request.json();
    const { username, password } = body;

    console.log("API Auth: Vérification des identifiants pour:", username);

    // Vérifier les identifiants
    if (
      username !== ADMIN_CREDENTIALS.username ||
      password !== ADMIN_CREDENTIALS.password
    ) {
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
