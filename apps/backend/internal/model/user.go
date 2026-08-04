package model

type User struct {
	Base
	ClerkUserID    string  `json:"clerkUserId" db:"clerk_user_id"`
	Email          string  `json:"email" db:"email"`
	GitHubUsername *string `json:"githubUsername" db:"github_username"`
	AvatarURL      *string `json:"avatarUrl" db:"avatar_url"`
}