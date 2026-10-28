@echo off
REM Mo van phong Ads Team HQ co Claude Code that (Windows).
REM Tu chay khi bat may: Win+R, go shell:startup, tao shortcut toi file nay.
REM Tu mo lai chinh no o cua so thu nho de server chay ngam.
if not "%~1"=="min" (
  start "Ads Team HQ" /min "%~f0" min
  exit /b
)
cd /d "%~dp0"
start "" http://localhost:8000
node server.js
pause
