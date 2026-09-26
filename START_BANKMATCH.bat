@echo off
setlocal
cd /d "%~dp0"

echo ==========================================
echo       BankMatch AI - Windows Launcher
echo ==========================================

autoexec=false
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js not found. Install Node.js 20.19+ and run this file again.
  pause
  exit /b 1
)

node -e "const [a,b]=process.versions.node.split('.').map(Number); if(a<20 || (a===20 && b<19)){process.exit(1)}"
if errorlevel 1 (
  echo ERROR: Node.js 20.19+ is required.
  node -v
  pause
  exit /b 1
)

if not exist "node_modules\.bin\vite.cmd" (
  echo Installing dependencies...
  call npm ci
  if errorlevel 1 (
    echo ERROR: npm ci failed. Check your internet connection and run this file again.
    pause
    exit /b 1
  )
)

if not exist "dist\index.html" (
  echo Building frontend...
  call npm run build
  if errorlevel 1 (
    echo ERROR: frontend build failed.
    pause
    exit /b 1
  )
)

echo.
echo Starting BankMatch...
echo Open: http://localhost:5000
start "BankMatch" cmd /k "npm start"

timeout /t 3 /nobreak >nul
start "" http://localhost:5000
endlocal
