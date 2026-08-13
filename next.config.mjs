/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      // BookMyShow's CDN — event artwork imported via /admin/events/import
      // links here until an admin replaces it with an uploaded asset.
      { protocol: "https", hostname: "**.bmscdn.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/book-a-table", destination: "/reserve", permanent: true },
      { source: "/rooms-xo", destination: "/room-xo", permanent: true },
    ];
  },
};

export default nextConfig;
