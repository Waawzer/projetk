import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function middleware(request: NextRequest) {
  console.log(
    "Middleware: Vérification de la route:",
    request.nextUrl.pathname
  );

  // Vérifier si la requête est pour une route admin
  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    // Exclure la route d'authentification
    if (request.nextUrl.pathname === "/api/admin/auth") {
      console.log(
        "Middleware: Route d'authentification, pas de vérification de token"
      );
      return NextResponse.next();
    }

    console.log("Middleware: Route admin protégée, vérification du token");

    // Récupérer le token depuis le header Authorization
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Middleware: Token manquant ou format invalide");
      return NextResponse.json(
        { error: "Token d'authentification manquant" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    console.log("Middleware: Token trouvé, tentative de vérification");

    try {
      // Vérifier et décoder le token
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log("Middleware: Token vérifié avec succès pour:", decoded);

      // Ajouter les informations de l'utilisateur à la requête
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user", JSON.stringify(decoded));

      console.log(
        "Middleware: Requête autorisée pour la route:",
        request.nextUrl.pathname
      );

      // Continuer avec la requête modifiée
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error("Middleware: Erreur de vérification du token:", error);
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
