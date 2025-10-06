import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Sessions table
export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  status: text("status").notNull().default("setup"), // setup, active, ended
  startAt: timestamp("start_at"),
  endAt: timestamp("end_at"),
  timerSeconds: integer("timer_seconds").notNull().default(900), // 15 minutes
  jackpotPool: integer("jackpot_pool").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Codes table
export const codes = pgTable("codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  codeString: text("code_string").notNull(),
  usedByTeamId: varchar("used_by_team_id"),
  usedAt: timestamp("used_at"),
});

// Teams table
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  totalPoints: integer("total_points").notNull().default(0),
  color: text("color").notNull(), // team-1 through team-5
});

// Players table (users)
export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  teamId: varchar("team_id").references(() => teams.id, { onDelete: "set null" }),
  sessionId: varchar("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("player"), // admin or player
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Scans table
export const scans = pgTable("scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  teamId: varchar("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  playerId: varchar("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  codeId: varchar("code_id").notNull().references(() => codes.id, { onDelete: "cascade" }),
  points: integer("points").notNull(),
  randSeed: real("rand_seed").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Relations
export const sessionsRelations = relations(sessions, ({ many }) => ({
  codes: many(codes),
  teams: many(teams),
  players: many(players),
  scans: many(scans),
}));

export const codesRelations = relations(codes, ({ one, many }) => ({
  session: one(sessions, {
    fields: [codes.sessionId],
    references: [sessions.id],
  }),
  scans: many(scans),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  session: one(sessions, {
    fields: [teams.sessionId],
    references: [sessions.id],
  }),
  players: many(players),
  scans: many(scans),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  team: one(teams, {
    fields: [players.teamId],
    references: [teams.id],
  }),
  session: one(sessions, {
    fields: [players.sessionId],
    references: [sessions.id],
  }),
  scans: many(scans),
}));

export const scansRelations = relations(scans, ({ one }) => ({
  session: one(sessions, {
    fields: [scans.sessionId],
    references: [sessions.id],
  }),
  team: one(teams, {
    fields: [scans.teamId],
    references: [teams.id],
  }),
  player: one(players, {
    fields: [scans.playerId],
    references: [players.id],
  }),
  code: one(codes, {
    fields: [scans.codeId],
    references: [codes.id],
  }),
}));

// Insert schemas
export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
  jackpotPool: true,
});

export const insertCodeSchema = createInsertSchema(codes).omit({
  id: true,
  usedByTeamId: true,
  usedAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  totalPoints: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
});

export const insertScanSchema = createInsertSchema(scans).omit({
  id: true,
  createdAt: true,
});

// Types
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type Code = typeof codes.$inferSelect;
export type InsertCode = z.infer<typeof insertCodeSchema>;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

export type Scan = typeof scans.$inferSelect;
export type InsertScan = z.infer<typeof insertScanSchema>;
