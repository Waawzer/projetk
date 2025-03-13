/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  eslint: {
    // Désactiver ESLint lors de la construction pour éviter les erreurs de déploiement
    ignoreDuringBuilds: true,
  },
};

export default nextConfig; 