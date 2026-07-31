package handler

import (
	"github.com/Adityaraj-star/devmind-backend/internal/server"
	"github.com/Adityaraj-star/devmind-backend/internal/service"
)

type Handlers struct {
	Health  *HealthHandler
	OpenAPI *OpenAPIHandler
}

func NewHandlers(s *server.Server, services *service.Services) *Handlers {
	return &Handlers{
		Health:  NewHealthHandler(s),
		OpenAPI: NewOpenAPIHandler(s),
	}
}
