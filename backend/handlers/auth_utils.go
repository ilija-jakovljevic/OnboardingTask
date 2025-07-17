package handlers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

func userIDFromToken(r *http.Request, w *http.ResponseWriter) (int, error) {

	authHeader := r.Header.Get("Authorization")
	if authHeader == "missing token" || !strings.HasPrefix(authHeader, "Bearer ") {
		return -1, errors.New("missing")
	}
	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})
	if err != nil || !token.Valid {
		http.Error(*w, "invalid token", http.StatusUnauthorized)
		return -1, errors.New("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		http.Error(*w, "invalid token claims", http.StatusUnauthorized)
		return -1, errors.New("invalid token")

	}
	userIDFloat, ok := claims["user_id"].(float64)
	if !ok {
		http.Error(*w, "invalid user_id in token", http.StatusUnauthorized)
		return -1, errors.New("invalid user_id in token")
	}
	userID := int(userIDFloat)

	return userID, nil
}
