/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@steuer-fair/shared'],
  // API-URL wird jetzt dynamisch in der Anwendung ermittelt
  // NEXT_PUBLIC_API_URL kann weiterhin als Override verwendet werden
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Rewrites werden entfernt, da die API-URL jetzt client-seitig ermittelt wird
  // und nicht mehr über Next.js Rewrites geleitet werden muss
};

module.exports = nextConfig;
