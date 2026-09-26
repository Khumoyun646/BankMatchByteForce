@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js 20.19+ not found.
  pause
  exit /b 1
)

echo ==========================================
echo        BankMatch - AI setup
echo ==========================================
echo.
echo Paste a NEW Gemini API key. Do not use a key that was previously
echo published/shared in an archive or Git repository.
echo.
set /p "GEMINI_KEY=Gemini API key: "
if "%GEMINI_KEY%"=="" (
  echo ERROR: key is empty.
  pause
  exit /b 1
)

set /p "ADMIN=Admin token (leave empty to generate one): "
if "%ADMIN%"=="" (
  for /f "delims=" %%A in ('powershell -NoProfile -Command "[guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')"') do set "ADMIN=%%A"
)

(
  echo PORT=5000
  echo CORS_ORIGIN=http://localhost:5173,http://localhost:5174
  echo GEMINI_MODEL=gemini-3.8-flash
  echo GEMINI_API_KEY=%GEMINI_KEY%
  echo ADMIN_TOKEN=%ADMIN%
)> .env

echo.
echo .env was created. Keep it private and never upload it to GitHub.
echo Now run START_BANKMATCH.bat
pause
endlocal
