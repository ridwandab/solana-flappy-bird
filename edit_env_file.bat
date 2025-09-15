@echo off
echo ========================================
echo    EDIT .env.local FILE
echo ========================================
echo.
echo This script will help you edit the .env.local file
echo to fix the database connection issue.
echo.
echo Current anon key: your_supabase_anon_key_here
echo.
echo You need to replace this with the real anon key from:
echo https://supabase.com/dashboard/project/yqxafphtxatnrxswnpje/settings/api
echo.
echo Press any key to open the .env.local file for editing...
pause >nul
echo.
echo Opening .env.local file...
notepad .env.local
echo.
echo ========================================
echo    NEXT STEPS:
echo ========================================
echo 1. Replace "your_supabase_anon_key_here" with real anon key
echo 2. Save the file (Ctrl+S)
echo 3. Close Notepad
echo 4. Restart development server (npm run dev)
echo.
echo Press any key to exit...
pause >nul
