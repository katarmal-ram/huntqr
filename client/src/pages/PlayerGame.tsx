import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CodeEntry } from "@/components/CodeEntry";
import { QRScanner } from "@/components/QRScanner";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { ScoreReveal } from "@/components/ScoreReveal";
import { Leaderboard } from "@/components/Leaderboard";
import { Timer } from "@/components/Timer";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import { Trophy } from "lucide-react";
import type { Session, Team, Player } from "@shared/schema";

export default function PlayerGame() {
  const [showScanner, setShowScanner] = useState(false);
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [revealScore, setRevealScore] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: session } = useQuery<Session>({
    queryKey: ["/api/session"],
    refetchInterval: 5000,
  });

  const { data: currentPlayer } = useQuery<Player>({
    queryKey: ["/api/player/me"],
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
    enabled: !!session,
    refetchInterval: 2000,
  });

  useWebSocket(session?.id);

  const currentTeam = teams.find((t) => t.id === currentPlayer?.teamId);

  const teamColorBg: Record<string, string> = {
    "team-1": "bg-team-1",
    "team-2": "bg-team-2",
    "team-3": "bg-team-3",
    "team-4": "bg-team-4",
    "team-5": "bg-team-5",
  };

  const handleCodeSubmit = (code: string) => {
    setPendingCode(code);
    setShowConfirmation(true);
  };

  const handleScanQR = (code: string) => {
    setShowScanner(false);
    handleCodeSubmit(code);
  };

  const handleConfirmScan = async () => {
    if (!pendingCode) return;

    setShowConfirmation(false);
    
    try {
      const response = await fetch("/api/player/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeString: pendingCode }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setRevealScore(data.points);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to scan code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to scan code:", error);
      toast({
        title: "Error",
        description: "Failed to scan code. Please try again.",
        variant: "destructive",
      });
    }
    
    setPendingCode(null);
  };

  const handleCancelScan = () => {
    setShowConfirmation(false);
    setPendingCode(null);
  };

  if (!session || !currentPlayer || !currentTeam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </Card>
      </div>
    );
  }

  if (session.status === "ended") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <Trophy className="h-20 w-20 mx-auto text-jackpot" />
            <h1 className="text-4xl font-black">Game Over!</h1>
            <p className="text-xl text-muted-foreground">Final Results</p>
          </div>

          <Leaderboard teams={teams} />
        </div>
      </div>
    );
  }

  const bgClass = teamColorBg[currentTeam.color] || "bg-primary";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge className={`${bgClass} text-white px-3 py-1`} data-testid="badge-team">
                {currentTeam.name}
              </Badge>
              <span className="text-2xl font-mono font-bold" data-testid="text-team-score">
                {currentTeam.totalPoints > 0 ? "+" : ""}
                {currentTeam.totalPoints}
              </span>
            </div>

            {session.status === "active" && (
              <Timer
                endAt={session.endAt}
                timerSeconds={session.timerSeconds}
                status={session.status}
              />
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 space-y-8">
        {session.status === "setup" && (
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Waiting to Start</h2>
            <p className="text-muted-foreground">
              The game will begin shortly. Get ready to scan codes!
            </p>
          </Card>
        )}

        {session.status === "active" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <CodeEntry
                onSubmit={handleCodeSubmit}
                onOpenScanner={() => setShowScanner(true)}
              />

              <Card className="p-6">
                <h3 className="font-bold mb-2">Your Team</h3>
                <p className="text-3xl font-black font-mono">
                  {currentTeam.totalPoints > 0 ? "+" : ""}
                  {currentTeam.totalPoints}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Total Points</p>
              </Card>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Live Leaderboard</h3>
              <Leaderboard teams={teams} isLive />
            </div>
          </div>
        )}
      </main>

      {showScanner && (
        <QRScanner onScan={handleScanQR} onClose={() => setShowScanner(false)} />
      )}

      {showConfirmation && pendingCode && (
        <ConfirmationModal
          open={showConfirmation}
          codeString={pendingCode}
          onConfirm={handleConfirmScan}
          onCancel={handleCancelScan}
        />
      )}

      {revealScore !== null && (
        <ScoreReveal
          open={revealScore !== null}
          points={revealScore}
          onClose={() => setRevealScore(null)}
        />
      )}
    </div>
  );
}
