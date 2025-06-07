import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createHash, timingSafeEqual } from "crypto";

// Secret JWT depuis les variables d'environnement
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET doit être défini dans les variables d'environnement"
  );
}

// Identifiants admin depuis les variables d'environnement
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH) {
  throw new Error(
    "ADMIN_USERNAME et ADMIN_PASSWORD_HASH doivent être définis dans les variables d'environnement"
  );
}

// Fonction pour hasher un mot de passe
function hashPassword(password: string): string {
  return createHash("sha256")
    .update(password + JWT_SECRET)
    .digest("hex");
}

// Fonction pour vérifier un mot de passe de manière sécurisée
function verifyPassword(
  inputPassword: string,
  hashedPassword: string
): boolean {
  const inputHash = hashPassword(inputPassword);
  const inputBuffer = Buffer.from(inputHash, "hex");
  const storedBuffer = Buffer.from(hashedPassword, "hex");

  // Utiliser timingSafeEqual pour éviter les attaques par timing
  if (inputBuffer.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(inputBuffer, storedBuffer);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validation des entrées
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username et password requis" },
        { status: 400 }
      );
    }

    // Vérifier les identifiants avec les variables d'environnement
    if (
      username !== ADMIN_USERNAME ||
      !verifyPassword(password, ADMIN_PASSWORD_HASH)
    ) {
      // Attendre un délai pour éviter les attaques par force brute
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return NextResponse.json(
        { error: "Identifiants incorrects" },
        { status: 401 }
      );
    }

    // Générer un token JWT avec durée de vie réduite
    const token = jwt.sign(
      {
        username,
        role: "admin",
        iat: Math.floor(Date.now() / 1000),
      },
      JWT_SECRET,
      {
        expiresIn: "2h", // Réduit de 24h à 2h pour plus de sécurité
        algorithm: "HS256",
      }
    );

    // Retourner le token
    return NextResponse.json({
      token,
      expiresIn: 7200, // 2 heures en secondes
    });
  } catch (error) {
    // Log seulement en développement
    if (process.env.NODE_ENV === "development") {
      console.error("Erreur d'authentification:", error);
    }
    return NextResponse.json(
      { error: "Erreur lors de l'authentification" },
      { status: 500 }
    );
  }
}
