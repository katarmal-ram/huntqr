import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Team } from "@shared/schema";

interface LeaderboardProps {
  teams: (Team & { previousRank?: number })[];
  isLive?: boolean;
}

const teamColorMap: Record<string, string> = {
  "team-1": "border-team-1 bg-team-1/10",
  "team-2": "border-team-2 bg-team-2/10",
  "team-3": "border-team-3 bg-team-3/10",
  "team-4": "border-team-4 bg-team-4/10",
  "team-5": "border-team-5 bg-team-5/10",
};

const rankColors = [
  "from-yellow-500/20 to-transparent",
  "from-gray-400/20 to-transparent",
  "from-orange-600/20 to-transparent",
];

export function Leaderboard({ teams, isLive = false }: LeaderboardProps) {
  const sortedTeams = [...teams].sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="space-y-3" data-testid="container-leaderboard">
      {isLive && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          Live Leaderboard
        </div>
      )}
      
      {sortedTeams.map((team, index) => {
        const rank = index + 1;
        const colorClass = teamColorMap[team.color] || "border-border";
        const rankGradient = rankColors[index] || "";
        
        let trendIcon = null;
        if (team.previousRank !== undefined && team.previousRank !== rank) {
          if (rank < team.previousRank) {
            trendIcon = <TrendingUp className="h-4 w-4 text-success" />;
          } else if (rank > team.previousRank) {
            trendIcon = <TrendingDown className="h-4 w-4 text-destructive" />;
          } else {
            trendIcon = <Minus className="h-4 w-4 text-muted-foreground" />;
          }
        }

        return (
          <Card
            key={team.id}
            className={`p-4 border-2 transition-all duration-700 ${colorClass} ${
              rank <= 3 ? `bg-gradient-to-r ${rankGradient}` : ""
            }`}
            data-testid={`card-team-${team.id}`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2 min-w-[60px]">
                  {rank === 1 && <Trophy className="h-5 w-5 text-yellow-500" />}
                  <span className="text-2xl font-black font-mono" data-testid={`text-rank-${team.id}`}>
                    #{rank}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-lg" data-testid={`text-team-name-${team.id}`}>
                    {team.name}
                  </h3>
                </div>

                {trendIcon && (
                  <div className="flex items-center" data-testid={`icon-trend-${team.id}`}>
                    {trendIcon}
                  </div>
                )}
              </div>

              <Badge
                variant="secondary"
                className="text-xl font-mono font-bold px-4 py-2"
                data-testid={`badge-points-${team.id}`}
              >
                {team.totalPoints > 0 ? "+" : ""}
                {team.totalPoints}
              </Badge>
            </div>
          </Card>
        );
      })}

      {sortedTeams.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No teams yet</p>
        </Card>
      )}
    </div>
  );
}
