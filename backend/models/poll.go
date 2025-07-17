package models

type Poll struct {
	ID       string         `json:"id"`
	Question string         `json:"question"`
	Options  []string       `json:"options"`
	Votes    map[string]int `json:"votes"`
}

func NewPoll(id, question string, options []string) *Poll {
	votes := make(map[string]int)
	for _, option := range options {
		votes[option] = 0
	}
	return &Poll{
		ID:       id,
		Question: question,
		Options:  options,
		Votes:    votes,
	}
}

func (p *Poll) Vote(option string) {
	p.Votes[option]++
}

type Vote struct {
	Option string `json:"option"`
}
