/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['impactdigitalacademy.com.ng'],
    },
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