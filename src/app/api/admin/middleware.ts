import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function middleware(request: NextRequest) {
  // Vérifier si la requête est pour une route admin
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    // Exclure la route d'authentification
    if (request.nextUrl.pathname === '/api/admin/auth') {
      return NextResponse.next();
    }

    // Récupérer le token depuis le header Authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification manquant' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      // Vérifier et décoder le token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Ajouter les informations de l'utilisateur à la requête
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user', JSON.stringify(decoded));

      // Continuer avec la requête modifiée
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/admin/:path*',
}; 