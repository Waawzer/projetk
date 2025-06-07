/**
 * Script pour générer le hash du mot de passe admin
 * Usage: node scripts/generate-admin-hash.js [password]
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Charger les variables d'environnement depuis .env.local
function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const lines = envContent.split("\n");
    for (const line of lines) {
      if (line.trim() && !line.startsWith("#")) {
        const [key, ...valueParts] = line.split("=");
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join("=").trim();
        }
      }
    }
  }
}

// Charger les variables d'environnement
loadEnvLocal();

function generatePasswordHash(password, secret) {
  return crypto
    .createHash("sha256")
    .update(password + secret)
    .digest("hex");
}

// Récupérer le mot de passe depuis les arguments ou demander une saisie
const password = process.argv[2];
const jwtSecret = process.env.JWT_SECRET;

if (!password) {
  console.error("Usage: node scripts/generate-admin-hash.js [password]");
  console.error("Exemple: node scripts/generate-admin-hash.js monMotDePasse");
  process.exit(1);
}

if (!jwtSecret) {
  console.error(
    "Erreur: JWT_SECRET doit être défini dans les variables d'environnement"
  );
  console.error(
    "Ajoutez JWT_SECRET=votre_secret_jwt dans votre fichier .env.local"
  );
  process.exit(1);
}

const hash = generatePasswordHash(password, jwtSecret);

console.log("=".repeat(60));
console.log("HASH DU MOT DE PASSE ADMIN GÉNÉRÉ");
console.log("=".repeat(60));
console.log("");
console.log("Ajoutez cette ligne dans votre fichier .env.local :");
console.log("");
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log("");
console.log("⚠️  IMPORTANT: Supprimez ADMIN_PASSWORD de votre .env.local");
console.log("⚠️  et utilisez uniquement ADMIN_PASSWORD_HASH");
console.log("");
console.log("=".repeat(60));
