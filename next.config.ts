import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true, // Enable Gzip compression
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.pinimg.com" },
      { protocol: "https", hostname: "images3.alphacoders.com" },
      { protocol: "https", hostname: "images5.alphacoders.com" },
      { protocol: "https", hostname: "images.alphacoders.com" },
      { protocol: "https", hostname: "cdn-icons-png.flaticon.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "cdn.dfk-team.site" },
      { protocol: "https", hostname: "*.r2.dev" },
    ],
  },
};

export default nextConfig;
