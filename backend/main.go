package main

import (
	"context"
	"log"
	"net/http"
	"polling-app/backend/ent"
	"polling-app/backend/routes"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	client, err := ent.Open("sqlite3", "file:poll.db?_fk=1")
	if err != nil {
		log.Fatalf("failed opening connection to sqlite: %v", err)
	}
	defer client.Close()
	if err := client.Schema.Create(context.Background()); err != nil {
		log.Fatalf("failed creating schema resources: %v", err)
	}

	router := routes.InitializeRoutes(client)
	log.Fatal(http.ListenAndServe(":8080", router))
}
