# Builds locally then creates a cPanel-ready ZIP with .next included.
# This avoids 500 errors when cPanel health-checks the app after npm install.
$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$outputZip = Join-Path $projectRoot "credicus-cpanel.zip"

Set-Location $projectRoot

Write-Host "Step 1/3: Installing dependencies (if needed)..."
npm install --no-audit --no-fund

Write-Host "Step 2/3: Building production app (this may take a few minutes)..."
npm run build
if ($LASTEXITCODE -ne 0) {
  Write-Host "Build failed. Fix errors above before uploading to cPanel." -ForegroundColor Red
  exit 1
}

if (-not (Test-Path (Join-Path $projectRoot ".next\BUILD_ID"))) {
  Write-Host "Build finished but .next/BUILD_ID not found." -ForegroundColor Red
  exit 1
}

Write-Host "Step 3/3: Creating credicus-cpanel.zip ..."

$itemsToInclude = @(
  "app",
  "components",
  "lib",
  "prisma",
  "public",
  "scripts",
  ".next",
  "app.js",
  "postcss.config.js",
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "tailwind.config.ts",
  "tsconfig.json",
  "CPANEL-README.txt"
)

$postcss = Get-ChildItem -Path $projectRoot -Filter "postcss.config.*" | Select-Object -First 1
if ($postcss) { $itemsToInclude += $postcss.Name }

$tempDir = Join-Path $env:TEMP "credicus-cpanel-$(Get-Date -Format 'yyyyMMddHHmmss')"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

foreach ($item in $itemsToInclude) {
  $source = Join-Path $projectRoot $item
  if (Test-Path $source) {
    Copy-Item -Path $source -Destination $tempDir -Recurse -Force
  } else {
    Write-Host "Warning: missing $item" -ForegroundColor Yellow
  }
}

if (Test-Path $outputZip) { Remove-Item $outputZip -Force }
Compress-Archive -Path "$tempDir\*" -DestinationPath $outputZip -Force
Remove-Item $tempDir -Recurse -Force

Write-Host ""
Write-Host "SUCCESS: $outputZip" -ForegroundColor Green
Write-Host ""
Write-Host "cPanel upload steps:"
Write-Host "  1. Upload credicus-cpanel.zip to public_html/credicus.in/"
Write-Host "  2. Extract (overwrite all files)"
Write-Host "  3. Setup Node.js App -> root: public_html/credicus.in, startup: app.js"
Write-Host "  4. Set JWT_SECRET and NODE_ENV=production"
Write-Host "  5. Run NPM Install -> Restart (no npm run build needed on server)"
