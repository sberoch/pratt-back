CREATE TABLE "candidate_candidate_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidate_id" integer NOT NULL,
	"file_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "candidate_candidate_files" ADD CONSTRAINT "candidate_candidate_files_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_candidate_files" ADD CONSTRAINT "candidate_candidate_files_file_id_candidate_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."candidate_files"("id") ON DELETE cascade ON UPDATE no action;