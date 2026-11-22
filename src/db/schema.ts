import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const egenskapskrav = pgTable(
  "egenskapskrav",
  {
    vegobjekttypeId: integer("vegobjekttype_id").notNull(),
    egenskapstypeId: integer("egenskapstype_id").notNull(),
    kreves: boolean("kreves").notNull().default(false),
    beskrivelse: text("beskrivelse"),
    oppdatert: timestamp("oppdatert", { withTimezone: true }).notNull().defaultNow(),
    oppdatertAv: text("oppdatert_av").references(() => user.id, { onDelete: "set null" }),
  },
  (t) => [
    primaryKey({ columns: [t.vegobjekttypeId, t.egenskapstypeId] }),
    check("egenskapskrav_beskrivelse_lengde", sql`char_length(${t.beskrivelse}) <= 1000`),
  ],
);

export const objekttypekrav = pgTable(
  "objekttypekrav",
  {
    vegobjekttypeId: integer("vegobjekttype_id").primaryKey(),
    fkb: boolean("fkb").notNull().default(false),
    fkbKommentar: text("fkb_kommentar"),
    tilleggsinformasjon: text("tilleggsinformasjon"),
    elektro: boolean("elektro").notNull().default(false),
    oppdatert: timestamp("oppdatert", { withTimezone: true }).notNull().defaultNow(),
    oppdatertAv: text("oppdatert_av").references(() => user.id, { onDelete: "set null" }),
  },
  (t) => [
    check("objekttypekrav_fkb_kommentar_lengde", sql`char_length(${t.fkbKommentar}) <= 1000`),
    check(
      "objekttypekrav_tilleggsinformasjon_lengde",
      sql`char_length(${t.tilleggsinformasjon}) <= 2000`,
    ),
  ],
);

export const kravhendelse = pgTable(
  "kravhendelse",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    vegobjekttypeId: integer("vegobjekttype_id").notNull(),
    beskrivelse: text("beskrivelse").notNull(),
    tidspunkt: timestamp("tidspunkt", { withTimezone: true }).notNull().defaultNow(),
    utfortAv: text("utfort_av").references(() => user.id, { onDelete: "set null" }),
  },
  (t) => [
    index("kravhendelse_vegobjekttype_tidspunkt_idx").on(t.vegobjekttypeId, t.tidspunkt),
    check("kravhendelse_beskrivelse_lengde", sql`char_length(${t.beskrivelse}) <= 300`),
  ],
);
