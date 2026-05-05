package main

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg, err := LoadConfig()
	if err != nil {
		log.Fatal(err)
	}
	db, err := ConnDB(cfg)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	App = cfg
	DB = db
	router := NewRouter(cfg, db)
	server := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}
	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGTERM)
	go func() {
		log.Printf("spark beta api listening on :%s", cfg.Port)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatal(err)
		}
	}()
	<-done
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		log.Fatal(err)
	}
}

func NewRouter(cfg Config, db *sql.DB) *gin.Engine {
	if strings.EqualFold(env("GIN_MODE", ""), "release") {
		gin.SetMode(gin.ReleaseMode)
	}
	router := gin.New()
	if err := router.SetTrustedProxies(nil); err != nil {
		log.Fatal(err)
	}
	router.Use(gin.Logger(), gin.Recovery(), bodyLimit(32<<10), corsMiddleware(cfg))
	router.GET("/", HealthHandler)
	router.GET("/health", HealthHandler)
	router.GET("/ready", ReadyHandler(db))
	router.GET("/api/beta/slots", SlotsHandler(db, cfg))
	router.GET("/api/beta/candidates", CandidatesHandler(db, cfg))
	router.POST("/api/beta-testers", SignupHandler(db, cfg))
	router.POST("/api/beta/signup", SignupHandler(db, cfg))
	return router
}

func bodyLimit(limit int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, limit)
		c.Next()
	}
}

func corsMiddleware(cfg Config) gin.HandlerFunc {
	allowed := map[string]struct{}{
		"http://localhost:3000":    {},
		"http://localhost:3112":    {},
		"http://localhost:5173":    {},
		"https://sparkdb.pro":      {},
		"https://www.sparkdb.pro":  {},
		"https://beta.sparkdb.pro": {},
	}
	for _, origin := range cfg.Allowed {
		allowed[origin] = struct{}{}
	}
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		if _, ok := allowed[origin]; ok {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Vary", "Origin")
			c.Header("Access-Control-Allow-Credentials", "true")
			c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
			c.Header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		}
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}
