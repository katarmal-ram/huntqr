import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import type { Team } from "@shared/schema";

interface TeamSelectionProps {
  teams: Team[];
  onSelect: (teamId: string) => void;
  disabled?: boolean;
}

const teamColorClasses: Record<string, string> = {
  "team-1": "border-team-1 hover:bg-team-1/20",
  "team-2": "border-team-2 hover:bg-team-2/20",
  "team-3": "border-team-3 hover:bg-team-3/20",
  "team-4": "border-team-4 hover:bg-team-4/20",
  "team-5": "border-team-5 hover:bg-team-5/20",
};

const teamColorBg: Record<string, string> = {
  "team-1": "bg-team-1",
  "team-2": "bg-team-2",
  "team-3": "bg-team-3",
  "team-4": "bg-team-4",
  "team-5": "bg-team-5",
};

export function TeamSelection({ teams, onSelect, disabled = false }: TeamSelectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="container-team-selection">
      {teams.map((team) => {
        const colorClass = teamColorClasses[team.color] || "border-border";
        const bgClass = teamColorBg[team.color] || "bg-primary";

        return (
          <Card
            key={team.id}
            className={`p-6 border-2 transition-all cursor-pointer hover-elevate ${colorClass}`}
            onClick={() => !disabled && onSelect(team.id)}
            data-testid={`card-team-select-${team.id}`}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${bgClass}`}>
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl" data-testid={`text-team-name-${team.id}`}>
                    {team.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {team.totalPoints} points
                  </p>
                </div>
              </div>

              <Button
                className="w-full"
                disabled={disabled}
                data-testid={`button-join-team-${team.id}`}
              >
                Join Team
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
