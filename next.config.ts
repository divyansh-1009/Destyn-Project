import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ['sharp']
  },
  // Configure for larger file uploads
  async headers() {
    return [
      {
        source: '/api/upload-photo',
        headers: [
          {
            key: 'max-http-buffer-size',
            value: '10mb',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
