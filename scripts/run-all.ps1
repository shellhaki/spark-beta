$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$web = Join-Path $root "web"
$logs = Join-Path $root ".spark-beta"
$bin = Join-Path $root "bin\spark-beta.exe"
New-Item -ItemType Directory -Force -Path $logs | Out-Null
Set-Location $root
go build -trimpath -ldflags="-s -w" -o $bin .
if (!(Test-Path (Join-Path $web "node_modules"))) {
	Set-Location $web
	bun install
	Set-Location $root
}
$env:GIN_MODE = "release"
$backendLog = Join-Path $logs "backend.log"
$backendErr = Join-Path $logs "backend.err.log"
$frontendLog = Join-Path $logs "frontend.log"
$frontendErr = Join-Path $logs "frontend.err.log"
$backend = Start-Process -FilePath $bin -WorkingDirectory $root -RedirectStandardOutput $backendLog -RedirectStandardError $backendErr -PassThru -WindowStyle Hidden
Remove-Item Env:\GIN_MODE -ErrorAction SilentlyContinue
$frontend = Start-Process -FilePath "bun" -ArgumentList "run","dev" -WorkingDirectory $web -RedirectStandardOutput $frontendLog -RedirectStandardError $frontendErr -PassThru -WindowStyle Hidden
@{
	backend = $backend.Id
	frontend = $frontend.Id
	started_at = (Get-Date).ToString("o")
	backend_url = "http://localhost:3111"
	frontend_url = "http://localhost:3112"
} | ConvertTo-Json | Set-Content (Join-Path $logs "pids.json")
Write-Host "Backend:  http://localhost:3111"
Write-Host "Frontend: http://localhost:3112"
