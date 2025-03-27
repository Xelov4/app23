/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['d-id.com', 'pika.art', 'static.midjourney.com', 'openai.com', 'midjourney.com', 'elevenlabs.io', 'www.runway.com', 'runwayml.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
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
};

module.exports = nextConfig; 