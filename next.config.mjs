/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'motion', 'framer-motion'],
  },
  devIndicators: false,
  images: {
    remotePatterns: [
      // Supabase Storage
      { protocol: 'https', hostname: '*.supabase.co',        pathname: '/storage/v1/object/public/**' },
      // Google profile avatars
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      // Generic https images (Unsplash, Cloudinary, etc.)
      { protocol: 'https', hostname: '**' },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes:  [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
