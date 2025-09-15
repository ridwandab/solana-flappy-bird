# Database Setup untuk Leaderboard

## ⚠️ Error Fix: Supabase Configuration

**MASALAH**: Error `Failed to construct 'URL': Invalid URL` terjadi karena Supabase belum dikonfigurasi.

**SOLUSI**: Aplikasi sekarang sudah diperbaiki dengan fallback system. Leaderboard akan berfungsi dengan localStorage jika Supabase tidak dikonfigurasi.

## Setup Environment Variables

Buat file `.env.local` di root project dengan konfigurasi berikut:

```env
# Solana Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Supabase Configuration (Optional - leave as placeholder if not using Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Game Configuration
NEXT_PUBLIC_GAME_TREASURY_ADDRESS=your_treasury_wallet_address
NEXT_PUBLIC_GAME_MIN_SCORE_TO_SAVE=10
```

## Supabase Database Schema (Optional)

Untuk mengaktifkan leaderboard yang terintegrasi dengan database, Anda perlu membuat tabel `high_scores` di Supabase dengan struktur berikut:

### 1. Tabel `high_scores`

```sql
CREATE TABLE high_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_address TEXT NOT NULL,
  player_name TEXT NOT NULL DEFAULT 'Anonymous',
  score INTEGER NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk performa query
CREATE INDEX idx_high_scores_player_address ON high_scores(player_address);
CREATE INDEX idx_high_scores_score ON high_scores(score DESC);
CREATE INDEX idx_high_scores_timestamp ON high_scores(timestamp DESC);
```

### 2. Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE high_scores ENABLE ROW LEVEL SECURITY;

-- Policy untuk membaca data (public read)
CREATE POLICY "Allow public read access" ON high_scores
  FOR SELECT USING (true);

-- Policy untuk insert data (public insert)
CREATE POLICY "Allow public insert" ON high_scores
  FOR INSERT WITH CHECK (true);
```

### 3. Environment Variables

Pastikan file `.env.local` memiliki konfigurasi Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Fitur Leaderboard

### Time Filtering
- **All**: Menampilkan semua skor dari semua waktu
- **Daily**: Menampilkan skor dari hari ini (00:00 - 23:59)
- **Weekly**: Menampilkan skor dari minggu ini (Senin - Minggu)
- **Monthly**: Menampilkan skor dari bulan ini (1 - 31)

### Fallback System
- Jika Supabase tidak tersedia, sistem akan otomatis fallback ke localStorage
- Data tetap tersimpan di localStorage sebagai backup
- Ketika Supabase kembali online, data akan tersinkronisasi

### Real-time Updates
- Leaderboard akan otomatis refresh ketika filter berubah
- Data baru akan langsung muncul di leaderboard
- Loading state ditampilkan saat mengambil data

## Cara Penggunaan

### Mode LocalStorage (Default - Tidak Perlu Setup)
1. **Tidak perlu setup**: Aplikasi akan otomatis menggunakan localStorage
2. **Testing**: Jalankan game dan coba bermain untuk menambah skor
3. **Leaderboard**: Buka halaman leaderboard dan coba filter All/Daily/Weekly/Monthly
4. **Data tersimpan**: Skor tersimpan di browser localStorage

### Mode Supabase (Optional)
1. **Setup Database**: Jalankan SQL di atas di Supabase SQL Editor
2. **Environment**: Update `.env.local` dengan URL dan key Supabase yang benar
3. **Testing**: Jalankan game dan coba bermain untuk menambah skor
4. **Leaderboard**: Buka halaman leaderboard dan coba filter All/Daily/Weekly/Monthly
5. **Data tersinkronisasi**: Skor tersimpan di database Supabase

## Troubleshooting

### Error "Failed to load leaderboard"
- Periksa koneksi internet
- Pastikan Supabase URL dan key sudah benar
- Cek console browser untuk error detail

### Data tidak muncul
- Pastikan tabel `high_scores` sudah dibuat
- Periksa RLS policies sudah benar
- Cek apakah ada data di tabel

### Performance Issues
- Pastikan index sudah dibuat
- Pertimbangkan untuk limit query (sudah diimplementasi: limit 100)
- Monitor penggunaan Supabase dashboard
