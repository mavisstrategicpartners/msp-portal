import { MyFollowUps } from "@/components/executive/MyFollowUps";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  User, Search, Bell, Sun, Moon, LogOut, HelpCircle, ChevronsLeft, ChevronsRight, ChevronDown,
  MessageCircle, Crown, KeyRound, Menu, Camera, UserRound,
} from "lucide-react";
import { buildSidebar, canAccessPath, isItemActive, itemKey, navContextFromProfile } from "@/lib/navigation";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/lib/use-profile";
import { CeoNotificationBell } from "@/components/executive/CeoNotificationBell";
import { useStaffNotifications } from "@/lib/staff-tasks.service";
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
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { data: profileData, isLoading: profileLoading } = useProfile();
  const navCtx = navContextFromProfile(profileData);
  // Workspace pages are only shown to roles allowed in src/lib/navigation.ts.
  // Anyone else who opens one by URL is sent to their own dashboard.
  const blocked = !!navCtx && !canAccessPath(pathname, navCtx);

  useEffect(() => {
    if (!blocked) return;
    const target = profileData?.defaultDashboard ?? "/home";
    navigate({ to: (canAccessPath(target, navCtx!) ? target : "/home") as any, replace: true });
  }, [blocked, pathname]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <Sidebar collapsed={collapsed} />
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0 md:hidden">
          <Sidebar collapsed={false} mobile />
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
        <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-6 sm:px-4 sm:py-8 md:px-8">
          {!profileLoading && !blocked && profileData && !profileData.isCEO &&
            pathname === (profileData.defaultDashboard ?? "/home") && (
              <div className="mb-6">
                <MyFollowUps />
              </div>
            )}
          {!profileLoading && !blocked && profileData?.isCEO && /^\/(gm|operations|department|sales|finance|hr)(\/|$)/.test(pathname) && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-xs text-foreground">
              <span>
                You are inspecting this department workspace as CEO. Your account and role are unchanged; decisions and
                approvals here stay with the responsible manager.
              </span>
              <Link to={"/ceo" as any} className="font-semibold text-primary hover:underline">
                Back to CEO Executive Dashboard
              </Link>
            </div>
          )}
          {!profileLoading && !blocked && /^\/operations\/(communications|recovery|escalations|workflows)/.test(pathname) && (
            <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-2.5 text-xs text-foreground">
              Records on this page are saved only in this browser. They are not yet stored in the shared database, so
              other staff and the CEO cannot see them.
            </div>
          )}
          {profileLoading || blocked ? null : children}
        </main>
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

const NAV_GROUPS_KEY = "msp.nav.groups";

