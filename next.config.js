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
};

module.exports = nextConfig; 