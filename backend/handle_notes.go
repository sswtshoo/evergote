package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/sswtshoo/evergote/backend/internal/auth"
	"github.com/sswtshoo/evergote/backend/internal/database"
)

func (cfg *apiConfig) handleCreateNotes(w http.ResponseWriter, req *http.Request) {
	type notesParameters struct {
		Content string `json:"content"`
	}

	accessToken, err := auth.GetAccessToken(req)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "error getting access token from request", err)
		return
	}

	userID, err := auth.ValidateJWT(accessToken, cfg.Secret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "invalid access token", err)
		return
	}

	user, err := cfg.DBQueries.GetUserByID(req.Context(), userID)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "user not found", err)
		auth.DeleteAuthCookies(w)
		return
	}

	notesParams := notesParameters{}
	decoder := json.NewDecoder(req.Body)
	if err := decoder.Decode(&notesParams); err != nil {
		respondWithError(w, http.StatusBadRequest, "error decoding json", err)
		return
	}

	_, err = cfg.DBQueries.CreateNote(req.Context(), database.CreateNoteParams{
		ID:        uuid.New(),
		Content:   notesParams.Content,
		CreatedAt: time.Now().UTC(),
		UserID:    user.ID,
	})

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "error creating note", err)
		return
	}
	respondWithJson(w, http.StatusOK, "")
}

func (cfg *apiConfig) handleReturnNotes(w http.ResponseWriter, req *http.Request) {
	accessToken, err := auth.GetAccessToken(req)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "access token not found in request", err)
		return
	}

	userID, err := auth.ValidateJWT(accessToken, cfg.Secret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "token invalid or expired", err)
		return
	}

	notes, err := cfg.DBQueries.GetNotesByID(req.Context(), userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "error fetching notes from the database", err)
		return
	}

	notesFrontend := make([]evergoteNote, len(notes))
	for i, note := range notes {
		notesFrontend[i] = evergoteNote{
			ID:        note.ID.String(),
			Content:   note.Content,
			CreatedAt: note.CreatedAt.Format(time.RFC3339),
			UpdatedAt: note.UpdatedAt.Format(time.RFC3339),
		}
	}
	respondWithJson(w, http.StatusOK, notesFrontend)
}

func (cfg *apiConfig) handleUpdateNotes(w http.ResponseWriter, req *http.Request) {
	type updateNoteParams struct {
		ID      uuid.UUID       `json:"id"`
		Title   string          `json:"title"`
		Content json.RawMessage `json:"content"`
	}

	accessToken, err := auth.GetAccessToken(req)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "error getting access token from request", err)
		return
	}

	_, err = auth.ValidateJWT(accessToken, cfg.Secret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "invalid access token", err)
		return
	}
	noteParams := updateNoteParams{}

	decoder := json.NewDecoder(req.Body)
	if err := decoder.Decode(&noteParams); err != nil {
		respondWithError(w, http.StatusBadRequest, "error decoding request params", err)
		return
	}

	err = cfg.DBQueries.UpdateNoteByID(req.Context(), database.UpdateNoteByIDParams{
		ID:        noteParams.ID,
		Content:   string(noteParams.Content),
		UpdatedAt: time.Now().UTC(),
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "error updating note", err)
		return
	}

	respondWithJson(w, http.StatusOK, nil)
}
