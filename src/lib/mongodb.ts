import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Veuillez définir la variable d\'environnement MONGODB_URI dans le fichier .env.local'
  );
}

/**
 * Variables globales utilisées pour mettre en cache la connexion à MongoDB.
 */
declare global {
  var mongooseConnection: {
    isConnected?: number;
  };
}

/**
 * Fonction pour se connecter à MongoDB
 */
export async function connectToDatabase() {
  if (global.mongooseConnection && global.mongooseConnection.isConnected) {
    console.log('Utilisation de la connexion existante');
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI!);
    
    global.mongooseConnection = {
      isConnected: db.connections[0].readyState,
    };
    
    console.log('Nouvelle connexion à MongoDB établie');
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error);
    throw error;
  }
}

/**
 * Fonction pour déconnecter de MongoDB
 */
export async function disconnectFromDatabase() {
  if (!global.mongooseConnection || !global.mongooseConnection.isConnected) {
    return;
  }
  
  try {
    await mongoose.disconnect();
    global.mongooseConnection.isConnected = 0;
    console.log('Déconnexion de MongoDB réussie');
  } catch (error) {
    console.error('Erreur lors de la déconnexion de MongoDB:', error);
  }
}

// Export par défaut pour la compatibilité avec les imports existants
const dbConnect = connectToDatabase;
export default dbConnect; 