// filepath: /home/ilija/dv/poll/polling-app/backend/ent/schema/poll.go
package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Poll holds the schema definition for the Poll entity.
type Poll struct {
	ent.Schema
}

// Fields of the Poll.
func (Poll) Fields() []ent.Field {
	return []ent.Field{
		field.String("question"),
		field.Strings("options"),
		field.JSON("votenums", map[string]int{}),
	}
}

func (Poll) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("creator", User.Type).
			Ref("polls").
			Unique().
			Required(),
		edge.To("votes", Vote.Type),
	}

}
