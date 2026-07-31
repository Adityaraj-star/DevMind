package repository

import "github.com/Adityaraj-star/DevMind/apps/backend/internal/server"

type Repositories struct{}

func NewRepositories(s *server.Server) *Repositories {
	return &Repositories{}
}
