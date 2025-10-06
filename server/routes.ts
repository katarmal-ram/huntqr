import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertSessionSchema, insertCodeSchema, insertTeamSchema, insertPlayerSchema } from "@shared/schema";

const sessionJackpotPools = new Map<string, number>();

function jackpotBaitingRandom(sessionId: string): { points: number; randSeed: number } {
  const randSeed = Math.random();
  let jackpot = sessionJackpotPools.get(sessionId) || 0;
  
  const r = Math.random();
  let points: number;
  
  if (r < 0.05 && jackpot > 0) {
    points = Math.min(30, jackpot + Math.floor(Math.random() * 10));
    sessionJackpotPools.set(sessionId, 0);
  } else if (r < 0.75) {
    jackpot = Math.min(30, jackpot + 1);
    sessionJackpotPools.set(sessionId, jackpot);
    const vals = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, -1, -2, -3, -4, -5];
    points = vals[Math.floor(Math.random() * vals.length)];
  } else {
    jackpot = Math.min(30, jackpot + 1);
    sessionJackpotPools.set(sessionId, jackpot);
    points = -10 + Math.floor(Math.random() * 5);
  }
  
  return { points, randSeed };
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const broadcast = (sessionId: string, data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        const message = JSON.stringify({ sessionId, ...data });
        client.send(message);
      }
    });
  };

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  app.get("/api/session", async (req, res) => {
    try {
      const session = await storage.getActiveSession();
      res.json(session || null);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.post("/api/admin/session", async (req, res) => {
    try {
      const data = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(data);
      
      const defaultTeams = [
        { sessionId: session.id, name: "Team Alpha", color: "team-1" },
        { sessionId: session.id, name: "Team Beta", color: "team-2" },
        { sessionId: session.id, name: "Team Gamma", color: "team-3" },
        { sessionId: session.id, name: "Team Delta", color: "team-4" },
        { sessionId: session.id, name: "Team Epsilon", color: "team-5" },
      ];
      
      for (const team of defaultTeams) {
        await storage.createTeam(team);
      }
      
      sessionJackpotPools.set(session.id, 0);
      broadcast(session.id, { type: "session_created", session });
      
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(400).json({ error: "Failed to create session" });
    }
  });

  app.get("/api/admin/session", async (req, res) => {
    try {
      const session = await storage.getActiveSession();
      res.json(session || null);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.post("/api/admin/session/start", async (req, res) => {
    try {
      const session = await storage.getActiveSession();
      if (!session) {
        return res.status(404).json({ error: "No active session" });
      }
      
      const startAt = new Date();
      const endAt = new Date(startAt.getTime() + session.timerSeconds * 1000);
      
      const updated = await storage.updateSession(session.id, {
        status: "active",
        startAt,
        endAt,
      });
      
      broadcast(session.id, { type: "session_started", session: updated });
      res.json(updated);
    } catch (error) {
      console.error("Error starting session:", error);
      res.status(500).json({ error: "Failed to start session" });
    }
  });

  app.post("/api/admin/session/end", async (req, res) => {
    try {
      const session = await storage.getActiveSession();
      if (!session) {
        return res.status(404).json({ error: "No active session" });
      }
      
      const updated = await storage.updateSession(session.id, {
        status: "ended",
        endAt: new Date(),
      });
      
      broadcast(session.id, { type: "session_ended", session: updated });
      res.json(updated);
    } catch (error) {
      console.error("Error ending session:", error);
      res.status(500).json({ error: "Failed to end session" });
    }
  });

  app.get("/api/admin/codes", async (req, res) => {
    try {
      const session = await storage.getActiveSession();
      if (!session) {
        return res.json([]);
      }
      const codes = await storage.getSessionCodes(session.id);
      res.json(codes);
    } catch (error) {
      console.error("Error fetching codes:", error);
      res.status(500).json({ error: "Failed to fetch codes" });
    }
  });

  app.post("/api/admin/codes", async (req, res) => {
    try {
      const session = await storage.getActiveSession();
      if (!session) {
        return res.status(404).json({ error: "No active session" });
      }
      
      const data = insertCodeSchema.parse({
        ...req.body,
        sessionId: session.id,
      });
      
      const code = await storage.createCode(data);
      res.json(code);
    } catch (error) {
      console.error("Error creating code:", error);
      res.status(400).json({ error: "Failed to create code" });
    }
  });

  app.delete("/api/admin/codes/:id", async (req, res) => {
    try {
      await storage.deleteCode(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting code:", error);
      res.status(500).json({ error: "Failed to delete code" });
    }
  });

  app.get("/api/admin/teams", async (req, res) => {
    try {
      const session = await storage.getActiveSession();
      if (!session) {
        return res.json([]);
      }
      const teams = await storage.getSessionTeams(session.id);
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  app.get("/api/admin/scans", async (req, res) => {
    try {
      const session = await storage.getActiveSession();
      if (!session) {
        return res.json([]);
      }
      const scans = await storage.getSessionScans(session.id);
      res.json(scans);
    } catch (error) {
      console.error("Error fetching scans:", error);
      res.status(500).json({ error: "Failed to fetch scans" });
    }
  });

  app.get("/api/teams", async (req, res) => {
    try {
      const session = await storage.getActiveSession();
      if (!session) {
        return res.json([]);
      }
      const teams = await storage.getSessionTeams(session.id);
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  app.post("/api/player/join", async (req, res) => {
    try {
      const { name, teamId } = req.body;
      const session = await storage.getActiveSession();
      
      if (!session) {
        return res.status(404).json({ error: "No active session" });
      }
      
      const player = await storage.createPlayer({
        name,
        teamId,
        sessionId: session.id,
        role: "player",
      });
      
      req.session.playerId = player.id;
      await req.session.save();
      
      broadcast(session.id, { type: "player_joined", player });
      res.json(player);
    } catch (error) {
      console.error("Error joining team:", error);
      res.status(500).json({ error: "Failed to join team" });
    }
  });

  app.get("/api/player/me", async (req, res) => {
    try {
      const playerId = req.session.playerId;
      if (!playerId) {
        return res.status(404).json({ error: "Not logged in" });
      }
      
      const player = await storage.getPlayer(playerId);
      res.json(player || null);
    } catch (error) {
      console.error("Error fetching player:", error);
      res.status(500).json({ error: "Failed to fetch player" });
    }
  });

  app.post("/api/player/scan", async (req, res) => {
    try {
      const { codeString } = req.body;
      const playerId = req.session.playerId;
      
      if (!playerId) {
        return res.status(401).json({ error: "Not logged in" });
      }
      
      const player = await storage.getPlayer(playerId);
      if (!player || !player.teamId) {
        return res.status(400).json({ error: "Invalid player" });
      }
      
      const session = await storage.getActiveSession();
      if (!session || session.status !== "active") {
        return res.status(400).json({ error: "No active session" });
      }
      
      const code = await storage.getCodeByString(session.id, codeString.toUpperCase());
      if (!code) {
        return res.status(404).json({ error: "Code not found" });
      }
      
      if (code.usedByTeamId) {
        return res.status(400).json({ error: "Code already used" });
      }
      
      const { points, randSeed } = jackpotBaitingRandom(session.id);
      
      const scan = await storage.createScan({
        sessionId: session.id,
        teamId: player.teamId,
        playerId: player.id,
        codeId: code.id,
        points,
        randSeed,
      });
      
      await storage.updateCode(code.id, {
        usedByTeamId: player.teamId,
        usedAt: new Date(),
      });
      
      const team = await storage.getTeam(player.teamId);
      if (team) {
        await storage.updateTeam(team.id, {
          totalPoints: team.totalPoints + points,
        });
      }
      
      const updatedTeams = await storage.getSessionTeams(session.id);
      broadcast(session.id, { type: "scan_completed", scan, teams: updatedTeams });
      
      res.json({ points, scan });
    } catch (error) {
      console.error("Error scanning code:", error);
      res.status(500).json({ error: "Failed to scan code" });
    }
  });

  app.get("/api/admin/export-csv", async (req, res) => {
    try {
      const session = await storage.getActiveSession();
      if (!session) {
        return res.status(404).json({ error: "No active session" });
      }
      
      const scans = await storage.getSessionScans(session.id);
      const teams = await storage.getSessionTeams(session.id);
      const players = await storage.getSessionPlayers(session.id);
      
      const teamMap = new Map(teams.map(t => [t.id, t.name]));
      const playerMap = new Map(players.map(p => [p.id, p.name]));
      
      let csv = "Timestamp,Team,Player,Points,Cumulative Points\n";
      
      const teamCumulative = new Map<string, number>();
      teams.forEach(t => teamCumulative.set(t.id, 0));
      
      scans.forEach(scan => {
        const current = teamCumulative.get(scan.teamId) || 0;
        const newTotal = current + scan.points;
        teamCumulative.set(scan.teamId, newTotal);
        
        const row = [
          new Date(scan.createdAt).toISOString(),
          teamMap.get(scan.teamId) || "Unknown",
          playerMap.get(scan.playerId) || "Unknown",
          scan.points,
          newTotal,
        ];
        csv += row.join(",") + "\n";
      });
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="qr-risk-hunt-${session.name}.csv"`);
      res.send(csv);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      res.status(500).json({ error: "Failed to export CSV" });
    }
  });

  return httpServer;
}
