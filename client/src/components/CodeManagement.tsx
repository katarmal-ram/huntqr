import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Check } from "lucide-react";
import type { Code } from "@shared/schema";

interface CodeManagementProps {
  codes: Code[];
  onAddCode: (codeString: string) => void;
  onDeleteCode: (codeId: string) => void;
  disabled?: boolean;
}

export function CodeManagement({
  codes,
  onAddCode,
  onDeleteCode,
  disabled = false,
}: CodeManagementProps) {
  const [newCode, setNewCode] = useState("");

  const handleAdd = () => {
    if (newCode.trim()) {
      onAddCode(newCode.trim().toUpperCase());
      setNewCode("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  return (
    <Card className="p-6 space-y-4" data-testid="card-code-management">
      <h2 className="text-xl font-bold">Manage Codes</h2>

      <div className="flex gap-2">
        <Input
          value={newCode}
          onChange={(e) => setNewCode(e.target.value.toUpperCase())}
          onKeyPress={handleKeyPress}
          placeholder="Enter code (e.g., ALPHA1)"
          disabled={disabled}
          data-testid="input-new-code"
        />
        <Button
          onClick={handleAdd}
          disabled={!newCode.trim() || disabled}
          data-testid="button-add-code"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {codes.map((code) => (
          <div
            key={code.id}
            className="flex items-center justify-between p-3 border rounded-lg"
            data-testid={`row-code-${code.id}`}
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="font-mono font-bold text-lg" data-testid={`text-code-${code.id}`}>
                {code.codeString}
              </span>
              {code.usedByTeamId ? (
                <Badge variant="secondary" className="gap-1">
                  <Check className="h-3 w-3" />
                  Used
                </Badge>
              ) : (
                <Badge variant="outline">Available</Badge>
              )}
            </div>

            {!code.usedByTeamId && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDeleteCode(code.id)}
                disabled={disabled}
                data-testid={`button-delete-code-${code.id}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        ))}

        {codes.length === 0 && (
          <p className="text-center text-muted-foreground p-8">
            No codes added yet. Add codes above to get started.
          </p>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Total: {codes.length} codes ({codes.filter((c) => !c.usedByTeamId).length} available)
      </div>
    </Card>
  );
}
