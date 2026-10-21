$env:PATH = "C:\Users\Justin\AppData\Local\nvm\v22.19.0;$env:PATH"
Write-Host "Starting NexaCart..." -ForegroundColor Cyan
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    pnpm dev:vercel
} else {
    npm run dev:vercel
}
