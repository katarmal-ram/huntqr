import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Play, Square, RotateCcw, Plus } from "lucide-react";
import type { Session } from "@shared/schema";

interface SessionControlsProps {
  session: Session | null;
  onCreateSession: (name: string, timerSeconds: number) => void;
  onStartSession: () => void;
  onEndSession: () => void;
  disabled?: boolean;
}

export function SessionControls({
  session,
  onCreateSession,
  onStartSession,
  onEndSession,
  disabled = false,
}: SessionControlsProps) {
  const [name, setName] = useState("");
  const [minutes, setMinutes] = useState(15);

  const handleCreate = () => {
    if (name.trim()) {
      onCreateSession(name.trim(), minutes * 60);
      setName("");
      setMinutes(15);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-success text-white">
            <div className="h-2 w-2 rounded-full bg-white animate-pulse mr-2" />
            Active
          </Badge>
        );
      case "ended":
        return <Badge variant="secondary">Ended</Badge>;
      default:
        return <Badge variant="outline">Setup</Badge>;
    }
  };

  if (!session) {
    return (
      <Card className="p-6 space-y-4" data-testid="card-create-session">
        <div className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          <h2 className="text-xl font-bold">Create New Session</h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="session-name">Session Name</Label>
            <Input
              id="session-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="MBA Risk Hunt - Session 1"
              data-testid="input-session-name"
            />
          </div>

          <div>
            <Label htmlFor="timer-minutes">Timer (minutes)</Label>
            <Input
              id="timer-minutes"
              type="number"
              min="1"
              max="60"
              value={minutes}
              onChange={(e) => setMinutes(parseInt(e.target.value) || 15)}
              data-testid="input-timer-minutes"
            />
          </div>

          <Button
            onClick={handleCreate}
            disabled={!name.trim() || disabled}
            className="w-full"
            data-testid="button-create-session"
          >
            Create Session
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4" data-testid="card-session-controls">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold" data-testid="text-session-name">
            {session.name}
          </h2>
          {getStatusBadge(session.status)}
        </div>
        <p className="text-sm text-muted-foreground">
          Timer: {Math.floor(session.timerSeconds / 60)} minutes
        </p>
      </div>

      <div className="flex gap-3">
        {session.status === "setup" && (
          <Button
            onClick={onStartSession}
            disabled={disabled}
            className="flex-1"
            data-testid="button-start-session"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Game
          </Button>
        )}

        {session.status === "active" && (
          <Button
            onClick={onEndSession}
            disabled={disabled}
            variant="destructive"
            className="flex-1"
            data-testid="button-end-session"
          >
            <Square className="h-4 w-4 mr-2" />
            End Game
          </Button>
        )}

        {session.status === "ended" && (
          <Button
            onClick={() => onCreateSession("New Session", 900)}
            disabled={disabled}
            variant="outline"
            className="flex-1"
            data-testid="button-new-session"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            New Session
          </Button>
        )}
      </div>
    </Card>
  );
}
