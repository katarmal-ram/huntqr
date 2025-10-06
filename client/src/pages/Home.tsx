import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Shield, Users, Trophy, TrendingUp } from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4 pt-12">
            <Trophy className="h-20 w-20 mx-auto text-primary" />
            <h1 className="text-5xl md:text-7xl font-black tracking-tight">
              QR Risk Hunt
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              An interactive classroom game for MBA students to learn risk management
              and greed psychology through real-time QR code scanning
            </p>
          </div>

          <Disclaimer />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              className="p-8 space-y-6 hover-elevate cursor-pointer transition-all"
              onClick={() => setLocation("/admin")}
              data-testid="card-admin-mode"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary">
                    <Shield className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-3xl font-bold">Admin</h2>
                </div>

                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Create and manage game sessions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Add codes and control game flow
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Monitor live leaderboard
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    View analytics and replay sessions
                  </li>
                </ul>
              </div>

              <Button className="w-full h-12 text-lg" data-testid="button-enter-admin">
                Enter as Admin
              </Button>
            </Card>

            <Card
              className="p-8 space-y-6 hover-elevate cursor-pointer transition-all"
              onClick={() => setLocation("/join")}
              data-testid="card-player-mode"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-success">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold">Player</h2>
                </div>

                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-success" />
                    Join a team and compete
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-success" />
                    Scan QR codes or enter codes
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-success" />
                    Experience risk vs reward decisions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-success" />
                    See live score updates
                  </li>
                </ul>
              </div>

              <Button className="w-full h-12 text-lg bg-success hover:bg-success" data-testid="button-enter-player">
                Enter as Player
              </Button>
            </Card>
          </div>

          <Card className="p-6 bg-muted/50">
            <div className="flex items-start gap-4">
              <TrendingUp className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <h3 className="font-bold text-lg">How It Works</h3>
                <p className="text-sm text-muted-foreground">
                  Students form teams and scan QR codes around the classroom. Each scan
                  yields a random score (-10 to +30) determined by the Jackpot + Baiting
                  algorithm. The system intentionally tempts players with streaks and
                  near-misses to demonstrate how greed and risk-taking affect outcomes.
                  This is purely educational — no money or gambling involved.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
