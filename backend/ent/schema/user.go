package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// User holds the schema definition for the User entity.
type User struct {
	ent.Schema
}

// Fields of the User.
func (User) Fields() []ent.Field {
	return []ent.Field{
		field.String("username").Unique(),
		field.String("password"),
	}
}

func (User) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("polls", Poll.Type),
		edge.To("votes", Vote.Type),
	}
}
