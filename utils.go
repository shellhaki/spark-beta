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
	msg.SetHeader("Subject", "You are on the SparkDB beta list")
	msg.SetBody("text/plain", welcomeText(tester))
	msg.AddAlternative("text/html", welcomeHTML(tester))
	return gomail.NewDialer("smtp.gmail.com", 587, cfg.SMTPEmail, cfg.SMTPPass).DialAndSend(msg)
}

func SendAdminSignupEmail(cfg Config, tester BetaTester) error {
	if cfg.NotifyEmail == "" {
		return nil
	}
	msg := gomail.NewMessage()
	msg.SetHeader("From", cfg.SMTPEmail)
	msg.SetHeader("To", cfg.NotifyEmail)
	msg.SetHeader("Subject", "New SparkDB beta signup")
	msg.SetBody("text/plain", adminSignupText(tester))
	msg.AddAlternative("text/html", adminSignupHTML(tester))
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
	return fmt.Sprintf("Hi %s,\n\nYou are on the SparkDB beta list.\n\nWe will send the beta date and next steps soon.\n\nSparkDB", name)
}

func welcomeHTML(t BetaTester) string {
	name := html.EscapeString(t.FullName)
	if name == "" {
		name = "there"
	}
	return fmt.Sprintf(`<!doctype html><html><body style="margin:0;background:#f7f7f4;color:#111;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;"><table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="padding:28px 14px;"><tr><td align="center"><table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#fffffc;border:1px solid #deded7;border-radius:10px;"><tr><td style="padding:28px;"><p style="margin:0 0 18px;color:#777;font-size:12px;letter-spacing:.12em;text-transform:uppercase;">SparkDB beta</p><h1 style="margin:0 0 14px;font-size:24px;line-height:1.25;font-weight:700;">You are on the beta list, %s.</h1><p style="margin:0;color:#555;font-size:14px;line-height:1.7;">We will send the beta date and next steps soon.</p><p style="margin:22px 0 0;color:#777;font-size:13px;">%s</p></td></tr></table></td></tr></table></body></html>`, name, html.EscapeString(t.Email))
}

func adminSignupText(t BetaTester) string {
	return fmt.Sprintf("New SparkDB beta signup\n\nName: %s\nEmail: %s\nRole: %s\nCreated: %s", t.FullName, t.Email, t.Profession, t.CreatedAt.Format(time.RFC3339))
}

func adminSignupHTML(t BetaTester) string {
	return fmt.Sprintf(`<!doctype html><html><body style="margin:0;background:#f7f7f4;color:#111;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;"><table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="padding:28px 14px;"><tr><td align="center"><table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#fffffc;border:1px solid #deded7;border-radius:10px;"><tr><td style="padding:28px;"><p style="margin:0 0 18px;color:#777;font-size:12px;letter-spacing:.12em;text-transform:uppercase;">New beta signup</p><h1 style="margin:0 0 18px;font-size:22px;line-height:1.25;">%s</h1><p style="margin:0 0 8px;color:#555;font-size:14px;">Email: %s</p><p style="margin:0 0 8px;color:#555;font-size:14px;">Role: %s</p><p style="margin:0;color:#777;font-size:13px;">Created: %s</p></td></tr></table></td></tr></table></body></html>`, html.EscapeString(t.FullName), html.EscapeString(t.Email), html.EscapeString(t.Profession), html.EscapeString(t.CreatedAt.Format(time.RFC3339)))
}

func timeoutContext(parent context.Context, seconds int) (context.Context, context.CancelFunc) {
	return context.WithTimeout(parent, time.Duration(seconds)*time.Second)
}
