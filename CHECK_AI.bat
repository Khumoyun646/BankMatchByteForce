@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js not found.
  pause
  exit /b 1
)
node server\ai-diagnostic.js
set "CODE=%ERRORLEVEL%"
echo.
if "%CODE%"=="0" (
  echo AI is reachable and configured.
) else if "%CODE%"=="2" (
  echo AI key is missing. Check .env or Ai.env.
) else if "%CODE%"=="3" (
  echo AI key is present, but Gemini is not reachable or access is limited.
) else (
  echo AI diagnostic failed.
)
echo.
pause
exit /b %CODE%
