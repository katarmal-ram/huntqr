import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionControls } from "@/components/SessionControls";
import { CodeManagement } from "@/components/CodeManagement";
import { Leaderboard } from "@/components/Leaderboard";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { Timer } from "@/components/Timer";
import { Disclaimer } from "@/components/Disclaimer";
import { useWebSocket } from "@/hooks/useWebSocket";
import { queryClient } from "@/lib/queryClient";
import { Settings, BarChart3 } from "lucide-react";
import type { Session, Code, Team, Scan } from "@shared/schema";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("setup");

  const { data: session } = useQuery<Session>({
    queryKey: ["/api/admin/session"],
    refetchInterval: 5000,
  });

  useWebSocket(session?.id);


  const { data: codes = [] } = useQuery<Code[]>({
    queryKey: ["/api/admin/codes"],
    enabled: !!session,
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/admin/teams"],
    enabled: !!session,
  });

  const { data: scans = [] } = useQuery<Scan[]>({
    queryKey: ["/api/admin/scans"],
    enabled: !!session,
  });

  const handleCreateSession = async (name: string, timerSeconds: number) => {
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, timerSeconds }),
      });
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/session"] });
      }
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const handleStartSession = async () => {
    try {
      const response = await fetch("/api/admin/session/start", {
        method: "POST",
      });
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/session"] });
      }
    } catch (error) {
      console.error("Failed to start session:", error);
    }
  };

  const handleEndSession = async () => {
    try {
      const response = await fetch("/api/admin/session/end", {
        method: "POST",
      });
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/session"] });
      }
    } catch (error) {
      console.error("Failed to end session:", error);
    }
  };

  const handleAddCode = async (codeString: string) => {
    try {
      const response = await fetch("/api/admin/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeString }),
      });
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/codes"] });
      }
    } catch (error) {
      console.error("Failed to add code:", error);
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    try {
      const response = await fetch(`/api/admin/codes/${codeId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/codes"] });
      }
    } catch (error) {
      console.error("Failed to delete code:", error);
    }
  };

  const handleExportCSV = () => {
    window.open("/api/admin/export-csv", "_blank");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl md:text-6xl font-black">QR Risk Hunt</h1>
            {session && session.status === "active" && (
              <Timer
                endAt={session.endAt}
                timerSeconds={session.timerSeconds}
                status={session.status}
              />
            )}
          </div>
          <Disclaimer />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="setup" data-testid="tab-setup">
              <Settings className="h-4 w-4 mr-2" />
              Setup & Live
            </TabsTrigger>
            <TabsTrigger value="analytics" disabled={!session} data-testid="tab-analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <SessionControls
                  session={session || null}
                  onCreateSession={handleCreateSession}
                  onStartSession={handleStartSession}
                  onEndSession={handleEndSession}
                />

                {session && (
                  <CodeManagement
                    codes={codes}
                    onAddCode={handleAddCode}
                    onDeleteCode={handleDeleteCode}
                    disabled={session.status !== "setup"}
                  />
                )}
              </div>

              <div className="lg:col-span-3">
                {session && teams.length > 0 ? (
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Live Leaderboard</h2>
                    <Leaderboard teams={teams} isLive={session.status === "active"} />
                  </Card>
                ) : (
                  <Card className="p-12 text-center">
                    <p className="text-muted-foreground">
                      {!session
                        ? "Create a session to get started"
                        : "Waiting for players to join teams..."}
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            {session && (
              <AnalyticsCharts
                scans={scans}
                teams={teams}
                onExportCSV={handleExportCSV}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
