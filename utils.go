package main

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"html"
	"net/mail"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	gomail "gopkg.in/mail.v2"
)

var ErrDuplicateEmail = errors.New("duplicate email")

func NormalizeSignup(input BetaSignupRequest) (BetaSignupRequest, error) {
	fullName := input.FullName
	if strings.TrimSpace(fullName) == "" {
		fullName = input.Name
	}
	req := BetaSignupRequest{
		FullName:   clean(fullName),
		Email:      strings.ToLower(clean(input.Email)),
		Profession: clean(input.Profession),
	}
	if len(req.FullName) < 2 || len(req.FullName) > 80 {
		return req, errors.New("Full name must be between 2 and 80 characters.")
	}
	if len(req.Email) > 254 {
		return req, errors.New("Enter a valid email address.")
	}
	parsed, err := mail.ParseAddress(req.Email)
	if err != nil || parsed.Address != req.Email {
		return req, errors.New("Enter a valid email address.")
	}
	if len(req.Profession) > 120 {
		return req, errors.New("Profession must be 120 characters or less.")
	}
	return req, nil
}

func CreateBetaTester(ctx context.Context, db *sql.DB, req BetaSignupRequest) (BetaTester, error) {
	query := `
		INSERT INTO beta_testers (full_name, email, profession)
		VALUES ($1, $2, NULLIF($3, ''))
		RETURNING id::text, full_name, email, COALESCE(profession, ''), created_at
	`
	var tester BetaTester
	err := db.QueryRowContext(ctx, query, req.FullName, req.Email, req.Profession).Scan(
		&tester.ID,
		&tester.FullName,
		&tester.Email,
		&tester.Profession,
		&tester.CreatedAt,
	)
	if err != nil {
		if IsDuplicate(err) {
			return tester, ErrDuplicateEmail
		}
		return tester, err
	}
	return tester, nil
}

func GetSlots(ctx context.Context, db *sql.DB, total int) (Slots, error) {
	var taken int
	if err := db.QueryRowContext(ctx, "SELECT COUNT(*) FROM beta_testers").Scan(&taken); err != nil {
		return Slots{}, err
	}
	remaining := total - taken
	if remaining < 0 {
		remaining = 0
	}
	return Slots{Total: total, Taken: taken, Remaining: remaining}, nil
}

func GetCandidates(ctx context.Context, db *sql.DB) ([]BetaTester, error) {
	rows, err := db.QueryContext(ctx, `
		SELECT id::text, full_name, email, COALESCE(profession, ''), created_at
		FROM beta_testers
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	candidates := make([]BetaTester, 0)
	for rows.Next() {
		var candidate BetaTester
		if err := rows.Scan(&candidate.ID, &candidate.FullName, &candidate.Email, &candidate.Profession, &candidate.CreatedAt); err != nil {
			return nil, err
		}
		candidates = append(candidates, candidate)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return candidates, nil
}

func SendWelcomeEmail(cfg Config, tester BetaTester) error {
	msg := gomail.NewMessage()
	msg.SetHeader("From", cfg.SMTPEmail)
	msg.SetHeader("To", tester.Email)
	msg.SetHeader("Subject", "You're on the SparkDB beta list")
	msg.SetBody("text/plain", welcomeText(tester))
	msg.AddAlternative("text/html", welcomeHTML(tester))
	return gomail.NewDialer("smtp.gmail.com", 587, cfg.SMTPEmail, cfg.SMTPPass).DialAndSend(msg)
}

func IsDuplicate(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}

func clean(value string) string {
	return strings.Join(strings.Fields(strings.TrimSpace(value)), " ")
}

func welcomeText(t BetaTester) string {
	name := t.FullName
	if name == "" {
		name = "there"
	}
	return fmt.Sprintf("Hi %s,\n\nYou're on the SparkDB beta programme. We'll communicate the beta date and next steps soon.\n\nSparkDB", name)
}

func welcomeHTML(t BetaTester) string {
	name := html.EscapeString(t.FullName)
	if name == "" {
		name = "there"
	}
	return fmt.Sprintf(`<!doctype html><html><body style="margin:0;background:#09070f;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;"><table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#09070f;padding:32px 16px;"><tr><td align="center"><table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:560px;background:linear-gradient(145deg,#120d1d,#0b0812);border:1px solid rgba(168,85,247,.28);border-radius:24px;overflow:hidden;"><tr><td style="padding:32px;"><div style="display:inline-flex;align-items:center;gap:10px;background:rgba(139,92,246,.14);border:1px solid rgba(168,85,247,.32);padding:10px 14px;border-radius:999px;color:#c4b5fd;font-size:14px;font-weight:700;">SparkDB Beta</div><h1 style="margin:28px 0 12px;font-size:34px;line-height:1.08;letter-spacing:-.02em;">You're in, %s.</h1><p style="margin:0;color:#cbd5e1;font-size:17px;line-height:1.65;">Welcome to the SparkDB beta programme. Your spot has been saved, and we'll communicate the beta date and next steps soon.</p><div style="margin-top:28px;padding:18px;border-radius:18px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);"><p style="margin:0;color:#a78bfa;font-size:13px;text-transform:uppercase;letter-spacing:.08em;font-weight:800;">Registered email</p><p style="margin:8px 0 0;color:#ffffff;font-size:16px;">%s</p></div><p style="margin:28px 0 0;color:#94a3b8;font-size:14px;line-height:1.6;">Thanks for helping shape SparkDB early. We’re building this with beta testers close to the product.</p></td></tr></table></td></tr></table></body></html>`, name, html.EscapeString(t.Email))
}

func timeoutContext(parent context.Context, seconds int) (context.Context, context.CancelFunc) {
	return context.WithTimeout(parent, time.Duration(seconds)*time.Second)
}
