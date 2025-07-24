package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"polling-app/backend/ent"
	"polling-app/backend/routes"
	"strings"

	_ "github.com/lib/pq"
)

func main() {
	client, err := ent.Open("postgres", "host=localhost port=5432 user=ilija dbname=poll password=123 sslmode=disable")
	if err != nil {
		log.Fatalf("failed opening connection to postgres: %v", err)
	}
	defer client.Close()
	if err := client.Schema.Create(context.Background()); err != nil {
		log.Fatalf("failed creating schema resources: %v", err)
	}

	mux := http.NewServeMux()

	// API routes
	apiRouter := routes.InitializeRoutes(client)
	mux.Handle("/api/", http.StripPrefix("/api", apiRouter))

	// Static files (React build)
	staticDir := filepath.Join(".", "frontend-build")
	fs := http.FileServer(http.Dir(staticDir))

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// If the request is for /api/, do NOT serve static files
		if strings.HasPrefix(r.URL.Path, "/api/") {
			http.NotFound(w, r)
			return
		}
		// If the file exists, serve it
		path := filepath.Join(staticDir, r.URL.Path)
		if info, err := os.Stat(path); err == nil && !info.IsDir() {
			fs.ServeHTTP(w, r)
			return
		}
		// Otherwise, serve index.html (for React Router)
		http.ServeFile(w, r, filepath.Join(staticDir, "index.html"))
	})

	log.Fatal(http.ListenAndServe(":8080", mux))
}
