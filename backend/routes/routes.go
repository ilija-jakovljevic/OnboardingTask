package routes

import (
	"polling-app/backend/ent"
	"polling-app/backend/handlers"

	"github.com/julienschmidt/httprouter"
)

func InitializeRoutes(client *ent.Client) *httprouter.Router {
	router := httprouter.New()
	h := &handlers.PollHandler{Client: client}
	uh := &handlers.UserHandler{Client: client}

	router.GET("/api/polls", h.ListPolls)

	router.POST("/api/polls", h.CreatePoll)
	router.GET("/api/polls/:id", h.GetPoll)
	router.POST("/api/polls/:id/vote", h.VotePoll)
	router.POST("/api/polls/:id/delete", h.Delete)

	router.POST("/api/register", uh.Register)
	router.POST("/api/login", uh.Login)

	return router
}
