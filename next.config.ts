import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.pinimg.com" },
      { protocol: "https", hostname: "images3.alphacoders.com" },
      { protocol: "https", hostname: "images5.alphacoders.com" },
      { protocol: "https", hostname: "images.alphacoders.com" },
      { protocol: "https", hostname: "cdn-icons-png.flaticon.com" },
    ],
  },
};

export default nextConfig;
