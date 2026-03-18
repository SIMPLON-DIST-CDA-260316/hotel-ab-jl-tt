CREATE TYPE "public"."amenity_scope" AS ENUM('property', 'room', 'both');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('confirmed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('unread', 'read', 'replied');--> statement-breakpoint
CREATE TYPE "public"."inquiry_subject" AS ENUM('complaint', 'extra_service', 'suite_info', 'app_issue');--> statement-breakpoint
CREATE TYPE "public"."pricing_model" AS ENUM('per_person_per_night', 'per_night', 'per_person_per_stay', 'per_stay', 'per_unit');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'manager', 'client');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "amenity" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"category" text NOT NULL,
	"scope" "amenity_scope" NOT NULL,
	"icon" text,
	CONSTRAINT "amenity_name_unique" UNIQUE("name"),
	CONSTRAINT "amenity_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "booking" (
	"id" text PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"check_in" date NOT NULL,
	"check_out" date NOT NULL,
	"guest_count" integer NOT NULL,
	"price_per_night" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"status" "booking_status" DEFAULT 'confirmed' NOT NULL,
	"cancelled_at" timestamp,
	"client_id" text NOT NULL,
	"suite_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "booking_reference_unique" UNIQUE("reference"),
	CONSTRAINT "booking_dates_valid" CHECK ("booking"."check_out" > "booking"."check_in"),
	CONSTRAINT "booking_price_per_night_positive" CHECK ("booking"."price_per_night" > 0),
	CONSTRAINT "booking_total_price_positive" CHECK ("booking"."total_price" > 0),
	CONSTRAINT "booking_guest_count_positive" CHECK ("booking"."guest_count" > 0)
);
--> statement-breakpoint
CREATE TABLE "booking_option" (
	"booking_id" text NOT NULL,
	"option_id" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	CONSTRAINT "booking_option_booking_id_option_id_pk" PRIMARY KEY("booking_id","option_id"),
	CONSTRAINT "booking_option_quantity_positive" CHECK ("booking_option"."quantity" > 0),
	CONSTRAINT "booking_option_unit_price_non_negative" CHECK ("booking_option"."unit_price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "establishment" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"postal_code" text NOT NULL,
	"city" text NOT NULL,
	"description" text,
	"image" text,
	"phone" text,
	"email" text,
	"check_in_time" time NOT NULL,
	"check_out_time" time NOT NULL,
	"manager_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "establishment_amenity" (
	"establishment_id" text NOT NULL,
	"amenity_id" text NOT NULL,
	CONSTRAINT "establishment_amenity_establishment_id_amenity_id_pk" PRIMARY KEY("establishment_id","amenity_id")
);
--> statement-breakpoint
CREATE TABLE "establishment_option" (
	"establishment_id" text NOT NULL,
	"option_id" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"included" boolean DEFAULT false NOT NULL,
	CONSTRAINT "establishment_option_establishment_id_option_id_pk" PRIMARY KEY("establishment_id","option_id")
);
--> statement-breakpoint
CREATE TABLE "image" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"alt" text,
	"position" integer NOT NULL,
	"suite_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "image_suite_position_unique" UNIQUE("suite_id","position")
);
--> statement-breakpoint
CREATE TABLE "inquiry" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" "inquiry_subject" NOT NULL,
	"message" text NOT NULL,
	"status" "inquiry_status" DEFAULT 'unread' NOT NULL,
	"establishment_id" text,
	"user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "option" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text,
	"pricing_model" "pricing_model" NOT NULL,
	"default_price" numeric(10, 2) NOT NULL,
	CONSTRAINT "option_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "review" (
	"id" text PRIMARY KEY NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"flagged" boolean DEFAULT false NOT NULL,
	"booking_id" text NOT NULL,
	"user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "review_booking_id_unique" UNIQUE("booking_id"),
	CONSTRAINT "review_rating_range" CHECK ("review"."rating" BETWEEN 1 AND 5)
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "suite" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"main_image" text NOT NULL,
	"capacity" integer NOT NULL,
	"area" numeric(6, 2),
	"establishment_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "suite_price_positive" CHECK ("suite"."price" > 0),
	CONSTRAINT "suite_capacity_positive" CHECK ("suite"."capacity" > 0)
);
--> statement-breakpoint
CREATE TABLE "suite_amenity" (
	"suite_id" text NOT NULL,
	"amenity_id" text NOT NULL,
	CONSTRAINT "suite_amenity_suite_id_amenity_id_pk" PRIMARY KEY("suite_id","amenity_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "role" DEFAULT 'client' NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_client_id_user_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_suite_id_suite_id_fk" FOREIGN KEY ("suite_id") REFERENCES "public"."suite"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_option" ADD CONSTRAINT "booking_option_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_option" ADD CONSTRAINT "booking_option_option_id_option_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."option"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "establishment" ADD CONSTRAINT "establishment_manager_id_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "establishment_amenity" ADD CONSTRAINT "establishment_amenity_establishment_id_establishment_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "establishment_amenity" ADD CONSTRAINT "establishment_amenity_amenity_id_amenity_id_fk" FOREIGN KEY ("amenity_id") REFERENCES "public"."amenity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "establishment_option" ADD CONSTRAINT "establishment_option_establishment_id_establishment_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "establishment_option" ADD CONSTRAINT "establishment_option_option_id_option_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."option"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image" ADD CONSTRAINT "image_suite_id_suite_id_fk" FOREIGN KEY ("suite_id") REFERENCES "public"."suite"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_establishment_id_establishment_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suite" ADD CONSTRAINT "suite_establishment_id_establishment_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishment"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suite_amenity" ADD CONSTRAINT "suite_amenity_suite_id_suite_id_fk" FOREIGN KEY ("suite_id") REFERENCES "public"."suite"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suite_amenity" ADD CONSTRAINT "suite_amenity_amenity_id_amenity_id_fk" FOREIGN KEY ("amenity_id") REFERENCES "public"."amenity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "booking_client_id_idx" ON "booking" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "booking_suite_id_idx" ON "booking" USING btree ("suite_id");--> statement-breakpoint
CREATE INDEX "establishment_manager_id_idx" ON "establishment" USING btree ("manager_id");--> statement-breakpoint
CREATE INDEX "image_suite_id_idx" ON "image" USING btree ("suite_id");--> statement-breakpoint
CREATE INDEX "inquiry_establishment_id_idx" ON "inquiry" USING btree ("establishment_id");--> statement-breakpoint
CREATE INDEX "inquiry_user_id_idx" ON "inquiry" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "review_booking_id_idx" ON "review" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "suite_establishment_id_idx" ON "suite" USING btree ("establishment_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");