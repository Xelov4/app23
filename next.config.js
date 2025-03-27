/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
      // Patterns spécifiques pour les domaines connus
      {
        protocol: 'https',
        hostname: 'd-id.com',
      },
      {
        protocol: 'https',
        hostname: 'pika.art',
      },
      {
        protocol: 'https',
        hostname: 'static.midjourney.com',
      },
      {
        protocol: 'https',
        hostname: 'openai.com',
      },
      {
        protocol: 'https',
        hostname: 'midjourney.com',
      },
      {
        protocol: 'https',
        hostname: 'elevenlabs.io',
      },
      {
        protocol: 'https',
        hostname: 'www.runway.com',
      },
      {
        protocol: 'https',
        hostname: 'runwayml.com',
      },
      {
        protocol: 'https',
        hostname: 'www.video-ia.net',
      },
      {
        protocol: 'https',
        hostname: 'video-ia.net',
      },
    ],
  },
  eslint: {
    // Ignorer les erreurs ESLint lors du build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorer les erreurs TypeScript lors du build
    ignoreBuildErrors: true,
  },
  // Configuration additionnelle pour la production
  output: 'standalone',
  trailingSlash: true,
  // Optimisation pour les moteurs de recherche
  poweredByHeader: false,
  // Compression pour de meilleures performances
  compress: true,
  // Optimisation de la mise en cache
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
      ],
    },
    {
      source: '/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/_next/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
};

module.exports = nextConfig; 