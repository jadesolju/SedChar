/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.sedchar.online',
          },
        ],
        destination: 'https://sedchar.online/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
