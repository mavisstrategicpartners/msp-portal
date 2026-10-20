import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users, UserPlus, Search, MoreVertical, ShieldCheck, Pencil,
  UserX, UserCheck, Crown, KeyRound, User, RefreshCw, Eye, EyeOff, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createTeamMember, updateTeamMember, deleteTeamMember } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Manage Staff — MSP Admin" }] }),
  component: ManageUsersPage,
});

type RoleTier = "root_admin" | "manager" | "staff" | "intern";

interface StaffProfile {
  id: string;
  full_name: string | null;
  email: string;
  job_title: string | null;
  department: string | null;
  role_tier: RoleTier;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
}

const DEPARTMENTS = [
  "IT Department",
  "Marketing Team",
  "Graphics Team",
  "Sales Team",
  "Human Resources",
  "Admin Department",
  "Operations Manager",
  "Client Relationship Manager",
  "Social Media Manager",
  "Managing Director",
  "CEO",
];

const ROLE_OPTIONS: { value: string; label: string; tier: RoleTier }[] = [
  { value: "staff", label: "Staff Member", tier: "staff" },
  { value: "intern", label: "Intern", tier: "intern" },
  { value: "manager", label: "Manager", tier: "manager" },
  { value: "superadmin", label: "Super Admin (Root)", tier: "root_admin" },
];

