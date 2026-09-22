import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-D_VAx1TB.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Dt as ArrowUpRight, St as Briefcase, Z as Download, ct as CircleCheck, i as Users, ot as CircleX, tt as Coffee, y as Search } from "../_libs/lucide-react.mjs";
import { n as useProfile, t as Card } from "./use-profile-BAMyUr1m.mjs";
import { t as Input } from "./input-CyugdGDp.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-CjSr-yN4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/attendance-Ciq7cx-S.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var INITIAL_STAFF = [
	{
		id: 1,
		name: "Siphelele Malotana",
		role: "Full Stack Engineer",
		department: "Engineering",
		tier: "Permanent",
		status: "Clocked In",
		time: "08:00",
		hours: "4h 15m",
		currentProject: "MSP Portal V2",
		avatar: ""
	},
	{
		id: 2,
		name: "Thandi Mokoena",
		role: "HR Operations Lead",
		department: "HR",
		tier: "Permanent",
		status: "Clocked In",
		time: "07:45",
		hours: "4h 30m",
		currentProject: "Q3 Intake Induction",
		avatar: ""
	},
	{
		id: 3,
		name: "Bongani Zulu",
		role: "Cloud Solutions Engineer",
		department: "Engineering",
		tier: "Permanent",
		status: "On Break",
		time: "08:15",
		hours: "3h 45m",
		currentProject: "AWS Cloud Migration",
		avatar: ""
	},
	{
		id: 4,
		name: "Karabo Mthembu",
		role: "Cybersecurity Intern",
		department: "Engineering",
		tier: "Intern",
		status: "Clocked In",
		time: "08:30",
		hours: "3h 30m",
		currentProject: "Security Audit Sprint",
		avatar: ""
	},
	{
		id: 5,
		name: "Sipho Dlamini",
		role: "Software Developer Intern",
		department: "Engineering",
		tier: "Intern",
		status: "Clocked In",
		time: "08:30",
		hours: "3h 30m",
		currentProject: "Client Portal Rebuild",
		avatar: ""
	},
	{
		id: 6,
		name: "Sarah Johnson",
		role: "Senior Sales Executive",
		department: "Sales",
		tier: "Permanent",
		status: "Clocked In",
		time: "09:00",
		hours: "3h 00m",
		currentProject: "Enterprise Inbound Deals",
		avatar: ""
	},
	{
		id: 7,
		name: "Naledi Nkosi",
		role: "Marketing & Brand Intern",
		department: "Marketing",
		tier: "Intern",
		status: "On Break",
		time: "08:45",
		hours: "3h 15m",
		currentProject: "Brand Assets Campaign",
		avatar: ""
	},
	{
		id: 8,
		name: "David Smith",
		role: "Growth Specialist Intern",
		department: "Marketing",
		tier: "Intern",
		status: "Clocked Out",
		time: "-",
		hours: "0h 0m",
		currentProject: "SEO Optimization",
		avatar: ""
	},
	{
		id: 9,
		name: "Anele Radebe",
		role: "Operations Specialist",
		department: "Operations",
		tier: "Permanent",
		status: "Clocked In",
		time: "08:10",
		hours: "3h 50m",
		currentProject: "SOP Governance",
		avatar: ""
	}
];
function AdminAttendanceCommandCenter() {
	const [search, setSearch] = (0, import_react.useState)("");
	const [selectedDept, setSelectedDept] = (0, import_react.useState)("All");
	const [selectedStatus, setSelectedStatus] = (0, import_react.useState)("All");
	const [staffList, setStaffList] = (0, import_react.useState)(INITIAL_STAFF);
	const { data: profile } = useProfile();
	(0, import_react.useEffect)(() => {
		const syncLocalUser = () => {
			const localState = localStorage.getItem("staff.attendance.state")?.replace(/"/g, "");
			const clockInTime = localStorage.getItem("staff.attendance.clockInTime");
			const currentUserName = profile?.profile?.full_name || "You (Logged In User)";
			let formattedTime = "-";
			let formattedHours = "0h 0m";
			if (clockInTime && localState && localState !== "Clocked Out") {
				formattedTime = new Date(Number(clockInTime)).toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit"
				});
				const elapsedMinutes = Math.max(1, Math.floor((Date.now() - Number(clockInTime)) / 6e4));
				formattedHours = `${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m`;
			}
			setStaffList((prev) => {
				const exists = prev.find((s) => s.id === 999 || s.name.toLowerCase() === currentUserName.toLowerCase());
				if (exists) return prev.map((s) => s.id === exists.id ? {
					...s,
					status: localState || s.status,
					time: localState && localState !== "Clocked Out" ? formattedTime : "-",
					hours: localState && localState !== "Clocked Out" ? formattedHours : "0h 0m"
				} : s);
				else if (profile?.profile?.full_name) return [{
					id: 999,
					name: currentUserName,
					role: profile?.profile?.job_title || "Staff Member",
					department: "Engineering",
					tier: "Permanent",
					status: localState || "Clocked Out",
					time: localState && localState !== "Clocked Out" ? formattedTime : "-",
					hours: localState && localState !== "Clocked Out" ? formattedHours : "0h 0m",
					currentProject: "MSP Operations"
				}, ...prev];
				return prev;
			});
		};
		syncLocalUser();
		window.addEventListener("storage", syncLocalUser);
		window.addEventListener("local-storage-update", syncLocalUser);
		return () => {
			window.removeEventListener("storage", syncLocalUser);
			window.removeEventListener("local-storage-update", syncLocalUser);
		};
	}, [profile]);
	const filteredStaff = staffList.filter((s) => {
		const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase()) || s.department.toLowerCase().includes(search.toLowerCase()) || s.currentProject.toLowerCase().includes(search.toLowerCase());
		const matchesDept = selectedDept === "All" || (selectedDept === "Interns" ? s.tier === "Intern" : s.department === selectedDept);
		const matchesStatus = selectedStatus === "All" || s.status === selectedStatus;
		return matchesSearch && matchesDept && matchesStatus;
	});
	const stats = {
		total: staffList.length,
		active: staffList.filter((s) => s.status === "Clocked In").length,
		break: staffList.filter((s) => s.status === "On Break").length,
		out: staffList.filter((s) => s.status === "Clocked Out").length,
		interns: staffList.filter((s) => s.tier === "Intern").length
	};
	const activeRate = Math.round((stats.active + stats.break) / (stats.total || 1) * 100);
	const exportSummary = () => {
		toast.success("Attendance Report Exported", { description: `Exported live status for ${staffList.length} staff members (CSV).` });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8 max-w-7xl mx-auto pb-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/70 pb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400",
							children: "Live Operations Command Center"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 text-3xl font-bold tracking-tight sm:text-4xl text-foreground",
						children: "Workforce Presence & Attendance"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Real-time monitoring of all MSP departments, permanent staff, and active intern cohorts."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: exportSummary,
						className: "gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), "Export Report"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						className: "gap-2 bg-primary hover:bg-primary/90",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/host/tasks",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, { className: "h-4 w-4" }), "Assign Tasks"]
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5 border-border/70 bg-gradient-to-br from-card to-card/50 shadow-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
									children: "Total Workforce"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-2 rounded-lg bg-primary/10 text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5" })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex items-baseline gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-3xl font-bold tracking-tight text-foreground",
									children: stats.total
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted-foreground font-medium",
									children: [
										"(",
										stats.interns,
										" interns)"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "Monitored across 5 departments"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5 border-border/70 border-l-4 border-l-emerald-500 bg-gradient-to-br from-card to-emerald-500/[0.03] shadow-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400",
									children: "Clocked In (Active)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-5 w-5" })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex items-baseline gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-3xl font-bold tracking-tight text-foreground",
									children: stats.active
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs font-semibold text-emerald-600 dark:text-emerald-400",
									children: [activeRate, "% of workforce"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "Currently actively working"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5 border-border/70 border-l-4 border-l-amber-500 bg-gradient-to-br from-card to-amber-500/[0.03] shadow-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400",
									children: "On Break"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coffee, { className: "h-5 w-5" })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex items-baseline gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-3xl font-bold tracking-tight text-foreground",
									children: stats.break
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "temporary pause"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "Expected to resume shortly"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5 border-border/70 border-l-4 border-l-slate-400 bg-gradient-to-br from-card to-slate-400/[0.03] shadow-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
									children: "Clocked Out / Off"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-2 rounded-lg bg-muted text-muted-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-5 w-5" })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex items-baseline gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-3xl font-bold tracking-tight text-foreground",
									children: stats.out
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "offline"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "Shift ended or off-duty"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border/70 overflow-hidden shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5 border-b border-border/60 bg-muted/20 space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold text-muted-foreground mr-2 shrink-0",
							children: "Filter By:"
						}), [
							"All",
							"Interns",
							"Engineering",
							"HR",
							"Sales",
							"Marketing",
							"Operations"
						].map((dept) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setSelectedDept(dept),
							className: `px-3 py-1.5 rounded-md font-medium transition shrink-0 ${selectedDept === dept ? "bg-primary text-primary-foreground shadow-sm" : "bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground border border-border/50"}`,
							children: dept === "Interns" ? "🎓 Interns / Learners" : dept
						}, dept))]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex-1 max-w-md",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Search staff, intern name, role, or project...",
								value: search,
								onChange: (e) => setSearch(e.target.value),
								className: "pl-9 bg-background"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-1.5 overflow-x-auto text-xs",
							children: [
								"All",
								"Clocked In",
								"On Break",
								"Clocked Out"
							].map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setSelectedStatus(st),
								className: `px-2.5 py-1 rounded-full text-[11px] font-medium transition shrink-0 border ${selectedStatus === st ? "bg-foreground text-background border-foreground font-semibold" : "bg-background text-muted-foreground border-border hover:border-foreground/40"}`,
								children: [
									st === "Clocked In" && "🟢 ",
									st === "On Break" && "🟡 ",
									st === "Clocked Out" && "⚪ ",
									st === "All" ? "All Statuses" : st
								]
							}, st))
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border/60",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-6 py-3.5 font-semibold",
									children: "Staff Member"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-6 py-3.5 font-semibold",
									children: "Department & Tier"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-6 py-3.5 font-semibold",
									children: "Teams Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-6 py-3.5 font-semibold",
									children: "Clocked In"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-6 py-3.5 font-semibold",
									children: "Active Hours"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-6 py-3.5 font-semibold",
									children: "Current Project"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-6 py-3.5 font-semibold text-right",
									children: "Actions"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
							className: "divide-y divide-border/50 bg-card",
							children: [filteredStaff.map((staff) => {
								const isClockedIn = staff.status === "Clocked In";
								const isOnBreak = staff.status === "On Break";
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-muted/15 transition-colors group",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-6 py-4",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "relative",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
														className: "h-9 w-9 border border-border",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: staff.avatar }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
															className: "bg-primary/10 text-primary font-semibold text-xs",
															children: staff.name.split(" ").map((n) => n[0]).join("")
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-background ${isClockedIn ? "bg-emerald-500 animate-pulse" : isOnBreak ? "bg-amber-500" : "bg-slate-400"}` })]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "font-semibold text-foreground flex items-center gap-1.5",
													children: [staff.name, staff.id === 999 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono",
														children: "YOU"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted-foreground",
													children: staff.role
												})] })]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-6 py-4",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col items-start gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-medium text-foreground text-xs",
													children: staff.department
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `text-[10px] px-2 py-0.5 rounded-full font-medium ${staff.tier === "Intern" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`,
													children: staff.tier
												})]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-6 py-4",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isClockedIn ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-500/20" : isOnBreak ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-500/20" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700"}`,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-1.5 w-1.5 rounded-full ${isClockedIn ? "bg-emerald-500" : isOnBreak ? "bg-amber-500" : "bg-slate-400"}` }), staff.status]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-6 py-4 font-mono text-xs text-muted-foreground",
											children: staff.time
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-6 py-4 font-mono text-xs font-bold text-foreground",
											children: staff.hours
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-6 py-4",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex items-center gap-1 text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded border border-border/50",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, { className: "h-3 w-3 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "truncate max-w-[140px]",
													children: staff.currentProject
												})]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-6 py-4 text-right",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												asChild: true,
												variant: "ghost",
												size: "sm",
												className: "h-8 text-xs gap-1 hover:text-primary",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
													to: "/host/tasks",
													children: ["Assign ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-3.5 w-3.5" })]
												})
											})
										})
									]
								}, staff.id);
							}), filteredStaff.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								colSpan: 7,
								className: "px-6 py-12 text-center text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold text-foreground",
									children: "No employees or interns found"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs mt-1",
									children: "Try adjusting your department filter or search criteria."
								})]
							}) })]
						})]
					})
				})]
			})
		]
	});
}
//#endregion
export { AdminAttendanceCommandCenter as component };
