ALTER TABLE "comments" RENAME COLUMN "name" TO "candidate_id";--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "created_at" SET DEFAULT now();