function readGroupState(): Record<string, boolean> {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(NAV_GROUPS_KEY) : null;
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeGroupState(state: Record<string, boolean>) {
  try {
    localStorage.setItem(NAV_GROUPS_KEY, JSON.stringify(state));
  } catch {}
}

function Sidebar({ collapsed, mobile = false }: { collapsed: boolean; mobile?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => (s.location.search ?? {}) as Record<string, unknown> });
  const { data } = useProfile();
  const ctx = navContextFromProfile(data);
  const nav = ctx ? buildSidebar(pathname, ctx) : null;
  const [openState, setOpenState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenState(readGroupState());
  }, []);

  // When navigation lands on a page inside a closed group, open that group so
  // the active item is visible. The user can still collapse it afterwards.
  const activeGroupId = nav?.groups.find((g) => g.items.some((i) => isItemActive(i, pathname, search)))?.id;
  useEffect(() => {
    if (!activeGroupId) return;
    setOpenState((prev) => (prev[activeGroupId] === false ? { ...prev, [activeGroupId]: true } : prev));
  }, [activeGroupId, pathname]);

  function toggleGroup(id: string, current: boolean) {
    setOpenState((prev) => {
      const next = { ...prev, [id]: !current };
      writeGroupState(next);
      return next;
    });
  }

  return (
    <aside className={cn(
      "relative shrink-0 flex-col overflow-hidden border-r border-white/15 bg-[#3b1d4d] text-white dark:bg-[#21172f]",
      mobile ? "flex h-full w-full" : "sticky top-0 hidden h-screen md:flex",
      !mobile && (collapsed ? "w-[68px]" : "w-[260px]"),
    )}>
      <div className={cn("flex h-[76px] items-center border-b border-white/10 px-4", collapsed && "justify-center px-2")}>
        <Link to={(data?.defaultDashboard ?? "/home") as any} className="flex items-center gap-2.5">
          <MspLogo showWord={!collapsed} />
        </Link>
      </div>
      {!collapsed && nav && (
        <div className="mx-3 mt-4 rounded-lg border border-white/10 bg-white/[0.06] p-2.5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/55">{nav.title}</p>
          <p className="mt-1 text-xs text-white/80">{nav.subtitle}</p>
        </div>
      )}
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-2 py-4">
        {nav?.groups.map((group, index) => {
          const hasActive = group.id === activeGroupId;
          const isOpen = collapsed || (openState[group.id] ?? (hasActive || (group.defaultOpen ?? true)));
          const listId = `nav-group-${group.id}${mobile ? "-m" : ""}`;
          return (
            <div key={group.id} className={cn(collapsed ? "mb-2" : "mb-4")}>
              {collapsed ? (
                index > 0 && <div className="mx-2 mb-2 border-t border-white/10" aria-hidden />
              ) : (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id, isOpen)}
                  aria-expanded={isOpen}
                  aria-controls={listId}
                  className="flex w-full items-center justify-between rounded px-3 pb-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-white/55 transition hover:text-white/80"
                >
                  {group.label}
                  <ChevronDown className={cn("h-3 w-3 transition-transform", !isOpen && "-rotate-90")} />
                </button>
              )}
              {isOpen && (
                <ul id={listId} className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isItemActive(item, pathname, search);
                    return (
                      <li key={itemKey(item)}>
                        <Link
                          to={item.to as any}
                          search={(item.search ?? undefined) as any}
                          // Links that open a section of a page scroll to that section themselves.
                          resetScroll={item.search ? false : undefined}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "group flex items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2 text-sm font-medium no-underline transition",
                            active
                              ? "border-l-primary bg-white/12 text-white shadow-sm"
                              : "text-white/70 hover:border-white/20 hover:bg-white/[0.06] hover:text-white",
                            collapsed && "justify-center px-2",
                          )}
                          title={collapsed ? item.label : undefined}
                        >
                          <item.icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                          {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
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
  const { data: notifData } = useStaffNotifications();
  const unreadCount = notifData?.unreadCount || 0;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isCeoPath = pathname.startsWith('/ceo');
  const isCEO = Boolean(navContextFromProfile(data)?.isCEO);
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
    await queryClient.cancelQueries();
    queryClient.clear();
    try {
      await supabase.auth.signOut();
    } catch {}
    try {
      localStorage.removeItem("msp.demoUser");
      localStorage.removeItem("msp.authenticatedUser");
      localStorage.removeItem("msp.selectedPortal");
      localStorage.removeItem("msp.rememberedPassword");
      localStorage.removeItem("msp.demoAvatar");
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
        {isCEO && <CeoNotificationBell />}
        {!isCEO && !isCeoPath && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            onClick={onOpenNotifications}
            className="hidden sm:inline-flex relative"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        )}
        {!isCeoPath && <Button variant="ghost" size="icon" aria-label="Help" onClick={onOpenHelp} className="hidden sm:inline-flex"><HelpCircle className="h-4 w-4" /></Button>}
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
            <DropdownMenuItem asChild>
              <Link to="/me/profile" className="flex items-center cursor-pointer">
                <User className="mr-2 h-4 w-4" /> My Profile
              </Link>
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