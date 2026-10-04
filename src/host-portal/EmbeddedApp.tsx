// @ts-nocheck
/**
 * Mounts the ported Host + HR portal inside the MSP shell.
 *
 * The portal was authored as a standalone Vite app using react-router-dom
 * BrowserRouter. Converting 30+ pages to TanStack file routes would be a
 * multi-day rewrite, so we run its internal router in a MemoryRouter,
 * scoped inside `.host-portal-root` so styles/tokens don't leak.
 *
 * IMPORTANT: The TanStack router passes the full external path, e.g.
 *   /_authenticated/host/hr/relations
 * The internal react-router-dom only knows:
 *   /hr/relations  or  /host/...
 * So we strip the /_authenticated/host prefix here, then sync the
 * internal MemoryRouter location back to the browser URL so refreshes work.
 */
import { useEffect } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import "./index.css";

/** Strip the TanStack shell prefix so the internal router gets the right path. */
function toInternalPath(externalPath: string): string {
  const stripped = externalPath
    .replace(/^\/_authenticated\/host/, "") // remove tanstack prefix
    .replace(/^\/host\/hr/, "/hr");         // normalise /host/hr → /hr
  return stripped || "/host";
}

/**
 * Syncs the internal MemoryRouter location back to the browser address bar.
 * This means clicking any sidebar link updates the URL so refresh/bookmark works.
 */
function RouteSync() {
  const location = useLocation();
  useEffect(() => {
    // Map internal path back to the external TanStack URL
    let external = location.pathname;
    if (external.startsWith("/hr")) {
      external = "/_authenticated/host" + external;
    } else if (external.startsWith("/host") && !external.startsWith("/host/")) {
      external = "/_authenticated/host";
    } else if (external.startsWith("/host/")) {
      external = "/_authenticated" + external;
    }
    if (window.location.pathname !== external) {
      window.history.pushState(null, "", external + location.search + location.hash);
    }
  }, [location.pathname, location.search, location.hash]);
  return null;
}

export function HostPortalEmbedded({ initialPath = "/host" }: { initialPath?: string }) {
  const internal = toInternalPath(initialPath);
  return (
    <div className="host-portal-root">
      <ThemeProvider>
        <NotificationProvider>
          <MemoryRouter initialEntries={[internal]} initialIndex={0} key={internal}>
            <RouteSync />
            <App />
          </MemoryRouter>
        </NotificationProvider>
      </ThemeProvider>
    </div>
  );
}
