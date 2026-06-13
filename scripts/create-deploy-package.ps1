# Creates a ZIP file ready to upload to VPS hosting (excludes dev folders)
$projectRoot = Split-Path -Parent $PSScriptRoot
$outputZip = Join-Path $projectRoot "credicus-deploy.zip"

$itemsToInclude = @(
  "app",
  "components",
  "lib",
  "prisma",
  "public",
  "scripts",
  "app.js",
  "postcss.config.js",
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "tailwind.config.ts",
  "tsconfig.json",
  ".env.production.example",
  "CPANEL-README.txt",
  "HOSTING.md"
)

$postcss = Get-ChildItem -Path $projectRoot -Filter "postcss.config.*" | Select-Object -First 1
if ($postcss) { $itemsToInclude += $postcss.Name }

$tempDir = Join-Path $env:TEMP "credicus-deploy-$(Get-Date -Format 'yyyyMMddHHmmss')"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

foreach ($item in $itemsToInclude) {
  $source = Join-Path $projectRoot $item
  if (Test-Path $source) {
    Copy-Item -Path $source -Destination $tempDir -Recurse -Force
  }
}

if (Test-Path $outputZip) { Remove-Item $outputZip -Force }
Compress-Archive -Path "$tempDir\*" -DestinationPath $outputZip -Force
Remove-Item $tempDir -Recurse -Force

Write-Host "Deploy package created: $outputZip"
Write-Host ""
Write-Host "Upload steps (cPanel):"
Write-Host "  1. Upload and extract ZIP into public_html/credicus.in/ (NOT into lib/)"
Write-Host "  2. Application root = folder containing package.json (read CPANEL-README.txt)"
Write-Host "  3. Verify prisma/schema.prisma exists next to package.json"
Write-Host "  4. Add JWT_SECRET in Environment variables"
Write-Host "  5. Click Run NPM Install, then Run JS script: npm run build"
Write-Host "  6. Restart the Node.js application"
