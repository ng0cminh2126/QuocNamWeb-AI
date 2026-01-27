import "./App.css";
import { AppRouter } from "./routes";
import { Toaster } from "sonner";
import { SignalRProvider } from "./providers/SignalRProvider";
import { useSecurity } from "./hooks/useSecurity";

export default function App() {
  // Initialize client-side security protections
  const { isWhitelisted } = useSecurity();

  return (
    <SignalRProvider>
      {/* Dev mode indicator for whitelisted users */}
      {isWhitelisted && (
        <div className="fixed top-0 left-0 bg-yellow-500 text-black px-2 py-1 text-xs z-50 font-mono">
          DEV MODE - Protections Bypassed
        </div>
      )}

      <AppRouter />
      <Toaster position="top-center" richColors />
    </SignalRProvider>
  );
}
