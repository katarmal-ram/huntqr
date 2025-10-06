import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Camera } from "lucide-react";

interface QRScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
          scanner.stop();
        },
        () => {
          // Silent fail on scan errors
        }
      )
      .catch((err) => {
        setError("Unable to access camera. Please check permissions.");
        console.error("QR Scanner error:", err);
      });

    return () => {
      if (scanner.isScanning) {
        scanner.stop().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6 space-y-4" data-testid="container-qr-scanner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            <h2 className="text-xl font-bold">Scan QR Code</h2>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            data-testid="button-close-scanner"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {error ? (
          <div className="text-center p-8 text-destructive">{error}</div>
        ) : (
          <div id="qr-reader" className="w-full" data-testid="video-qr-reader" />
        )}

        <p className="text-sm text-muted-foreground text-center">
          Position the QR code within the frame to scan
        </p>
      </Card>
    </div>
  );
}
