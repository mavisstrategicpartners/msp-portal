import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SlidersHorizontal,
  Clock,
  ShieldCheck,
  Activity,
  Award,
  Briefcase,
  Layers,
  DollarSign,
  Users,
} from "lucide-react";
import { DASHBOARD_ROLES, DashboardRole } from "./types";
import { GeneralManagerDashboard } from "./GeneralManagerDashboard";
import { OperationsDashboard } from "./OperationsDashboard";
import { DepartmentManagerDashboard } from "./DepartmentManagerDashboard";
import { FinanceAdminDashboard } from "./FinanceAdminDashboard";

const ROLE_ICONS: Record<DashboardRole, any> = {
  general_manager: Briefcase,
  operations: Activity,
  department_manager: Layers,
  finance_admin: DollarSign,
};

export function RoleDashboardContainer() {
  const [activeRole, setActiveRole] = useState<DashboardRole>("general_manager");

  const currentRoleConfig = DASHBOARD_ROLES.find((r) => r.id === activeRole) || DASHBOARD_ROLES[0];

  return (
    <div className="space-y-6">


      {/* ─── Role Authority Eyebrow Banner ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Authority Profile:</span>
          <span>{currentRoleConfig.authority}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <Clock className="h-3 w-3" /> Africa/Johannesburg (08:00–17:00 SAST)
        </div>
      </div>

      {/* ─── Render Active Role Dashboard ──────────────────────────────────── */}
      {activeRole === "general_manager" && <GeneralManagerDashboard />}
      {activeRole === "operations" && <OperationsDashboard />}
      {activeRole === "department_manager" && <DepartmentManagerDashboard />}
      {activeRole === "finance_admin" && <FinanceAdminDashboard />}
    </div>
  );
}
