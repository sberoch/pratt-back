ALTER TABLE "candidates" ADD COLUMN "province" text;--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "language" text DEFAULT 'Español';--> statement-breakpoint
ALTER TABLE "candidates" DROP COLUMN "document_number";