import {
  sessions,
  codes,
  teams,
  players,
  scans,
  type Session,
  type InsertSession,
  type Code,
  type InsertCode,
  type Team,
  type InsertTeam,
  type Player,
  type InsertPlayer,
  type Scan,
  type InsertScan,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Sessions
  getActiveSession(): Promise<Session | undefined>;
  getSession(id: string): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: string, updates: Partial<Session>): Promise<Session>;

  // Codes
  getSessionCodes(sessionId: string): Promise<Code[]>;
  getCode(id: string): Promise<Code | undefined>;
  getCodeByString(sessionId: string, codeString: string): Promise<Code | undefined>;
  createCode(code: InsertCode): Promise<Code>;
  updateCode(id: string, updates: Partial<Code>): Promise<Code>;
  deleteCode(id: string): Promise<void>;

  // Teams
  getSessionTeams(sessionId: string): Promise<Team[]>;
  getTeam(id: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, updates: Partial<Team>): Promise<Team>;

  // Players
  getSessionPlayers(sessionId: string): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;

  // Scans
  getSessionScans(sessionId: string): Promise<Scan[]>;
  createScan(scan: InsertScan): Promise<Scan>;
}

export class DatabaseStorage implements IStorage {
  // Sessions
  async getActiveSession(): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.status, "active"))
      .limit(1);
    
    if (!session) {
      const [setupSession] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.status, "setup"))
        .orderBy(desc(sessions.createdAt))
        .limit(1);
      return setupSession || undefined;
    }
    
    return session || undefined;
  }

  async getSession(id: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session || undefined;
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db.insert(sessions).values(insertSession).returning();
    return session;
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session> {
    const [session] = await db
      .update(sessions)
      .set(updates)
      .where(eq(sessions.id, id))
      .returning();
    return session;
  }

  // Codes
  async getSessionCodes(sessionId: string): Promise<Code[]> {
    return db.select().from(codes).where(eq(codes.sessionId, sessionId));
  }

  async getCode(id: string): Promise<Code | undefined> {
    const [code] = await db.select().from(codes).where(eq(codes.id, id));
    return code || undefined;
  }

  async getCodeByString(sessionId: string, codeString: string): Promise<Code | undefined> {
    const [code] = await db
      .select()
      .from(codes)
      .where(and(eq(codes.sessionId, sessionId), eq(codes.codeString, codeString)));
    return code || undefined;
  }

  async createCode(insertCode: InsertCode): Promise<Code> {
    const [code] = await db.insert(codes).values(insertCode).returning();
    return code;
  }

  async updateCode(id: string, updates: Partial<Code>): Promise<Code> {
    const [code] = await db
      .update(codes)
      .set(updates)
      .where(eq(codes.id, id))
      .returning();
    return code;
  }

  async deleteCode(id: string): Promise<void> {
    await db.delete(codes).where(eq(codes.id, id));
  }

  // Teams
  async getSessionTeams(sessionId: string): Promise<Team[]> {
    return db.select().from(teams).where(eq(teams.sessionId, sessionId));
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const [team] = await db.insert(teams).values(insertTeam).returning();
    return team;
  }

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team> {
    const [team] = await db
      .update(teams)
      .set(updates)
      .where(eq(teams.id, id))
      .returning();
    return team;
  }

  // Players
  async getSessionPlayers(sessionId: string): Promise<Player[]> {
    return db.select().from(players).where(eq(players.sessionId, sessionId));
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db.insert(players).values(insertPlayer).returning();
    return player;
  }

  // Scans
  async getSessionScans(sessionId: string): Promise<Scan[]> {
    return db.select().from(scans).where(eq(scans.sessionId, sessionId)).orderBy(scans.createdAt);
  }

  async createScan(insertScan: InsertScan): Promise<Scan> {
    const [scan] = await db.insert(scans).values(insertScan).returning();
    return scan;
  }
}

export const storage = new DatabaseStorage();
