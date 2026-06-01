package main

import (
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"crypto/rand"
	"crypto/sha256"

	"github.com/google/uuid"
	"github.com/resend/resend-go/v3"
	"github.com/sswtshoo/evergote/backend/internal/auth"
	"github.com/sswtshoo/evergote/backend/internal/database"
)

func (cfg *apiConfig) handleSendResetLink(w http.ResponseWriter, req *http.Request) {
	type ResetPasswordParams struct {
		Email string `json:"email"`
	}

	resetParam := ResetPasswordParams{}

	decoder := json.NewDecoder(req.Body)
	err := decoder.Decode(&resetParam)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "error decoding email params", err)
		return
	}

	w.WriteHeader(http.StatusOK)

	user, err := cfg.DBQueries.GetUserByEmail(req.Context(), resetParam.Email)
	if err != nil {
		fmt.Printf("[reset] user not found: %v\n", err)
		return
	}

	rawBytes := make([]byte, 32)
	if _, err = rand.Read(rawBytes); err != nil {
		fmt.Printf("[reset] rand error: %v\n", err)
		return
	}
	rawToken := hex.EncodeToString(rawBytes)

	hashBytes := sha256.Sum256([]byte(rawToken))
	tokenHash := hex.EncodeToString(hashBytes[:])

	_, err = cfg.DBQueries.CreateResetPasswordToken(req.Context(), database.CreateResetPasswordTokenParams{
		ID:        uuid.New(),
		UserID:    user.ID,
		TokenHash: tokenHash,
		ExpiresAt: time.Now().Add(time.Hour),
	})
	if err != nil {
		fmt.Printf("[reset] token insert error: %v\n", err)
		return
	}
	fmt.Printf("[reset] token created\n")

	resetUrl := fmt.Sprintf("%s/reset-password?token=%s", cfg.AppUrl, rawToken)
	fmt.Printf("[reset] reset url: %s\n", resetUrl)

	client := resend.NewClient(cfg.ResendAPIKey)

	params := &resend.SendEmailRequest{
		From:    "Evergote <no-reply@evergote.xyz>",
		To:      []string{user.Email},
		Subject: "Your password reset link",
		Html: fmt.Sprintf(`
            <p>Hi %s,</p>
            <p>Click the link below to reset your password. It expires in 1 hour.</p>
            <p><a href="%s">Reset password</a></p>
            <p>If you didn't request this, you can ignore this email.</p>
        `, user.Name, resetUrl),
	}

	_, err = client.Emails.Send(params)
	if err != nil {
		fmt.Printf("[reset] resend error: %v\n", err)
		return
	}

	fmt.Printf("[reset] email sent successfully to %s\n", user.Email)
}

func (cfg *apiConfig) handleResetPassword(w http.ResponseWriter, req *http.Request) {
	type Request struct {
		Token       string `json:"token"`
		NewPassword string `json:"new_password"`
	}

	r := Request{}
	if err := json.NewDecoder(req.Body).Decode(&r); err != nil {
		respondWithError(w, http.StatusBadRequest, "error decoding request params", err)
		return
	}

	hashBytes := sha256.Sum256([]byte(r.Token))
	tokenHash := hex.EncodeToString(hashBytes[:])

	resetToken, err := cfg.DBQueries.GetResetPasswordToken(req.Context(), tokenHash)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid or expired token", err)
		return
	}
	if resetToken.UsedAt.Valid {
		respondWithError(w, http.StatusBadRequest, "token has already been used", err)
		return
	}
	if time.Now().After(resetToken.ExpiresAt) {
		respondWithError(w, http.StatusBadRequest, "token has expired", err)
		return
	}

	hashedPassword, err := auth.HashPassword(r.NewPassword)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "error hashing password", err)
		return
	}

	err = cfg.DBQueries.UpdateUserPassword(req.Context(), database.UpdateUserPasswordParams{
		ID:             resetToken.UserID,
		HashedPassword: hashedPassword,
		UpdatedAt:      time.Now().UTC(),
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "error updating user password", err)
		return
	}

	_ = cfg.DBQueries.MarkTokenAsUsed(req.Context(), database.MarkTokenAsUsedParams{
		TokenHash: tokenHash,
		UsedAt:    sql.NullTime{Time: time.Now(), Valid: true},
	})

	respondWithJson(w, http.StatusOK, map[string]string{"message": "password updated"})
}
