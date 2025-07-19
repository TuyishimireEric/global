CREATE TABLE "Session" (
	"SessionToken" varchar PRIMARY KEY NOT NULL,
	"UserId" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Session" ADD CONSTRAINT "Session_UserId_Users_id_fk" FOREIGN KEY ("UserId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;