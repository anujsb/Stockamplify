CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"nextauth_id" varchar(100) NOT NULL,
	"username" varchar(100),
	"email" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_login" timestamp,
	CONSTRAINT "users_nextauth_id_unique" UNIQUE("nextauth_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
