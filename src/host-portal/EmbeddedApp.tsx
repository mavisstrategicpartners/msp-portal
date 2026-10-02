// @ts-nocheck
/**
 * Mounts the ported Host + HR portal inside the MSP shell.
 *
 * The portal was authored as a standalone Vite app using react-router-dom
 * BrowserRouter. Converting 30+ pages to TanStack file routes would be a
 * multi-day rewrite, so we run its internal router in a MemoryRouter,
 * scoped inside `.host-portal-root` so styles/tokens don't leak.
 */
import { useState, useEffect } from "react";
import { MemoryRouter } from "react-router-dom";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import "./index.css";

export function HostPortalEmbedded({ initialPath = "/host" }: { initialPath?: string }) {
  // Force full remount by using initialPath as component key
  // This ensures a fresh MemoryRouter is created for each navigation
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    // Force remount on path change
    setMounted(false);
    const timer = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(timer);
  }, [initialPath]);

  if (!mounted) return null;

  return (
    <div className="host-portal-root">
      <ThemeProvider>
        <NotificationProvider>
          <MemoryRouter initialEntries={[initialPath]} key={initialPath}>
            <App />
          </MemoryRouter>
        </NotificationProvider>
      </ThemeProvider>
    </div>
  );
}