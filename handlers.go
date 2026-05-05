package main

import (
	"crypto/subtle"
	"database/sql"
	"errors"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func HealthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, HealthResponse{Status: "ok"})
}

func ReadyHandler(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := timeoutContext(c.Request.Context(), 3)
		defer cancel()
		if err := db.PingContext(ctx); err != nil {
			c.JSON(http.StatusServiceUnavailable, HealthResponse{Status: "unavailable"})
			return
		}
		c.JSON(http.StatusOK, HealthResponse{Status: "ready"})
	}
}

func SlotsHandler(db *sql.DB, cfg Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := timeoutContext(c.Request.Context(), 3)
		defer cancel()
		slots, err := GetSlots(ctx, db, cfg.Slots)
		if err != nil {
			log.Printf("beta slots lookup failed: %v", err)
			c.JSON(http.StatusInternalServerError, MessageResponse{Message: "Could not load beta slots right now."})
			return
		}
		c.JSON(http.StatusOK, slots)
	}
}

func SignupHandler(db *sql.DB, cfg Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input BetaSignupRequest
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, MessageResponse{Message: "Send full name, email, and profession as JSON."})
			return
		}
		req, err := NormalizeSignup(input)
		if err != nil {
			c.JSON(http.StatusBadRequest, MessageResponse{Message: err.Error()})
			return
		}
		ctx, cancel := timeoutContext(c.Request.Context(), 6)
		defer cancel()
		tester, err := CreateBetaTester(ctx, db, req)
		if err != nil {
			if errors.Is(err, ErrDuplicateEmail) {
				c.JSON(http.StatusConflict, MessageResponse{Message: "This email is already on the beta list."})
				return
			}
			log.Printf("beta signup insert failed: %v", err)
			c.JSON(http.StatusInternalServerError, MessageResponse{Message: "Could not join the beta list right now."})
			return
		}
		go func(t BetaTester) {
			if err := SendWelcomeEmail(cfg, t); err != nil {
				log.Printf("beta welcome email failed for %s: %v", t.Email, err)
			}
		}(tester)
		slots, err := GetSlots(c.Request.Context(), db, cfg.Slots)
		if err != nil {
			log.Printf("beta slots lookup failed after signup: %v", err)
		}
		c.JSON(http.StatusCreated, SignupResponse{
			Message: "You're on the SparkDB beta list.",
			Tester:  tester,
			Slots:   slots,
		})
	}
}

func CandidatesHandler(db *sql.DB, cfg Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		if cfg.AdminKey == "" || subtle.ConstantTimeCompare([]byte(c.GetHeader("X-Admin-Key")), []byte(cfg.AdminKey)) != 1 {
			c.JSON(http.StatusUnauthorized, MessageResponse{Message: "Unauthorized."})
			return
		}
		ctx, cancel := timeoutContext(c.Request.Context(), 5)
		defer cancel()
		candidates, err := GetCandidates(ctx, db)
		if err != nil {
			log.Printf("beta candidates lookup failed: %v", err)
			c.JSON(http.StatusInternalServerError, MessageResponse{Message: "Could not load beta candidates right now."})
			return
		}
		c.JSON(http.StatusOK, CandidatesResponse{Count: len(candidates), Candidates: candidates})
	}
}
