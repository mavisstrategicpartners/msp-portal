import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Home, Compass, BookOpen, Briefcase, Tag, ListTree, Wrench, Map, User, CalendarDays,
  FileSignature, Users, ShieldCheck, ClipboardList, BarChart3, Settings, Search, Bell,
  Sun, Moon, LogOut, Lock, HelpCircle, ChevronsLeft, ChevronsRight, MessageCircle, Building2,
  Crown, FileBarChart2, KeyRound, Menu, Camera, UserRound,
  LayoutDashboard,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/lib/use-profile";
import { useTheme, ThemeProvider } from "@/components/theme-provider";
import { MspLogo } from "@/components/msp-logo";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HelpPanel,
  MspChatPanel,
  NotificationsPanel,
  PortalSearchDialog,
  SettingsPanel,
} from "@/components/portal-pages";

type NavItem = { to: string; label: string; icon: typeof Home; rootOnly?: boolean };

type PortalKey = "staff" | "manager" | "admin" | "other" | "hr";

const NAV: { group: string; managerOnly?: boolean; hrOnly?: boolean; portals?: PortalKey[]; items: NavItem[] }[] = [
  { group: "Home", portals: ["staff"], items: [{ to: "/home", label: "Dashboard", icon: Home }] },
  { group: "Learn MSP", portals: ["staff"], items: [
    { to: "/who-we-are", label: "Who We Are", icon: Compass },
    { to: "/services", label: "Our Services", icon: Briefcase },
    { to: "/pricing", label: "Pricing & Packages", icon: Tag },
    { to: "/glossary", label: "Glossary", icon: ListTree },
  ]},
  { group: "How We Work", portals: ["staff"], items: [
    { to: "/sops", label: "SOP Library", icon: BookOpen },
    { to: "/departments", label: "Departments", icon: Building2 },
    { to: "/roadmap", label: "Client Build Roadmap", icon: Map },
    { to: "/tools", label: "Tools & Systems", icon: Wrench },
  ]},
  { group: "My Workspace", portals: ["staff"], items: [
    { to: "/me/profile", label: "My Profile", icon: User },
    { to: "/me/leave", label: "Leave Requests", icon: CalendarDays },
    { to: "/me/declaration", label: "HR Documents", icon: FileSignature },
  ]},
  { group: "Client Delivery", managerOnly: true, portals: ["staff"], items: [
    { to: "/reports", label: "Monthly Reports", icon: FileBarChart2 },
  ]},
  { group: "All In One — Host", managerOnly: true, portals: ["manager"], items: [
    { to: "/host", label: "Host Dashboard", icon: LayoutDashboard },
    { to: "/host/learners", label: "Placed Learners", icon: Users },
    { to: "/host/workforce", label: "Workforce", icon: Users },
    { to: "/host/performance", label: "Performance", icon: BarChart3 },
    { to: "/host/coaching", label: "Coaching Notes", icon: FileSignature },
    { to: "/host/onboarding", label: "Onboarding", icon: ClipboardList },
    { to: "/host/marketplace", label: "Learner Marketplace", icon: Compass },
    { to: "/host/recruitment", label: "Recruitment", icon: Users },
    { to: "/host/check", label: "Host Employer Check", icon: ShieldCheck },
    { to: "/host/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/host/projects", label: "Projects", icon: Briefcase },
    { to: "/host/tasks", label: "Tasks", icon: ListTree },
    { to: "/host/kpi", label: "KPI Management", icon: BarChart3 },
    { to: "/host/contracts", label: "Contracts", icon: FileSignature },
    { to: "/host/documents", label: "Documents", icon: BookOpen },
    { to: "/host/messages", label: "Messages", icon: MessageCircle },
    { to: "/host/reports", label: "Host Reports", icon: FileBarChart2 },
    { to: "/host/company", label: "Company Profile", icon: Building2 },
    { to: "/host/settings", label: "Host Settings", icon: Settings },
  ]},
  { group: "All In One — HR", hrOnly: true, portals: ["hr"], items: [
    { to: "/host/hr", label: "HR Dashboard", icon: LayoutDashboard },
    { to: "/host/hr/attendance", label: "Attendance Register", icon: CalendarDays },
    { to: "/host/hr/leave", label: "Leave Management", icon: CalendarDays },
    { to: "/host/hr/timesheets", label: "Timesheets", icon: ClipboardList },
    { to: "/host/hr/relations", label: "Employee Relations", icon: Users },
    { to: "/host/hr/recruitment", label: "HR Recruitment", icon: Users },
    { to: "/host/hr/performance", label: "HR Performance", icon: BarChart3 },
    { to: "/host/hr/talent", label: "Talent Management", icon: Crown },
    { to: "/host/hr/training", label: "Training & Development", icon: BookOpen },
    { to: "/host/hr/admin", label: "HR Administration", icon: Settings },
    { to: "/host/hr/integrations", label: "Integrations", icon: Wrench },
  ]},
  { group: "Admin", managerOnly: true, portals: ["staff"], items: [
    { to: "/admin/team", label: "Team Management", icon: Users },
    { to: "/admin/audit", label: "Audit Logs", icon: ShieldCheck, rootOnly: true },
    { to: "/admin/sales-playbook", label: "Sales Playbook", icon: ClipboardList, rootOnly: true },
    { to: "/admin/kpis", label: "KPI Dashboards", icon: BarChart3 },
    { to: "/admin/content", label: "Content Editor", icon: Settings, rootOnly: true },
  ]},
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ShellInner>{children}</ShellInner>
    </ThemeProvider>
  );
}

