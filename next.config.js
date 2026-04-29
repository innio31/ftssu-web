/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
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