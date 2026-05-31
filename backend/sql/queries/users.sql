-- name: CreateUser :one
INSERT INTO users (id, email, hashed_password, name, created_at, updated_at)
VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6
) RETURNING *;

-- name: GetUserByID :one
SELECT * FROM users
WHERE id = $1;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1;

-- name: UpdateUserPassword :exec
UPDATE users
SET hashed_password = $1, updated_at = $2
WHERE id = $3;
