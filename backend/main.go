package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/sswtshoo/evergote/backend/internal/database"

	_ "github.com/lib/pq"
)

type apiConfig struct {
	Secret       string
	ServerPort   string
	DBQueries    *database.Queries
	DBUrl        string
	AppUrl       string
	ResendAPIKey string
}

func main() {
	godotenv.Load(".env")

	port := os.Getenv("SERVER_PORT")
	if port == "" {
		log.Fatal("server port not set in env")
	}

	appUrl := os.Getenv("APP_URL")
	if appUrl == "" {
		log.Fatal("app url not set in env")
	}

	resendApiKey := os.Getenv("RESEND_API_KEY")
	if resendApiKey == "" {
		log.Fatal("resend api key not set in env")
	}

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Fatal("error getting jwt secret")
	}
	dbUrl := os.Getenv("DB_URL")
	db, err := sql.Open("postgres", dbUrl)
	if err != nil {
		log.Fatalf("error opening a new database connection: %s", err)
	}
	dbQueries := database.New(db)
	cfg := apiConfig{
		ServerPort:   port,
		DBQueries:    dbQueries,
		DBUrl:        dbUrl,
		Secret:       secret,
		AppUrl:       appUrl,
		ResendAPIKey: resendApiKey,
	}
	mux := http.NewServeMux()
	assetPath := "./assets"
	imgHandler := http.StripPrefix("/", http.FileServer(http.Dir(assetPath)))
	mux.Handle("/", imgHandler)

	mux.HandleFunc("POST /api/signup", cfg.handleCreateUser)
	mux.HandleFunc("POST /api/login", cfg.handleLoginUser)
	mux.HandleFunc("POST /api/logout", cfg.handleLogoutUser)
	mux.HandleFunc("POST /api/notes", cfg.handleCreateNotes)
	mux.HandleFunc("POST /api/refresh", cfg.handleRefreshJWT)
	mux.HandleFunc("GET /api/notes", cfg.handleReturnNotes)
	mux.HandleFunc("PUT /api/notes", cfg.handleUpdateNotes)
	mux.HandleFunc("GET /api/link-preview", cfg.handlePreview)
	mux.HandleFunc("DELETE /api/notes", cfg.handeDeleteNotesByID)
	mux.HandleFunc("POST /api/reset-password", cfg.handleResetPassword)
	mux.HandleFunc("POST /api/forgot-password", cfg.handleSendResetLink)

	srv := &http.Server{
		Addr:    ":" + cfg.ServerPort,
		Handler: middlewareCors(mux),
	}
	log.Printf("server listening on http://localhost%s", srv.Addr)
	log.Fatal(srv.ListenAndServe())
}
