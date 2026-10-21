CREATE TYPE "public"."contact_status" AS ENUM('new', 'contacted', 'qualified', 'won', 'lost', 'paused');--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"specialty" text,
	"city" text,
	"clinic" text,
	"source" text,
	"phones" text,
	"phone_key" text,
	"whatsapp" text,
	"whatsapp_key" text,
	"instagram" text,
	"instagram_key" text,
	"status" "contact_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contacts_owner_idx" ON "contacts" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "contacts_owner_phone_key_idx" ON "contacts" USING btree ("owner_id","phone_key");--> statement-breakpoint
CREATE INDEX "contacts_owner_instagram_key_idx" ON "contacts" USING btree ("owner_id","instagram_key");