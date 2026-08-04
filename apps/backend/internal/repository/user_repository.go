package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/Adityaraj-star/DevMind/apps/backend/internal/model"
)

type UserRepository struct {
	pool *pgxpool.Pool
}

func NewUserRepository(pool *pgxpool.Pool) *UserRepository {
	return &UserRepository{pool: pool}
}

// UpsertByClerkID creates the user row on first sign-in, or updates the
// cached profile fields (email/github username/avatar can change on the
// provider's side) on every subsequent sign-in.
func (r *UserRepository) UpsertByClerkID(
	ctx context.Context,
	clerkUserID, email string,
	githubUsername, avatarURL *string,
) (*model.User, error) {
	const query = `
		INSERT INTO users (clerk_user_id, email, github_username, avatar_url)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (clerk_user_id) DO UPDATE SET
			email = EXCLUDED.email,
			github_username = EXCLUDED.github_username,
			avatar_url = EXCLUDED.avatar_url,
			updated_at = now()
		RETURNING id, clerk_user_id, email, github_username, avatar_url, created_at, updated_at
	`

	var u model.User
	err := r.pool.QueryRow(ctx, query, clerkUserID, email, githubUsername, avatarURL).Scan(
		&u.ID, &u.ClerkUserID, &u.Email, &u.GitHubUsername, &u.AvatarURL, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// GetByClerkID returns nil, nil (not an error) when no matching user exists yet -
// callers decide whether that's expected (e.g. first request before sync).
func (r *UserRepository) GetByClerkID(ctx context.Context, clerkUserID string) (*model.User, error) {
	const query = `
		SELECT id, clerk_user_id, email, github_username, avatar_url, created_at, updated_at
		FROM users
		WHERE clerk_user_id = $1
	`

	var u model.User
	err := r.pool.QueryRow(ctx, query, clerkUserID).Scan(
		&u.ID, &u.ClerkUserID, &u.Email, &u.GitHubUsername, &u.AvatarURL, &u.CreatedAt, &u.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}