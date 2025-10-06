import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Keyboard } from "lucide-react";

interface CodeEntryProps {
  onSubmit: (code: string) => void;
  onOpenScanner: () => void;
  disabled?: boolean;
}

export function CodeEntry({ onSubmit, onOpenScanner, disabled = false }: CodeEntryProps) {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onSubmit(code.trim().toUpperCase());
      setCode("");
    }
  };

  return (
    <Card className="p-8" data-testid="card-code-entry">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center space-y-2">
          <Keyboard className="h-12 w-12 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Enter Code</h2>
          <p className="text-muted-foreground">
            Type the code or scan a QR code
          </p>
        </div>

        <Input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter code here"
          className="text-center text-2xl font-mono tracking-wider h-16 focus:ring-4 focus:ring-primary/20 transition-all"
          disabled={disabled}
          autoFocus
          data-testid="input-code"
        />

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onOpenScanner}
            className="flex-1 h-12"
            disabled={disabled}
            data-testid="button-scan-qr"
          >
            <QrCode className="h-5 w-5 mr-2" />
            Scan QR
          </Button>
          <Button
            type="submit"
            disabled={!code.trim() || disabled}
            className="flex-1 h-12"
            data-testid="button-submit-code"
          >
            Submit Code
          </Button>
        </div>
      </form>
    </Card>
  );
}
