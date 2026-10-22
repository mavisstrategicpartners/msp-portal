/**
 * Wraps host-portal HR page components with the providers they require:
 * - MemoryRouter (react-router-dom context for useNavigate/useLocation)
 * - ThemeProvider & NotificationProvider from the host-portal
 * - host-portal CSS scoped under .host-portal-root
 */
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@/host-portal/context/ThemeContext.jsx";
import { NotificationProvider } from "@/host-portal/context/NotificationContext.jsx";
import "@/host-portal/index.css";

interface HRPageWrapperProps {
  children: React.ReactNode;
  /** The path to initialise the MemoryRouter at (e.g. "/host/hr/leave") */
  path: string;
}

export function HRPageWrapper({ children, path }: HRPageWrapperProps) {
  return (
    <div className="host-portal-root">
      <ThemeProvider>
        <NotificationProvider>
          <MemoryRouter initialEntries={[path]} initialIndex={0} key={path}>
            {children}
          </MemoryRouter>
        </NotificationProvider>
      </ThemeProvider>
    </div>
  );
}
