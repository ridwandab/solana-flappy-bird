# 🐦 Solana Flappy Bird

A modern, Solana-powered Flappy Bird game built with Next.js 15, TypeScript, Phaser 3, and Supabase. Features a cosmetic system, high score leaderboard, and SOL-based purchases.

## ✨ Features

- **🎮 Classic Flappy Bird Gameplay**: Smooth, responsive game mechanics built with Phaser 3
- **🔗 Solana Wallet Integration**: Connect Phantom, Solflare, and other Solana wallets
- **🏆 High Score System**: Global leaderboard with persistent score tracking
- **🛍️ Cosmetic Store**: Purchase bird skins, backgrounds, and effects using SOL
- **📊 Real-time Leaderboard**: Compete with players worldwide
- **🎨 Modern UI**: Beautiful, responsive design with Tailwind CSS
- **📱 Mobile Responsive**: Optimized for both desktop and mobile devices

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Game Engine**: Phaser 3
- **Styling**: Tailwind CSS
- **Blockchain**: Solana Web3.js, Wallet Adapter
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel-ready

## 🛠️ Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Solana wallet (Phantom, Solflare, etc.)
- Supabase account (for database)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd SOLANA-FLAPPY-BIRD
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_GAME_TREASURY_ADDRESS=your_treasury_wallet
   ```

4. **Set up Supabase database**
   
   Create the following tables in your Supabase project:

   ```sql
   -- High scores table
   CREATE TABLE high_scores (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     player_address TEXT NOT NULL,
     score INTEGER NOT NULL,
     timestamp TIMESTAMPTZ DEFAULT NOW(),
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- User cosmetics table
   CREATE TABLE user_cosmetics (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     player_address TEXT NOT NULL,
     cosmetic_id TEXT NOT NULL,
     purchased_at TIMESTAMPTZ DEFAULT NOW(),
     transaction_signature TEXT NOT NULL
   );

   -- Cosmetics table
   CREATE TABLE cosmetics (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT NOT NULL,
     price DECIMAL(10,9) NOT NULL,
     rarity TEXT NOT NULL,
     type TEXT NOT NULL,
     image_url TEXT,
     is_active BOOLEAN DEFAULT true
   );

   -- Insert sample cosmetics
   INSERT INTO cosmetics (id, name, description, price, rarity, type, image_url) VALUES
   ('bird_golden', 'Golden Bird', 'A majestic golden bird with shimmering feathers', 0.1, 'legendary', 'bird', ''),
   ('bird_rainbow', 'Rainbow Bird', 'A colorful bird with rainbow plumage', 0.05, 'epic', 'bird', ''),
   ('bird_stealth', 'Stealth Bird', 'A sleek black bird for night flying', 0.03, 'rare', 'bird', ''),
   ('background_sunset', 'Sunset Background', 'Beautiful sunset sky background', 0.02, 'common', 'background', ''),
   ('effect_sparkles', 'Sparkle Effect', 'Adds sparkles when scoring points', 0.04, 'rare', 'effect', '');
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 How to Play

1. **Connect Wallet**: Click the wallet button to connect your Solana wallet
2. **Start Game**: Click "Play Game" from the main menu
3. **Game Controls**: 
   - Click or press SPACEBAR to make the bird flap
   - Navigate through pipes without hitting them
   - Try to achieve the highest score possible
4. **Purchase Cosmetics**: Visit the store to buy new bird skins and effects
5. **Check Leaderboard**: See how you rank against other players

## 🏗️ Project Structure

```
SOLANA-FLAPPY-BIRD/
├── app/                    # Next.js app router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/             # React components
│   ├── game/              # Game-related components
│   ├── store/             # Store and cosmetics
│   ├── leaderboard/       # Leaderboard components
│   ├── wallet/            # Wallet integration
│   └── ui/                # Reusable UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
├── public/                 # Static assets
└── types/                  # TypeScript type definitions
```

## 🔧 Configuration

### Solana Network
- **Devnet**: For testing and development
- **Testnet**: For pre-production testing
- **Mainnet**: For production deployment

### Supabase Setup
1. Create a new Supabase project
2. Get your project URL and anon key
3. Set up the database tables (see installation step 4)
4. Configure Row Level Security (RLS) policies

### Treasury Wallet
Set up a dedicated wallet address to receive SOL payments from cosmetic purchases.

## 🚀 Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production
```env
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_key
NEXT_PUBLIC_GAME_TREASURY_ADDRESS=your_production_treasury_wallet
```

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Phaser 3](https://phaser.io/) - Game framework
- [Solana](https://solana.com/) - Blockchain platform
- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Check the documentation
- Join our Discord community

---

**Happy Gaming! 🎮✨**
