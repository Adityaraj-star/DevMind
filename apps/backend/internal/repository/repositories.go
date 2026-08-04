package repository

import "github.com/Adityaraj-star/DevMind/apps/backend/internal/server"

type Repositories struct {
	Users *UserRepository
}

func NewRepositories(s *server.Server) *Repositories {
	return &Repositories{
		Users: NewUserRepository(s.DB.Pool),
	}
}
