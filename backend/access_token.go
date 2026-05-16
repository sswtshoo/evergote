package main

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/sswtshoo/evergote/backend/internal/auth"
)

func (cfg *apiConfig) returnUserID(w http.ResponseWriter, req *http.Request) (uuid.UUID, error) {
	accessToken, err := auth.GetAccessToken(req)
	if err != nil {
		return uuid.Nil, err
	}

	userID, err := auth.ValidateJWT(accessToken, cfg.Secret)

	return userID, err
}
