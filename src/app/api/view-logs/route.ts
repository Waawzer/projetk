import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Chemin vers le fichier de log
    const logDir = path.join(process.cwd(), "logs");
    const logFile = path.join(logDir, "stripe-email.log");

    // Vérifier si le fichier de log existe
    if (!fs.existsSync(logFile)) {
      return NextResponse.json(
        {
          success: false,
          message: "Le fichier de log n'existe pas encore.",
        },
        { status: 404 }
      );
    }

    // Lire le contenu du fichier
    const logContent = fs.readFileSync(logFile, "utf8");

    // Diviser par lignes et inverser l'ordre pour avoir les logs les plus récents en premier
    const logLines = logContent
      .split("\n")
      .filter((line) => line.trim() !== "")
      .reverse();

    return NextResponse.json({
      success: true,
      logs: logLines,
    });
  } catch (error) {
    console.error("Erreur lors de la lecture des logs:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la lecture des logs",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
