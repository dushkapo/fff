/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'fvkexoukttzcgvcujwrp.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
        unoptimized: false,
    },
    // Security headers
    async headers() {
        const supabase = 'https://fvkexoukttzcgvcujwrp.supabase.co';
        // Google Translate widget domains
        const gtScript = 'https://translate.google.com https://translate.googleapis.com https://www.google.com https://www.gstatic.com';
        const gtConnect = 'https://translate.googleapis.com https://translate.google.com';
        const gtImg = 'https://www.google.com https://www.gstatic.com https://translate.googleapis.com https://translate.google.com';
        const csp = [
            "default-src 'self'",
            `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${gtScript}`,
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com",
            "font-src 'self' https://fonts.gstatic.com",
            `img-src 'self' data: blob: ${supabase} https://images.unsplash.com ${gtImg}`,
            `connect-src 'self' ${supabase} ${gtConnect}`,
            "frame-src https://translate.google.com https://translate.googleapis.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ].join('; ');

        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: csp,
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
