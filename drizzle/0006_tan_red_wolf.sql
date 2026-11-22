CREATE TABLE "kravhendelse" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "kravhendelse_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"vegobjekttype_id" integer NOT NULL,
	"beskrivelse" text NOT NULL,
	"tidspunkt" timestamp with time zone DEFAULT now() NOT NULL,
	"utfort_av" text,
	CONSTRAINT "kravhendelse_beskrivelse_lengde" CHECK (char_length("kravhendelse"."beskrivelse") <= 300)
);
--> statement-breakpoint
ALTER TABLE "kravhendelse" ADD CONSTRAINT "kravhendelse_utfort_av_user_id_fk" FOREIGN KEY ("utfort_av") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "kravhendelse_vegobjekttype_tidspunkt_idx" ON "kravhendelse" USING btree ("vegobjekttype_id","tidspunkt");