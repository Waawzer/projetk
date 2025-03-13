import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Dans une application réelle, vous utiliseriez un secret stocké dans les variables d'environnement
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development-only';

// Dans une application réelle, vous stockeriez ces informations dans une base de données
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'password'
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Vérifier les identifiants
    if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
      return NextResponse.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      );
    }

    // Générer un token JWT
    const token = jwt.sign(
      { 
        username,
        role: 'admin',
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Retourner le token
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'authentification' },
      { status: 500 }
    );
  }
} 