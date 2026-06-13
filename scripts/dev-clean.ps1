# Stop stale Next.js dev servers and start fresh on port 3000
$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $projectRoot

Write-Host "Stopping processes on ports 3000 and 3001..."
foreach ($port in 3000, 3001) {
  Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object {
      Write-Host "  Killing PID $_ (port $port)"
      Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
    }
}

$lockFile = Join-Path $projectRoot ".next\dev\lock"
if (Test-Path $lockFile) {
  Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
  Write-Host "Removed dev lock file."
}

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Starting Credicus on http://localhost:3000"
Write-Host "Sign-in: http://localhost:3000/sign-in"
Write-Host "Press Ctrl+C to stop."
Write-Host ""

& npx next dev --webpack
