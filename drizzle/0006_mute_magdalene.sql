CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" integer NOT NULL,
	"comment" text NOT NULL,
	"created_at" date NOT NULL,
	"user_id" integer NOT NULL
);
