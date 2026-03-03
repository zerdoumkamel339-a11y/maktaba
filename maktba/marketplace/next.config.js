/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['node-cron', 'bcrypt'],
    },
}

module.exports = nextConfig
