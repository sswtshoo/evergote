package main

import (
	"database/sql"
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
		respondWithError(w, http.StatusInternalServerError, "error adding refresh token to the database", err)
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

func (cfg *apiConfig) handleLoginUser(w http.ResponseWriter, req *http.Request) {
	type userParams struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	userParameters := userParams{}
	decoder := json.NewDecoder(req.Body)
	if err := decoder.Decode(&userParameters); err != nil {
		respondWithError(w, http.StatusBadRequest, "error decoding request params", err)
		return
	}

	user, err := cfg.DBQueries.GetUserByEmail(req.Context(), userParameters.Email)
	if err != nil {
		respondWithError(w, http.StatusNotFound, "user not found in the database", err)
		return
	}

	err = auth.CheckPasswordHash(userParameters.Password, user.HashedPassword)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "wrong password", err)
		return
	}

	accessToken, err := auth.MakeJWT(user.ID, cfg.Secret, time.Hour)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "error creating jwt", err)
		return
	}

	refreshToken, _ := auth.MakeRefreshToken()

	currentRefreshToken, err := cfg.DBQueries.GetRefreshTokenByID(req.Context(), user.ID)
	if err != nil {
		respondWithError(w, http.StatusNotFound, "refresh token doesn't exist on database", err)
		return
	}
	err = cfg.DBQueries.RevokeRefreshToken(req.Context(), database.RevokeRefreshTokenParams{
		Token:     currentRefreshToken.Token,
		RevokedAt: sql.NullTime{Time: time.Now(), Valid: true},
	})

	expirestAt := time.Now().Add(time.Hour * 24 * 30)
	_, err = cfg.DBQueries.CreateRefreshToken(req.Context(), database.CreateRefreshTokenParams{
		Token:     refreshToken,
		UserID:    user.ID,
		CreatedAt: time.Now(),
		ExpiresAt: expirestAt,
	})

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "error adding refresht token to the database", err)
		return
	}

	auth.SetAuthCookies(w, accessToken, refreshToken)
	respondWithJson(w, http.StatusOK, evergoteLoginUser{
		ID:        user.ID,
		Name:      user.Name,
		Email:     user.Email,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	})
}

func (cfg *apiConfig) handleLogoutUser(w http.ResponseWriter, req *http.Request) {
	_, err := cfg.returnUserID(w, req)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "invalid access token or user doesn't exist", err)
		return
	}

	refreshToken, err := auth.GetRefreshToken(req)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "error fetching refresh token from cookie", err)
		return
	}

	err = cfg.DBQueries.RevokeRefreshToken(req.Context(), database.RevokeRefreshTokenParams{
		Token:     refreshToken,
		RevokedAt: sql.NullTime{Time: time.Now(), Valid: true},
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "error revoking refresh token in the database", err)
		return
	}

	auth.DeleteAuthCookies(w)

	w.WriteHeader(http.StatusOK)
}
