package main

import (
	"net/http"
	"time"

	"github.com/sswtshoo/evergote/backend/internal/auth"
)

func (cfg *apiConfig) handleRefreshJWT(w http.ResponseWriter, req *http.Request) {

	refreshTokenClient, err := auth.GetRefreshToken(req)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "error getting refresh token from request header", err)
		return
	}

	refreshToken, err := cfg.DBQueries.GetRefreshToken(req.Context(), refreshTokenClient)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "refresh token doesn't exist in the database", err)
		return
	}

	if refreshToken.RevokedAt.Valid {
		respondWithError(w, http.StatusUnauthorized, "refresh token has expired", err)
		return
	}

	newToken, err := auth.MakeJWT(refreshToken.UserID, cfg.Secret, time.Hour)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "error creating new access token", err)
		return
	}

	auth.SetAuthCookies(w, newToken, refreshToken.Token)
	w.WriteHeader(http.StatusOK)
}
