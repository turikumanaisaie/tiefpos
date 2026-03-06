import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose?: () => void;
}

const BarcodeScanner = ({ onScan, onClose }: BarcodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "barcode-reader";
  const hasStartedRef = useRef(false);

  const startScanning = async () => {
    setError(null);
    try {
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanning();
        },
        () => {}
      );
      setIsScanning(true);
    } catch (err) {
      setError("Camera access denied. Please allow camera permissions.");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
    setIsScanning(false);
  };

  // Auto-start camera on mount
  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => startScanning(), 300);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        id={containerId}
        className="w-full rounded-xl overflow-hidden bg-foreground/5 aspect-square max-w-sm relative"
      >
        {!isScanning && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Camera className="w-10 h-10 animate-pulse" />
            <p className="text-sm">Starting camera...</p>
          </div>
        )}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[250px] h-[2px] bg-primary animate-scan-line rounded-full shadow-[0_0_8px_hsl(var(--primary))]" />
          </div>
        )}
      </div>
      {error && (
        <div className="text-center">
          <p className="text-destructive text-sm mb-2">{error}</p>
          <Button onClick={startScanning} size="sm" className="gap-2">
            <Camera className="w-4 h-4" /> Retry
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        {isScanning && (
          <Button variant="destructive" onClick={stopScanning} size="sm" className="gap-2">
            <CameraOff className="w-4 h-4" /> Stop
          </Button>
        )}
        {onClose && (
          <Button variant="outline" onClick={() => { stopScanning(); onClose(); }} size="sm">
            Close
          </Button>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;
