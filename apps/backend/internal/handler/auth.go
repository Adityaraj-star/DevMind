package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/Adityaraj-star/DevMind/apps/backend/internal/model"
	"github.com/Adityaraj-star/DevMind/apps/backend/internal/service"
)

type AuthHandler struct {
	Handler
	authService *service.AuthService

	// GetMe is registered directly as a route handler (see router.go),
	// same pattern as h.Health.CheckHealth.
	GetMe echo.HandlerFunc
}

// emptyRequest satisfies validation.Validatable for handlers with no
// request body to bind/validate.
type emptyRequest struct{}

func (emptyRequest) Validate() error { return nil }

func NewAuthHandler(h Handler, authService *service.AuthService) *AuthHandler {
	ah := &AuthHandler{Handler: h, authService: authService}

	ah.GetMe = Handle(h, func(c echo.Context, _ emptyRequest) (*model.User, error) {
		clerkUserID, _ := c.Get("user_id").(string)
		return authService.SyncUser(c.Request().Context(), clerkUserID)
	}, http.StatusOK, emptyRequest{})

	return ah
}