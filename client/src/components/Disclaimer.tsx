import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export function Disclaimer() {
  return (
    <Alert className="border-yellow-500 bg-yellow-500/10" data-testid="alert-disclaimer">
      <AlertTriangle className="h-5 w-5 text-yellow-500" />
      <AlertDescription className="text-sm font-medium">
        <strong>Educational Simulation Only</strong> - This game is designed to teach risk management
        concepts. No money, rewards, or gambling involved. Symbolic prizes only. Players may leave at any time.
      </AlertDescription>
    </Alert>
  );
}
