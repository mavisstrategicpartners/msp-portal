import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as cn, t as Button } from "./button-D_VAx1TB.mjs";
import { t as supabase } from "./client-yJUBr8rP.mjs";
import { d as useRouterState, m as Outlet, v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { $ as Compass, A as Map, B as House, D as Moon, F as ListTree, K as FilePenLine, L as LayoutDashboard, M as LogOut, N as Lock, O as MessageCircle, Q as Crown, R as KeyRound, St as Briefcase, Tt as Bell, _ as Settings, _t as Camera, a as User, at as Circle, dt as ChevronsLeft, g as ShieldCheck, gt as ChartColumn, ht as Check, i as Users, k as Menu, m as Sun, n as Wrench, nt as Clock, p as Tag, pt as ChevronRight, q as FileChartColumn, rt as ClipboardList, s as UserRound, st as CircleQuestionMark, ut as ChevronsRight, wt as BookOpen, xt as Building2, y as Search, yt as CalendarDays } from "../_libs/lucide-react.mjs";
import { a as ThemeProvider, o as useTheme } from "./router-CM1gTbxc.mjs";
import { n as useProfile } from "./use-profile-CeWEBsPJ.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-CjSr-yN4.mjs";
import { a as Label2, c as Root2, d as SubTrigger2, f as Trigger, i as ItemIndicator2, l as Separator2, n as Content2, o as Portal2, r as Item2, s as RadioItem2, t as CheckboxItem2, u as SubContent2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { b as Sheet, d as NotificationsPanel, f as PortalSearchDialog, o as HelpPanel, u as MspChatPanel, x as SheetContent, y as SettingsPanel } from "./portal-pages-DPIQvV86.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-5BiiIeCo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MspLogo({ className, showWord = true }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-center gap-2.5", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative flex h-9 w-9 shrink-0 items-center justify-center bg-transparent p-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/msp-logo.png",
				alt: "Mavis Strategic Partners",
				className: "h-full w-full object-contain"
			})
		}), showWord && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col leading-none",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[15px] font-bold tracking-tight text-white",
				children: "MSP"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[9px] font-semibold uppercase tracking-[0.18em] text-white/60",
				children: "Mavis Strategic Partners"
			})]
		})]
	});
}
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
var DropdownMenuSubTrigger = import_react.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubTrigger2, {
	ref,
	className: cn("flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", inset && "pl-8", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-auto" })]
}));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
var DropdownMenuSubContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubContent2, {
	ref,
	className: cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}));
