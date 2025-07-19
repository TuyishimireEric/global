ALTER TABLE "Session" RENAME TO "sessions";--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "Session_UserId_Users_id_fk";
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_UserId_Users_id_fk" FOREIGN KEY ("UserId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;