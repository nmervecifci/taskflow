/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*", // frontend’de /api ile başlayan tüm istekler
        destination: "https://taskflow-x9rq.onrender.com/api/:path*", // backend API URL’sine yönlenecek
      },
    ];
  },
};

export default nextConfig;
