/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  // Sécurité renforcée : ESLint et TypeScript activés en production
  eslint: {
    // Activer ESLint pour détecter les problèmes de sécurité
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Activer les vérifications TypeScript pour éviter les erreurs de type
    ignoreBuildErrors: false,
  },
  // En-têtes de sécurité
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
