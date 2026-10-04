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
  const entries = [initialPath];
  if (initialPath.startsWith("/host/hr")) {
    entries.push(initialPath.replace("/host", ""));
  }
  return (
    <div className="host-portal-root">
      <ThemeProvider>
        <NotificationProvider>
          <MemoryRouter initialEntries={entries} initialIndex={0} key={initialPath}>
            <App />
          </MemoryRouter>
        </NotificationProvider>
      </ThemeProvider>
    </div>
  );
}