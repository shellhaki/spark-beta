$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$bin = Join-Path $root "bin"
$linuxBin = Join-Path $bin "spark-beta"
$remote = "root@db.sparkdb.pro"
$remoteDir = "/opt/spark-beta"
$envFile = Join-Path $root ".env"
New-Item -ItemType Directory -Force -Path $bin | Out-Null
Set-Location $root
$env:GOOS = "linux"
$env:GOARCH = "amd64"
$env:CGO_ENABLED = "0"
go build -trimpath -ldflags="-s -w" -o $linuxBin .
Remove-Item Env:\GOOS -ErrorAction SilentlyContinue
Remove-Item Env:\GOARCH -ErrorAction SilentlyContinue
Remove-Item Env:\CGO_ENABLED -ErrorAction SilentlyContinue
ssh $remote "mkdir -p $remoteDir"
scp $linuxBin "${remote}:$remoteDir/spark-beta"
scp $envFile "${remote}:$remoteDir/.env"
$service = @"
[Unit]
Description=SparkDB Beta API
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=$remoteDir
EnvironmentFile=$remoteDir/.env
Environment=GIN_MODE=release
ExecStart=$remoteDir/spark-beta
Restart=always
RestartSec=5
User=root

[Install]
WantedBy=multi-user.target
"@
$tmp = New-TemporaryFile
Set-Content -Path $tmp -Value $service -NoNewline
scp $tmp "${remote}:/tmp/spark-beta.service"
Remove-Item $tmp -Force
ssh $remote "mv /tmp/spark-beta.service /etc/systemd/system/spark-beta.service && chmod +x $remoteDir/spark-beta && chmod 600 $remoteDir/.env && systemctl daemon-reload && systemctl enable spark-beta && systemctl restart spark-beta && systemctl status spark-beta --no-pager"
