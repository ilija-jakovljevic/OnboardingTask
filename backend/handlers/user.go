package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"polling-app/backend/ent"
	"polling-app/backend/ent/user"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"github.com/julienschmidt/httprouter"
)

type UserHandler struct {
	Client *ent.Client
}

var jwtKey = []byte("ustokljc") //temp

func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	u, err := h.Client.User.
		Create().
		SetUsername(req.Username).
		SetPassword(req.Password).
		Save(context.Background())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(u)
}

func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {

	w.Header().Set("Access-Control-Allow-Origin", "*") //for testing purposes
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	u, err := h.Client.User.
		Query().
		Where(user.UsernameEQ(req.Username), user.PasswordEQ(req.Password)).
		Only(context.Background())
	if err != nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  u.ID,
		"username": u.Username,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		http.Error(w, "could not create token", http.StatusInternalServerError)
		return
	}
	log.Printf("User %s logged in successfully", u.Username)

	json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
}
