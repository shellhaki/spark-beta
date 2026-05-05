$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$remote = "root@db.sparkdb.pro"
$remoteDir = "/opt/spark-beta-web"
Set-Location $root
$env:BETA_API_URL = "http://127.0.0.1:3111"
bun install
bun run build
Remove-Item Env:\BETA_API_URL -ErrorAction SilentlyContinue
ssh $remote "rm -rf $remoteDir && mkdir -p $remoteDir/.next"
scp -r .next/standalone/* "${remote}:$remoteDir/"
scp -r .next/static "${remote}:$remoteDir/.next/static"
scp -r public "${remote}:$remoteDir/public"
$service = @"
[Unit]
Description=SparkDB Beta Web
After=network-online.target spark-beta.service
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=$remoteDir
Environment=NODE_ENV=production
Environment=PORT=3112
Environment=HOSTNAME=0.0.0.0
Environment=BETA_API_URL=http://127.0.0.1:3111
ExecStart=/usr/bin/env node $remoteDir/server.js
Restart=always
RestartSec=5
User=root

[Install]
WantedBy=multi-user.target
"@
$tmp = New-TemporaryFile
Set-Content -Path $tmp -Value $service -NoNewline
scp $tmp "${remote}:/tmp/spark-beta-web.service"
Remove-Item $tmp -Force
ssh $remote "mv /tmp/spark-beta-web.service /etc/systemd/system/spark-beta-web.service && systemctl daemon-reload && systemctl enable spark-beta-web && systemctl restart spark-beta-web && systemctl status spark-beta-web --no-pager"
