import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface ScoreRevealProps {
  open: boolean;
  points: number;
  onClose: () => void;
}

export function ScoreReveal({ open, points, onClose }: ScoreRevealProps) {
  const [displayPoints, setDisplayPoints] = useState(0);
  const isPositive = points >= 0;
  const isJackpot = points >= 15;

  useEffect(() => {
    if (open) {
      setDisplayPoints(0);
      const duration = 500;
      const steps = 20;
      const increment = points / steps;
      let current = 0;

      const interval = setInterval(() => {
        current += increment;
        if (Math.abs(current) >= Math.abs(points)) {
          setDisplayPoints(points);
          clearInterval(interval);
        } else {
          setDisplayPoints(Math.round(current));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }
  }, [open, points]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="max-w-full h-screen flex items-center justify-center border-0 bg-background/95 backdrop-blur-sm"
        data-testid="modal-score-reveal"
      >
        <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
          {isJackpot && (
            <div className="flex justify-center gap-2 animate-bounce">
              <Sparkles className="h-12 w-12 text-jackpot" />
              <Sparkles className="h-12 w-12 text-jackpot" />
              <Sparkles className="h-12 w-12 text-jackpot" />
            </div>
          )}

          {isPositive && !isJackpot && (
            <TrendingUp className="h-16 w-16 text-success mx-auto" />
          )}
          {!isPositive && (
            <TrendingDown className="h-16 w-16 text-destructive mx-auto" />
          )}

          <div>
            <p className="text-2xl font-semibold text-muted-foreground mb-2">
              {isJackpot ? "🎉 JACKPOT! 🎉" : "Score"}
            </p>
            <div
              className={`text-9xl font-black font-mono ${
                isJackpot
                  ? "text-jackpot"
                  : isPositive
                  ? "text-success"
                  : "text-destructive"
              }`}
              data-testid="text-score-value"
            >
              {displayPoints > 0 ? "+" : ""}
              {displayPoints}
            </div>
          </div>

          <Button
            size="lg"
            onClick={onClose}
            className="text-lg px-8"
            data-testid="button-continue"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
