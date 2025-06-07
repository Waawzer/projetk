/**
 * Système de logging unifié et sécurisé
 * Les logs sensibles ne sont affichés qu'en développement
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: string
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}] ` : "";
    return `[${timestamp}] ${level.toUpperCase()}: ${contextStr}${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    // En production, ne logger que les erreurs et warnings
    if (!this.isDevelopment) {
      return level === "error" || level === "warn";
    }
    return true;
  }

  private sanitizeData(data: any): any {
    if (!data) return data;

    // Supprimer les données sensibles des logs
    const sensitiveKeys = [
      "password",
      "token",
      "secret",
      "key",
      "authorization",
    ];

    if (typeof data === "object") {
      const sanitized = { ...data };
      for (const key of Object.keys(sanitized)) {
        if (
          sensitiveKeys.some((sensitive) =>
            key.toLowerCase().includes(sensitive)
          )
        ) {
          sanitized[key] = "[REDACTED]";
        }
      }
      return sanitized;
    }

    return data;
  }

  info(message: string, data?: any, context?: string): void {
    if (this.shouldLog("info")) {
      console.log(this.formatMessage("info", message, context));
      if (data && this.isDevelopment) {
        console.log("Data:", this.sanitizeData(data));
      }
    }
  }

  warn(message: string, data?: any, context?: string): void {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message, context));
      if (data) {
        console.warn("Data:", this.sanitizeData(data));
      }
    }
  }

  error(message: string, error?: any, context?: string): void {
    if (this.shouldLog("error")) {
      console.error(this.formatMessage("error", message, context));
      if (error) {
        if (error instanceof Error) {
          console.error("Error:", error.message);
          if (this.isDevelopment) {
            console.error("Stack:", error.stack);
          }
        } else {
          console.error("Error data:", this.sanitizeData(error));
        }
      }
    }
  }

  debug(message: string, data?: any, context?: string): void {
    if (this.shouldLog("debug")) {
      console.debug(this.formatMessage("debug", message, context));
      if (data && this.isDevelopment) {
        console.debug("Debug data:", this.sanitizeData(data));
      }
    }
  }

  // Méthodes spécialisées pour différents contextes
  auth(message: string, data?: any): void {
    this.info(message, data, "AUTH");
  }

  payment(message: string, data?: any): void {
    this.info(message, data, "PAYMENT");
  }

  api(message: string, data?: any): void {
    this.info(message, data, "API");
  }

  database(message: string, data?: any): void {
    this.info(message, data, "DATABASE");
  }
}

// Instance singleton
export const logger = new Logger();

// Export par défaut pour compatibilité
export default logger;
