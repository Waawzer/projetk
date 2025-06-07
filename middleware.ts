import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function middleware(request: NextRequest) {
  // Logs uniquement en développement
  if (process.env.NODE_ENV === "development") {
    console.log(
      "Middleware: Vérification de la route:",
      request.nextUrl.pathname
    );
  }

  // Vérifier si la requête est pour une route admin
  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    // Exclure la route d'authentification
    if (request.nextUrl.pathname === "/api/admin/auth") {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "Middleware: Route d'authentification, pas de vérification de token"
        );
      }
      return NextResponse.next();
    }

    if (process.env.NODE_ENV === "development") {
      console.log("Middleware: Route admin protégée, vérification du token");
    }

    // Récupérer le token depuis le header Authorization
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token d'authentification manquant" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // Validation basique du format du token
    if (!token || token.length < 10) {
      return NextResponse.json(
        { error: "Format de token invalide" },
        { status: 401 }
      );
    }

    try {
      // Vérifier et décoder le token
      if (!JWT_SECRET) {
        throw new Error("JWT_SECRET non configuré");
      }

      const decoded = jwt.verify(token, JWT_SECRET, {
        algorithms: ["HS256"], // Spécifier l'algorithme pour plus de sécurité
      });

      // Vérifier que le token contient les informations requises
      if (
        typeof decoded === "object" &&
        decoded &&
        "role" in decoded &&
        decoded.role !== "admin"
      ) {
        return NextResponse.json(
          { error: "Accès non autorisé" },
          { status: 403 }
        );
      }

      // Ajouter les informations de l'utilisateur à la requête
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user", JSON.stringify(decoded));

      if (process.env.NODE_ENV === "development") {
        console.log(
          "Middleware: Requête autorisée pour la route:",
          request.nextUrl.pathname
        );
      }

      // Continuer avec la requête modifiée
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Middleware: Erreur de vérification du token:", error);
      }
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/admin/:path*",
};
