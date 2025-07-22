ALTER TABLE "candidates" ADD COLUMN "countries" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "provinces" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "candidates" ADD COLUMN "languages" text[] DEFAULT '{}';

UPDATE "candidates"
SET
  "countries" = ARRAY["country"],
  "provinces" = CASE WHEN "province" IS NOT NULL THEN ARRAY["province"] ELSE '{}'::text[] END,
  "languages" = ARRAY["language"];