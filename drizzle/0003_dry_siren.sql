CREATE TABLE "candidate_areas" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidate_id" integer NOT NULL,
	"area_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidate_industries" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidate_id" integer NOT NULL,
	"industry_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidate_seniorities" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidate_id" integer NOT NULL,
	"seniority_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "candidates" DROP CONSTRAINT "candidates_seniority_id_seniorities_id_fk";
--> statement-breakpoint
ALTER TABLE "candidates" DROP CONSTRAINT "candidates_area_id_areas_id_fk";
--> statement-breakpoint
ALTER TABLE "candidates" DROP CONSTRAINT "candidates_industry_id_industries_id_fk";
--> statement-breakpoint
ALTER TABLE "candidate_areas" ADD CONSTRAINT "candidate_areas_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_areas" ADD CONSTRAINT "candidate_areas_area_id_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_industries" ADD CONSTRAINT "candidate_industries_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_industries" ADD CONSTRAINT "candidate_industries_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_seniorities" ADD CONSTRAINT "candidate_seniorities_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_seniorities" ADD CONSTRAINT "candidate_seniorities_seniority_id_seniorities_id_fk" FOREIGN KEY ("seniority_id") REFERENCES "public"."seniorities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidates" DROP COLUMN "seniority_id";--> statement-breakpoint
ALTER TABLE "candidates" DROP COLUMN "area_id";--> statement-breakpoint
ALTER TABLE "candidates" DROP COLUMN "industry_id";