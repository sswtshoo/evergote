-- name: CreateNote :one
INSERT INTO notes (id, content, user_id, created_at, updated_at)
VALUES (
    $1,
    $2,
    $3,
    $4,
    $4
) RETURNING *;

-- name: DeleteNote :exec
DELETE FROM notes 
WHERE id = $1;

-- name: GetNotesByID :many
SELECT * FROM notes
WHERE user_id = $1
ORDER BY updated_at DESC;

-- name: UpdateNoteByID :exec
UPDATE notes
SET content = $2, updated_at = $3
WHERE id = $1;