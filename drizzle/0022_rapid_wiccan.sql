CREATE TYPE "public"."movementStatus" AS ENUM('Activo', 'Prospect');--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "status" "movementStatus" NOT NULL;