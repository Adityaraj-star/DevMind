package handler

import (
	"github.com/Adityaraj-star/DevMind/apps/backend/internal/server"
	"github.com/Adityaraj-star/DevMind/apps/backend/internal/service"
)

type Handlers struct {
	Health  *HealthHandler
	OpenAPI *OpenAPIHandler
	Auth    *AuthHandler
}

func NewHandlers(s *server.Server, services *service.Services) *Handlers {
	return &Handlers{
		Health:  NewHealthHandler(s),
		OpenAPI: NewOpenAPIHandler(s),
		Auth:    NewAuthHandler(NewHandler(s), services.Auth),
	}
}
