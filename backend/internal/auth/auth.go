package auth

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type TokenType string

const (
	TokenTypeAccess   TokenType = "evergote-access"
	CookieTypeRefresh TokenType = "refresh_token"
	CookieTypeAccess  TokenType = "access_token"
)

var ErrNoAuthHeaderIncluded = errors.New("no auth header included in request")

func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

func CheckPasswordHash(password, hash string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
}

func MakeJWT(
	userID uuid.UUID,
	tokenSecret string,
	expiresIn time.Duration,
) (string, error) {
	signingKey := []byte(tokenSecret)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.RegisteredClaims{
		Issuer:    string(TokenTypeAccess),
		IssuedAt:  jwt.NewNumericDate(time.Now().UTC()),
		ExpiresAt: jwt.NewNumericDate(time.Now().UTC().Add(expiresIn)),
		Subject:   userID.String(),
	})
	return token.SignedString(signingKey)
}

func ValidateJWT(tokenString, tokenSecret string) (uuid.UUID, error) {
	claimsStruct := jwt.RegisteredClaims{}
	token, err := jwt.ParseWithClaims(
		tokenString,
		&claimsStruct,
		func(token *jwt.Token) (interface{}, error) { return []byte(tokenSecret), nil },
	)
	if err != nil {
		return uuid.Nil, err
	}

	userIDString, err := token.Claims.GetSubject()
	if err != nil {
		return uuid.Nil, err
	}

	issuer, err := token.Claims.GetIssuer()
	if err != nil {
		return uuid.Nil, err
	}
	if issuer != string(TokenTypeAccess) {
		return uuid.Nil, errors.New("invalid issuer")
	}

	userID, err := uuid.Parse(userIDString)
	if err != nil {
		return uuid.Nil, fmt.Errorf("invalid user: %s", err)
	}

	return userID, nil
}

func MakeRefreshToken() (string, error) {
	key := make([]byte, 32)
	rand.Read(key)
	encodedString := hex.EncodeToString(key)
	return encodedString, nil
}

func GetAccessToken(req *http.Request) (string, error) {
	cookie, err := req.Cookie(string(CookieTypeAccess))
	if err != nil {
		return "", err
	}
	return cookie.Value, nil
}

func GetRefreshToken(req *http.Request) (string, error) {
	cookie, err := req.Cookie(string(CookieTypeRefresh))
	if err != nil {
		return "", err
	}
	return cookie.Value, nil
}

func SetAuthCookies(w http.ResponseWriter, accessToken, refreshToken string) {
	isProd := os.Getenv("ENV") == "production"

	http.SetCookie(w, &http.Cookie{
		Name:     string(CookieTypeAccess),
		Value:    accessToken,
		HttpOnly: true,
		Secure:   isProd,
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(time.Hour),
	})

	http.SetCookie(w, &http.Cookie{
		Name:     string(CookieTypeRefresh),
		Value:    refreshToken,
		HttpOnly: true,
		Secure:   isProd,
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(time.Hour * 24 * 30),
	})
}

func DeleteAuthCookies(w http.ResponseWriter) {
	isProd := os.Getenv("ENV") == "production"

	http.SetCookie(w, &http.Cookie{
		Name:     string(CookieTypeAccess),
		Value:    "",
		HttpOnly: true,
		Secure:   isProd,
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(-100 * time.Hour),
	})

	http.SetCookie(w, &http.Cookie{
		Name:     string(CookieTypeRefresh),
		Value:    "",
		HttpOnly: true,
		Secure:   isProd,
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(-100 * time.Hour),
	})
}
