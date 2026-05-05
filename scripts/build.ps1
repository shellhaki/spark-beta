$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$bin = Join-Path $root "bin"
New-Item -ItemType Directory -Force -Path $bin | Out-Null
Set-Location $root
go build -trimpath -ldflags="-s -w" -o (Join-Path $bin "spark-beta.exe") .
