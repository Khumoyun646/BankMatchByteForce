@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 20.19+ is required.
  pause
  exit /b 1
)
node -e "const [a,b]=process.versions.node.split('.').map(Number); if(a<20 || (a===20 && b<19)){process.exit(1)}"
if errorlevel 1 (
  echo Node.js 20.19+ is required.
  node -v
  pause
  exit /b 1
)

if not exist "node_modules\.bin\vite.cmd" (
  echo Installing dependencies...
  call npm ci
  if errorlevel 1 pause & exit /b 1
)
start "BankMatch API" cmd /k "npm run server"
start "BankMatch Vite" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
start "" http://localhost:5173
endlocal
