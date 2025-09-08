@echo off
echo Installing Solana Flappy Bird dependencies...
echo.

echo Installing npm packages...
npm install

echo.
echo Creating .env.local file...
if not exist .env.local (
    copy env.example .env.local
    echo Created .env.local from env.example
    echo Please edit .env.local with your configuration
) else (
    echo .env.local already exists
)

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Edit .env.local with your Supabase and Solana configuration
echo 2. Set up your Supabase database (see README.md)
echo 3. Run: npm run dev
echo.
pause
