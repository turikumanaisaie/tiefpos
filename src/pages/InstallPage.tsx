import { useState, useEffect } from "react";
import { Download, Smartphone, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const InstallPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-elevated">
          {installed ? (
            <CheckCircle className="w-10 h-10 text-primary-foreground" />
          ) : (
            <Smartphone className="w-10 h-10 text-primary-foreground" />
          )}
        </div>
        <h1 className="text-2xl font-bold mb-2">
          {installed ? "App Installed!" : "Install Tief POS"}
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          {installed
            ? "You can now find Tief POS on your home screen."
            : "Install this app on your device for the best experience. Works offline and feels like a native app."}
        </p>
        {!installed && (
          <>
            {deferredPrompt ? (
              <Button onClick={handleInstall} className="gap-2">
                <Download className="w-4 h-4" /> Install App
              </Button>
            ) : (
              <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground">
                <p className="font-medium mb-2">To install:</p>
                <p><strong>Android:</strong> Tap the browser menu → "Add to Home Screen"</p>
                <p className="mt-1"><strong>iOS:</strong> Tap Share → "Add to Home Screen"</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InstallPage;
