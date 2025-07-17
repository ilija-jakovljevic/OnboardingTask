package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type Vote struct {
	ent.Schema
}

func (Vote) Fields() []ent.Field {
	return []ent.Field{
		field.String("option"),
	}
}

func (Vote) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).Ref("votes").Unique().Required(),
		edge.From("poll", Poll.Type).Ref("votes").Unique().Required(),
	}
}
