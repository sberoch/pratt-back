CREATE TABLE "areas" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"image" text,
	"date_of_birth" date,
	"gender" text,
	"short_description" text,
	"email" text NOT NULL,
	"linkedin" text,
	"address" text,
	"document_number" text,
	"phone" text,
	"source_id" integer,
	"seniority_id" integer,
	"area_id" integer,
	"industry_id" integer,
	"stars" integer,
	"blacklisted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "candidate_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidate_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "industries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seniorities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_source_id_candidate_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."candidate_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_seniority_id_seniorities_id_fk" FOREIGN KEY ("seniority_id") REFERENCES "public"."seniorities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_area_id_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;