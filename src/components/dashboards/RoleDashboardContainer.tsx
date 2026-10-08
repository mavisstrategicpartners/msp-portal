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
import { CeoDashboard } from "./CeoDashboard";
import { GeneralManagerDashboard } from "./GeneralManagerDashboard";
import { OperationsDashboard } from "./OperationsDashboard";
import { DepartmentManagerDashboard } from "./DepartmentManagerDashboard";
import { FinanceAdminDashboard } from "./FinanceAdminDashboard";

const ROLE_ICONS: Record<DashboardRole, any> = {
  ceo: Award,
  general_manager: Briefcase,
  operations: Activity,
  department_manager: Layers,
  finance_admin: DollarSign,
};

export function RoleDashboardContainer() {
  const [activeRole, setActiveRole] = useState<DashboardRole>("ceo");

  const currentRoleConfig = DASHBOARD_ROLES.find((r) => r.id === activeRole) || DASHBOARD_ROLES[0];

  return (
    <div className="space-y-6">
      {/* ─── Role Dashboard Switcher Toolbar ───────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 rounded-xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Role Dashboard Switcher:
              </span>
              <Badge variant="outline" className="text-[10px] bg-muted/50 font-medium">
                Role-Based Authority
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Viewing as: <strong className="text-foreground">{currentRoleConfig.title}</strong>
            </p>
          </div>
        </div>

        {/* Role Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {DASHBOARD_ROLES.map((role) => {
            const Icon = ROLE_ICONS[role.id];
            const isActive = activeRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{role.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

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
      {activeRole === "ceo" && <CeoDashboard />}
      {activeRole === "general_manager" && <GeneralManagerDashboard />}
      {activeRole === "operations" && <OperationsDashboard />}
      {activeRole === "department_manager" && <DepartmentManagerDashboard />}
      {activeRole === "finance_admin" && <FinanceAdminDashboard />}
    </div>
  );
}
