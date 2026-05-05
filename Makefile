APP=spark-beta
VPS=root@db.sparkdb.pro
REMOTE_DIR=/opt/spark-beta

.PHONY: run build deploy web web-build run-all stop-all deploy-all

run:
	go run .

build:
	go build -trimpath -ldflags="-s -w" -o bin/$(APP).exe .

web:
	cd web && bun run dev

web-build:
	cd web && bun install && bun run build

run-all:
	powershell -ExecutionPolicy Bypass -File scripts/run-all.ps1

stop-all:
	powershell -ExecutionPolicy Bypass -File scripts/stop-all.ps1

deploy:
	powershell -ExecutionPolicy Bypass -File scripts/deploy.ps1

deploy-all:
	powershell -ExecutionPolicy Bypass -File scripts/deploy-all.ps1
