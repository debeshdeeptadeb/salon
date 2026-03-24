@echo off
echo ================================================
echo MINJAL SALON - DATABASE SETUP
echo ================================================
echo.

echo Step 1: Creating database...
psql -U postgres -c "CREATE DATABASE salon_db;"
if %ERRORLEVEL% NEQ 0 (
    echo Database might already exist, continuing...
)
echo.

echo Step 2: Running schema migration...
psql -U postgres -d salon_db -f migrations/001_initial_schema.sql
echo.

echo Step 3: Inserting seed data...
psql -U postgres -d salon_db -f migrations/002_seed_data.sql
echo.

echo Step 4: Creating admin user...
node scripts/create-admin.js
echo.

echo ================================================
echo DATABASE SETUP COMPLETE!
echo ================================================
echo.
echo You can now start the backend server with:
echo npm run dev
echo.
pause
