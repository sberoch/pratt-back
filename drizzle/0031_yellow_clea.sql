ALTER TABLE "candidates" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;