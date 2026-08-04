package service

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/clerk/clerk-sdk-go/v2"
	clerkuser "github.com/clerk/clerk-sdk-go/v2/user"
	"github.com/Adityaraj-star/DevMind/apps/backend/internal/errs"
	"github.com/Adityaraj-star/DevMind/apps/backend/internal/model"
	"github.com/Adityaraj-star/DevMind/apps/backend/internal/repository"
	"github.com/Adityaraj-star/DevMind/apps/backend/internal/server"
)

// githubProviderID is Clerk's identifier for the GitHub social connection.
// Verify this against your Clerk dashboard (Configure > SSO connections)
// if GetGitHubAccessToken starts returning 404/not-found errors - Clerk's
// provider IDs follow the "oauth_<provider>" convention but aren't
// guaranteed stable across SDK versions.
const githubProviderID = "oauth_github"

type AuthService struct {
	server     *server.Server
	users      *repository.UserRepository
	httpClient *http.Client
}

func NewAuthService(s *server.Server, users *repository.UserRepository) *AuthService {
	clerk.SetKey(s.Config.Auth.SecretKey)
	return &AuthService{
		server:     s,
		users:      users,
		httpClient: &http.Client{},
	}
}

// SyncUser upserts the local user row from Clerk's copy of the user's
// profile. Call this on every authenticated request (or at minimum on
// first sign-in) since email/github username/avatar can change on
// Clerk's or GitHub's side without DevMind being notified.
func (a *AuthService) SyncUser(ctx context.Context, clerkUserID string) (*model.User, error) {
	clerkUser, err := clerkuser.Get(ctx, clerkUserID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user from Clerk: %w", err)
	}

	email := primaryEmail(clerkUser)
	githubUsername, avatarURL := githubIdentity(clerkUser)

	user, err := a.users.UpsertByClerkID(ctx, clerkUserID, email, githubUsername, avatarURL)
	if err != nil {
		return nil, fmt.Errorf("failed to sync user to database: %w", err)
	}

	return user, nil
}

// GetGitHubAccessToken retrieves the user's GitHub OAuth access token via
// Clerk's Backend API, so DevMind can call the GitHub API server-side
// under the user's own rate limit (5,000 req/hr) instead of the shared
// unauthenticated limit (60 req/hr).
//
// Requires GitHub to be configured as a social connection in the Clerk
// dashboard with at least "public_repo" (or "repo") scope requested -
// without that scope, GitHub will issue a token but it won't be able to
// read repository contents.
func (a *AuthService) GetGitHubAccessToken(ctx context.Context, clerkUserID string) (string, error) {
	url := fmt.Sprintf("https://api.clerk.com/v1/users/%s/oauth_access_tokens/%s", clerkUserID, githubProviderID)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return "", fmt.Errorf("failed to build Clerk oauth token request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+a.server.Config.Auth.SecretKey)

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to call Clerk oauth token endpoint: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read Clerk oauth token response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", errs.NewBadRequestError(
			"Could not retrieve GitHub access token - the user may not have signed in with GitHub, "+
				"or the connection may need reauthorization",
			true, nil, nil, nil,
		)
	}

	var tokens struct {
		Data []struct {
			Token string `json:"token"`
		} `json:"data"`
	}
	if err := json.Unmarshal(body, &tokens); err != nil {
		return "", fmt.Errorf("failed to parse Clerk oauth token response: %w", err)
	}

	if len(tokens.Data) == 0 || tokens.Data[0].Token == "" {
		return "", errs.NewNotFoundError("No GitHub token found for this user", false, nil)
	}

	return tokens.Data[0].Token, nil
}

func primaryEmail(u *clerk.User) string {
	for _, e := range u.EmailAddresses {
		if u.PrimaryEmailAddressID != nil && e.ID == *u.PrimaryEmailAddressID {
			return e.EmailAddress
		}
	}
	if len(u.EmailAddresses) > 0 {
		return u.EmailAddresses[0].EmailAddress
	}
	return ""
}

func githubIdentity(u *clerk.User) (username, avatarURL *string) {
	for _, acc := range u.ExternalAccounts {
		if acc.Provider == githubProviderID {
			if acc.Username != nil {
				username = acc.Username
			}
			if acc.AvatarURL != "" {
				url := acc.AvatarURL
				avatarURL = &url
			}
			return username, avatarURL
		}
	}
	return nil, nil
}
