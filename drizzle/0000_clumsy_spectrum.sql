CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"date" date NOT NULL,
	"time" varchar(10),
	"notes" text,
	"reminder_minutes_before" integer DEFAULT 30,
	"archived" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"date" date NOT NULL,
	"time" varchar(10),
	"reminder_minutes_before" integer,
	"archived" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "occasions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"date" date NOT NULL,
	"time" varchar(10),
	"notes" text,
	"reminder_minutes_before" integer DEFAULT 30,
	"recurring" boolean DEFAULT false,
	"archived" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"date" date NOT NULL,
	"time" varchar(10),
	"notes" text,
	"reminder_time" varchar(10),
	"reminder_minutes_before" integer DEFAULT 30,
	"completed" boolean DEFAULT false,
	"archived" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"gender" varchar(20),
	"birth_date" date,
	"job_title" text,
	"employer" text,
	"city" text,
	"language" varchar(10) DEFAULT 'ar',
	"theme" varchar(20) DEFAULT 'dark',
	"accent_color" varchar(20) DEFAULT 'indigo',
	"birthday_reminder_days" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vacations" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" varchar(20) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"days" integer NOT NULL,
	"notes" text,
	"reminder_days_before" integer DEFAULT 1,
	"archived" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
