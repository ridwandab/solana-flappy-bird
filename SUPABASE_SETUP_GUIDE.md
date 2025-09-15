# Supabase Setup Guide for Solana Flappy Bird

This guide will help you set up Supabase to store player names and high scores for your Solana Flappy Bird game.

## Prerequisites

- A Supabase account (free tier available)
- Basic knowledge of SQL and database management

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `solana-flappy-bird` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
6. Click "Create new project"
7. Wait for the project to be created (usually takes 1-2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## Step 3: Set Up Environment Variables

1. In your project root, create a `.env.local` file (if it doesn't exist)
2. Add your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Replace `your-project-id` and `your-anon-key-here` with your actual values.

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase-setup.sql` into the editor
4. Click "Run" to execute the SQL

This will create:
- `high_scores` table for storing player scores
- `user_cosmetics` table for storing purchased cosmetics
- `cosmetics` table for available cosmetics
- Proper indexes for performance
- Row Level Security policies
- Sample cosmetic data

## Step 5: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your game in the browser
3. Connect your wallet
4. Set a player name
5. Play the game and achieve a score
6. Check your Supabase dashboard → **Table Editor** → **high_scores** to see if the score was saved

## Step 6: Verify the Setup

### Check Tables
Go to **Table Editor** in your Supabase dashboard and verify these tables exist:
- `high_scores`
- `user_cosmetics` 
- `cosmetics`

### Check Sample Data
In the `cosmetics` table, you should see 10 sample cosmetic items.

### Test High Score Saving
1. Play the game and get a score
2. Check the `high_scores` table for your entry
3. Verify the data includes:
   - `player_address` (your wallet address)
   - `player_name` (the name you set)
   - `score` (your game score)
   - `timestamp` (when the score was achieved)

## Troubleshooting

### Common Issues

**1. "Supabase not configured" message**
- Check that your `.env.local` file has the correct environment variables
- Restart your development server after adding environment variables
- Verify the URL and key are correct (no extra spaces or quotes)

**2. "Failed to save high score" error**
- Check your Supabase project is active (not paused)
- Verify the database schema was created correctly
- Check the browser console for detailed error messages

**3. High scores not appearing in leaderboard**
- Ensure the `high_scores` table has data
- Check that the leaderboard component is properly fetching data
- Verify Row Level Security policies allow public read access

### Debug Mode

To enable debug logging, add this to your `.env.local`:
```env
NEXT_PUBLIC_DEBUG=true
```

This will show detailed logs in the browser console about Supabase operations.

## Security Considerations

The current setup uses public access policies for simplicity. For production, consider:

1. **Authentication**: Implement proper user authentication
2. **Rate Limiting**: Add rate limiting to prevent spam
3. **Input Validation**: Validate all inputs on the server side
4. **Access Control**: Implement proper RLS policies based on user roles

## Next Steps

Once Supabase is set up, you can:

1. **View Leaderboards**: High scores will automatically appear in the leaderboard
2. **Track Player Progress**: Monitor player statistics and achievements
3. **Manage Cosmetics**: Add new cosmetic items through the Supabase dashboard
4. **Analytics**: Use Supabase's built-in analytics to track game usage

## Support

If you encounter issues:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review the browser console for error messages
3. Check the Supabase dashboard for any service issues
4. Verify your environment variables are correctly set

## Database Schema Reference

### high_scores Table
- `id`: UUID (Primary Key)
- `player_address`: TEXT (Wallet address)
- `player_name`: TEXT (Player's display name)
- `score`: INTEGER (Game score)
- `timestamp`: TIMESTAMP (When score was achieved)
- `created_at`: TIMESTAMP (Record creation time)

### user_cosmetics Table
- `id`: UUID (Primary Key)
- `player_address`: TEXT (Wallet address)
- `cosmetic_id`: TEXT (Cosmetic identifier)
- `purchased_at`: TIMESTAMP (Purchase time)
- `transaction_signature`: TEXT (Solana transaction signature)

### cosmetics Table
- `id`: UUID (Primary Key)
- `name`: TEXT (Cosmetic name)
- `description`: TEXT (Cosmetic description)
- `price`: DECIMAL (Price in SOL)
- `rarity`: TEXT (Common, Uncommon, Rare, Epic)
- `type`: TEXT (bird, pipe, background)
- `image_url`: TEXT (Image file path)
- `is_active`: BOOLEAN (Whether cosmetic is available)
