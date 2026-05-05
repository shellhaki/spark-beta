$ErrorActionPreference = "SilentlyContinue"
$root = Split-Path -Parent $PSScriptRoot
$pidFile = Join-Path $root ".spark-beta\pids.json"
if (Test-Path $pidFile) {
	$pids = Get-Content -Raw $pidFile | ConvertFrom-Json
	@($pids.frontend, $pids.backend) | ForEach-Object {
		if ($_ ) {
			Stop-Process -Id $_ -Force
		}
	}
	Remove-Item $pidFile -Force
}
Get-NetTCPConnection -LocalPort 3111,3112 | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
	Stop-Process -Id $_ -Force
}
Write-Host "SparkDB beta processes stopped."
