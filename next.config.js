/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',  // This is important for Netlify static hosting
    images: {
        unoptimized: true,  // Required for static export
        domains: ['impactdigitalacademy.com.ng'],
    },
    trailingSlash: true,  // Helps with routing on Netlify
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                ],
            },
        ];
    },
}

module.exports = nextConfig