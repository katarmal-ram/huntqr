import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Activity, Target, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Scan, Team } from "@shared/schema";

interface AnalyticsChartsProps {
  scans: Scan[];
  teams: Team[];
  onExportCSV: () => void;
}

export function AnalyticsCharts({ scans, teams, onExportCSV }: AnalyticsChartsProps) {
  const calculateMetrics = () => {
    if (scans.length === 0) {
      return {
        avgPoints: 0,
        stdDev: 0,
        positiveScans: 0,
        negativeScans: 0,
        jackpotHits: 0,
      };
    }

    const points = scans.map((s) => s.points);
    const avgPoints = points.reduce((a, b) => a + b, 0) / points.length;
    
    const variance = points.reduce((sum, p) => sum + Math.pow(p - avgPoints, 2), 0) / points.length;
    const stdDev = Math.sqrt(variance);

    return {
      avgPoints: avgPoints.toFixed(2),
      stdDev: stdDev.toFixed(2),
      positiveScans: points.filter((p) => p > 0).length,
      negativeScans: points.filter((p) => p < 0).length,
      jackpotHits: points.filter((p) => p >= 15).length,
    };
  };

  const prepareChartData = () => {
    const teamScores: Record<string, { time: string; [key: string]: any }[]> = {};
    
    teams.forEach((team) => {
      teamScores[team.id] = [];
    });

    const sortedScans = [...scans].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const teamCumulativePoints: Record<string, number> = {};
    teams.forEach((team) => {
      teamCumulativePoints[team.id] = 0;
    });

    sortedScans.forEach((scan, index) => {
      teamCumulativePoints[scan.teamId] += scan.points;
      
      const dataPoint: any = {
        time: `Scan ${index + 1}`,
        scanIndex: index,
      };

      teams.forEach((team) => {
        dataPoint[team.name] = teamCumulativePoints[team.id];
      });

      teams.forEach((team) => {
        teamScores[team.id].push({ ...dataPoint });
      });
    });

    const allPoints = sortedScans.map((_, index) => {
      const point: any = { time: `Scan ${index + 1}`, scanIndex: index };
      teams.forEach((team) => {
        point[team.name] = teamCumulativePoints[team.id];
      });
      return point;
    });

    return allPoints.length > 0 ? allPoints : [];
  };

  const metrics = calculateMetrics();
  const chartData = prepareChartData();

  const teamColors: Record<string, string> = {
    "team-1": "#3b82f6",
    "team-2": "#10b981",
    "team-3": "#f97316",
    "team-4": "#a855f7",
    "team-5": "#ec4899",
  };

  return (
    <div className="space-y-6" data-testid="container-analytics">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Session Analytics</h2>
        <Button onClick={onExportCSV} variant="outline" data-testid="button-export-csv">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Avg Points</p>
          </div>
          <p className="text-2xl font-bold font-mono" data-testid="text-avg-points">
            {metrics.avgPoints}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Volatility</p>
          </div>
          <p className="text-2xl font-bold font-mono" data-testid="text-volatility">
            {metrics.stdDev}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Scan Ratio</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-success text-white" data-testid="badge-positive-scans">
              +{metrics.positiveScans}
            </Badge>
            <Badge className="bg-destructive text-white" data-testid="badge-negative-scans">
              -{metrics.negativeScans}
            </Badge>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-jackpot" />
            <p className="text-sm text-muted-foreground">Jackpots</p>
          </div>
          <p className="text-2xl font-bold font-mono text-jackpot" data-testid="text-jackpot-hits">
            {metrics.jackpotHits}
          </p>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Team Risk Curves</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              {teams.map((team) => (
                <Line
                  key={team.id}
                  type="monotone"
                  dataKey={team.name}
                  stroke={teamColors[team.color] || "#888"}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {scans.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No scan data available yet</p>
        </Card>
      )}
    </div>
  );
}