DropdownMenuSubContent.displayName = SubContent2.displayName;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}) }));
DropdownMenuContent.displayName = Content2.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0", inset && "pl-8", className),
	...props
}));
DropdownMenuItem.displayName = Item2.displayName;
var DropdownMenuCheckboxItem = import_react.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CheckboxItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	checked,
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), children]
}));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
var DropdownMenuRadioItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-2 w-2 fill-current" }) })
	}), children]
}));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
var DropdownMenuLabel = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label2, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
	...props
}));
DropdownMenuLabel.displayName = Label2.displayName;
var DropdownMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
DropdownMenuSeparator.displayName = Separator2.displayName;
var DropdownMenuShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest opacity-60", className),
		...props
	});
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
var NAV = [
	{
		group: "Home",
		portals: ["staff"],
		items: [{
			to: "/home",
			label: "Dashboard",
			icon: House
		}]
	},
	{
		group: "Learn MSP",
		portals: ["staff"],
		items: [
			{
				to: "/who-we-are",
				label: "Who We Are",
				icon: Compass
			},
			{
				to: "/services",
				label: "Our Services",
				icon: Briefcase
			},
			{
				to: "/pricing",
				label: "Pricing & Packages",
				icon: Tag
			},
			{
				to: "/glossary",
				label: "Glossary",
				icon: ListTree
			}
		]
	},
	{
		group: "How We Work",
		portals: ["staff"],
		items: [
			{
				to: "/sops",
				label: "SOP Library",
				icon: BookOpen
			},
			{
				to: "/departments",
				label: "Departments",
				icon: Building2
			},
			{
				to: "/roadmap",
				label: "Client Build Roadmap",
				icon: Map
			},
			{
				to: "/tools",
				label: "Tools & Systems",
				icon: Wrench
			}
		]
	},
	{
		group: "My Workspace",
		portals: ["staff"],
		items: [
			{
				to: "/me/profile",
				label: "My Profile",
				icon: User
			},
			{
				to: "/me/leave",
				label: "Leave Requests",
				icon: CalendarDays
			},
			{
				to: "/me/declaration",
				label: "HR Documents",
				icon: FilePenLine
			}
		]
	},
	{
		group: "Client Delivery",
		managerOnly: true,
		portals: ["staff"],
		items: [{
			to: "/reports",
			label: "Monthly Reports",
			icon: FileChartColumn
		}]
	},
	{
		group: "All In One — Host",
		managerOnly: true,
		portals: ["manager"],
		items: [
			{
				to: "/host",
				label: "Host Dashboard",
				icon: LayoutDashboard
			},
			{
				to: "/host/learners",
				label: "Placed Learners",
				icon: Users
			},
			{
				to: "/host/workforce",
				label: "Workforce",
				icon: Users
			},
			{
				to: "/host/performance",
				label: "Performance",
				icon: ChartColumn
			},
			{
				to: "/host/coaching",
				label: "Coaching Notes",
				icon: FilePenLine
			},
			{
				to: "/host/onboarding",
				label: "Onboarding",
				icon: ClipboardList
			},
			{
				to: "/host/marketplace",
				label: "Learner Marketplace",
				icon: Compass
			},
			{
				to: "/host/recruitment",
				label: "Recruitment",
				icon: Users
			},
			{
				to: "/host/check",
				label: "Host Employer Check",
				icon: ShieldCheck
			},
			{
				to: "/host/calendar",
				label: "Calendar",
				icon: CalendarDays
			},
			{
				to: "/host/projects",
				label: "Projects",
				icon: Briefcase
			},
			{
				to: "/host/tasks",
				label: "Tasks",
				icon: ListTree
			},
			{
				to: "/host/kpi",
				label: "KPI Management",
				icon: ChartColumn
			},
			{
				to: "/host/contracts",
				label: "Contracts",
				icon: FilePenLine
			},
			{
				to: "/host/documents",
				label: "Documents",
				icon: BookOpen
			},
			{
				to: "/host/messages",
				label: "Messages",
				icon: MessageCircle
			},
			{
				to: "/host/reports",
				label: "Host Reports",
				icon: FileChartColumn
			},
			{
				to: "/host/company",
				label: "Company Profile",
				icon: Building2
			},
			{
				to: "/host/settings",
				label: "Host Settings",
				icon: Settings
			}
		]
	},
	{
		group: "All In One — HR",
		hrOnly: true,
		portals: ["hr"],
		items: [
			{
				to: "/host/hr",
				label: "HR Dashboard",
				icon: LayoutDashboard
			},
			{
				to: "/admin/attendance",
				label: "Live Staff Presence",
				icon: Clock
			},
			{
				to: "/host/hr/attendance",
				label: "Attendance Register",
				icon: CalendarDays
			},
			{
				to: "/host/hr/leave",
				label: "Leave Management",
				icon: CalendarDays
			},
			{
				to: "/host/hr/timesheets",
				label: "Timesheets",
				icon: ClipboardList
			},
			{
				to: "/host/hr/relations",
				label: "Employee Relations",
				icon: Users
			},
			{
				to: "/host/hr/recruitment",
				label: "HR Recruitment",
				icon: Users
			},
			{
				to: "/host/hr/performance",
				label: "HR Performance",
				icon: ChartColumn
			},
			{
				to: "/host/hr/talent",
				label: "Talent Management",
				icon: Crown
			},
			{
				to: "/host/hr/training",
				label: "Training & Development",
				icon: BookOpen
			},
			{
				to: "/host/hr/admin",
				label: "HR Administration",
				icon: Settings
			},
			{
				to: "/host/hr/integrations",
				label: "Integrations",
				icon: Wrench
			}
		]
	},
	{
		group: "Admin",
		managerOnly: true,
		portals: ["staff", "hr"],
		items: [
			{
				to: "/admin/attendance",
				label: "Staff Attendance",
				icon: Clock
			},
			{
				to: "/admin/team",
				label: "Team Management",
				icon: Users
			},
			{
				to: "/admin/audit",
				label: "Audit Logs",
				icon: ShieldCheck,
				rootOnly: true
			},
			{
				to: "/admin/sales-playbook",
				label: "Sales Playbook",
				icon: ClipboardList,
				rootOnly: true
			},
			{
				to: "/admin/kpis",
				label: "KPI Dashboards",
				icon: ChartColumn
			},
			{
				to: "/admin/content",
				label: "Content Editor",
				icon: Settings,
				rootOnly: true
			}
		]
	}
];
function AppShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShellInner, { children }) });
}
function ShellInner({ children }) {
	const [collapsed, setCollapsed] = (0, import_react.useState)(false);
	const [mobileOpen, setMobileOpen] = (0, import_react.useState)(false);
	const [searchOpen, setSearchOpen] = (0, import_react.useState)(false);
	const [mspOpen, setMspOpen] = (0, import_react.useState)(false);
	const [notificationsOpen, setNotificationsOpen] = (0, import_react.useState)(false);
	const [helpOpen, setHelpOpen] = (0, import_react.useState)(false);
	const [settingsOpen, setSettingsOpen] = (0, import_react.useState)(false);
	const { data } = useProfile();
	const isManagerOrAbove = data?.isManagerOrAbove ?? false;
	const isRootAdmin = data?.isRootAdmin ?? false;
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	(0, import_react.useEffect)(() => {
		const onKeyDown = (event) => {
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
	(0, import_react.useEffect)(() => {
		setMobileOpen(false);
	}, [pathname]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen w-full bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {
				collapsed,
				isManagerOrAbove,
				isRootAdmin
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open: mobileOpen,
				onOpenChange: setMobileOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetContent, {
					side: "left",
					className: "w-[280px] p-0 md:hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {
						collapsed: false,
						isManagerOrAbove,
						isRootAdmin,
						mobile: true
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
					onToggleSidebar: () => setCollapsed((c) => !c),
					onOpenMobileNav: () => setMobileOpen(true),
					collapsed,
					onOpenSearch: () => setSearchOpen(true),
					onOpenNotifications: () => setNotificationsOpen(true),
					onOpenHelp: () => setHelpOpen(true),
					onOpenSettings: () => setSettingsOpen(true)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "mx-auto w-full max-w-7xl flex-1 px-3 py-6 sm:px-4 sm:py-8 md:px-8",
					children
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MspBubble, { onOpen: () => setMspOpen(true) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalSearchDialog, {
				open: searchOpen,
				onOpenChange: setSearchOpen
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MspChatPanel, {
				open: mspOpen,
				onOpenChange: setMspOpen
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsPanel, {
				open: notificationsOpen,
				onOpenChange: setNotificationsOpen
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HelpPanel, {
				open: helpOpen,
				onOpenChange: setHelpOpen
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPanel, {
				open: settingsOpen,
				onOpenChange: setSettingsOpen
			})
		]
	});
}
function Sidebar({ collapsed, isManagerOrAbove, isRootAdmin, mobile = false }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { data } = useProfile();
	const selectedPortal = (typeof window !== "undefined" ? localStorage.getItem("msp.selectedPortal") : null) ?? (data?.isHR ? "hr" : "staff");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: cn("relative shrink-0 flex-col overflow-hidden border-r border-white/15 bg-[#3b1d4d] text-white dark:bg-[#21172f]", mobile ? "flex h-full w-full" : "sticky top-0 hidden h-screen md:flex", !mobile && (collapsed ? "w-[68px]" : "w-[260px]")),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("flex h-[76px] items-center border-b border-white/10 px-4", collapsed && "justify-center px-2"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MspLogo, { showWord: !collapsed })
			}),
			!collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-3 mt-4 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[9px] font-semibold uppercase tracking-[0.18em] text-white/55",
					children: "Company workspace"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-white/80",
					children: "Internal operations portal"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex-1 overflow-y-auto px-2 py-4",
				children: NAV.map((section) => {
					if (section.managerOnly && !isManagerOrAbove) return null;
					if (section.hrOnly && !data?.isHR) return null;
					const visibleToAdmin = selectedPortal === "admin" && (section.portals?.includes("staff") || section.portals?.includes("manager"));
					if (section.portals && !section.portals.includes(selectedPortal) && !visibleToAdmin) return null;
					const items = section.items.filter((it) => !it.rootOnly || isRootAdmin);
					if (items.length === 0) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-5",
						children: [!collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/55",
							children: [section.group, section.managerOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "ml-1 inline h-2.5 w-2.5" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-0.5",
							children: items.map((item) => {
								const active = pathname === item.to || pathname.startsWith(item.to + "/");
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: item.to,
									className: cn("group flex items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2 text-sm font-medium transition", active ? "border-l-primary bg-white/12 text-white shadow-sm" : "text-white/70 hover:border-white/20 hover:bg-white/[0.06] hover:text-white", collapsed && "justify-center px-2"),
									title: collapsed ? item.label : void 0,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: cn("h-4 w-4 shrink-0", active && "text-primary") }), !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex flex-1 items-center gap-1.5 truncate",
										children: [item.label, item.rootOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "h-3 w-3 text-primary" })]
									})]
								}) }, item.to);
							})
						})]
					}, section.group);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-t border-white/10 p-3",
				children: !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] leading-relaxed text-white/60",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-white",
						children: "Need help?"
					}), " Open MSP Assist in the bottom-right corner."]
				})
			})
		]
	});
}
function TopBar({ onToggleSidebar, onOpenMobileNav, collapsed, onOpenSearch, onOpenNotifications, onOpenHelp, onOpenSettings }) {
	const { theme, toggle } = useTheme();
	const { data } = useProfile();
	useNavigate();
	const queryClient = useQueryClient();
	const fileInputRef = (0, import_react.useRef)(null);
	const [avatarUrl, setAvatarUrl] = (0, import_react.useState)(null);
	const [initialsMode, setInitialsMode] = (0, import_react.useState)(false);
	const [uploadingAvatar, setUploadingAvatar] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setAvatarUrl(data?.profile?.avatar_url ?? (typeof window !== "undefined" ? localStorage.getItem("msp.demoAvatar") : null));
		setInitialsMode(typeof window !== "undefined" && localStorage.getItem("msp.initialsMode") === "true");
	}, [data?.profile?.avatar_url]);
	const initials = (data?.profile?.full_name || data?.user?.email || "?").trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
	async function updateAvatar(event) {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file || !data?.user?.id) return;
		if (!file.type.startsWith("image/")) return;
		if (file.size > 5242880) return;
		setUploadingAvatar(true);
		try {
			const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
			const path = `${data.user.id}/avatar-${Date.now()}.${extension}`;
			const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
				upsert: true,
				contentType: file.type
			});
			if (uploadError) throw uploadError;
			const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(path);
			const publicUrl = publicData.publicUrl;
			const { error: profileError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", data.user.id);
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
			if (data?.user?.id) await supabase.from("profiles").update({ avatar_url: null }).eq("id", data.user.id);
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
			if (profile?.email && !localStorage.getItem("msp.rememberedEmail")) localStorage.setItem("msp.rememberedEmail", profile.email);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-xl sm:px-4 md:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				onClick: onOpenMobileNav,
				className: "md:hidden",
				"aria-label": "Open navigation",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-5 w-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				onClick: onToggleSidebar,
				className: "hidden md:flex",
				children: collapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsRight, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsLeft, { className: "h-4 w-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative min-w-0 flex-1 max-w-lg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onOpenSearch,
					className: "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-secondary/40 pl-9 pr-2 text-left text-sm text-muted-foreground transition hover:bg-secondary/70",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate",
						children: "Search SOPs, services, tools…"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
						className: "ml-auto hidden rounded border border-border bg-background/80 px-1.5 py-0.5 text-[10px] font-medium md:inline",
						children: "⌘K"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ml-auto flex shrink-0 items-center gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "Notifications",
						onClick: onOpenNotifications,
						className: "hidden sm:inline-flex",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "Help",
						onClick: onOpenHelp,
						className: "hidden sm:inline-flex",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						onClick: toggle,
						"aria-label": "Toggle theme",
						children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "ml-1 flex items-center gap-2 rounded-full border border-border px-1.5 py-1 transition hover:bg-secondary/60 sm:pr-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
								className: "h-8 w-8 border border-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
									src: avatarUrl ?? void 0,
									alt: "Profile picture"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
									className: "bg-primary/15 text-primary",
									children: initialsMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-semibold",
										children: initials
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, {
										className: "h-4 w-4",
										strokeWidth: 1.8
									})
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "hidden max-w-[150px] text-left sm:block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-xs font-semibold text-foreground",
									children: data?.profile?.full_name || "Signed in"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-[10px] text-muted-foreground",
									children: data?.profile?.job_title || "Staff member"
								})]
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
						align: "end",
						className: "w-56",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuLabel, {
								className: "space-y-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm",
										children: data?.profile?.full_name || "Signed in"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-xs font-normal text-muted-foreground",
										children: data?.user?.email
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoleBadge, { tier: data?.roleTier })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onSelect: () => fileInputRef.current?.click(),
								disabled: uploadingAvatar,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "mr-2 h-4 w-4" }),
									" ",
									uploadingAvatar ? "Uploading picture..." : avatarUrl ? "Change profile picture" : "Add profile picture"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onSelect: initialsMode ? useAvatarIcon : useInitials,
								disabled: uploadingAvatar,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "mr-2 h-4 w-4" }),
									" ",
									initialsMode ? "Use avatar icon" : "Use initials instead"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onClick: onOpenSettings,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "mr-2 h-4 w-4" }), " Portal settings"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onClick: signOut,
								className: "text-destructive focus:text-destructive",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "mr-2 h-4 w-4" }), " Sign out"]
							})
						]
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: fileInputRef,
				type: "file",
				accept: "image/*",
				onChange: updateAvatar,
				className: "hidden",
				"aria-label": "Upload profile picture"
			})
		]
	});
}
function MspBubble({ onOpen }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onOpen,
		className: "group fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:bg-primary/90",
		title: "Ask Msp",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-6 w-6" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success ring-2 ring-background" })]
	});
}
function RoleBadge({ tier }) {
	if (!tier) return null;
	const config = {
		root_admin: {
			label: "Root Admin",
			icon: Crown,
			cls: "bg-primary/20 text-primary"
		},
		manager: {
			label: "Manager",
			icon: KeyRound,
			cls: "bg-blue-500/20 text-blue-300 dark:text-blue-300"
		},
		staff: {
			label: "Staff",
			icon: User,
			cls: "bg-muted text-muted-foreground"
		},
		intern: {
			label: "Intern",
			icon: User,
			cls: "bg-muted/60 text-muted-foreground"
		}
	}[tier];
	const Icon = config.icon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", config.cls),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3 w-3" }),
			" ",
			config.label
		]
	});
}
function AuthedLayout() {
	(0, import_react.useEffect)(() => {
		const handlePageShow = async (event) => {
			if (event.persisted) try {
				const { data } = await supabase.auth.getUser();
				const demoUser = localStorage.getItem("msp.demoUser");
				if (!data?.user && !demoUser) window.location.replace("/auth");
			} catch {
				window.location.replace("/auth");
			}
		};
		window.addEventListener("pageshow", handlePageShow);
		return () => window.removeEventListener("pageshow", handlePageShow);
	}, []);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	if (pathname.startsWith("/host") || pathname.startsWith("/hr")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
}
//#endregion
export { AuthedLayout as component };
