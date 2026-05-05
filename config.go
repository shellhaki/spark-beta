package main

import (
	"database/sql"
	"errors"
	"os"
	"strconv"
	"strings"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	DatabaseURL string
	SMTPEmail   string
	SMTPPass    string
	Allowed     []string
	Slots       int
	AdminKey    string
	NotifyEmail string
}

var App Config
var DB *sql.DB

func LoadConfig() (Config, error) {
	_ = godotenv.Load()
	cfg := Config{
		Port:        env("PORT", "3111"),
		DatabaseURL: strings.TrimSpace(os.Getenv("CSTRING")),
		SMTPEmail:   strings.TrimSpace(os.Getenv("SMTP_EMAIL")),
		SMTPPass:    strings.TrimSpace(os.Getenv("APP_PASSWORD")),
		Allowed:     csv(os.Getenv("ALLOWED_ORIGINS")),
		Slots:       envInt("BETA_SLOTS", 10),
		AdminKey:    strings.TrimSpace(os.Getenv("BETA_ADMIN_KEY")),
		NotifyEmail: env("BETA_NOTIFY_EMAIL", "maxwellexcel2@gmail.com"),
	}
	if cfg.DatabaseURL == "" {
		return cfg, errors.New("CSTRING is required")
	}
	if cfg.SMTPEmail == "" {
		return cfg, errors.New("SMTP_EMAIL is required")
	}
	if cfg.SMTPPass == "" {
		return cfg, errors.New("APP_PASSWORD is required")
	}
	return cfg, nil
}

func ConnDB(cfg Config) (*sql.DB, error) {
	db, err := sql.Open("pgx", cfg.DatabaseURL)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(envInt("DB_MAX_OPEN_CONNS", 12))
	db.SetMaxIdleConns(envInt("DB_MAX_IDLE_CONNS", 6))
	db.SetConnMaxIdleTime(5 * time.Minute)
	db.SetConnMaxLifetime(30 * time.Minute)
	if err := db.Ping(); err != nil {
		db.Close()
		return nil, err
	}
	return db, nil
}

func env(key string, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func envInt(key string, fallback int) int {
	value, err := strconv.Atoi(strings.TrimSpace(os.Getenv(key)))
	if err != nil || value <= 0 {
		return fallback
	}
	return value
}

func csv(value string) []string {
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}
