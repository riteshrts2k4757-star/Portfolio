@echo off
setlocal
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo ERROR: npm was not found. Install Node.js, then reopen this window.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo ERROR: Dependencies are missing. Run npm install in this project first.
  pause
  exit /b 1
)

if not exist ".env" (
  echo WARNING: .env is missing. The backend requires Supabase credentials to start.
)

echo Starting the portfolio backend on port 5000 and Vite on port 5173...
echo.
echo Find the IPv4 address for the Wi-Fi network connected to your phone hotspot:
ipconfig | findstr /C:"adapter" /C:"IPv4 Address"
echo.
echo On your phone, open: http://YOUR_HOTSPOT_IPV4:5173
echo Keep both service windows open while testing.
echo.

powershell -NoProfile -Command "if (Get-NetTCPConnection -State Listen -LocalPort 5000 -ErrorAction SilentlyContinue) { exit 1 } else { exit 0 }"
if errorlevel 1 (
  echo NOTE: Port 5000 is already listening; keeping the existing backend.
) else (
  start "Portfolio backend - port 5000" /D "%~dp0" cmd /k "npm run server"
)

powershell -NoProfile -Command "if (Get-NetTCPConnection -State Listen -LocalPort 5173 -ErrorAction SilentlyContinue) { exit 1 } else { exit 0 }"
if errorlevel 1 (
  echo NOTE: Port 5173 is already listening; keeping the existing frontend.
) else (
  start "Portfolio Vite - port 5173" /D "%~dp0" cmd /k "npm run dev:phone"
)

echo Leave the frontend and backend service windows open while testing.
echo Replace YOUR_HOTSPOT_IPV4 with the Wi-Fi IPv4 address shown above.
pause
