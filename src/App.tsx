import "./App.css";
import { AppRouter } from "./routes";
import { Toaster } from "sonner";
import { SignalRProvider } from "./providers/SignalRProvider";

export default function App() {
  return (
    <SignalRProvider>
      <AppRouter />
      <Toaster position="top-center" richColors />
    </SignalRProvider>
  );
}
