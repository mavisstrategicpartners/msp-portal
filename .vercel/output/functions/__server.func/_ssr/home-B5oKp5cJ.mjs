import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-D_VAx1TB.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { I as Lightbulb, M as LogOut, Ot as ArrowRight, St as Briefcase, ct as CircleCheck, et as Cog, gt as ChartColumn, h as Sparkles, n as Wrench, nt as Clock, r as Workflow, tt as Coffee, u as TrendingUp, wt as BookOpen } from "../_libs/lucide-react.mjs";
import { n as useProfile, t as Card } from "./use-profile-BAMyUr1m.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/home-B5oKp5cJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useLocalStorage(key, initialValue) {
	const [storedValue, setStoredValue] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return initialValue;
		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.warn(`Error reading localStorage key "${key}":`, error);
			return initialValue;
		}
	});
	const setValue = (value) => {
		try {
			const valueToStore = value instanceof Function ? value(storedValue) : value;
			setStoredValue(valueToStore);
			if (typeof window !== "undefined") {
				window.localStorage.setItem(key, JSON.stringify(valueToStore));
				window.dispatchEvent(new CustomEvent("local-storage-update", { detail: {
					key,
					value: valueToStore
				} }));
			}
		} catch (error) {
			console.warn(`Error setting localStorage key "${key}":`, error);
		}
	};
	(0, import_react.useEffect)(() => {
		const handleStorageChange = (e) => {
			if ("key" in e && e.key === key && e.newValue !== null) try {
				setStoredValue(JSON.parse(e.newValue));
			} catch {}
			else if ("detail" in e && e.detail?.key === key) setStoredValue(e.detail.value);
		};
		window.addEventListener("storage", handleStorageChange);
		window.addEventListener("local-storage-update", handleStorageChange);
		return () => {
			window.removeEventListener("storage", handleStorageChange);
			window.removeEventListener("local-storage-update", handleStorageChange);
		};
	}, [key]);
	return [storedValue, setValue];
}
function StaffAttendanceWidget() {
	const [state, setState] = useLocalStorage("staff.attendance.state", "Clocked Out");
	const [clockInTime, setClockInTime] = useLocalStorage("staff.attendance.clockInTime", null);
	const [breakStartTime, setBreakStartTime] = useLocalStorage("staff.attendance.breakStartTime", null);
	const [totalBreakMs, setTotalBreakMs] = useLocalStorage("staff.attendance.totalBreakMs", 0);
	const [now, setNow] = (0, import_react.useState)(Date.now());
	(0, import_react.useEffect)(() => {
		const timer = setInterval(() => setNow(Date.now()), 1e3);
		return () => clearInterval(timer);
	}, []);
	const handleClockIn = () => {
		setState("Clocked In");
		setClockInTime(Date.now());
		setTotalBreakMs(0);
		toast.success("Clocked In", { description: "Have a great day at work!" });
	};
	const handleStartBreak = () => {
		setState("On Break");
		setBreakStartTime(Date.now());
		toast("Break Started", { description: "Enjoy your break!" });
	};
	const handleEndBreak = () => {
		if (breakStartTime) setTotalBreakMs((prev) => prev + (Date.now() - breakStartTime));
		setState("Clocked In");
		setBreakStartTime(null);
		toast("Break Ended", { description: "Welcome back." });
	};
	const handleClockOut = () => {
		if (state === "On Break" && breakStartTime) {
			setTotalBreakMs((prev) => prev + (Date.now() - breakStartTime));
			setBreakStartTime(null);
		}
		setState("Clocked Out");
		toast.success("Clocked Out", { description: "Great work today! See you tomorrow." });
	};
	const calculateHoursWorked = () => {
		if (!clockInTime) return "0h 0m";
		const endTime = state === "Clocked Out" ? Date.now() : now;
		if (state === "Clocked Out") return "0h 0m";
		let elapsed = endTime - clockInTime - totalBreakMs;
		if (state === "On Break" && breakStartTime) elapsed -= now - breakStartTime;
		const totalMinutes = Math.max(0, Math.floor(elapsed / 6e4));
		return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "flex flex-col border-border/70 p-5 transition-colors hover:border-primary/40 relative overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-20 ${state === "Clocked In" ? "bg-green-500" : state === "On Break" ? "bg-orange-500" : "bg-gray-500"}` }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between mb-4 relative z-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "text-lg font-semibold flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "w-5 h-5 text-primary" }), "Time Tracking"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-1",
					children: "Manage your attendance"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-2xl font-bold font-mono tracking-tight",
						children: calculateHoursWorked()
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] uppercase font-semibold tracking-wider text-muted-foreground",
						children: "Active Time"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 mt-2 relative z-10",
				children: [
					state === "Clocked Out" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: handleClockIn,
						className: "flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all hover:scale-[1.02]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "w-4 h-4 mr-2" }), "Clock In"]
					}),
					state === "Clocked In" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: handleStartBreak,
						variant: "outline",
						className: "flex-1 border-orange-200 bg-orange-50/50 hover:bg-orange-100 text-orange-700 dark:border-orange-900/50 dark:bg-orange-900/20 dark:text-orange-400",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coffee, { className: "w-4 h-4 mr-2" }), "Take Break"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: handleClockOut,
						variant: "destructive",
						className: "flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "w-4 h-4 mr-2" }), "Clock Out"]
					})] }),
					state === "On Break" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: handleEndBreak,
						className: "flex-1 bg-green-600 hover:bg-green-700 text-white",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "w-4 h-4 mr-2" }), "Resume Work"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: handleClockOut,
						variant: "destructive",
						className: "flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "w-4 h-4 mr-2" }), "Clock Out"]
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-center gap-2 text-xs font-medium relative z-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: "Status:"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${state === "Clocked In" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : state === "On Break" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"}`,
					children: state
				})]
			})
		]
	});
}
var CORE_RULES = [
	{
		icon: TrendingUp,
		label: "Leads over Followers",
		desc: "We chase revenue, not vanity metrics."
	},
	{
		icon: Workflow,
		label: "Systems over Campaigns",
		desc: "A campaign ends. A system compounds."
	},
	{
		icon: Cog,
		label: "Automation over Manual Work",
		desc: "If it can be automated, it must be."
	},
	{
		icon: ChartColumn,
		label: "Data over Opinions",
		desc: "Numbers decide. Opinions guide."
	}
];
var TIPS = [
	"Ask Msp 'how do I send a client invoice?' and it'll walk you through the SOP.",
	"New here? Check the SOP Library to see exactly what's expected in your role.",
	"Leads contacted within 5 minutes are 21× more likely to convert.",
	"Press ⌘K (or Ctrl+K) anywhere to search the whole portal.",
	"Every ad needs Hook → Problem → Solution → CTA. No exceptions."
];
function greeting() {
	const hour = Number(new Intl.DateTimeFormat("en-ZA", {
		timeZone: "Africa/Johannesburg",
		hour: "numeric",
		hour12: false
	}).format(/* @__PURE__ */ new Date()));
	if (hour < 12) return "Good morning";
	if (hour < 17) return "Good afternoon";
	return "Good evening";
}
function Home() {
	const { data } = useProfile();
	const greetingText = greeting();
	const name = data?.profile?.full_name?.trim() ?? "there";
	const tip = TIPS[(/* @__PURE__ */ new Date()).getDate() % TIPS.length];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "text-3xl font-bold tracking-tight sm:text-4xl",
				children: [
					greetingText,
					", ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "brand-text",
						children: name
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-2xl text-muted-foreground",
				children: "Welcome to the Mavis Strategic Partners portal — your single source of truth for how we work, what we sell, and how to do your job brilliantly."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-3 gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "md:col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "flex flex-col justify-center h-full gap-3 border-primary/20 bg-primary/[0.04] p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-md border border-primary/20 bg-primary/10 p-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-primary" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold uppercase tracking-wide text-primary",
								children: "Tip of the day"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-0.5 flex items-start gap-1.5 text-sm text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "h-4 w-4 shrink-0 text-primary mt-0.5" }), tip]
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "md:col-span-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffAttendanceWidget, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground",
				children: "The four core rules"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4",
				children: CORE_RULES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "group border-border/70 p-5 transition-colors hover:border-primary/40",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(r.icon, { className: "relative h-6 w-6 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "relative mt-4 text-sm font-semibold",
							children: r.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "relative mt-1 text-xs text-muted-foreground",
							children: r.desc
						})
					]
				}, r.label))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground",
				children: "Jump back in"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-1 gap-4 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickLink, {
						to: "/sops",
						icon: BookOpen,
						title: "SOP Library",
						desc: "How every department works."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickLink, {
						to: "/services",
						icon: Briefcase,
						title: "Our Services",
						desc: "The 7 services we sell."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickLink, {
						to: "/tools",
						icon: Wrench,
						title: "Tools & Systems",
						desc: "GHL, Meta, Zoho, Slack…"
					})
				]
			})] })
		]
	});
}
function QuickLink({ to, icon: Icon, title, desc }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to,
		className: "group",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "flex items-start justify-between gap-3 border-border/70 p-5 transition-colors hover:border-primary/40",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5 text-primary" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm font-semibold",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-xs text-muted-foreground",
					children: desc
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" })]
		})
	});
}
//#endregion
export { Home as component };
