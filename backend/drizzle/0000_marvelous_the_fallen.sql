CREATE TYPE "public"."priority_level" AS ENUM('Low', 'Medium', 'High');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('To-Do', 'In Progress', 'Done');--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" varchar(12) PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"priority_level" "priority_level" NOT NULL,
	"status" "status" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(12) PRIMARY KEY NOT NULL,
	"uId" varchar(255) NOT NULL,
	"token" varchar,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"username" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_uId_unique" UNIQUE("uId"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_uId_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("uId") ON DELETE cascade ON UPDATE no action;