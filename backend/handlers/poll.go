package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"polling-app/backend/ent"

	"polling-app/backend/ent/poll"
	"polling-app/backend/ent/user"
	"polling-app/backend/ent/vote"
	"strconv"

	"github.com/julienschmidt/httprouter"
)

type PollHandler struct {
	Client *ent.Client
}
type PollWithVotes struct {
	ID            int            `json:"id"`
	Question      string         `json:"question"`
	Options       []string       `json:"options"`
	Votes         map[string]int `json:"votes"`
	HasVoted      bool           `json:"hasVoted"`
	UserIsCreator bool           `json:"userIsCreator"`
}

func (pollHandler *PollHandler) isCreator(userID int, pollID int) (bool, error) {
	exists, err := pollHandler.Client.Poll.Query().
		Where(poll.ID(pollID), poll.HasCreatorWith(user.ID(userID))).
		Exist(context.Background())

	return exists, err
}

func (pollHandler *PollHandler) hasVoted(userID int, pollID int) (bool, error) {
	exists, err := pollHandler.Client.Vote.Query().
		Where(
			vote.HasPollWith(poll.ID(pollID)),
			vote.HasUserWith(user.ID(userID)),
		).
		Exist(context.Background())

	return exists, err
}

func (pollHandler *PollHandler) getVotes(pollID int) (map[string]int, error) {
	votes := make(map[string]int)
	voteEntities, err := pollHandler.Client.Vote.Query().
		Where(vote.HasPollWith(poll.ID(pollID))).
		All(context.Background())
	if err != nil {
		return nil, err
	}
	for _, v := range voteEntities {
		votes[v.Option]++
	}
	return votes, nil

}
func (pollHandler *PollHandler) getPollFromParams(ps httprouter.Params) (*ent.Poll, error) {
	idStr := ps.ByName("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return nil, errors.New("invalid poll ID")
	}

	pollInstance, err := pollHandler.Client.Poll.Query().
		Where(poll.ID(id)).
		Only(context.Background())
	if err != nil {
		return nil, err
	}
	return pollInstance, nil
}

func (ph *PollHandler) getPollData(userID, pollID int) (hasVoted bool, isCreator bool, votes map[string]int, err error) {
	hasVoted, err = ph.hasVoted(userID, pollID)
	if err != nil {
		return
	}
	isCreator, err = ph.isCreator(userID, pollID)
	if err != nil {
		return
	}
	votes, err = ph.getVotes(pollID)
	return
}

func (pollHandler *PollHandler) CreatePoll(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	log.Println("CreatePoll called")

	userID, err := userIDFromToken(r, &w)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	var req struct {
		Question string   `json:"question"`
		Options  []string `json:"options"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	votes := make(map[string]int)
	for _, option := range req.Options {
		votes[option] = 0
	}

	poll, err := pollHandler.Client.Poll.
		Create().
		SetQuestion(req.Question).
		SetOptions(req.Options).
		SetVotenums(votes).
		SetCreatorID(userID).
		Save(context.Background())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(poll)
}

func (pollHandler *PollHandler) ListPolls(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	log.Println("ListPolls called")

	userID, err := userIDFromToken(r, &w)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	polls, err := pollHandler.Client.Poll.Query().All(context.Background())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var result []PollWithVotes
	for _, pollInstance := range polls {

		hasVoted, isCreator, votes, err := pollHandler.getPollData(userID, pollInstance.ID)
		if err != nil {
			http.Error(w, "Internal error", http.StatusInternalServerError)
			return
		}

		log.Printf("User %d is creator of poll %d: %v", userID, pollInstance.ID, isCreator)
		result = append(result, PollWithVotes{
			ID:            pollInstance.ID,
			Question:      pollInstance.Question,
			Options:       pollInstance.Options,
			Votes:         votes,
			HasVoted:      hasVoted,
			UserIsCreator: isCreator,
		})
	}

	json.NewEncoder(w).Encode(result)
}

func (pollHandler *PollHandler) GetPoll(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {

	log.Println("GetPoll called")

	pollInstance, err := pollHandler.getPollFromParams(ps)

	if err != nil {
		if ent.IsNotFound(err) {
			http.Error(w, "Poll not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	json.NewEncoder(w).Encode(pollInstance)
}

func (pollHandler *PollHandler) Delete(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	pollInstance, err := pollHandler.getPollFromParams(ps)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	_, err = pollHandler.Client.Vote.
		Delete().
		Where(vote.HasPollWith(poll.ID(pollInstance.ID))).
		Exec(context.Background())
	if err != nil {
		http.Error(w, "Failed to delete votes", http.StatusInternalServerError)
		return
	}

	userID, err := userIDFromToken(r, &w)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	isCreator, err := pollHandler.isCreator(userID, pollInstance.ID)
	if err != nil || !isCreator {

		http.Error(w, "You are not the creator", http.StatusNotFound)
		return
	}

	err = pollHandler.Client.Poll.DeleteOneID(pollInstance.ID).Exec(context.Background())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int{"deleted_id": pollInstance.ID})
}

func (pollHandler *PollHandler) VotePoll(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {

	var voteReq struct {
		Option string `json:"option"`
	}
	err := json.NewDecoder(r.Body).Decode(&voteReq)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	userID, err := userIDFromToken(r, &w)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	pollInstance, err := pollHandler.getPollFromParams(ps)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	hasVoted, isCreator, _, err := pollHandler.getPollData(userID, pollInstance.ID)
	if err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}
	if hasVoted {
		http.Error(w, "User already voted", http.StatusBadRequest)
		return
	}

	_, err = pollHandler.Client.Vote.
		Create().
		SetUserID(userID).
		SetPollID(pollInstance.ID).
		SetOption(voteReq.Option).
		Save(r.Context())

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	votes, err := pollHandler.getVotes(pollInstance.ID)
	if err != nil {
		http.Error(w, "Failed to get votes", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(PollWithVotes{
		ID:            pollInstance.ID,
		Question:      pollInstance.Question,
		Options:       pollInstance.Options,
		Votes:         votes,
		HasVoted:      true,
		UserIsCreator: isCreator,
	})

}
