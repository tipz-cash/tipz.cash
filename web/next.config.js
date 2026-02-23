/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [{ protocol: "https", hostname: "pbs.twimg.com" }],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
}

module.exports = nextConfig
