import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-d408cfbc-96d2-441c-a069-46268228b866.space.z.ai",
    ".space.z.ai",
  ],
};

export default nextConfig;
