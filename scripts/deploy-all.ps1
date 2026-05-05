$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
powershell -ExecutionPolicy Bypass -File (Join-Path $root "scripts\deploy.ps1")
powershell -ExecutionPolicy Bypass -File (Join-Path $root "web\scripts\deploy.ps1")
ssh root@db.sparkdb.pro "systemctl is-active --quiet spark-beta && systemctl is-active --quiet spark-beta-web && curl -fsS http://127.0.0.1:3111/health && curl -fsS -o /dev/null http://127.0.0.1:3112"
Write-Host "SparkDB beta backend and frontend are running on the VPS."