function roleBadge(tier: RoleTier) {
  const map: Record<RoleTier, { label: string; cls: string; Icon: typeof Crown }> = {
    root_admin: { label: "Root Admin", cls: "bg-primary/15 text-primary", Icon: Crown },
    manager: { label: "Manager", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", Icon: KeyRound },
    staff: { label: "Staff", cls: "bg-muted text-muted-foreground", Icon: User },
    intern: { label: "Intern", cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", Icon: User },
  };
  const { label, cls, Icon } = map[tier] ?? map.staff;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cls}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function ManageUsersPage() {
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("active");

  // Add user dialog
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    jobTitle: "",
    department: "",
    accessLevel: "staff",
    password: "Staff2026",
  });

  // Edit user dialog
  const [editUser, setEditUser] = useState<StaffProfile | null>(null);
  const [editForm, setEditForm] = useState<{
    fullName: string;
    jobTitle: string;
    department: string;
    roleTier: RoleTier;
  }>({
    fullName: "",
    jobTitle: "",
    department: "",
    roleTier: "staff",
  });
  const [saving, setSaving] = useState(false);

  // Delete user confirmation
  const [deleteTarget, setDeleteTarget] = useState<StaffProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, job_title, department, role_tier, is_active, avatar_url, created_at")
        .order("full_name", { ascending: true });
      if (error) throw error;
      setStaff((data as StaffProfile[]) ?? []);
    } catch (err: any) {
      toast.error("Failed to load staff: " + (err?.message ?? "Unknown error"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStaff(); }, [loadStaff]);

  const filtered = staff.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      (s.full_name?.toLowerCase().includes(q) ?? false) ||
      s.email.toLowerCase().includes(q) ||
      (s.department?.toLowerCase().includes(q) ?? false) ||
      (s.job_title?.toLowerCase().includes(q) ?? false);
    const matchRole = filterRole === "all" || s.role_tier === filterRole;
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && s.is_active) ||
      (filterStatus === "inactive" && !s.is_active);
    return matchSearch && matchRole && matchStatus;
  });

  const stats = {
    total: staff.length,
    active: staff.filter((s) => s.is_active).length,
    managers: staff.filter((s) => s.role_tier === "manager" || s.role_tier === "root_admin").length,
    interns: staff.filter((s) => s.role_tier === "intern").length,
  };

  // ── Add user ──────────────────────────────────────────────────────────────
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = form.email.trim().toLowerCase();
    if (!form.firstName.trim() || !form.lastName.trim() || !cleanEmail || !form.department) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setAdding(true);
    try {
      await createTeamMember({
        data: {
          email: cleanEmail,
          fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
          jobTitle: form.jobTitle.trim() || undefined,
          department: form.department,
          accessLevel: form.accessLevel as any,
          role: "user",
          password: form.password || undefined,
        },
      });
      toast.success("Staff member created!", {
        description: `${form.firstName} ${form.lastName} can now log in at ${cleanEmail} with the password.`,
      });
      setAddOpen(false);
      setForm({ firstName: "", lastName: "", email: "", jobTitle: "", department: "", accessLevel: "staff", password: "Staff2026" });
      await loadStaff();
    } catch (err: any) {
      toast.error("Failed to create user", { description: err?.message ?? String(err) });
    } finally {
      setAdding(false);
    }
  }

  // ── Edit user ─────────────────────────────────────────────────────────────
  function openEdit(s: StaffProfile) {
    setEditUser(s);
    setEditForm({
      fullName: s.full_name ?? "",
      jobTitle: s.job_title ?? "",
      department: s.department ?? "",
      roleTier: s.role_tier ?? "staff",
    });
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
    try {
      await updateTeamMember({
        data: {
          userId: editUser.id,
          fullName: editForm.fullName || undefined,
          jobTitle: editForm.jobTitle || null,
          department: editForm.department || null,
          roleTier: editForm.roleTier,
        },
      });
      toast.success("Profile updated.");
      setEditUser(null);
      await loadStaff();
    } catch (err: any) {
      toast.error("Failed to update: " + (err?.message ?? String(err)));
    } finally {
      setSaving(false);
    }
  }

  // ── Toggle active ─────────────────────────────────────────────────────────
  async function toggleActive(s: StaffProfile) {
    try {
      await updateTeamMember({ data: { userId: s.id, isActive: !s.is_active } });
      toast.success(s.is_active ? `${s.full_name} deactivated.` : `${s.full_name} reactivated.`);
      await loadStaff();
    } catch (err: any) {
      toast.error("Failed: " + (err?.message ?? String(err)));
    }
  }

  // ── Delete user ─────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTeamMember({ data: { userId: deleteTarget.id } });
      toast.success(`${deleteTarget.full_name || deleteTarget.email} permanently removed.`);
      setDeleteTarget(null);
      await loadStaff();
    } catch (err: any) {
      toast.error("Failed to delete user: " + (err?.message ?? String(err)));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/70 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/20" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Admin</span>
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Manage Staff</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add, edit, and manage all MSP staff accounts and their roles.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" onClick={loadStaff} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Staff Member
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Staff", value: stats.total, icon: Users, cls: "" },
          { label: "Active", value: stats.active, icon: UserCheck, cls: "border-l-4 border-l-green-500" },
          { label: "Managers", value: stats.managers, icon: KeyRound, cls: "border-l-4 border-l-blue-500" },
          { label: "Interns", value: stats.interns, icon: User, cls: "border-l-4 border-l-orange-400" },
        ].map((s) => (
          <Card key={s.label} className={`p-4 border-border/70 flex items-center justify-between ${s.cls}`}>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </div>
            <s.icon className="w-8 h-8 text-muted-foreground/20" />
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="border-border/70">
        {/* Filters */}
        <div className="p-4 border-b border-border/50 bg-muted/20 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-40 bg-background">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="root_admin">Root Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="intern">Intern</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
              <tr>
                <th className="px-6 py-3 font-semibold">Staff Member</th>
                <th className="px-6 py-3 font-semibold">Department</th>
                <th className="px-6 py-3 font-semibold">Role</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Email</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                    Loading staff…
                  </td>
                </tr>
              )}
              {!loading && filtered.map((s) => {
                const initials = (s.full_name ?? s.email)
                  .trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
                return (
                  <tr key={s.id} className={`hover:bg-muted/10 transition-colors ${!s.is_active ? "opacity-50" : ""}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border">
                          <AvatarImage src={s.avatar_url ?? undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{s.full_name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">{s.job_title ?? "No job title"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{s.department ?? "—"}</td>
                    <td className="px-6 py-4">{roleBadge(s.role_tier)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wide font-medium ${
                        s.is_active
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                        {s.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs font-mono">{s.email}</td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(s)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toggleActive(s)} className={s.is_active ? "text-destructive focus:text-destructive" : "text-green-600 focus:text-green-600"}>
                            {s.is_active
                              ? <><UserX className="mr-2 h-4 w-4" />Deactivate</>
                              : <><UserCheck className="mr-2 h-4 w-4" />Reactivate</>
                            }
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setDeleteTarget(s)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Permanently
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                    No staff members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Add Staff Dialog ── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Add New Staff Member
            </DialogTitle>
            <DialogDescription>
              Creates a Supabase account and profile. The employee will use their company email to log in.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdd} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="e.g. Thabo"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="e.g. Dlamini"
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="workEmail">Work Email *</Label>
              <Input
                id="workEmail"
                type="email"
                placeholder="e.g. employee@mavisstrategicpartners.co.za"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                placeholder="e.g. Full Stack Engineer"
                value={form.jobTitle}
                onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))}
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="department">Department *</Label>
                <Select value={form.department} onValueChange={(v) => setForm((f) => ({ ...f, department: v }))}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="accessLevel">Role *</Label>
                <Select value={form.accessLevel} onValueChange={(v) => setForm((f) => ({ ...f, accessLevel: v }))}>
                  <SelectTrigger id="accessLevel">
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Temporary Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this with the employee — they can change it after logging in.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={adding} className="gap-2">
                {adding ? <RefreshCw className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                {adding ? "Creating…" : "Create Staff Member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Profile Dialog ── */}
      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Edit Staff Profile
            </DialogTitle>
            <DialogDescription>{editUser?.email}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={editForm.fullName}
                onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-title">Job Title</Label>
              <Input
                id="edit-title"
                value={editForm.jobTitle}
                onChange={(e) => setEditForm((f) => ({ ...f, jobTitle: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-dept">Department</Label>
                <Select value={editForm.department} onValueChange={(v) => setEditForm((f) => ({ ...f, department: v }))}>
                  <SelectTrigger id="edit-dept">
                    <SelectValue placeholder="Select department…" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editForm.roleTier}
                  onValueChange={(v) => setEditForm((f) => ({ ...f, roleTier: v as RoleTier }))}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Select role…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff Member</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="root_admin">Root Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setEditUser(null)}>Cancel</Button>
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-md border-destructive/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Permanently Remove Staff Member
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete <strong>{deleteTarget?.full_name || deleteTarget?.email}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive space-y-1">
            <p className="font-semibold">⚠️ This action cannot be undone.</p>
            <p>
              This will completely remove their account, profile data, roles, and login access from the system.
            </p>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2"
            >
              {deleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {deleting ? "Deleting…" : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
