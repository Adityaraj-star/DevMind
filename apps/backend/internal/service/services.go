package service

import (
	"github.com/Adityaraj-star/DevMind/apps/backend/internal/lib/job"
	"github.com/Adityaraj-star/DevMind/apps/backend/internal/repository"
	"github.com/Adityaraj-star/DevMind/apps/backend/internal/server"
)

type Services struct {
	Auth *AuthService
	Job  *job.JobService
}

func NewServices(s *server.Server, repos *repository.Repositories) (*Services, error) {
	authService := NewAuthService(s)

	return &Services{
		Job:  s.Job,
		Auth: authService,
	}, nil
}
