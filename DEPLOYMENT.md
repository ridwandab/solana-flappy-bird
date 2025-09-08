# 🚀 Deployment Guide

This guide will help you deploy your Solana Flappy Bird game to various platforms.

## 🌐 Vercel Deployment (Recommended)

### 1. Prepare Your Repository
```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (or leave empty)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. Set Environment Variables
In your Vercel project dashboard, go to Settings → Environment Variables and add:

```env
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
NEXT_PUBLIC_GAME_TREASURY_ADDRESS=your_production_treasury_wallet
```

### 4. Deploy
Click "Deploy" and wait for the build to complete!

## 🐳 Docker Deployment

### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Build and Run
```bash
# Build the image
docker build -t solana-flappy-bird .

# Run the container
docker run -p 3000:3000 solana-flappy-bird
```

## ☁️ AWS Deployment

### 1. Elastic Beanstalk
1. Create a new Elastic Beanstalk environment
2. Choose Node.js platform
3. Upload your code as a ZIP file
4. Set environment variables in the configuration

### 2. S3 + CloudFront
1. Build your project: `npm run build`
2. Upload the `out` directory to S3
3. Configure CloudFront for global distribution

## 🔧 Environment Configuration

### Development
```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SUPABASE_URL=your_dev_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_dev_supabase_key
NEXT_PUBLIC_GAME_TREASURY_ADDRESS=your_dev_treasury_wallet
```

### Staging
```env
NEXT_PUBLIC_SOLANA_NETWORK=testnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.testnet.solana.com
NEXT_PUBLIC_SUPABASE_URL=your_staging_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_staging_supabase_key
NEXT_PUBLIC_GAME_TREASURY_ADDRESS=your_staging_treasury_wallet
```

### Production
```env
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_key
NEXT_PUBLIC_GAME_TREASURY_ADDRESS=your_production_treasury_wallet
```

## 📊 Performance Optimization

### 1. Enable Next.js Optimizations
```javascript
// next.config.js
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Enable image optimization
  images: {
    domains: ['your-image-domain.com'],
  },
  // Enable compression
  compress: true,
  // Enable SWC minification
  swcMinify: true,
}
```

### 2. CDN Configuration
- Use Vercel's Edge Network (automatic)
- Configure CloudFront for AWS deployments
- Set up proper caching headers

### 3. Database Optimization
- Enable Supabase connection pooling
- Use appropriate indexes on your tables
- Implement proper RLS policies

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env.local` to version control
- Use different keys for different environments
- Rotate keys regularly

### 2. Supabase Security
- Enable Row Level Security (RLS)
- Use service role keys only on the backend
- Implement proper authentication policies

### 3. Solana Security
- Use dedicated wallets for different purposes
- Never expose private keys
- Implement proper transaction validation

## 📈 Monitoring and Analytics

### 1. Vercel Analytics
- Enable Vercel Analytics in your dashboard
- Monitor Core Web Vitals
- Track performance metrics

### 2. Error Tracking
- Integrate Sentry for error monitoring
- Set up alerts for critical errors
- Monitor user experience metrics

### 3. Game Analytics
- Track player engagement
- Monitor high scores and leaderboard activity
- Analyze cosmetic purchase patterns

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Environment Variables**
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify Supabase credentials

3. **Database Connection**
   - Check Supabase project status
   - Verify RLS policies
   - Check connection limits

4. **Solana Integration**
   - Verify network configuration
   - Check RPC endpoint availability
   - Ensure wallet adapter is properly configured

## 📞 Support

If you encounter deployment issues:
1. Check the Vercel build logs
2. Review environment variable configuration
3. Verify database connectivity
4. Check Solana network status
5. Open an issue on GitHub

---

**Happy Deploying! 🚀✨**
