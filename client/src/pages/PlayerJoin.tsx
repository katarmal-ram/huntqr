import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TeamSelection } from "@/components/TeamSelection";
import { Disclaimer } from "@/components/Disclaimer";
import { Trophy, User } from "lucide-react";
import type { Session, Team } from "@shared/schema";

export default function PlayerJoin() {
  const [, setLocation] = useLocation();
  const [playerName, setPlayerName] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const { data: session } = useQuery<Session>({
    queryKey: ["/api/session"],
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
    enabled: !!session,
  });

  const handleJoinTeam = async () => {
    if (!playerName.trim() || !selectedTeamId) return;

    try {
      const response = await fetch("/api/player/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName, teamId: selectedTeamId }),
      });
      
      if (response.ok) {
        setLocation("/game");
      }
    } catch (error) {
      console.error("Failed to join team:", error);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md">
          <p className="text-muted-foreground text-lg">
            No active session. Please wait for the admin to create a session.
          </p>
        </Card>
      </div>
    );
  }

  if (session.status === "ended") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md">
          <Trophy className="h-16 w-16 mx-auto mb-4 text-jackpot" />
          <h2 className="text-2xl font-bold mb-2">Session Ended</h2>
          <p className="text-muted-foreground">
            This session has concluded. Please wait for a new session to begin.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-center">
            QR Risk Hunt
          </h1>
          <Disclaimer />
        </div>

        <Card className="p-6 md:p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">{session.name}</h2>
            <p className="text-muted-foreground">
              Timer: {Math.floor(session.timerSeconds / 60)} minutes
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="player-name">Your Nickname</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="player-name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your nickname"
                  className="pl-10"
                  maxLength={30}
                  data-testid="input-player-name"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Select Your Team</Label>
              <TeamSelection
                teams={teams}
                onSelect={setSelectedTeamId}
                disabled={!playerName.trim()}
              />
            </div>

            <Button
              onClick={handleJoinTeam}
              disabled={!playerName.trim() || !selectedTeamId}
              className="w-full h-12 text-lg"
              data-testid="button-join-game"
            >
              Join Game
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