function ShellInner({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mspOpen, setMspOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { data } = useProfile();
  const isManagerOrAbove = data?.isManagerOrAbove ?? false;
  const isRootAdmin = data?.isRootAdmin ?? false;
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    const openMsp = () => setMspOpen(true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("msp:open", openMsp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("msp:open", openMsp);
    };
  }, []);

  // Close mobile drawer when navigation changes
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <Sidebar collapsed={collapsed} isManagerOrAbove={isManagerOrAbove} isRootAdmin={isRootAdmin} />
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0 md:hidden">
          <Sidebar collapsed={false} isManagerOrAbove={isManagerOrAbove} isRootAdmin={isRootAdmin} mobile />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          onToggleSidebar={() => setCollapsed((c) => !c)}
          onOpenMobileNav={() => setMobileOpen(true)}
          collapsed={collapsed}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
          onOpenHelp={() => setHelpOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-6 sm:px-4 sm:py-8 md:px-8">{children}</main>
      </div>
      <MspBubble onOpen={() => setMspOpen(true)} />
      <PortalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <MspChatPanel open={mspOpen} onOpenChange={setMspOpen} />
      <NotificationsPanel open={notificationsOpen} onOpenChange={setNotificationsOpen} />
      <HelpPanel open={helpOpen} onOpenChange={setHelpOpen} />
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

function Sidebar({ collapsed, isManagerOrAbove, isRootAdmin, mobile = false }: { collapsed: boolean; isManagerOrAbove: boolean; isRootAdmin: boolean; mobile?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data } = useProfile();
  const selectedPortal = (typeof window !== "undefined"
    ? (localStorage.getItem("msp.selectedPortal") as PortalKey | null)
    : null) ?? (data?.isHR ? "hr" : "staff");
  return (
    <aside className={cn(
      "relative shrink-0 flex-col overflow-hidden border-r border-white/15 bg-[#3b1d4d] text-white dark:bg-[#21172f]",
      mobile ? "flex h-full w-full" : "sticky top-0 hidden h-screen md:flex",
      !mobile && (collapsed ? "w-[68px]" : "w-[260px]"),
    )}>
      <div className={cn("flex h-[76px] items-center border-b border-white/10 px-4", collapsed && "justify-center px-2")}>
        <MspLogo showWord={!collapsed} />
      </div>
      {!collapsed && (
        <div className="mx-3 mt-4 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/55">Company workspace</p>
          <p className="mt-1 text-xs text-white/80">Internal operations portal</p>
        </div>
      )}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {NAV.map((section) => {
          if (section.managerOnly && !isManagerOrAbove) return null;
          if (section.hrOnly && !data?.isHR) return null;
          const visibleToAdmin = selectedPortal === "admin" &&
            (section.portals?.includes("staff") || section.portals?.includes("manager"));
          if (section.portals && !section.portals.includes(selectedPortal) && !visibleToAdmin) return null;
          const items = section.items.filter((it) => !it.rootOnly || isRootAdmin);
          if (items.length === 0) return null;
          return (
            <div key={section.group} className="mb-5">
              {!collapsed && (
                <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/55">
                  {section.group}
                  {section.managerOnly && <Lock className="ml-1 inline h-2.5 w-2.5" />}
                </p>
              )}
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = pathname === item.to || pathname.startsWith(item.to + "/");
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to as any}
                        className={cn(
                          "group flex items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2 text-sm font-medium transition",
                          active
                            ? "border-l-primary bg-white/12 text-white shadow-sm"
                            : "text-white/70 hover:border-white/20 hover:bg-white/[0.06] hover:text-white",
                          collapsed && "justify-center px-2",
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <item.icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                        {!collapsed && (
                          <span className="flex flex-1 items-center gap-1.5 truncate">
                            {item.label}
                            {item.rootOnly && <Crown className="h-3 w-3 text-primary" />}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        {!collapsed && (
          <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] leading-relaxed text-white/60">
            <span className="font-semibold text-white">Need help?</span> Open MSP Assist in the bottom-right corner.
          </p>
        )}
      </div>
    </aside>
  );
}

function TopBar({
  onToggleSidebar,
  onOpenMobileNav,
  collapsed,
  onOpenSearch,
  onOpenNotifications,
  onOpenHelp,
  onOpenSettings,
}: {
  onToggleSidebar: () => void;
  onOpenMobileNav: () => void;
  collapsed: boolean;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenHelp: () => void;
  onOpenSettings: () => void;
}) {
  const { theme, toggle } = useTheme();
  const { data } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initialsMode, setInitialsMode] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    setAvatarUrl(
      data?.profile?.avatar_url ??
        (typeof window !== "undefined" ? localStorage.getItem("msp.demoAvatar") : null),
    );
    setInitialsMode(typeof window !== "undefined" && localStorage.getItem("msp.initialsMode") === "true");
  }, [data?.profile?.avatar_url]);

  const initials = (data?.profile?.full_name || data?.user?.email || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part: string) => part[0])
    .join("")
    .toUpperCase();

  async function updateAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !data?.user?.id) return;

    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;

    setUploadingAvatar(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${data.user.id}/avatar-${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = publicData.publicUrl;
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", data.user.id);

      if (profileError) throw profileError;
      setAvatarUrl(`${publicUrl}?v=${Date.now()}`);
      setInitialsMode(false);
      localStorage.removeItem("msp.initialsMode");
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        const localUrl = typeof reader.result === "string" ? reader.result : null;
        if (localUrl) {
          setAvatarUrl(localUrl);
          localStorage.setItem("msp.demoAvatar", localUrl);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function useInitials() {
    setInitialsMode(true);
    localStorage.setItem("msp.initialsMode", "true");
    setUploadingAvatar(true);
    try {
      if (data?.user?.id) {
        await supabase.from("profiles").update({ avatar_url: null }).eq("id", data.user.id);
      }
      localStorage.removeItem("msp.demoAvatar");
      setAvatarUrl(null);
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    } finally {
      setUploadingAvatar(false);
    }
  }

  function useAvatarIcon() {
    setInitialsMode(false);
    localStorage.removeItem("msp.initialsMode");
  }

  async function signOut() {
    try {
      if (profile?.email && !localStorage.getItem("msp.rememberedEmail")) {
        localStorage.setItem("msp.rememberedEmail", profile.email);
      }
    } catch {}
    await queryClient.cancelQueries();
    queryClient.clear();
    try {
      await supabase.auth.signOut();
    } catch {}
    try {
      localStorage.removeItem("msp.demoUser");
      localStorage.removeItem("msp.selectedPortal");
    } catch {}
    window.location.replace("/auth");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-xl sm:px-4 md:px-6">
      <Button variant="ghost" size="icon" onClick={onOpenMobileNav} className="md:hidden" aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="hidden md:flex">
        {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
      </Button>
      <div className="relative min-w-0 flex-1 max-w-lg">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <button type="button" onClick={onOpenSearch} className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-secondary/40 pl-9 pr-2 text-left text-sm text-muted-foreground transition hover:bg-secondary/70">
          <span className="truncate">Search SOPs, services, tools…</span>
          <kbd className="ml-auto hidden rounded border border-border bg-background/80 px-1.5 py-0.5 text-[10px] font-medium md:inline">⌘K</kbd>
        </button>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Notifications" onClick={onOpenNotifications} className="hidden sm:inline-flex"><Bell className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" aria-label="Help" onClick={onOpenHelp} className="hidden sm:inline-flex"><HelpCircle className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-2 rounded-full border border-border px-1.5 py-1 transition hover:bg-secondary/60 sm:pr-3">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage src={avatarUrl ?? undefined} alt="Profile picture" />
                <AvatarFallback className="bg-primary/15 text-primary">
                  {initialsMode ? <span className="text-xs font-semibold">{initials}</span> : <UserRound className="h-4 w-4" strokeWidth={1.8} />}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[150px] text-left sm:block">
                <span className="block truncate text-xs font-semibold text-foreground">{data?.profile?.full_name || "Signed in"}</span>
                <span className="block truncate text-[10px] text-muted-foreground">{data?.profile?.job_title || "Staff member"}</span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="space-y-1">
              <p className="text-sm">{data?.profile?.full_name || "Signed in"}</p>
              <p className="truncate text-xs font-normal text-muted-foreground">{data?.user?.email}</p>
              <RoleBadge tier={data?.roleTier} />
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => fileInputRef.current?.click()} disabled={uploadingAvatar}>
              <Camera className="mr-2 h-4 w-4" /> {uploadingAvatar ? "Uploading picture..." : avatarUrl ? "Change profile picture" : "Add profile picture"}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={initialsMode ? useAvatarIcon : useInitials} disabled={uploadingAvatar}>
                <User className="mr-2 h-4 w-4" /> {initialsMode ? "Use avatar icon" : "Use initials instead"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenSettings}>
              <Settings className="mr-2 h-4 w-4" /> Portal settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={updateAvatar}
        className="hidden"
        aria-label="Upload profile picture"
      />
    </header>
  );
}

function MspBubble({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:bg-primary/90"
      title="Ask Msp"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success ring-2 ring-background" />
    </button>
  );
}

function RoleBadge({ tier }: { tier?: "root_admin" | "manager" | "staff" | "intern" }) {
  if (!tier) return null;
  const config = {
    root_admin: { label: "Root Admin", icon: Crown, cls: "bg-primary/20 text-primary" },
    manager: { label: "Manager", icon: KeyRound, cls: "bg-blue-500/20 text-blue-300 dark:text-blue-300" },
    staff: { label: "Staff", icon: User, cls: "bg-muted text-muted-foreground" },
    intern: { label: "Intern", icon: User, cls: "bg-muted/60 text-muted-foreground" },
  }[tier];
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", config.cls)}>
      <Icon className="h-3 w-3" /> {config.label}
    </span>
  );
}