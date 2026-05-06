package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/sswtshoo/evergote/backend/internal/auth"
	"github.com/sswtshoo/evergote/backend/internal/database"
)

func (cfg *apiConfig) handleCreateUser(w http.ResponseWriter, req *http.Request) {
	type userParameters struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		Name     string `json:"name"`
	}

	userParams := userParameters{}
	decoder := json.NewDecoder(req.Body)
	err := decoder.Decode(&userParams)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "error decoding user params", err)
		return
	}

	hashedPassword, err := auth.HashPassword(userParams.Password)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "error hashing user password", err)
		return
	}

	newUser, err := cfg.DBQueries.CreateUser(req.Context(), database.CreateUserParams{
		ID:             uuid.New(),
		Name:           userParams.Name,
		Email:          userParams.Email,
		HashedPassword: hashedPassword,
		CreatedAt:      time.Now().UTC(),
		UpdatedAt:      time.Now().UTC(),
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "error creating user in the database", err)
		return
	}

	accessToken, err := auth.MakeJWT(newUser.ID, cfg.Secret, time.Hour)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "error creating jwt", err)
		return
	}

	refreshToken, _ := auth.MakeRefreshToken()

	expiresAt := time.Now().Add(time.Hour * 24 * 30)
	_, err = cfg.DBQueries.CreateRefreshToken(req.Context(), database.CreateRefreshTokenParams{
		Token:     refreshToken,
		UserID:    newUser.ID,
		CreatedAt: time.Now(),
		ExpiresAt: expiresAt,
	})

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "error creating adding refresh token to the database", err)
		return
	}

	auth.SetAuthCookies(w, accessToken, refreshToken)

	respondWithJson(w, http.StatusOK, evergoteLoginUser{
		ID:        newUser.ID,
		Name:      newUser.Name,
		Email:     newUser.Email,
		CreatedAt: newUser.CreatedAt,
		UpdatedAt: newUser.UpdatedAt,
	})
}

func (cfg *apiConfig) handleLogoutUser(w http.ResponseWriter, req *http.Request) {
	/*
		revoke refresh token
		set access and refresh token in cookies to null
	*/
}
