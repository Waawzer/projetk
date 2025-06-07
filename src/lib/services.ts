// Types et utilitaires pour les services de studio
export type ServiceType = "recording" | "mixing" | "mastering" | "production";

export interface ServiceInfo {
  label: string;
  pricePerHour: number;
  description: string;
}

// Configuration centralisée des services
export const SERVICES: Record<ServiceType, ServiceInfo> = {
  recording: {
    label: "Enregistrement",
    pricePerHour: 60,
    description: "Enregistrement en studio professionnel",
  },
  mixing: {
    label: "Mixage",
    pricePerHour: 50,
    description: "Mixage et traitement audio",
  },
  mastering: {
    label: "Mastering",
    pricePerHour: 40,
    description: "Mastering et finalisation",
  },
  production: {
    label: "Production",
    pricePerHour: 70,
    description: "Production musicale complète",
  },
};

/**
 * Obtenir le libellé d'un service
 */
export function getServiceLabel(service: string): string {
  const serviceKey = service as ServiceType;
  return SERVICES[serviceKey]?.label || service;
}

/**
 * Obtenir le prix par heure d'un service
 */
export function getPricePerHour(service: string): number {
  const serviceKey = service as ServiceType;
  return SERVICES[serviceKey]?.pricePerHour || 50;
}

/**
 * Obtenir toutes les informations d'un service
 */
export function getServiceInfo(service: string): ServiceInfo | null {
  const serviceKey = service as ServiceType;
  return SERVICES[serviceKey] || null;
}

/**
 * Vérifier si un service est valide
 */
export function isValidService(service: string): service is ServiceType {
  return service in SERVICES;
}

/**
 * Obtenir la liste de tous les services disponibles
 */
export function getAllServices(): ServiceType[] {
  return Object.keys(SERVICES) as ServiceType[];
}
