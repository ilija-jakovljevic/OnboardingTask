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

	router.GET("/polls", h.ListPolls)

	router.POST("/polls", h.CreatePoll)
	router.GET("/polls/:id", h.GetPoll)
	router.POST("/polls/:id/vote", h.VotePoll)
	router.POST("/polls/:id/delete", h.Delete)

	router.POST("/register", uh.Register)
	router.POST("/login", uh.Login)

	return router
}
