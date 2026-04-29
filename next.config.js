/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    reactStrictMode: true,
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'https://impactdigitalacademy.com.ng/ftssu/api/:path*',
            },
        ];
    },
}

module.exports = nextConfig