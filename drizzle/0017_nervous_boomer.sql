CREATE TABLE "candidate_vacancies" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidate_id" integer NOT NULL,
	"vacancy_id" integer NOT NULL,
	"candidate_vacancy_status_id" integer NOT NULL,
	"notes" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vacancies" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status_id" integer,
	"vacancy_filters_id" integer,
	"company_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vacancy_filters" (
	"id" serial PRIMARY KEY NOT NULL,
	"min_stars" numeric,
	"gender" text,
	"min_age" integer,
	"max_age" integer
);
--> statement-breakpoint
CREATE TABLE "vacancy_filters_areas" (
	"id" serial PRIMARY KEY NOT NULL,
	"vacancy_filters_id" integer NOT NULL,
	"area_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vacancy_filters_industries" (
	"id" serial PRIMARY KEY NOT NULL,
	"vacancy_filters_id" integer NOT NULL,
	"industry_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vacancy_filters_seniorities" (
	"id" serial PRIMARY KEY NOT NULL,
	"vacancy_filters_id" integer NOT NULL,
	"seniority_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "candidate_vacancies" ADD CONSTRAINT "candidate_vacancies_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_vacancies" ADD CONSTRAINT "candidate_vacancies_vacancy_id_vacancies_id_fk" FOREIGN KEY ("vacancy_id") REFERENCES "public"."vacancies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_vacancies" ADD CONSTRAINT "candidate_vacancies_candidate_vacancy_status_id_candidate_vacancy_statuses_id_fk" FOREIGN KEY ("candidate_vacancy_status_id") REFERENCES "public"."candidate_vacancy_statuses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vacancies" ADD CONSTRAINT "vacancies_status_id_vacancy_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."vacancy_statuses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vacancies" ADD CONSTRAINT "vacancies_vacancy_filters_id_vacancy_filters_id_fk" FOREIGN KEY ("vacancy_filters_id") REFERENCES "public"."vacancy_filters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vacancies" ADD CONSTRAINT "vacancies_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vacancy_filters_areas" ADD CONSTRAINT "vacancy_filters_areas_vacancy_filters_id_vacancy_filters_id_fk" FOREIGN KEY ("vacancy_filters_id") REFERENCES "public"."vacancy_filters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vacancy_filters_areas" ADD CONSTRAINT "vacancy_filters_areas_area_id_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vacancy_filters_industries" ADD CONSTRAINT "vacancy_filters_industries_vacancy_filters_id_vacancy_filters_id_fk" FOREIGN KEY ("vacancy_filters_id") REFERENCES "public"."vacancy_filters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vacancy_filters_industries" ADD CONSTRAINT "vacancy_filters_industries_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vacancy_filters_seniorities" ADD CONSTRAINT "vacancy_filters_seniorities_vacancy_filters_id_vacancy_filters_id_fk" FOREIGN KEY ("vacancy_filters_id") REFERENCES "public"."vacancy_filters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vacancy_filters_seniorities" ADD CONSTRAINT "vacancy_filters_seniorities_seniority_id_seniorities_id_fk" FOREIGN KEY ("seniority_id") REFERENCES "public"."seniorities"("id") ON DELETE cascade ON UPDATE no action;