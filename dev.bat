@echo off
set "PATH=C:\Users\Justin\AppData\Local\nvm\v22.19.0;%PATH%"
echo Starting NexaCart...
where pnpm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  pnpm dev:vercel
) else (
  npm run dev:vercel
)
