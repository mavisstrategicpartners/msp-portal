import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-yJUBr8rP.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as Plus, D as Moon, E as Paperclip, Et as Award, G as FileText, H as GraduationCap, I as Lightbulb, M as LogOut, N as Lock, Tt as Bell, V as HeartPulse, W as Folder, _t as Camera, a as User, at as Circle, b as Scale, bt as Calculator, c as Upload, d as Trash2, f as Target, gt as ChartColumn, h as Sparkles, i as Users, m as Sun, nt as Clock, ot as CircleX, rt as ClipboardList, s as UserRound, vt as Calendar } from "../_libs/lucide-react.mjs";
import { i as usePrompt, r as useConfirm } from "./router-CM1gTbxc.mjs";
import { a as Routes, i as Route, n as Navigate, s as useLocation, t as MemoryRouter } from "../_libs/react-router.mjs";
import { t as Link } from "../_libs/react-router-dom.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/EmbeddedApp-DsErOjDg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ThemeContext = (0, import_react.createContext)({
	theme: "light",
	toggleTheme: () => {}
});
function ThemeProvider({ children }) {
	const [theme, setTheme] = (0, import_react.useState)(() => localStorage.getItem("msp-theme") || localStorage.getItem("host-theme") || "dark");
	(0, import_react.useEffect)(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
		localStorage.setItem("msp-theme", theme);
		localStorage.setItem("msp.theme", theme);
		localStorage.setItem("host-theme", theme);
	}, [theme]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeContext.Provider, {
		value: {
			theme,
			toggleTheme: () => setTheme((t) => t === "light" ? "dark" : "light")
		},
		children
	});
}
var useTheme = () => (0, import_react.useContext)(ThemeContext);
var Ctx = (0, import_react.createContext)(null);
var KEY$1 = "linkora.notifications.v1";
var seed = [
	{
		id: "N1",
		title: "New leave request",
		body: "Sipho Dlamini submitted a sick leave request with a medical certificate.",
		link: "/hr/leave",
		kind: "leave",
		unread: true,
		at: Date.now() - 18e5
	},
	{
		id: "N2",
		title: "Contract awaiting signature",
		body: "Host Agreement — Cohort 2026 is waiting for your signature.",
		link: "/host/documents",
		kind: "doc",
		unread: true,
		at: Date.now() - 72e5
	},
	{
		id: "N3",
		title: "Timesheet approvals due",
		body: "3 timesheets pending your approval for the week of 30 Jun.",
		link: "/hr/timesheets",
		kind: "timesheet",
		unread: true,
		at: Date.now() - 18e6
	},
	{
		id: "N4",
		title: "New candidate shortlisted",
		body: "Ayanda Pillay was recommended by the AI matching engine.",
		link: "/host/marketplace",
		kind: "recruit",
		unread: false,
		at: Date.now() - 936e5
	},
	{
		id: "N5",
		title: "Quarterly report reminder",
		body: "Managers must submit their quarterly learner reports by end of month.",
		link: "/host/company",
		kind: "reminder",
		unread: false,
		at: Date.now() - 144e6
	}
];
function NotificationProvider({ children }) {
	const [list, setList] = (0, import_react.useState)(() => {
		try {
			const raw = localStorage.getItem(KEY$1);
			if (raw) return JSON.parse(raw);
		} catch {}
		return seed;
	});
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem(KEY$1, JSON.stringify(list));
		} catch {}
	}, [list]);
	const push = (0, import_react.useCallback)((n) => setList((prev) => [{
		id: "N" + Date.now(),
		unread: true,
		at: Date.now(),
		...n
	}, ...prev].slice(0, 50)), []);
	const markRead = (0, import_react.useCallback)((id) => setList((prev) => prev.map((n) => n.id === id ? {
		...n,
		unread: false
	} : n)), []);
	const markAllRead = (0, import_react.useCallback)(() => setList((prev) => prev.map((n) => ({
		...n,
		unread: false
	}))), []);
	const remove = (0, import_react.useCallback)((id) => setList((prev) => prev.filter((n) => n.id !== id)), []);
	const unreadCount = list.filter((n) => n.unread).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ctx.Provider, {
		value: {
			list,
			push,
			markRead,
			markAllRead,
			remove,
			unreadCount
		},
		children
	});
}
var useNotifications = () => (0, import_react.useContext)(Ctx);
function timeAgo(ts) {
	const d = Math.floor((Date.now() - ts) / 1e3);
	if (d < 60) return d + "s ago";
	if (d < 3600) return Math.floor(d / 60) + "m ago";
	if (d < 86400) return Math.floor(d / 3600) + "h ago";
	return Math.floor(d / 86400) + "d ago";
}
var icons = {
	leave: Calendar,
	doc: FileText,
	timesheet: Clock,
	recruit: Users,
	reminder: Bell
};
function NotificationBell() {
	const { list, unreadCount, markRead, markAllRead, remove } = useNotifications();
	const [open, setOpen] = (0, import_react.useState)(false);
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const h = (e) => {
			if (ref.current && !ref.current.contains(e.target)) setOpen(false);
		};
		document.addEventListener("mousedown", h);
		return () => document.removeEventListener("mousedown", h);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		style: { position: "relative" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			className: "btn btn-ghost",
			onClick: () => setOpen((o) => !o),
			style: {
				position: "relative",
				padding: "8px 10px"
			},
			"aria-label": "Notifications",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { size: 16 }), unreadCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				style: {
					position: "absolute",
					top: 2,
					right: 2,
					background: "var(--danger)",
					color: "white",
					fontSize: 10,
					fontWeight: 700,
					borderRadius: 999,
					minWidth: 16,
					height: 16,
					padding: "0 4px",
					display: "grid",
					placeItems: "center"
				},
				children: unreadCount
			})]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card",
			style: {
				position: "absolute",
				top: "110%",
				right: 0,
				width: 360,
				padding: 0,
				zIndex: 50,
				boxShadow: "var(--shadow-md)",
				maxHeight: 480,
				display: "flex",
				flexDirection: "column"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					padding: "12px 14px",
					borderBottom: "1px solid var(--border-color)",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						fontWeight: 700,
						fontSize: 14
					},
					children: "Notifications"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					style: {
						padding: "4px 8px",
						fontSize: 11
					},
					onClick: markAllRead,
					children: "Mark all read"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					overflowY: "auto",
					flex: 1
				},
				children: [list.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						padding: 30,
						textAlign: "center",
						color: "var(--text-muted)",
						fontSize: 12
					},
					children: "You're all caught up."
				}), list.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						padding: "10px 14px",
						borderBottom: "1px solid var(--border-color)",
						background: n.unread ? "var(--brand-soft)" : "transparent",
						display: "flex",
						gap: 10
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: { color: "var(--brand)" },
							children: (() => {
								const Icon = icons[n.kind] || Circle;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 18 });
							})()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								flex: 1,
								minWidth: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: n.link || "#",
									onClick: () => {
										markRead(n.id);
										setOpen(false);
									},
									style: {
										display: "block",
										fontSize: 13,
										fontWeight: 600
									},
									children: n.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: 12,
										color: "var(--text-secondary)",
										marginTop: 2
									},
									children: n.body
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: 10,
										color: "var(--text-muted)",
										marginTop: 4
									},
									children: timeAgo(n.at)
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn btn-ghost",
							style: {
								padding: 4,
								fontSize: 12,
								color: "var(--text-muted)"
							},
							onClick: () => remove(n.id),
							"aria-label": "Dismiss",
							children: "×"
						})
					]
				}, n.id))]
			})]
		})]
	});
}
var KEY = "linkora.sidebar.scroll";
function useSidebarScrollRef(navRef) {
	(0, import_react.useEffect)(() => {
		const el = navRef.current;
		if (!el) return;
		try {
			const y = Number(sessionStorage.getItem(KEY) || 0);
			if (!Number.isNaN(y)) el.scrollTop = y;
		} catch {}
		const onScroll = () => {
			try {
				sessionStorage.setItem(KEY, String(el.scrollTop));
			} catch {}
		};
		el.addEventListener("scroll", onScroll, { passive: true });
		return () => el.removeEventListener("scroll", onScroll);
	}, []);
}
function useLocalStorage(key, initial) {
	const [value, setValue] = (0, import_react.useState)(() => {
		try {
			const raw = localStorage.getItem(key);
			if (raw !== null) return JSON.parse(raw);
		} catch {}
		return typeof initial === "function" ? initial() : initial;
	});
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch {}
	}, [key, value]);
	return [value, setValue];
}
var uid = (p = "id") => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
var FIXED = [
	{
		md: "01-01",
		name: "New Year's Day",
		description: "Public holiday marking the start of the calendar year."
	},
	{
		md: "03-21",
		name: "Human Rights Day",
		description: "Commemorates the Sharpeville massacre of 21 March 1960."
	},
	{
		md: "04-27",
		name: "Freedom Day",
		description: "Marks South Africa’s first post-apartheid democratic elections in 1994."
	},
	{
		md: "05-01",
		name: "Workers' Day",
		description: "International Labour Day, honouring the contribution of workers."
	},
	{
		md: "06-16",
		name: "Youth Day",
		description: "Commemorates the 1976 Soweto Uprising and the role of the youth in South Africa’s liberation."
	},
	{
		md: "08-09",
		name: "National Women's Day",
		description: "Commemorates the 1956 women’s march to the Union Buildings against pass laws."
	},
	{
		md: "09-24",
		name: "Heritage Day",
		description: "Celebrates the cultural diversity and heritage of all South Africans."
	},
	{
		md: "12-16",
		name: "Day of Reconciliation",
		description: "Promotes national unity and reconciliation between all South Africans."
	},
	{
		md: "12-25",
		name: "Christmas Day",
		description: "Christian public holiday celebrated worldwide."
	},
	{
		md: "12-26",
		name: "Day of Goodwill",
		description: "Public holiday following Christmas Day, dedicated to goodwill and reflection."
	}
];
function easterSunday(year) {
	const a = year % 19;
	const b = Math.floor(year / 100);
	const c = year % 100;
	const d = Math.floor(b / 4);
	const e = b % 4;
	const f = Math.floor((b + 8) / 25);
	const g = Math.floor((b - f + 1) / 3);
	const h = (19 * a + b - d - g + 15) % 30;
	const i = Math.floor(c / 4);
	const k = c % 4;
	const L = (32 + 2 * e + 2 * i - h - k) % 7;
	const m = Math.floor((a + 11 * h + 22 * L) / 451);
	return [Math.floor((h + L - 7 * m + 114) / 31), (h + L - 7 * m + 114) % 31 + 1];
}
function addDays(y, m, d, delta) {
	const dt = new Date(y, m - 1, d + delta);
	return [
		dt.getFullYear(),
		dt.getMonth() + 1,
		dt.getDate()
	];
}
var pad = (n) => String(n).padStart(2, "0");
var key = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
function easterHolidays(year) {
	const [em, ed] = easterSunday(year);
	const [gy, gm, gd] = addDays(year, em, ed, -2);
	const [fy, fm, fd] = addDays(year, em, ed, 1);
	return [{
		date: key(gy, gm, gd),
		name: "Good Friday",
		description: "Christian public holiday commemorating the crucifixion of Jesus Christ."
	}, {
		date: key(fy, fm, fd),
		name: "Family Day",
		description: "The Monday after Easter Sunday — a day for spending time with family."
	}];
}
function forYear(year) {
	return [...FIXED.map((h) => ({
		date: `${year}-${h.md}`,
		name: h.name,
		description: h.description
	})), ...easterHolidays(year)].sort((a, b) => a.date.localeCompare(b.date));
}
var startYear = (/* @__PURE__ */ new Date()).getFullYear() - 2;
var endYear = (/* @__PURE__ */ new Date()).getFullYear() + 5;
var ZA_PUBLIC_HOLIDAYS = Array.from({ length: endYear - startYear + 1 }, (_, i) => forYear(startYear + i)).flat();
var _index = new Map(ZA_PUBLIC_HOLIDAYS.map((h) => [h.date, h]));
function holidayOn(dateKey) {
	return _index.get(dateKey) || null;
}
var HOST_COMPANY = "Mavis Strategic Partners";
var firstNames = [
	"Sipho",
	"Lerato",
	"Naledi",
	"Bongani",
	"Karabo",
	"Anele",
	"Themba",
	"Zinhle",
	"Lwazi",
	"Palesa",
	"Kagiso",
	"Nomvula",
	"Mandla",
	"Refilwe",
	"Tumelo",
	"Boitumelo",
	"Sibusiso",
	"Nokuthula"
];
var lastNames = [
	"Dlamini",
	"Khumalo",
	"Mokoena",
	"Nkosi",
	"Mthembu",
	"Zulu",
	"Ndlovu",
	"Sithole",
	"Mahlangu",
	"Radebe",
	"Sibiya",
	"Mokwena",
	"Hlongwane",
	"Khoza"
];
var programs = [
	"Software Development NQF5",
	"Data Analytics NQF5",
	"Cloud Engineering NQF6",
	"Cybersecurity NQF5",
	"UX/UI Design NQF5"
];
var statuses = [
	"Active",
	"On Leave",
	"Completed",
	"At Risk"
];
var hostProfile = {
	company_name: "Mavis Strategic Partners (Pty) Ltd",
	contact_person: "Thandi Mokoena",
	contact_title: "HR & Talent Lead",
	email: "thandi@linkora.co.za",
	alt_email: "ops@linkora.co.za",
	phone: "+27 11 555 1234",
	industry: "Information Technology",
	sector: "ICT & Digital Services",
	address: "12 Innovation Drive, Sandton, Johannesburg, 2196",
	registration_number: "2018/456123/07",
	bbbee_level: "Level 2",
	years_operating: 8,
	footprint: "Gauteng · Western Cape · KZN",
	website: "https://linkora.co.za",
	employees: 84,
	learners_current: 18,
	learners_previous: 46,
	last_intake: "2026-04-15",
	learners_requested: 8,
	roles_needed: "Junior software developers, UX design apprentices, cloud engineering learners",
	disability_accommodation: "Yes",
	disability_types: "Physical mobility, hearing impairment",
	virtual_site_visit: true,
	proximity_transport: "Walking distance to Gautrain Sandton",
	learner_capacity: 25,
	current_placements: 18,
	approval_status: "Approved",
	company_bio: "Mavis Strategic Partners is a South African technology services firm building enterprise cloud, data, and product platforms for local financial services and retail clients. We invest in workplace-based learning as a talent pipeline.",
	open_to_host: true,
	manager: {
		name: "Thandi Mokoena",
		role: "HR & Talent Lead",
		email: "thandi@linkora.co.za",
		phone: "+27 11 555 1234"
	},
	departments: [
		"Engineering",
		"Design",
		"Data",
		"People Ops"
	],
	programs: [
		"Software Development NQF5",
		"Data Analytics NQF5",
		"Cloud Engineering NQF6",
		"Cybersecurity NQF5",
		"UX/UI Design NQF5"
	]
};
function rand(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}
var seedLearners = Array.from({ length: 18 }, (_, i) => {
	const fn = firstNames[i % firstNames.length], ln = lastNames[i % lastNames.length];
	return {
		id: `L-${1001 + i}`,
		full_name: `${fn} ${ln}`,
		email: `${fn.toLowerCase()}.${ln.toLowerCase()}@learner.co.za`,
		phone: `+27 8${i % 5} 555 ${1e3 + i}`,
		program: programs[i % programs.length],
		company: HOST_COMPANY,
		mentor: rand(firstNames) + " " + rand(lastNames),
		mentor_phone: `+27 82 555 ${2e3 + i}`,
		sponsor: [
			"MerSETA",
			"Services SETA",
			"BankSETA",
			"MICT SETA"
		][i % 4],
		start_date: `2025-${String(1 + i % 9).padStart(2, "0")}-${String(5 + i % 20).padStart(2, "0")}`,
		end_date: `2026-${String(1 + i % 12).padStart(2, "0")}-15`,
		status: statuses[i % statuses.length],
		attendance_rate: 70 + i * 3 % 30,
		performance_score: 60 + i * 5 % 40,
		progress: i * 11 % 100,
		bio: "Enthusiastic learner working through a workplace-based rotation programme. Reliable, coachable and a strong team contributor.",
		skills: [
			"Communication",
			"Teamwork",
			i % 2 ? "JavaScript" : "Python",
			i % 3 ? "SQL" : "Excel"
		],
		disability: i % 7 === 0 ? "Hearing impairment" : null,
		location: [
			"Johannesburg",
			"Cape Town",
			"Pretoria",
			"Durban"
		][i % 4],
		qualifications: ["NQF Level 5 Certificate", "Matric with Distinction in Maths"],
		experience: `${i % 4 + 1} months workplace exposure`
	};
});
var seedAvailableLearners = [
	{
		id: "AL-1",
		full_name: "Neo Mabaso",
		program: "Software Development NQF5",
		provider: "CoTech Academy",
		years_experience: 1,
		availability: "Immediate",
		location: "Johannesburg",
		skills: [
			"React",
			"Node.js",
			"SQL"
		],
		bio: "Recently completed a 6-month bootcamp with distinction, looking for a first placement.",
		disability: null,
		match_score: 92,
		industry: "Technology",
		match_reasons: [
			"Skills: React + Node.js aligned",
			"Located in Johannesburg",
			"Immediate start"
		]
	},
	{
		id: "AL-2",
		full_name: "Ayanda Pillay",
		program: "Data Analytics NQF5",
		provider: "Skillup SA",
		years_experience: 2,
		availability: "Immediate",
		location: "Cape Town",
		skills: [
			"Power BI",
			"Python",
			"SQL"
		],
		bio: "Analyst with retail-sector experience seeking a stretch placement in fintech or SaaS.",
		disability: null,
		match_score: 88,
		industry: "Data & Analytics",
		match_reasons: ["NQF5 Data Analytics matches your need", "Sector alignment: fintech"]
	},
	{
		id: "AL-3",
		full_name: "Junior Baloyi",
		program: "Cybersecurity NQF5",
		provider: "CyberHub",
		years_experience: 0,
		availability: "2 weeks",
		location: "Pretoria",
		skills: [
			"Linux",
			"Networking",
			"SIEM basics"
		],
		bio: "Passionate about blue-team work. Currently studying CompTIA Security+.",
		disability: "Mobility (wheelchair)",
		match_score: 84,
		industry: "Cybersecurity",
		match_reasons: ["Cybersecurity NQF5", "Inclusive: mobility accommodation supported"]
	},
	{
		id: "AL-4",
		full_name: "Refiloe Mahlangu",
		program: "UX/UI Design NQF5",
		provider: "Design Hive",
		years_experience: 1,
		availability: "Immediate",
		location: "Remote",
		skills: [
			"Figma",
			"User research",
			"Prototyping"
		],
		bio: "UX designer focused on accessibility and inclusive design patterns.",
		disability: null,
		match_score: 90,
		industry: "Design",
		match_reasons: ["UX/UI Design matches open role", "Remote availability"]
	},
	{
		id: "AL-5",
		full_name: "Tshepo Radebe",
		program: "Cloud Engineering NQF6",
		provider: "CloudNative Institute",
		years_experience: 2,
		availability: "1 month",
		location: "Johannesburg",
		skills: [
			"AWS",
			"Terraform",
			"Docker"
		],
		bio: "Cloud engineer with hands-on AWS work. AWS Solutions Architect Associate certified.",
		disability: null,
		match_score: 95,
		industry: "Cloud",
		match_reasons: [
			"AWS + Terraform match your stack",
			"NQF6 level",
			"Local — Johannesburg"
		]
	},
	{
		id: "AL-6",
		full_name: "Zanele Cele",
		program: "Software Development NQF5",
		provider: "CoTech Academy",
		years_experience: 0,
		availability: "Immediate",
		location: "Durban",
		skills: [
			"HTML",
			"CSS",
			"JavaScript"
		],
		bio: "Junior full-stack learner ready to be placed in a supportive engineering team.",
		disability: "Hearing impairment",
		match_score: 78,
		industry: "Technology",
		match_reasons: ["Software Dev NQF5", "Inclusive: hearing accommodation supported"]
	}
];
var seedAttendance = (() => {
	const recs = [];
	const today = /* @__PURE__ */ new Date();
	seedLearners.forEach((l, li) => {
		for (let d = 0; d < 10; d++) {
			const dt = new Date(today);
			dt.setDate(today.getDate() - d);
			const r = (li * 7 + d * 13) % 100 / 100;
			recs.push({
				id: `${l.id}-${d}`,
				learner_id: l.id,
				learner_name: l.full_name,
				sponsor: l.sponsor,
				host: HOST_COMPANY,
				mentor: l.mentor,
				mentor_phone: l.mentor_phone,
				contact: l.phone,
				date: dt.toISOString().slice(0, 10),
				status: r > .9 ? "Absent" : r > .85 ? "On Leave" : r > .75 ? "Clocked Out" : r > .4 ? "Present" : "Clocked In",
				leave_flags: {
					SL: r > .9 && r < .92,
					PH: false,
					AL: r > .85 && r < .9,
					CL: false
				},
				check_in: r > .8 ? "09:15" : "08:02",
				check_out: "17:01"
			});
		}
	});
	return recs;
})();
var seedPerformance = seedLearners.slice(0, 12).map((l, i) => ({
	id: `R-${i + 1}`,
	learner_id: l.id,
	learner_name: l.full_name,
	review_date: `2025-${String(6 + i % 4).padStart(2, "0")}-${String(10 + i).padStart(2, "0")}`,
	reviewer: "Thandi Mokoena",
	technical: 3 + i % 3,
	communication: 3 + (i + 1) % 3,
	teamwork: 3 + (i + 2) % 3,
	attitude: 3 + (i + 1) % 3,
	notes: "Solid progress this period. Continue to focus on documentation and code reviews."
}));
var seedOnboarding = seedLearners.slice(0, 10).map((l, i) => {
	const tasks = [
		{
			name: "Site Induction",
			done: true
		},
		{
			name: "Health & Safety Briefing",
			done: true
		},
		{
			name: "IT Equipment Issued",
			done: i % 3 !== 0
		},
		{
			name: "Email & Slack Access",
			done: i % 4 !== 0
		},
		{
			name: "Mentor Assigned",
			done: i % 5 !== 0
		},
		{
			name: "First Project Brief",
			done: i % 2 === 0
		},
		{
			name: "Probation Review",
			done: i < 3
		}
	];
	const done = tasks.filter((t) => t.done).length;
	return {
		learner_id: l.id,
		learner_name: l.full_name,
		program: l.program,
		started: l.start_date,
		tasks,
		progress: Math.round(done / tasks.length * 100)
	};
});
var seedCalendar = [
	{
		id: "E1",
		date: "2026-07-02",
		time: "09:00",
		title: "Learner Induction",
		type: "Induction",
		location: "Head office",
		link: "",
		mandatory_attendance: true,
		description: "Welcome and site induction for new intake."
	},
	{
		id: "E2",
		date: "2026-07-03",
		time: "14:00",
		title: "Mid-term Performance Reviews",
		type: "Review",
		location: "Boardroom A",
		link: "",
		mandatory_attendance: false,
		description: "Quarterly one-on-one reviews."
	},
	{
		id: "E3",
		date: "2026-07-05",
		time: "10:30",
		title: "Mentor Sync — Cloud Engineering group",
		type: "Meeting",
		location: "MS Teams",
		link: "https://teams.microsoft.com/meet/xyz",
		mandatory_attendance: false,
		description: ""
	},
	{
		id: "E4",
		date: "2026-07-08",
		time: "09:00",
		title: "Soft Skills Workshop",
		type: "Workshop",
		location: "Training Room",
		link: "",
		mandatory_attendance: false,
		description: ""
	},
	{
		id: "E5",
		date: "2026-07-10",
		time: "13:00",
		title: "Absorption Review",
		type: "Review",
		location: "Boardroom B",
		link: "",
		mandatory_attendance: false,
		description: "Discuss potential absorption candidates into permanent roles."
	}
];
var seedDocuments = [
	{
		id: "D1",
		name: "Host Agreement — Cohort 2026.pdf",
		category: "Agreement",
		size: "482 KB",
		uploaded: "2026-01-12",
		requires_signature: true,
		signed: false,
		review_status: "Pending",
		verification: {
			status: "Verified",
			score: 92,
			reasons: ["Metadata intact"]
		}
	},
	{
		id: "D2",
		name: "Health & Safety Policy v3.pdf",
		category: "Policy",
		size: "210 KB",
		uploaded: "2026-02-04",
		requires_signature: true,
		signed: false,
		review_status: "Pending",
		verification: {
			status: "Verified",
			score: 88,
			reasons: ["Metadata intact"]
		}
	},
	{
		id: "D3",
		name: "Site Induction Slides.pdf",
		category: "Training",
		size: "3.4 MB",
		uploaded: "2026-03-22",
		requires_signature: false,
		signed: false,
		review_status: "N/A",
		verification: {
			status: "Verified",
			score: 96,
			reasons: ["Trusted uploader"]
		}
	},
	{
		id: "D4",
		name: "Learner Code of Conduct.pdf",
		category: "Policy",
		size: "180 KB",
		uploaded: "2026-03-22",
		requires_signature: true,
		signed: false,
		review_status: "Pending",
		verification: {
			status: "Needs Review",
			score: 65,
			reasons: ["Modification date differs from creation date"]
		}
	},
	{
		id: "D5",
		name: "Mentor Handbook.pdf",
		category: "Guide",
		size: "1.1 MB",
		uploaded: "2026-04-09",
		requires_signature: false,
		signed: false,
		review_status: "N/A",
		verification: {
			status: "Verified",
			score: 91,
			reasons: ["Trusted uploader"]
		}
	}
];
var DOCUMENT_CATEGORIES = [
	"Agreement",
	"Policy",
	"Training",
	"Guide",
	"Contract",
	"ID Document",
	"Qualification",
	"POPIA Consent",
	"Medical",
	"Other"
];
var seedMessages = [
	{
		id: "M1",
		from: "Head Office",
		preview: "Please confirm intake numbers for July.",
		time: "2h ago",
		unread: true
	},
	{
		id: "M2",
		from: "Sipho Dlamini",
		preview: "Can I take Friday off for an exam?",
		time: "5h ago",
		unread: true
	},
	{
		id: "M3",
		from: "HR Department",
		preview: "Mid-quarter progress report is due next week.",
		time: "1d ago",
		unread: false
	},
	{
		id: "M4",
		from: "Naledi Nkosi",
		preview: "Uploaded my latest assignment for review.",
		time: "2d ago",
		unread: false
	}
];
var PROJECT_STATUSES = [
	"To Do",
	"In Progress",
	"Review",
	"Completed"
];
var PROJECT_PRIORITIES = [
	"Low",
	"Medium",
	"High",
	"Critical"
];
var seedProjects = [
	{
		id: "P-1",
		name: "Customer Portal Rebuild",
		client: "Retail SA",
		description: "Redesign and rebuild the customer-facing portal using React and a headless CMS.",
		status: "In Progress",
		priority: "High",
		start_date: "2026-05-01",
		end_date: "2026-09-30",
		lead: "Thandi Mokoena",
		assigned_learner_ids: [
			"L-1001",
			"L-1002",
			"L-1006"
		]
	},
	{
		id: "P-2",
		name: "Data Warehouse Migration",
		client: "Internal",
		description: "Migrate on-prem reporting DB to a cloud data warehouse and set up Power BI dashboards.",
		status: "To Do",
		priority: "Medium",
		start_date: "2026-07-15",
		end_date: "2026-12-15",
		lead: "Sipho Dlamini",
		assigned_learner_ids: ["L-1004"]
	},
	{
		id: "P-3",
		name: "Security Hardening Sprint",
		client: "Kopano Cloud",
		description: "Patch, audit and document security controls across the shared infrastructure.",
		status: "Review",
		priority: "Critical",
		start_date: "2026-06-10",
		end_date: "2026-07-31",
		lead: "Bongani Zulu",
		assigned_learner_ids: ["L-1003", "L-1005"]
	},
	{
		id: "P-4",
		name: "Internal Onboarding Rewrite",
		client: "Internal",
		description: "Streamline onboarding checklists into an automated flow.",
		status: "Completed",
		priority: "Medium",
		start_date: "2026-02-01",
		end_date: "2026-04-30",
		lead: "Naledi Nkosi",
		assigned_learner_ids: ["L-1007"]
	}
];
var TASK_STATUSES = [
	"To Do",
	"In Progress",
	"Review",
	"Completed"
];
var seedTasks = [
	{
		id: "T-1",
		title: "Set up React project scaffolding",
		project_id: "P-1",
		assignee_learner_id: "L-1001",
		status: "Completed",
		priority: "High",
		due_date: "2026-05-10",
		description: "Vite + React + Tailwind starter, linting, CI."
	},
	{
		id: "T-2",
		title: "Build authentication screens",
		project_id: "P-1",
		assignee_learner_id: "L-1002",
		status: "In Progress",
		priority: "High",
		due_date: "2026-07-15",
		description: "Sign-in, sign-up, password reset UI."
	},
	{
		id: "T-3",
		title: "Data model workshop",
		project_id: "P-2",
		assignee_learner_id: "L-1004",
		status: "To Do",
		priority: "Medium",
		due_date: "2026-07-25",
		description: "Facilitate a two-hour workshop with stakeholders."
	},
	{
		id: "T-4",
		title: "Patch all Ubuntu servers",
		project_id: "P-3",
		assignee_learner_id: "L-1005",
		status: "In Progress",
		priority: "Critical",
		due_date: "2026-07-05",
		description: "Kernel + package updates + reboot windows."
	},
	{
		id: "T-5",
		title: "Write incident-response playbook",
		project_id: "P-3",
		assignee_learner_id: "L-1003",
		status: "Review",
		priority: "High",
		due_date: "2026-07-20",
		description: "Draft the initial playbook for review by the security lead."
	},
	{
		id: "T-6",
		title: "Kick-off meeting summary",
		project_id: "P-4",
		assignee_learner_id: "L-1007",
		status: "Completed",
		priority: "Low",
		due_date: "2026-02-05",
		description: ""
	}
];
var LEAVE_TYPES = [
	"Annual",
	"Sick",
	"Family Responsibility",
	"Maternity",
	"Paternity",
	"Study",
	"Compassionate"
];
var seedEmployees = [
	{
		id: "E-1",
		full_name: "Thandi Mokoena",
		role: "HR & Talent Lead",
		department: "People Ops",
		email: "thandi@linkora.co.za",
		phone: "+27 11 555 1234",
		employment_type: "Permanent",
		join_date: "2020-03-15",
		manager: "Board",
		gender: "Female",
		age_band: "30-39"
	},
	{
		id: "E-2",
		full_name: "Sipho Dlamini",
		role: "Senior Cloud Engineer",
		department: "Engineering",
		email: "sipho@linkora.co.za",
		phone: "+27 82 555 1122",
		employment_type: "Permanent",
		join_date: "2021-07-01",
		manager: "Thandi Mokoena",
		gender: "Male",
		age_band: "30-39"
	},
	{
		id: "E-3",
		full_name: "Lerato Khumalo",
		role: "Data Analyst",
		department: "Data",
		email: "lerato@linkora.co.za",
		phone: "+27 82 555 3344",
		employment_type: "Contract",
		join_date: "2023-01-10",
		manager: "Sipho Dlamini",
		gender: "Female",
		age_band: "20-29"
	},
	{
		id: "E-4",
		full_name: "Naledi Nkosi",
		role: "Product Designer",
		department: "Design",
		email: "naledi@linkora.co.za",
		phone: "+27 82 555 5566",
		employment_type: "Permanent",
		join_date: "2022-05-04",
		manager: "Thandi Mokoena",
		gender: "Female",
		age_band: "20-29"
	},
	{
		id: "E-5",
		full_name: "Bongani Zulu",
		role: "Security Engineer",
		department: "Engineering",
		email: "bongani@linkora.co.za",
		phone: "+27 82 555 7788",
		employment_type: "Permanent",
		join_date: "2019-10-20",
		manager: "Sipho Dlamini",
		gender: "Male",
		age_band: "40-49"
	},
	{
		id: "E-6",
		full_name: "Karabo Mthembu",
		role: "People Coordinator",
		department: "People Ops",
		email: "karabo@linkora.co.za",
		phone: "+27 82 555 9900",
		employment_type: "Temporary",
		join_date: "2025-11-01",
		manager: "Thandi Mokoena",
		gender: "Female",
		age_band: "20-29"
	}
];
var seedLeaveBalances = seedEmployees.map((e) => ({
	employee_id: e.id,
	employee: e.full_name,
	Annual: 15 + e.id.charCodeAt(2) % 6,
	Sick: 8,
	"Family Responsibility": 3,
	Study: 5,
	Compassionate: 2
}));
var seedLeave = [
	{
		id: "LV-1",
		employee: "Thandi Mokoena",
		type: "Annual",
		from: "2026-07-15",
		to: "2026-07-19",
		days: 5,
		status: "Approved",
		reason: "Family holiday"
	},
	{
		id: "LV-2",
		employee: "Sipho Dlamini",
		type: "Sick",
		from: "2026-06-28",
		to: "2026-06-28",
		days: 1,
		status: "Approved",
		reason: "Flu"
	},
	{
		id: "LV-3",
		employee: "Lerato Khumalo",
		type: "Study",
		from: "2026-08-02",
		to: "2026-08-04",
		days: 3,
		status: "Pending",
		reason: "Certification exam prep"
	}
];
var seedLearnerLeaveRequests = [
	{
		id: "LLV-1",
		learner_id: "L-1001",
		learner_name: "Sipho Dlamini",
		program: "Software Development NQF5",
		type: "Sick",
		from: "2026-07-02",
		to: "2026-07-03",
		days: 2,
		status: "Pending",
		reason: "Flu with fever, unable to attend site — see attached medical certificate.",
		submitted_at: "2026-07-01",
		document_name: "Medical-Certificate-Sipho.pdf",
		document_url: null,
		document_type: "application/pdf",
		doc_verification: {
			status: "Verified",
			score: 86,
			reasons: ["Filename, size, and metadata all consistent"]
		}
	},
	{
		id: "LLV-2",
		learner_id: "L-1005",
		learner_name: "Karabo Mthembu",
		program: "Cybersecurity NQF5",
		type: "Family Responsibility",
		from: "2026-07-06",
		to: "2026-07-08",
		days: 3,
		status: "Pending",
		reason: "Passing of my grandfather — attending funeral in Limpopo. Death certificate attached.",
		submitted_at: "2026-07-04",
		document_name: "Death-Certificate-Family.pdf",
		document_url: null,
		document_type: "application/pdf",
		doc_verification: {
			status: "Needs Review",
			score: 62,
			reasons: ["Filename suggests screenshot rather than original scan"]
		}
	},
	{
		id: "LLV-3",
		learner_id: "L-1004",
		learner_name: "Bongani Nkosi",
		program: "Cloud Engineering NQF6",
		type: "Study",
		from: "2026-07-10",
		to: "2026-07-10",
		days: 1,
		status: "Approved",
		reason: "AWS Solutions Architect exam — supporting registration attached.",
		submitted_at: "2026-06-28",
		document_name: "AWS-Exam-Registration.pdf",
		document_url: null,
		document_type: "application/pdf",
		decided_by: "Thandi Mokoena",
		decided_at: "2026-06-29",
		doc_verification: {
			status: "Verified",
			score: 94,
			reasons: ["Trusted external source"]
		}
	}
];
var ATTENDANCE_STATUSES = [
	"Present",
	"Clocked In",
	"On Break",
	"Clocked Out",
	"On Leave",
	"Absent"
];
var seedTimesheets = [
	{
		id: "TS-1",
		employee: "Thandi Mokoena",
		date: "2026-06-30",
		clock_in: "08:00",
		clock_out: "17:00",
		projects: [{
			name: "HR Ops",
			hours: 4,
			manager_comment: "Great progress on the recruitment pipeline."
		}, {
			name: "Recruitment Drive",
			hours: 4,
			manager_comment: "Shortlisted 3 promising candidates."
		}],
		status: "Present",
		notes: ""
	},
	{
		id: "TS-2",
		employee: "Sipho Dlamini",
		date: "2026-06-30",
		clock_in: "08:15",
		clock_out: "17:30",
		projects: [
			{
				name: "Cloud Migration",
				hours: 3,
				manager_comment: "Blocked on IAM policy review."
			},
			{
				name: "Customer Portal Rebuild",
				hours: 3.25,
				manager_comment: "Auth screens delivered."
			},
			{
				name: "Internal Tooling",
				hours: 2,
				manager_comment: ""
			}
		],
		status: "Clocked Out",
		notes: "Split across three project streams."
	},
	{
		id: "TS-3",
		employee: "Naledi Nkosi",
		date: "2026-06-30",
		clock_in: "09:00",
		clock_out: "",
		projects: [{
			name: "UX Research",
			hours: 4,
			manager_comment: "User interviews completed."
		}, {
			name: "Design System",
			hours: 3,
			manager_comment: "Colour tokens finalised."
		}],
		status: "Clocked In",
		notes: ""
	},
	{
		id: "TS-4",
		employee: "Sipho Dlamini",
		date: "2026-06-27",
		clock_in: "08:00",
		clock_out: "17:00",
		projects: [
			{
				name: "Cloud Migration",
				hours: 2,
				manager_comment: ""
			},
			{
				name: "Customer Portal Rebuild",
				hours: 2,
				manager_comment: ""
			},
			{
				name: "Security Hardening Sprint",
				hours: 2,
				manager_comment: "Ubuntu patches complete."
			},
			{
				name: "Internal Tooling",
				hours: 1,
				manager_comment: ""
			},
			{
				name: "Data Warehouse Migration",
				hours: 1,
				manager_comment: ""
			}
		],
		status: "Present",
		notes: "Very fragmented day — 5 projects."
	},
	{
		id: "TS-5",
		employee: "Karabo Mthembu",
		date: "2026-06-30",
		clock_in: "",
		clock_out: "",
		projects: [],
		status: "On Leave",
		notes: "Approved family responsibility leave."
	}
];
var VACANCY_TYPES = [
	"Full-time",
	"Contract",
	"Part-time",
	"Intern",
	"Leanership",
	"Temporary"
];
var seedVacancies = [
	{
		id: "V-1",
		title: "Junior Cloud Engineer",
		department: "Engineering",
		type: "Full-time",
		location: "Sandton, JHB",
		posted: "2026-06-10",
		applicants: 12,
		status: "Open",
		salary: "R 18 000 – R 24 000",
		description: "Support the cloud engineering team on AWS and Terraform-based projects. You will pair with senior engineers, review pull requests, and rotate through infrastructure, observability, and cost-optimisation tickets.",
		requirements: [
			"AWS fundamentals",
			"Bash/Python basics",
			"Interest in DevOps"
		],
		tags: [
			"AWS",
			"Terraform",
			"DevOps"
		],
		closes: "2026-07-31"
	},
	{
		id: "V-2",
		title: "UX Designer",
		department: "Design",
		type: "Contract",
		location: "Remote",
		posted: "2026-06-18",
		applicants: 7,
		status: "Open",
		salary: "R 400 – R 550 / hr",
		description: "Design accessible, inclusive product surfaces for our banking client. Ownership from research to prototyping.",
		requirements: [
			"Figma",
			"Portfolio of shipped work",
			"Accessibility awareness"
		],
		tags: [
			"Figma",
			"A11y",
			"Fintech"
		],
		closes: "2026-08-15"
	},
	{
		id: "V-3",
		title: "HR Coordinator",
		department: "People Ops",
		type: "Full-time",
		location: "Sandton, JHB",
		posted: "2026-05-30",
		applicants: 22,
		status: "Interviewing",
		salary: "R 22 000 – R 28 000",
		description: "Coordinate onboarding, employee records, and leave workflows across the team.",
		requirements: ["HR diploma or equivalent", "2+ years HR experience"],
		tags: [
			"HRIS",
			"Payroll",
			"People"
		],
		closes: "2026-07-10"
	},
	{
		id: "V-4",
		title: "Software Development Learnership",
		department: "Engineering",
		type: "Leanership",
		location: "Sandton, JHB",
		posted: "2026-06-25",
		applicants: 41,
		status: "Open",
		salary: "Stipend R 6 000/month",
		description: "12-month workplace-based learnership for junior software developers. NQF Level 5.",
		requirements: ["Matric", "Basic programming"],
		tags: [
			"NQF5",
			"Java",
			"Web"
		],
		closes: "2026-07-20"
	},
	{
		id: "V-5",
		title: "Data Analytics Intern",
		department: "Data",
		type: "Intern",
		location: "Cape Town",
		posted: "2026-06-22",
		applicants: 33,
		status: "Open",
		salary: "Stipend R 8 500/month",
		description: "6-month internship in the data team. Support dashboarding, SQL, and reporting for the retail client.",
		requirements: ["Studying towards BSc or similar", "SQL basics"],
		tags: ["SQL", "Power BI"],
		closes: "2026-07-25"
	}
];
var seedApplicants = [
	{
		id: "A-1",
		name: "Tebogo Mahlangu",
		vacancy: "Junior Cloud Engineer",
		stage: "Screening",
		score: 82,
		applied: "2026-06-12"
	},
	{
		id: "A-2",
		name: "Anele Radebe",
		vacancy: "UX Designer",
		stage: "Interview",
		score: 88,
		applied: "2026-06-19"
	},
	{
		id: "A-3",
		name: "Nomvula Sibiya",
		vacancy: "HR Coordinator",
		stage: "Offer",
		score: 91,
		applied: "2026-06-02"
	},
	{
		id: "A-4",
		name: "Kagiso Radebe",
		vacancy: "Software Development Learnership",
		stage: "Screening",
		score: 76,
		applied: "2026-06-26"
	}
];
var seedTraining = [
	{
		id: "TR-1",
		title: "POPIA Awareness",
		type: "Compliance",
		mode: "Online",
		duration: "2h",
		enrolled: 24,
		completed: 20,
		deadline: "2026-08-30"
	},
	{
		id: "TR-2",
		title: "AWS Cloud Practitioner",
		type: "Technical",
		mode: "Online",
		duration: "20h",
		enrolled: 8,
		completed: 3,
		deadline: "2026-10-15"
	},
	{
		id: "TR-3",
		title: "Health & Safety Refresher",
		type: "Compliance",
		mode: "Classroom",
		duration: "4h",
		enrolled: 18,
		completed: 18,
		deadline: "2026-06-30"
	}
];
var seedContracts = [
	{
		id: "C-1",
		title: "Host Agreement — Cohort 2026",
		party: "Mavis Strategic Partners / MerSETA",
		status: "Signed",
		signed_at: "2026-01-15",
		signed_by: "Thandi Mokoena",
		signature_url: null,
		expires: "2027-01-15"
	},
	{
		id: "C-2",
		title: "Learner Placement Contract — Sipho D.",
		party: "Mavis Strategic Partners / Sipho Dlamini",
		status: "Awaiting Signature",
		signed_at: null,
		signed_by: null,
		signature_url: null,
		expires: "2027-06-30"
	},
	{
		id: "C-3",
		title: "Learner Placement Contract — Ayanda P.",
		party: "Mavis Strategic Partners / Ayanda Pillay",
		status: "Draft",
		signed_at: null,
		signed_by: null,
		signature_url: null,
		expires: null
	}
];
var seedKPIs = [
	{
		id: "K-1",
		learner_id: "L-1001",
		learner_name: seedLearners[0].full_name,
		goal: "Deliver auth module for Customer Portal",
		kpi: "Sprint velocity 12+",
		quarter: "Q3 2026",
		progress: 65,
		status: "On Track",
		development_plan: "Pair with senior full-stack engineer for the next 2 sprints."
	},
	{
		id: "K-2",
		learner_id: "L-1004",
		learner_name: seedLearners[3].full_name,
		goal: "Complete AWS SA Associate cert",
		kpi: "80%+ practice score",
		quarter: "Q3 2026",
		progress: 40,
		status: "At Risk",
		development_plan: "Weekly study sessions + mock exam every Friday."
	},
	{
		id: "K-3",
		learner_id: "L-1002",
		learner_name: seedLearners[1].full_name,
		goal: "Deliver Power BI dashboards for retail client",
		kpi: "5 dashboards live",
		quarter: "Q3 2026",
		progress: 100,
		status: "Completed",
		development_plan: "Shadow analyst on complex reporting."
	}
];
var seedCoaching = [{
	id: "CN-1",
	learner_id: "L-1001",
	learner_name: seedLearners[0].full_name,
	date: "2026-06-20",
	mentor: "Thandi Mokoena",
	note: "Excellent progress on React fundamentals. Encouraged to start pairing on more complex tickets.",
	mood: "Positive"
}, {
	id: "CN-2",
	learner_id: "L-1002",
	learner_name: seedLearners[1].full_name,
	date: "2026-06-15",
	mentor: "Sipho Dlamini",
	note: "Struggling with time management — set up a weekly planning session.",
	mood: "Needs Attention"
}];
var seedIncidents = [{
	id: "IN-1",
	date: "2026-06-10",
	learner: seedLearners[4].full_name,
	category: "Health & Safety",
	severity: "Low",
	status: "Resolved",
	description: "Minor slip in the kitchen area. First-aider attended. No injury."
}, {
	id: "IN-2",
	date: "2026-06-22",
	learner: seedLearners[6].full_name,
	category: "Punctuality",
	severity: "Low",
	status: "Open",
	description: "Three consecutive late arrivals. Escalated to mentor."
}];
var seedIntegrations = [
	{
		id: "INT-1",
		name: "Sage Payroll",
		category: "Payroll",
		status: "Connected",
		last_sync: "2026-06-30 06:00"
	},
	{
		id: "INT-2",
		name: "ZKTeco Biometric",
		category: "Time & Attendance",
		status: "Connected",
		last_sync: "2026-07-01 07:15"
	},
	{
		id: "INT-3",
		name: "Xero",
		category: "Accounting/ERP",
		status: "Not Connected",
		last_sync: null
	},
	{
		id: "INT-4",
		name: "Moodle LMS",
		category: "LMS",
		status: "Connected",
		last_sync: "2026-06-29 22:00"
	},
	{
		id: "INT-5",
		name: "PNet",
		category: "Recruitment",
		status: "Connected",
		last_sync: "2026-07-01 04:00"
	},
	{
		id: "INT-6",
		name: "SA Youth",
		category: "Recruitment",
		status: "Connected",
		last_sync: "2026-07-01 04:00"
	},
	{
		id: "INT-7",
		name: "Microsoft 365",
		category: "Email & Calendar",
		status: "Connected",
		last_sync: "2026-07-01 08:00"
	},
	{
		id: "INT-8",
		name: "Google Workspace",
		category: "Email & Calendar",
		status: "Not Connected",
		last_sync: null
	},
	{
		id: "INT-9",
		name: "DocuSign",
		category: "e-Signature",
		status: "Connected",
		last_sync: "2026-06-28 12:00"
	},
	{
		id: "INT-10",
		name: "Okta SSO",
		category: "SSO / MFA",
		status: "Connected",
		last_sync: "2026-07-01 06:30"
	},
	{
		id: "INT-11",
		name: "Power BI",
		category: "BI Platform",
		status: "Connected",
		last_sync: "2026-07-01 05:00"
	}
];
var seedAnnouncements = [{
	id: "AN-1",
	title: "Public holiday reminder — Youth Day",
	body: "Offices will be closed on 16 June. Timesheets should be logged as PH.",
	posted: "2026-06-10",
	author: "HR Department"
}, {
	id: "AN-2",
	title: "New leave policy v3",
	body: "Please acknowledge the updated leave policy in the Documents section.",
	posted: "2026-06-20",
	author: "HR Department"
}];
var seedLetters = [
	{
		id: "HL-1",
		employee: "Sipho Dlamini",
		type: "Employment Verification",
		generated: "2026-06-01"
	},
	{
		id: "HL-2",
		employee: "Naledi Nkosi",
		type: "Promotion Letter",
		generated: "2026-05-15"
	},
	{
		id: "HL-3",
		employee: "Karabo Mthembu",
		type: "Contract Renewal",
		generated: "2026-06-25"
	}
];
var seedAudit = [
	{
		id: "AU-1",
		at: "2026-07-01 09:14",
		actor: "Thandi Mokoena",
		action: "Approved leave request",
		target: "LLV-3 (Bongani Nkosi)"
	},
	{
		id: "AU-2",
		at: "2026-06-30 17:02",
		actor: "Sipho Dlamini",
		action: "Clocked out",
		target: "Timesheet TS-2"
	},
	{
		id: "AU-3",
		at: "2026-06-30 08:15",
		actor: "Karabo Mthembu",
		action: "Uploaded document",
		target: "Medical-Certificate.pdf"
	},
	{
		id: "AU-4",
		at: "2026-06-29 11:00",
		actor: "Thandi Mokoena",
		action: "Signed contract",
		target: "Host Agreement — Cohort 2026"
	}
];
var attendanceTrend = [
	{
		label: "Mon",
		value: 88
	},
	{
		label: "Tue",
		value: 92
	},
	{
		label: "Wed",
		value: 90
	},
	{
		label: "Thu",
		value: 94
	},
	{
		label: "Fri",
		value: 89
	},
	{
		label: "Mon",
		value: 91
	},
	{
		label: "Tue",
		value: 93
	},
	{
		label: "Wed",
		value: 92
	},
	{
		label: "Thu",
		value: 95
	},
	{
		label: "Fri",
		value: 96
	}
];
var performanceTrend = [
	{
		label: "Q1",
		value: 71
	},
	{
		label: "Q2",
		value: 74
	},
	{
		label: "Q3",
		value: 78
	},
	{
		label: "Q4",
		value: 82
	}
];
var hostNav = [
	{
		heading: null,
		items: [{
			name: "Dashboard",
			path: "/host",
			icon: "◆"
		}]
	},
	{
		heading: "Operations",
		items: [
			{
				name: "Placed Learners",
				path: "/host/learners",
				icon: "◇"
			},
			{
				name: "Workforce",
				path: "/host/workforce",
				icon: "⚙"
			},
			{
				name: "Performance",
				path: "/host/performance",
				icon: "◑"
			},
			{
				name: "Coaching Notes",
				path: "/host/coaching",
				icon: "✎"
			},
			{
				name: "Onboarding",
				path: "/host/onboarding",
				icon: "◓"
			}
		]
	},
	{
		heading: "Recruitment",
		items: [
			{
				name: "Learner Marketplace",
				path: "/host/marketplace",
				icon: "★"
			},
			{
				name: "Recruitment",
				path: "/host/recruitment",
				icon: "◎"
			},
			{
				name: "Host Employer Check",
				path: "/host/check",
				icon: "☑"
			}
		]
	},
	{
		heading: "Workspace",
		items: [
			{
				name: "Calendar",
				path: "/host/calendar",
				icon: "◕"
			},
			{
				name: "Projects",
				path: "/host/projects",
				icon: "⬢"
			},
			{
				name: "Tasks",
				path: "/host/tasks",
				icon: "✓"
			},
			{
				name: "KPI Management",
				path: "/host/kpi",
				icon: "◈"
			},
			{
				name: "Contracts",
				path: "/host/contracts",
				icon: "✍"
			},
			{
				name: "Documents",
				path: "/host/documents",
				icon: "▣"
			},
			{
				name: "Messages",
				path: "/host/messages",
				icon: "▤"
			},
			{
				name: "Reports",
				path: "/host/reports",
				icon: "▥"
			}
		]
	},
	{
		heading: "Company",
		items: [{
			name: "Company Profile",
			path: "/host/company",
			icon: "⌂"
		}, {
			name: "Settings",
			path: "/host/settings",
			icon: "▦"
		}]
	}
];
var hrNav = [
	{
		heading: null,
		items: [{
			name: "HR Dashboard",
			path: "/hr",
			icon: "◆"
		}]
	},
	{
		heading: "People Ops",
		items: [
			{
				name: "Attendance Register",
				path: "/hr/attendance",
				icon: "◐"
			},
			{
				name: "Leave Management",
				path: "/hr/leave",
				icon: "☰"
			},
			{
				name: "Timesheets",
				path: "/hr/timesheets",
				icon: "◷"
			},
			{
				name: "Employee Relations",
				path: "/hr/relations",
				icon: "◇"
			}
		]
	},
	{
		heading: "Talent",
		items: [
			{
				name: "Recruitment",
				path: "/hr/recruitment",
				icon: "✎"
			},
			{
				name: "Performance",
				path: "/hr/performance",
				icon: "◑"
			},
			{
				name: "Talent Management",
				path: "/hr/talent",
				icon: "★"
			},
			{
				name: "Training & Development",
				path: "/hr/training",
				icon: "✦"
			}
		]
	},
	{
		heading: "System",
		items: [
			{
				name: "HR Administration",
				path: "/hr/admin",
				icon: "▣"
			},
			{
				name: "Employee Documents",
				path: "/hr/documents",
				icon: "▤"
			},
			{
				name: "Payroll",
				path: "/hr/payroll",
				icon: "▥"
			},
			{
				name: "Integrations",
				path: "/hr/integrations",
				icon: "⚡"
			}
		]
	}
];
var initialsOf = (name = "") => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "U";
function DashboardLayout({ children, title }) {
	const location = useLocation();
	const { theme, toggleTheme } = useTheme();
	const [open, setOpen] = (0, import_react.useState)(true);
	const [mobileOpen, setMobileOpen] = (0, import_react.useState)(false);
	const [accountOpen, setAccountOpen] = (0, import_react.useState)(false);
	const [avatarUrl, setAvatarUrl] = (0, import_react.useState)(null);
	const [initialsMode, setInitialsMode] = (0, import_react.useState)(false);
	const [uploadingAvatar, setUploadingAvatar] = (0, import_react.useState)(false);
	const [isMobile, setIsMobile] = (0, import_react.useState)(typeof window !== "undefined" ? window.innerWidth < 768 : false);
	const [profile] = useLocalStorage("host.company_profile", hostProfile);
	const navRef = (0, import_react.useRef)(null);
	const avatarInputRef = (0, import_react.useRef)(null);
	useSidebarScrollRef(navRef);
	(0, import_react.useEffect)(() => {
		setAvatarUrl(localStorage.getItem("msp.portalAvatar") || null);
		setInitialsMode(localStorage.getItem("msp.portalInitials") === "true");
	}, []);
	if (typeof window !== "undefined") (0, import_react.useEffect)(() => {
		const onResize = () => setIsMobile(window.innerWidth < 768);
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);
	const isHR = location.pathname.startsWith("/hr");
	const groups = isHR ? hrNav : hostNav;
	const W = open ? 254 : 68;
	const portalLabel = isHR ? "MSP — All In One (HR)" : "MSP — All In One (Host)";
	const portalSub = isHR ? "Human Resources" : "Host Employer";
	const accent = isHR ? "var(--purple)" : "var(--brand)";
	const displayName = profile.contact_person || "User";
	const role = isHR ? "HR Manager" : profile.contact_title || "Host Admin";
	const logout = async () => {
		try {
			if (profile?.contact_email && !localStorage.getItem("msp.rememberedEmail")) localStorage.setItem("msp.rememberedEmail", profile.contact_email);
			await supabase.auth.signOut();
		} catch {}
		localStorage.removeItem("msp.demoUser");
		localStorage.removeItem("msp.selectedPortal");
		window.location.replace("/auth");
	};
	const updateAvatar = (event) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file || !file.type.startsWith("image/") || file.size > 5242880) return;
		setUploadingAvatar(true);
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === "string") {
				setAvatarUrl(reader.result);
				setInitialsMode(false);
				localStorage.setItem("msp.portalAvatar", reader.result);
				localStorage.removeItem("msp.portalInitials");
			}
			setUploadingAvatar(false);
		};
		reader.onerror = () => setUploadingAvatar(false);
		reader.readAsDataURL(file);
	};
	const useInitials = () => {
		setAvatarUrl(null);
		setInitialsMode(true);
		localStorage.removeItem("msp.portalAvatar");
		localStorage.setItem("msp.portalInitials", "true");
	};
	const useAvatarIcon = () => {
		setInitialsMode(false);
		localStorage.removeItem("msp.portalInitials");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "flex",
			minHeight: "100vh",
			background: "var(--bg-page)"
		},
		children: [
			isMobile && mobileOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				onClick: () => setMobileOpen(false),
				style: {
					position: "fixed",
					inset: 0,
					background: "rgba(0,0,0,.5)",
					zIndex: 40
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				style: isMobile ? {
					width: 260,
					background: "var(--bg-primary)",
					borderRight: "1px solid var(--border-color)",
					position: "fixed",
					top: 0,
					left: 0,
					height: "100vh",
					display: "flex",
					flexDirection: "column",
					zIndex: 50,
					transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
					transition: "transform .2s"
				} : {
					width: W,
					transition: "width .2s",
					background: "var(--bg-primary)",
					borderRight: "1px solid var(--border-color)",
					position: "sticky",
					top: 0,
					height: "100vh",
					display: "flex",
					flexDirection: "column"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							padding: "18px 16px",
							borderBottom: "1px solid var(--border-color)",
							display: "flex",
							alignItems: "center",
							gap: 10
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								width: 36,
								height: 36,
								borderRadius: 10,
								background: accent,
								color: "white",
								display: "grid",
								placeItems: "center",
								fontWeight: 700
							},
							children: "M"
						}), (open || isMobile) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontWeight: 700,
								fontSize: 13
							},
							children: portalLabel
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 11,
								color: "var(--text-muted)"
							},
							children: portalSub
						})] })]
					}),
					(open || isMobile) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							padding: "10px 12px",
							borderBottom: "1px solid var(--border-color)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: 4,
								background: "var(--bg-secondary)",
								padding: 4,
								borderRadius: 8
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/host",
								style: {
									textAlign: "center",
									padding: "6px",
									borderRadius: 6,
									fontSize: 12,
									fontWeight: 600,
									background: !isHR ? "var(--bg-primary)" : "transparent",
									color: !isHR ? "var(--brand)" : "var(--text-secondary)",
									boxShadow: !isHR ? "var(--shadow-sm)" : "none"
								},
								children: "Host"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/hr",
								style: {
									textAlign: "center",
									padding: "6px",
									borderRadius: 6,
									fontSize: 12,
									fontWeight: 600,
									background: isHR ? "var(--bg-primary)" : "transparent",
									color: isHR ? "var(--purple)" : "var(--text-secondary)",
									boxShadow: isHR ? "var(--shadow-sm)" : "none"
								},
								children: "HR"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/home",
							style: {
								display: "block",
								textAlign: "center",
								marginTop: 8,
								fontSize: 11,
								color: "var(--text-muted)",
								padding: "6px",
								borderRadius: 6,
								border: "1px dashed var(--border-color)"
							},
							children: "← Back to MSP Portal"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						ref: navRef,
						style: {
							flex: 1,
							padding: "10px 8px",
							overflow: "auto"
						},
						children: groups.map((group, gi) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { marginBottom: 10 },
							children: [(open || isMobile) && group.heading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 10,
									textTransform: "uppercase",
									letterSpacing: ".08em",
									color: "var(--text-muted)",
									padding: "8px 10px 4px",
									fontWeight: 700
								},
								children: group.heading
							}), group.items.map((item) => {
								const active = location.pathname === item.path;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: item.path,
									onClick: () => isMobile && setMobileOpen(false),
									style: {
										display: "flex",
										alignItems: "center",
										gap: 10,
										padding: "9px 10px",
										borderRadius: 8,
										textDecoration: "none",
										color: active ? accent : "var(--text-secondary)",
										background: active ? "var(--brand-soft)" : "transparent",
										fontWeight: active ? 700 : 500,
										fontSize: 13,
										margin: "2px 0"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											width: 18,
											textAlign: "center"
										},
										children: item.icon
									}), (open || isMobile) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.name })]
								}, item.path);
							})]
						}, gi))
					}),
					!isMobile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setOpen((o) => !o),
						style: {
							margin: 10,
							padding: "8px",
							border: "1px solid var(--border-color)",
							background: "transparent",
							color: "var(--text-secondary)",
							borderRadius: 8,
							cursor: "pointer"
						},
						children: open ? "« Collapse" : "»"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				style: {
					flex: 1,
					minWidth: 0
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						style: {
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							padding: "14px 16px",
							background: "var(--bg-primary)",
							borderBottom: "1px solid var(--border-color)",
							position: "sticky",
							top: 0,
							zIndex: 10,
							gap: 12,
							flexWrap: "wrap"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: 10,
								minWidth: 0
							},
							children: [isMobile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setMobileOpen(true),
								"aria-label": "Open navigation",
								style: {
									background: "transparent",
									border: "1px solid var(--border-color)",
									color: "var(--text-secondary)",
									width: 36,
									height: 36,
									borderRadius: 8,
									cursor: "pointer",
									fontSize: 18
								},
								children: "☰"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: { minWidth: 0 },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: 11,
										color: "var(--text-muted)"
									},
									children: portalLabel
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									style: {
										margin: 0,
										fontSize: 18,
										lineHeight: 1.2
									},
									children: title
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: 8,
								flexWrap: "wrap"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationBell, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-ghost",
									onClick: toggleTheme,
									children: theme === "light" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { size: 16 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { size: 16 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: { position: "relative" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setAccountOpen((value) => !value),
										"aria-expanded": accountOpen,
										"aria-label": "Open account menu",
										style: {
											display: "flex",
											alignItems: "center",
											gap: 10,
											padding: "6px 12px",
											border: "1px solid var(--border-color)",
											borderRadius: 999,
											background: "transparent",
											color: "var(--text-primary)",
											cursor: "pointer",
											textAlign: "left"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												width: 28,
												height: 28,
												borderRadius: "50%",
												background: accent,
												color: "white",
												display: "grid",
												placeItems: "center",
												fontSize: 11,
												fontWeight: 700,
												overflow: "hidden"
											},
											children: avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: avatarUrl,
												alt: "Profile",
												style: {
													width: "100%",
													height: "100%",
													objectFit: "cover"
												}
											}) : initialsMode ? initialsOf(displayName) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, {
												size: 16,
												strokeWidth: 1.8
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: { fontSize: 12 },
											className: "hp-user-meta",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												style: { fontWeight: 600 },
												children: displayName
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												style: {
													fontSize: 10,
													color: "var(--text-muted)"
												},
												children: role
											})]
										})]
									}), accountOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											position: "absolute",
											right: 0,
											top: "calc(100% + 10px)",
											minWidth: 238,
											padding: 8,
											background: "var(--bg-primary)",
											border: "1px solid var(--border-color)",
											borderRadius: 12,
											boxShadow: "0 14px 34px rgba(11, 7, 20, .28)",
											zIndex: 20
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													padding: "7px 10px 9px",
													borderBottom: "1px solid var(--border-color)",
													marginBottom: 6
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													style: {
														fontSize: 10,
														color: "var(--text-muted)",
														textTransform: "uppercase",
														letterSpacing: ".1em",
														fontWeight: 700
													},
													children: "Account"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													style: {
														marginTop: 3,
														fontSize: 12,
														fontWeight: 600,
														color: "var(--text-primary)"
													},
													children: displayName
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => avatarInputRef.current?.click(),
												disabled: uploadingAvatar,
												className: "hp-account-action",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: uploadingAvatar ? "Uploading picture..." : avatarUrl ? "Change profile picture" : "Add profile picture" })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: initialsMode ? useAvatarIcon : useInitials,
												disabled: uploadingAvatar,
												className: "hp-account-action",
												children: [initialsMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { size: 16 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: initialsMode ? "Use avatar icon" : "Use initials instead" })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: logout,
												className: "hp-account-action hp-account-action-danger",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Log out" })]
											})
										]
									})]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: avatarInputRef,
						type: "file",
						accept: "image/*",
						onChange: updateAvatar,
						style: { display: "none" },
						"aria-label": "Upload profile picture"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: { padding: "clamp(14px, 3vw, 28px)" },
						children
					})
				]
			})
		]
	});
}
var cssVar = (name, fallback) => {
	if (typeof window === "undefined") return fallback;
	return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
};
function BarChart({ data, height = 220, color, labelFormatter = (v) => v }) {
	const c = color || cssVar("--brand", "#2563eb");
	const n = Math.max(1, data.length);
	const rotate = data.reduce((m, d) => Math.max(m, String(d.label).length), 0) > 8;
	const barW = rotate ? 52 : 44;
	const gap = rotate ? 26 : 18;
	const padTop = 18;
	const padBottom = rotate ? 78 : 34;
	const W = gap + n * (barW + gap);
	const H = height;
	const max = Math.max(1, ...data.map((d) => d.value));
	const usable = H - padBottom - padTop;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `0 0 ${W} ${H}`,
		width: "100%",
		height: H,
		preserveAspectRatio: "xMidYMid meet",
		style: { display: "block" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: 0,
			x2: W,
			y1: H - padBottom,
			y2: H - padBottom,
			stroke: "currentColor",
			opacity: "0.15"
		}), data.map((d, i) => {
			const h = d.value / max * usable;
			const x = gap + i * (barW + gap);
			const y = H - padBottom - h;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x,
					y,
					width: barW,
					height: h,
					fill: c,
					rx: 5,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("title", { children: [
						d.label,
						": ",
						labelFormatter(d.value)
					] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: x + barW / 2,
					y: y - 5,
					textAnchor: "middle",
					fontSize: 11,
					fill: "currentColor",
					opacity: "0.75",
					fontWeight: "600",
					children: labelFormatter(d.value)
				}),
				rotate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: x + barW / 2,
					y: H - padBottom + 14,
					fontSize: 11,
					fill: "currentColor",
					opacity: "0.85",
					textAnchor: "end",
					transform: `rotate(-35 ${x + barW / 2} ${H - padBottom + 14})`,
					children: d.label
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: x + barW / 2,
					y: H - 12,
					textAnchor: "middle",
					fontSize: 12,
					fill: "currentColor",
					opacity: "0.75",
					children: d.label
				})
			] }, i);
		})]
	});
}
function LineChart({ data, height = 220, color }) {
	const c = color || cssVar("--brand", "#2563eb");
	const n = Math.max(1, data.length);
	const step = 60;
	const padX = 30;
	const padTop = 18;
	const padBottom = 34;
	const W = 60 + Math.max(1, n - 1) * step;
	const H = height;
	const max = Math.max(1, ...data.map((d) => d.value));
	const min = Math.min(0, ...data.map((d) => d.value));
	const range = max - min || 1;
	const usable = H - padBottom - padTop;
	const y = (v) => H - padBottom - (v - min) / range * usable;
	const pts = data.map((d, i) => [padX + i * step, y(d.value)]);
	const path = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0] + "," + p[1]).join(" ");
	const area = path + ` L ${pts[pts.length - 1][0]},${H - padBottom} L ${pts[0][0]},${H - padBottom} Z`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `0 0 ${W} ${H}`,
		width: "100%",
		height: H,
		preserveAspectRatio: "xMidYMid meet",
		style: { display: "block" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: 0,
				x2: W,
				y1: H - padBottom,
				y2: H - padBottom,
				stroke: "currentColor",
				opacity: "0.15"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: area,
				fill: c,
				opacity: "0.15"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: path,
				fill: "none",
				stroke: c,
				strokeWidth: "2"
			}),
			pts.map(([x, yy], i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: x,
					cy: yy,
					r: "3.5",
					fill: c,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("title", { children: [
						data[i].label,
						": ",
						data[i].value
					] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x,
					y: yy - 10,
					textAnchor: "middle",
					fontSize: 11,
					fill: "currentColor",
					opacity: "0.75",
					fontWeight: "600",
					children: data[i].value
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x,
					y: H - 12,
					textAnchor: "middle",
					fontSize: 12,
					fill: "currentColor",
					opacity: "0.75",
					children: data[i].label
				})
			] }, i))
		]
	});
}
function Donut({ data, size = 180, thickness = 22 }) {
	const total = data.reduce((s, d) => s + d.value, 0) || 1;
	const r = size / 2 - thickness / 2;
	const C = 2 * Math.PI * r;
	let acc = 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "flex",
			gap: 14,
			alignItems: "center",
			flexWrap: "wrap"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			width: size,
			height: size,
			viewBox: `0 0 ${size} ${size}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: size / 2,
					cy: size / 2,
					r,
					fill: "none",
					stroke: "var(--bg-secondary)",
					strokeWidth: thickness
				}),
				data.map((d, i) => {
					const dash = d.value / total * C;
					const el = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: size / 2,
						cy: size / 2,
						r,
						fill: "none",
						stroke: d.color,
						strokeWidth: thickness,
						strokeDasharray: `${dash} ${C - dash}`,
						strokeDashoffset: -acc,
						transform: `rotate(-90 ${size / 2} ${size / 2})`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("title", { children: [
							d.label,
							": ",
							d.value
						] })
					}, i);
					acc += dash;
					return el;
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: size / 2,
					y: size / 2,
					textAnchor: "middle",
					dominantBaseline: "middle",
					fontSize: size / 6,
					fontWeight: "700",
					fill: "currentColor",
					children: total
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: {
				display: "grid",
				gap: 6
			},
			children: data.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "center",
					gap: 8,
					fontSize: 12
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: {
						width: 10,
						height: 10,
						borderRadius: 3,
						background: d.color
					} }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: { color: "var(--text-secondary)" },
						children: d.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							marginLeft: "auto",
							fontWeight: 700
						},
						children: d.value
					})
				]
			}, i))
		})]
	});
}
function StatCard({ label, value, sub, color, trend }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					fontSize: 11,
					color: "var(--text-muted)",
					textTransform: "uppercase",
					letterSpacing: ".05em"
				},
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					fontSize: 26,
					fontWeight: 700,
					margin: "6px 0 2px",
					color: color || "var(--text-primary)"
				},
				children: value
			}),
			sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					fontSize: 12,
					color: "var(--text-secondary)"
				},
				children: sub
			}),
			trend !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					fontSize: 11,
					marginTop: 4,
					color: trend >= 0 ? "var(--success)" : "var(--danger)"
				},
				children: [
					trend >= 0 ? "▲" : "▼",
					" ",
					Math.abs(trend),
					"%"
				]
			})
		]
	});
}
var DAY_LABELS = [
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat",
	"Sun"
];
var MONTH_LABELS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];
function HostDashboard() {
	const [learners] = useLocalStorage("host.learners", seedLearners);
	const [events] = useLocalStorage("host.calendar", seedCalendar);
	const [messages] = useLocalStorage("host.messages", seedMessages);
	const [profile] = useLocalStorage("host.company_profile", hostProfile);
	const [onboarding] = useLocalStorage("host.onboarding", seedOnboarding);
	const [attendance] = useLocalStorage("host.attendance", seedAttendance);
	const [performance] = useLocalStorage("host.performance", seedPerformance);
	const activeCount = learners.filter((l) => l.status === "Active").length;
	const capacity = Number(profile.learner_capacity) || 25;
	const vacant = Math.max(0, capacity - learners.length);
	const openReviews = performance.length ? Math.max(0, Math.round(performance.length * .25)) : 0;
	const avgAttendance = learners.length ? Math.round(learners.reduce((s, l) => s + (Number(l.attendance_rate) || 0), 0) / learners.length) : 0;
	events.filter((e) => (e.type || "").toLowerCase().includes("interview")).length || onboarding.length;
	const recent = learners.slice(0, 6);
	const donutData = [
		{
			label: "Active",
			value: learners.filter((l) => l.status === "Active").length,
			color: "#16a34a"
		},
		{
			label: "On Leave",
			value: learners.filter((l) => l.status === "On Leave").length,
			color: "#d97706"
		},
		{
			label: "At Risk",
			value: learners.filter((l) => l.status === "At Risk").length,
			color: "#dc2626"
		},
		{
			label: "Completed",
			value: learners.filter((l) => l.status === "Completed").length,
			color: "#2563eb"
		}
	];
	const attendanceByDay = (() => {
		const buckets = DAY_LABELS.map((l) => ({
			label: l,
			sum: 0,
			count: 0
		}));
		const cutoff = Date.now() - 12096e5;
		attendance.forEach((a) => {
			const dt = /* @__PURE__ */ new Date(a.date + "T00:00:00");
			if (dt.getTime() < cutoff) return;
			const dayIdx = (dt.getDay() + 6) % 7;
			const b = buckets[dayIdx];
			b.count += 1;
			if (a.status === "Present" || a.status === "Clocked In" || a.status === "Clocked Out") b.sum += 1;
		});
		return buckets.map((b) => ({
			label: b.label,
			value: b.count ? Math.round(b.sum / b.count * 100) : 0
		}));
	})();
	const perfTrend = (() => {
		const buckets = {
			Q1: [],
			Q2: [],
			Q3: [],
			Q4: []
		};
		performance.forEach((r) => {
			const avg = (r.technical + r.communication + r.teamwork + r.attitude) / 4 * 20;
			const m = Number((r.review_date || "").slice(5, 7));
			buckets[m <= 3 ? "Q1" : m <= 6 ? "Q2" : m <= 9 ? "Q3" : "Q4"].push(avg);
		});
		return Object.entries(buckets).map(([k, arr]) => ({
			label: k,
			value: arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0
		}));
	})();
	const hostActivity = (() => {
		const now = /* @__PURE__ */ new Date();
		const months = Array.from({ length: 6 }, (_, i) => {
			const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
			return {
				label: MONTH_LABELS[d.getMonth()],
				year: d.getFullYear(),
				month: d.getMonth(),
				value: 0
			};
		});
		learners.forEach((l) => {
			const [y, m] = (l.start_date || "").split("-").map(Number);
			if (!y) return;
			const hit = months.find((x) => x.year === y && x.month === m - 1);
			if (hit) hit.value += 1;
		});
		return months.map((m) => ({
			label: m.label,
			value: m.value
		}));
	})();
	const upcomingWithHolidays = [...events].filter((e) => e.date >= (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "Dashboard",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: { marginBottom: 22 },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					style: {
						margin: 0,
						fontSize: 18
					},
					children: ["Welcome back, ", (profile.contact_person || "there").split(" ")[0]]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					style: {
						margin: "4px 0 0",
						color: "var(--text-secondary)",
						fontSize: 13
					},
					children: [
						profile.company_name,
						" — ",
						profile.industry
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
					gap: 16
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Active Learners",
						value: activeCount,
						sub: `of ${capacity} capacity`,
						color: "var(--brand)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Vacant Positions",
						value: vacant,
						sub: "Placements you can still take",
						color: "var(--warning)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "In Onboarding",
						value: onboarding.length,
						sub: "Being onboarded"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Reviews Due",
						value: openReviews,
						sub: "Pending your input",
						color: "var(--danger)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Avg Attendance",
						value: `${avgAttendance}%`,
						sub: "Across placed learners",
						color: "var(--success)"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: { marginTop: 28 },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						style: {
							margin: "0 0 12px",
							fontSize: 16
						},
						children: "Analytics"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gridTemplateColumns: "minmax(0,2fr) minmax(260px,1fr)",
							gap: 16
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 12,
									color: "var(--text-muted)",
									marginBottom: 8
								},
								children: "ATTENDANCE BY WEEKDAY (%) — LAST 2 WEEKS"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineChart, {
								data: attendanceByDay,
								height: 220
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 12,
									color: "var(--text-muted)",
									marginBottom: 8
								},
								children: "LEARNER STATUS BREAKDOWN"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Donut, { data: donutData })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
							gap: 16,
							marginTop: 16
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 12,
									color: "var(--text-muted)",
									marginBottom: 8
								},
								children: "PERFORMANCE TREND (quarterly avg %)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarChart, {
								data: perfTrend,
								height: 220,
								labelFormatter: (v) => v + "%"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 12,
									color: "var(--text-muted)",
									marginBottom: 8
								},
								children: "LEARNERS HOSTED PER MONTH (last 6)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarChart, {
								data: hostActivity,
								height: 220,
								color: "#7c3aed"
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "2fr 1fr",
					gap: 18,
					marginTop: 24
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: 14
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							style: {
								margin: 0,
								fontSize: 15
							},
							children: "Recent Placed Learners"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/host/learners",
							className: "btn btn-ghost",
							children: "View all →"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						style: {
							textAlign: "left",
							fontSize: 11,
							color: "var(--text-muted)",
							textTransform: "uppercase"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: { padding: "8px 0" },
								children: "Name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Program" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Attendance" })
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: recent.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						style: {
							borderTop: "1px solid var(--border-color)",
							fontSize: 13
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									padding: "10px 0",
									fontWeight: 600
								},
								children: l.full_name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: { color: "var(--text-secondary)" },
								children: l.program
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "badge " + (l.status === "Active" ? "badge-success" : l.status === "At Risk" ? "badge-danger" : "badge-info"),
								children: l.status
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [l.attendance_rate, "%"] })
						]
					}, l.id)) })] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							style: {
								margin: "0 0 14px",
								fontSize: 15
							},
							children: "Upcoming"
						}),
						upcomingWithHolidays.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 12,
								color: "var(--text-muted)"
							},
							children: "No upcoming events."
						}),
						upcomingWithHolidays.map((e) => {
							const hol = holidayOn(e.date);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									padding: "10px 0",
									borderTop: "1px solid var(--border-color)"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: 12,
											color: "var(--brand)",
											fontWeight: 600
										},
										children: [
											e.date,
											" · ",
											e.time
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: 13,
											fontWeight: 500
										},
										children: [e.title, hol ? ` · 🇿🇦 ${hol.name}` : ""]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: 12,
											color: "var(--text-muted)"
										},
										children: [e.type, e.location ? ` • ${e.location}` : ""]
									})
								]
							}, e.id);
						})
					]
				})]
			})
		]
	});
}
function Modal({ open, onClose, title, subtitle, width = 560, footer, children }) {
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		onClick: onClose,
		style: {
			position: "fixed",
			inset: 0,
			background: "rgba(0,0,0,.5)",
			display: "grid",
			placeItems: "center",
			zIndex: 60,
			padding: 16
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onClick: (e) => e.stopPropagation(),
			className: "card",
			style: {
				width: `min(${width}px, 96vw)`,
				maxHeight: "92vh",
				overflow: "auto",
				padding: 0
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						padding: "18px 22px",
						borderBottom: "1px solid var(--border-color)",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
						gap: 12
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						style: {
							margin: 0,
							fontSize: 16
						},
						children: title
					}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 12,
							color: "var(--text-muted)",
							marginTop: 4
						},
						children: subtitle
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-ghost",
						onClick: onClose,
						children: "✕"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { padding: 22 },
					children
				}),
				footer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						padding: "14px 22px",
						borderTop: "1px solid var(--border-color)",
						display: "flex",
						justifyContent: "flex-end",
						gap: 8
					},
					children: footer
				})
			]
		})
	});
}
var field$1 = {
	display: "block",
	width: "100%",
	padding: "10px 12px",
	border: "1px solid var(--input-border)",
	borderRadius: 8,
	background: "var(--input-bg)",
	color: "var(--input-text)",
	fontSize: 13
};
var labelStyle$1 = {
	display: "block",
	fontSize: 12,
	fontWeight: 600,
	color: "var(--text-secondary)",
	marginBottom: 6
};
var PROGRAMS = [
	"Software Development NQF5",
	"Data Analytics NQF5",
	"Cloud Engineering NQF6",
	"Cybersecurity NQF5",
	"UX/UI Design NQF5"
];
var STATUSES = [
	"Active",
	"On Leave",
	"Completed",
	"At Risk"
];
var empty$6 = {
	full_name: "",
	email: "",
	phone: "",
	program: PROGRAMS[0],
	company: HOST_COMPANY,
	mentor: "",
	start_date: "",
	end_date: "",
	status: "Active",
	attendance_rate: 100,
	performance_score: 80,
	progress: 0
};
function PlacedLearners() {
	const [list, setList] = useLocalStorage("host.learners", seedLearners);
	const [q, setQ] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("All");
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [showForm, setShowForm] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)(empty$6);
	const confirm = useConfirm();
	const filtered = (0, import_react.useMemo)(() => list.filter((l) => (status === "All" || l.status === status) && (l.full_name.toLowerCase().includes(q.toLowerCase()) || l.program.toLowerCase().includes(q.toLowerCase()) || (l.company || "").toLowerCase().includes(q.toLowerCase()))), [
		list,
		q,
		status
	]);
	const openEdit = (l) => {
		setEditing(l.id);
		setForm({
			...empty$6,
			...l
		});
		setShowForm(true);
		setSelected(null);
	};
	const remove = async (l) => {
		if (!await confirm({
			title: "Remove Learner",
			description: `Are you sure you want to remove ${l.full_name} from placed learners?`,
			variant: "destructive",
			confirmText: "Remove Learner"
		})) return;
		setList((prev) => prev.filter((x) => x.id !== l.id));
		setSelected(null);
		toast.success("Learner Removed", { description: `${l.full_name} has been removed.` });
	};
	const submit = (e) => {
		e.preventDefault();
		if (!form.full_name.trim()) {
			toast.warning("Name Required", { description: "Please enter learner full name." });
			return;
		}
		const isComplete = form.status === "Completed";
		const clean = {
			...form,
			attendance_rate: Number(form.attendance_rate) || 0,
			performance_score: Number(form.performance_score) || 0,
			progress: isComplete ? 100 : Number(form.progress) || 0,
			company: form.company || "Mavis Strategic Partners"
		};
		if (editing) {
			setList((prev) => prev.map((x) => x.id === editing ? {
				...x,
				...clean
			} : x));
			toast.success("Learner Updated", { description: `${clean.full_name}'s record was updated.` });
		} else {
			setList((prev) => [{
				...clean,
				id: uid("L")
			}, ...prev]);
			toast.success("Learner Added", { description: `${clean.full_name} has been placed.` });
		}
		setShowForm(false);
	};
	const set = (k) => (e) => setForm((f) => ({
		...f,
		[k]: e.target.value
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "Placed Learners",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						gap: 10,
						marginBottom: 16,
						flexWrap: "wrap"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Search name, program, company…",
						style: {
							flex: 1,
							minWidth: 240,
							padding: "10px 12px",
							border: "1px solid var(--input-border)",
							borderRadius: 8,
							background: "var(--input-bg)",
							color: "var(--input-text)"
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: status,
						onChange: (e) => setStatus(e.target.value),
						style: {
							padding: "10px 12px",
							border: "1px solid var(--input-border)",
							borderRadius: 8,
							background: "var(--input-bg)",
							color: "var(--input-text)"
						},
						children: ["All", ...STATUSES].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { overflowX: "auto" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						style: {
							textAlign: "left",
							fontSize: 11,
							color: "var(--text-muted)",
							textTransform: "uppercase"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: { padding: "10px 0" },
								children: "Learner"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Program" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Company" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Start" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Performance" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [filtered.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						style: {
							borderTop: "1px solid var(--border-color)",
							fontSize: 13
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								style: { padding: "12px 0" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: { fontWeight: 600 },
									children: l.full_name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: 11,
										color: "var(--text-muted)"
									},
									children: l.email
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: { color: "var(--text-secondary)" },
								children: l.program
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: { color: "var(--text-secondary)" },
								children: l.company || "Mavis Strategic Partners"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: { color: "var(--text-secondary)" },
								children: l.start_date
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "badge " + (l.status === "Active" ? "badge-success" : l.status === "At Risk" ? "badge-danger" : "badge-info"),
								children: l.status
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [l.performance_score, "%"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								style: { whiteSpace: "nowrap" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "btn btn-ghost",
										onClick: () => setSelected(l),
										children: "View"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "btn btn-ghost",
										onClick: () => openEdit(l),
										children: "Edit"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "btn btn-ghost",
										style: { color: "var(--danger)" },
										onClick: () => remove(l),
										children: "Delete"
									})
								]
							})
						]
					}, l.id)), filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: "7",
						style: {
							padding: 30,
							textAlign: "center",
							color: "var(--text-muted)"
						},
						children: "No learners match."
					}) })] })] })
				})]
			}),
			selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
				open: true,
				onClose: () => setSelected(null),
				title: selected.full_name,
				subtitle: `${selected.email} · ${selected.phone || ""}`,
				width: 720,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => setSelected(null),
					children: "Close"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					onClick: () => openEdit(selected),
					children: "Edit"
				})] }),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gridTemplateColumns: "1fr 1fr 1fr",
							gap: 14,
							fontSize: 13
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									color: "var(--text-muted)",
									fontSize: 11
								},
								children: "Program"
							}), selected.program] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									color: "var(--text-muted)",
									fontSize: 11
								},
								children: "Company"
							}), selected.company || "Mavis Strategic Partners"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									color: "var(--text-muted)",
									fontSize: 11
								},
								children: "Mentor"
							}), selected.mentor] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									color: "var(--text-muted)",
									fontSize: 11
								},
								children: "Status"
							}), selected.status] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									color: "var(--text-muted)",
									fontSize: 11
								},
								children: "Start"
							}), selected.start_date] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									color: "var(--text-muted)",
									fontSize: 11
								},
								children: "End"
							}), selected.end_date] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										color: "var(--text-muted)",
										fontSize: 11
									},
									children: "Attendance"
								}),
								selected.attendance_rate,
								"%"
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										color: "var(--text-muted)",
										fontSize: 11
									},
									children: "Performance"
								}),
								selected.performance_score,
								"%"
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									color: "var(--text-muted)",
									fontSize: 11
								},
								children: "Phone"
							}), selected.phone || "—"] })
						]
					}),
					selected.bio && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							marginTop: 14,
							fontSize: 13,
							color: "var(--text-secondary)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								color: "var(--text-muted)",
								fontSize: 11,
								marginBottom: 4
							},
							children: "Bio"
						}), selected.bio]
					}),
					selected.skills && selected.skills.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: { marginTop: 14 },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								color: "var(--text-muted)",
								fontSize: 11,
								marginBottom: 4
							},
							children: "Skills"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "flex",
								flexWrap: "wrap",
								gap: 6
							},
							children: selected.skills.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "badge badge-info",
								children: s
							}, s))
						})]
					}),
					(() => {
						const effProgress = selected.status === "Completed" ? 100 : selected.progress || 0;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { marginTop: 16 },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									fontSize: 11,
									color: "var(--text-muted)",
									marginBottom: 4
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Program Progress" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [effProgress, "%"] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									height: 8,
									background: "var(--bg-secondary)",
									borderRadius: 999
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
									width: effProgress + "%",
									height: "100%",
									background: effProgress === 100 ? "var(--success)" : "var(--brand)",
									borderRadius: 999
								} })
							})]
						});
					})()
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: showForm,
				onClose: () => setShowForm(false),
				title: editing ? "Edit Learner" : "Add Learner",
				subtitle: `Host company: ${HOST_COMPANY}`,
				width: 720,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => setShowForm(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					type: "submit",
					form: "learner-form",
					children: editing ? "Save Changes" : "Create Learner"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					id: "learner-form",
					onSubmit: submit,
					style: {
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 14
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Full Name *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								style: field$1,
								value: form.full_name,
								onChange: set("full_name")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Email"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "email",
							style: field$1,
							value: form.email,
							onChange: set("email")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Phone"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							style: field$1,
							value: form.phone,
							onChange: set("phone")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Program"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							style: field$1,
							value: form.program,
							onChange: set("program"),
							children: PROGRAMS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: p }, p))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Company"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							style: field$1,
							value: form.company,
							onChange: set("company")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Mentor"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							style: field$1,
							value: form.mentor,
							onChange: set("mentor")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Status"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							style: field$1,
							value: form.status,
							onChange: set("status"),
							children: STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Start Date"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							style: field$1,
							value: form.start_date,
							onChange: set("start_date")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "End Date"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							style: field$1,
							value: form.end_date,
							onChange: set("end_date")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Attendance %"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							min: "0",
							max: "100",
							style: field$1,
							value: form.attendance_rate,
							onChange: set("attendance_rate")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Performance /100"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							min: "0",
							max: "100",
							style: field$1,
							value: form.performance_score,
							onChange: set("performance_score")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: labelStyle$1,
									children: "Progress %"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "range",
									min: "0",
									max: "100",
									style: { width: "100%" },
									value: form.progress,
									onChange: set("progress")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										fontSize: 12,
										color: "var(--text-muted)"
									},
									children: [form.progress, "%"]
								})
							]
						})
					]
				})
			})
		]
	});
}
function Stars({ n }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		style: { color: "#f59e0b" },
		children: ["★".repeat(n), "☆".repeat(5 - n)]
	});
}
var emptyReview = {
	learner_id: "",
	learner_name: "",
	review_date: "",
	reviewer: "Thandi Mokoena",
	technical: 3,
	communication: 3,
	teamwork: 3,
	attitude: 3,
	notes: ""
};
function Performance() {
	const [reviews, setReviews] = useLocalStorage("host.performance", seedPerformance);
	const [learners] = useLocalStorage("host.learners", seedLearners);
	const [q, setQ] = (0, import_react.useState)("");
	const [showForm, setShowForm] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)(emptyReview);
	const [learnerSearch, setLearnerSearch] = (0, import_react.useState)("");
	const filtered = (0, import_react.useMemo)(() => {
		const t = q.toLowerCase().trim();
		if (!t) return reviews;
		return reviews.filter((r) => (r.learner_name || "").toLowerCase().includes(t) || (r.reviewer || "").toLowerCase().includes(t) || (r.notes || "").toLowerCase().includes(t) || (r.review_date || "").includes(t));
	}, [reviews, q]);
	const learnerMatches = (0, import_react.useMemo)(() => {
		const t = learnerSearch.toLowerCase().trim();
		return learners.filter((l) => !t || l.full_name.toLowerCase().includes(t) || (l.email || "").toLowerCase().includes(t)).slice(0, 8);
	}, [learners, learnerSearch]);
	const openAdd = () => {
		setForm({
			...emptyReview,
			review_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		});
		setLearnerSearch("");
		setShowForm(true);
	};
	const setF = (k) => (e) => setForm((f) => ({
		...f,
		[k]: e.target.value
	}));
	const setNum = (k) => (e) => setForm((f) => ({
		...f,
		[k]: Math.max(1, Math.min(5, Number(e.target.value) || 1))
	}));
	const submit = (e) => {
		e.preventDefault();
		if (!form.learner_name) {
			toast.warning("Learner Required", { description: "Please pick the learner being reviewed." });
			return;
		}
		setReviews((prev) => [{
			...form,
			id: uid("R")
		}, ...prev]);
		toast.success("Performance Review Submitted", { description: `Review recorded for ${form.learner_name}.` });
		setShowForm(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "Performance Reviews",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card",
				style: {
					marginBottom: 16,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					gap: 10,
					flexWrap: "wrap"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					style: {
						margin: 0,
						fontSize: 15
					},
					children: "Quarterly Performance Reviews"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						fontSize: 13,
						color: "var(--text-secondary)"
					},
					children: "Rate technical skill, communication, teamwork and attitude on a 5-point scale."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						gap: 8,
						alignItems: "center"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "🔎 Search by name, email, reviewer…",
						style: {
							padding: "10px 12px",
							width: 280,
							border: "1px solid var(--input-border)",
							borderRadius: 8,
							background: "var(--input-bg)",
							color: "var(--input-text)"
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-primary",
						onClick: openAdd,
						children: "+ New Review"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
					gap: 16
				},
				children: [filtered.map((r) => {
					const avg = ((r.technical + r.communication + r.teamwork + r.attitude) / 4).toFixed(1);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: { fontWeight: 600 },
									children: r.learner_name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										fontSize: 12,
										color: "var(--text-muted)"
									},
									children: [
										"Reviewed ",
										r.review_date,
										" by ",
										r.reviewer
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: { textAlign: "right" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: 22,
											fontWeight: 700,
											color: "var(--brand)"
										},
										children: avg
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: 11,
											color: "var(--text-muted)"
										},
										children: "Avg score"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr auto",
									rowGap: 6,
									marginTop: 14,
									fontSize: 13
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Technical" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { n: r.technical }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Communication" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { n: r.communication }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Teamwork" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { n: r.teamwork }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Attitude" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { n: r.attitude })
								]
							}),
							r.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								style: {
									fontSize: 12,
									color: "var(--text-secondary)",
									marginTop: 12,
									marginBottom: 0
								},
								children: r.notes
							})
						]
					}, r.id);
				}), filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "card",
					style: {
						textAlign: "center",
						color: "var(--text-muted)",
						gridColumn: "1 / -1",
						padding: 40
					},
					children: "No reviews match your search."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: showForm,
				onClose: () => setShowForm(false),
				title: "New performance review",
				subtitle: "Search for the learner and rate each competency out of 5.",
				width: 640,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => setShowForm(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					type: "submit",
					form: "review-form",
					children: "Save review"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					id: "review-form",
					onSubmit: submit,
					style: {
						display: "grid",
						gap: 14
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Learner *"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								placeholder: "Search learner by name or email…",
								style: field$1,
								value: learnerSearch,
								onChange: (e) => {
									setLearnerSearch(e.target.value);
									setForm((f) => ({
										...f,
										learner_id: "",
										learner_name: ""
									}));
								}
							}),
							learnerSearch && !form.learner_id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									maxHeight: 180,
									overflow: "auto",
									border: "1px solid var(--border-color)",
									borderRadius: 8,
									marginTop: 6,
									background: "var(--bg-primary)"
								},
								children: [learnerMatches.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										padding: 10,
										fontSize: 12,
										color: "var(--text-muted)"
									},
									children: "No learners match."
								}), learnerMatches.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => {
										setForm((f) => ({
											...f,
											learner_id: l.id,
											learner_name: l.full_name
										}));
										setLearnerSearch(l.full_name);
									},
									style: {
										display: "block",
										width: "100%",
										textAlign: "left",
										padding: "8px 10px",
										background: "transparent",
										border: 0,
										borderTop: "1px solid var(--border-color)",
										cursor: "pointer",
										color: "var(--text-primary)"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: 13,
											fontWeight: 600
										},
										children: l.full_name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: 11,
											color: "var(--text-muted)"
										},
										children: [
											l.email,
											" · ",
											l.program
										]
									})]
								}, l.id))]
							}),
							form.learner_id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: 11,
									color: "var(--success)",
									marginTop: 4
								},
								children: ["✓ Selected: ", form.learner_name]
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
								gap: 12
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: labelStyle$1,
									children: "Review date"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									style: field$1,
									value: form.review_date,
									onChange: setF("review_date")
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: labelStyle$1,
									children: "Reviewer"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									style: field$1,
									value: form.reviewer,
									onChange: setF("reviewer")
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: labelStyle$1,
									children: "Technical (1–5)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									min: "1",
									max: "5",
									style: field$1,
									value: form.technical,
									onChange: setNum("technical")
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: labelStyle$1,
									children: "Communication (1–5)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									min: "1",
									max: "5",
									style: field$1,
									value: form.communication,
									onChange: setNum("communication")
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: labelStyle$1,
									children: "Teamwork (1–5)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									min: "1",
									max: "5",
									style: field$1,
									value: form.teamwork,
									onChange: setNum("teamwork")
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: labelStyle$1,
									children: "Attitude (1–5)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									min: "1",
									max: "5",
									style: field$1,
									value: form.attitude,
									onChange: setNum("attitude")
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Notes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							rows: 3,
							style: field$1,
							value: form.notes,
							onChange: setF("notes")
						})] })
					]
				})
			})
		]
	});
}
var DEFAULT_TASKS = [
	"Site Induction",
	"Health & Safety Briefing",
	"IT Equipment Issued",
	"Email & Slack Access",
	"Mentor Assigned",
	"First Project Brief",
	"Probation Review"
];
var emptyForm = {
	full_name: "",
	email: "",
	phone: "",
	alternate_phone: "",
	citizenship: "SA Citizen",
	id_number: "",
	passport_number: "",
	address: "",
	qualification: "",
	year_completed: "",
	institution: "",
	disability: false,
	disability_nature: "",
	program: "",
	start_date: "",
	end_date: "",
	mentor: "",
	bio: ""
};
var YEARS = Array.from({ length: 30 }, (_, i) => String((/* @__PURE__ */ new Date()).getFullYear() - i));
var Req = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
	style: {
		color: "var(--danger, #dc2626)",
		marginLeft: 3
	},
	children: "*"
});
function Onboarding() {
	const [data, setData] = useLocalStorage("host.onboarding", seedOnboarding);
	const [placed, setPlaced] = useLocalStorage("host.learners", seedLearners);
	const [profile] = useLocalStorage("host.company_profile", hostProfile);
	const [showForm, setShowForm] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)(emptyForm);
	const [flash, setFlash] = (0, import_react.useState)(null);
	const [programQuery, setProgramQuery] = (0, import_react.useState)("");
	const { push } = useNotifications();
	const availablePrograms = Array.isArray(profile.programs) && profile.programs.length ? profile.programs : [
		"Software Development NQF5",
		"Data Analytics NQF5",
		"Cloud Engineering NQF6",
		"Cybersecurity NQF5",
		"UX/UI Design NQF5"
	];
	const capacity = Number(profile.learner_capacity) || 25;
	const atCapacity = placed.length >= capacity;
	const set = (k) => (e) => setForm((f) => ({
		...f,
		[k]: e.target.type === "checkbox" ? e.target.checked : e.target.value
	}));
	const matchingPrograms = (0, import_react.useMemo)(() => {
		const q = programQuery.trim().toLowerCase();
		if (!q) return availablePrograms;
		return availablePrograms.filter((p) => p.toLowerCase().includes(q));
	}, [programQuery, availablePrograms]);
	const openAdd = () => {
		if (atCapacity) {
			setFlash({
				tone: "error",
				msg: `Learner capacity reached (${placed.length}/${capacity}). Can't onboard a learner right now — increase capacity in Settings first.`
			});
			return;
		}
		setForm({
			...emptyForm,
			program: availablePrograms[0] || "",
			start_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		});
		setProgramQuery("");
		setShowForm(true);
	};
	const submit = (e) => {
		e.preventDefault();
		if (atCapacity) {
			toast.error("Capacity Limit Reached", { description: `Learner capacity reached (${placed.length}/${capacity}). Cannot onboard right now.` });
			return;
		}
		const requiredMsg = (label) => {
			toast.warning(`${label} Required`, { description: `Please provide a valid ${label.toLowerCase()}.` });
		};
		if (!form.full_name.trim()) return requiredMsg("Full name");
		if (!form.email.trim()) return requiredMsg("Email");
		if (!form.phone.trim()) return requiredMsg("Phone");
		if (form.citizenship === "SA Citizen" && !form.id_number.trim()) return requiredMsg("SA ID number");
		if (form.citizenship === "Foreign" && !form.passport_number.trim()) return requiredMsg("Passport number");
		if (!form.address.trim()) return requiredMsg("Address");
		if (!form.qualification.trim()) return requiredMsg("Qualification");
		if (!form.program || !availablePrograms.includes(form.program)) {
			toast.warning("Program Required", { description: "Please choose a program from the available list." });
			return;
		}
		if (!form.start_date) return requiredMsg("Start date");
		if (!form.end_date) return requiredMsg("End date");
		if (form.end_date < form.start_date) {
			toast.warning("Invalid Date Range", { description: "End date must be on or after the start date." });
			return;
		}
		if (form.disability && !form.disability_nature.trim()) return requiredMsg("Nature of disability");
		const tasks = DEFAULT_TASKS.map((name) => ({
			name,
			done: false
		}));
		const newRow = {
			learner_id: uid("OB"),
			learner_name: form.full_name.trim(),
			program: form.program,
			started: form.start_date,
			tasks,
			progress: 0,
			_meta: {
				email: form.email,
				phone: form.phone,
				alternate_phone: form.alternate_phone,
				citizenship: form.citizenship,
				id_number: form.id_number,
				passport_number: form.passport_number,
				address: form.address,
				qualification: form.qualification,
				year_completed: form.year_completed,
				institution: form.institution,
				disability: form.disability,
				disability_nature: form.disability_nature,
				mentor: form.mentor,
				bio: form.bio,
				end_date: form.end_date,
				company: HOST_COMPANY
			}
		};
		setData((d) => [newRow, ...d]);
		setShowForm(false);
		toast.success("Learner Added to Onboarding", { description: `${newRow.learner_name} has been enrolled.` });
		setFlash({
			tone: "success",
			msg: `${newRow.learner_name} added to onboarding.`
		});
		push({
			title: "New onboarding started",
			body: `${newRow.learner_name} was added to the onboarding queue.`,
			link: "/host/onboarding",
			kind: "reminder"
		});
	};
	const toggle = (li, ti) => {
		setData((d) => {
			let migrate = null;
			const next = d.map((row, i) => {
				if (i !== li) return row;
				const tasks = row.tasks.map((t, j) => j === ti ? {
					...t,
					done: !t.done
				} : t);
				const done = tasks.filter((t) => t.done).length;
				const progress = Math.round(done / tasks.length * 100);
				if (progress === 100) migrate = {
					...row,
					tasks,
					progress
				};
				return {
					...row,
					tasks,
					progress
				};
			});
			if (migrate) {
				const meta = migrate._meta || {};
				const placedRow = {
					id: uid("L"),
					full_name: migrate.learner_name,
					email: meta.email || "",
					phone: meta.phone || "",
					alternate_phone: meta.alternate_phone || "",
					program: migrate.program,
					company: meta.company || "Mavis Strategic Partners",
					mentor: meta.mentor || "",
					start_date: migrate.started,
					end_date: meta.end_date || "",
					status: "Active",
					attendance_rate: 100,
					performance_score: 0,
					progress: 100,
					bio: meta.bio || "",
					skills: [],
					qualifications: meta.qualification ? [`${meta.qualification}${meta.year_completed ? " (" + meta.year_completed + ")" : ""}${meta.institution ? " — " + meta.institution : ""}`] : [],
					citizenship: meta.citizenship,
					id_number: meta.id_number,
					passport_number: meta.passport_number,
					address: meta.address,
					disability: meta.disability ? meta.disability_nature || "Yes" : null,
					onboarded: true
				};
				setPlaced((prev) => [placedRow, ...prev]);
				push({
					title: "Onboarding complete",
					body: `${migrate.learner_name} moved to Placed Learners.`,
					link: "/host/learners",
					kind: "reminder"
				});
				return next.filter((r) => r.learner_id !== migrate.learner_id);
			}
			return next;
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "Onboarding Progress",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card",
				style: {
					marginBottom: 16,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					gap: 12,
					flexWrap: "wrap"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						fontSize: 13,
						color: "var(--text-secondary)"
					},
					children: [
						data.length,
						" learner(s) currently being onboarded. Complete all onboarding tasks (100%) to automatically move a learner to ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Placed Learners" }),
						"."
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						fontSize: 12,
						color: "var(--text-muted)",
						marginTop: 4
					},
					children: [
						"Placement capacity: ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: placed.length }),
						" / ",
						capacity
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					onClick: openAdd,
					children: "+ Add Learner"
				})]
			}),
			flash && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				style: {
					marginBottom: 16,
					borderLeft: `4px solid ${flash.tone === "error" ? "var(--danger)" : "var(--success)"}`,
					background: flash.tone === "error" ? "var(--danger-soft, #fee2e2)" : "var(--success-soft, #dcfce7)"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: { fontSize: 13 },
						children: flash.msg
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-ghost",
						onClick: () => setFlash(null),
						children: "✕"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gap: 14
				},
				children: [data.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					style: {
						textAlign: "center",
						color: "var(--text-muted)",
						padding: 40
					},
					children: [
						"No learners are being onboarded right now. Click ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "+ Add Learner" }),
						" to start."
					]
				}), data.map((row, li) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: 12
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: { fontWeight: 600 },
							children: row.learner_name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								fontSize: 12,
								color: "var(--text-muted)"
							},
							children: [
								row.program,
								" · Started ",
								row.started
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { minWidth: 200 },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: 12,
									color: "var(--text-muted)",
									marginBottom: 4,
									textAlign: "right"
								},
								children: [row.progress, "% complete"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									height: 8,
									background: "var(--bg-secondary)",
									borderRadius: 999
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
									width: row.progress + "%",
									height: "100%",
									background: row.progress === 100 ? "var(--success)" : "var(--brand)",
									borderRadius: 999,
									transition: "width .25s"
								} })
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
							gap: 8
						},
						children: row.tasks.map((t, ti) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: 10,
								padding: "10px 12px",
								border: "1px solid var(--border-color)",
								borderRadius: 8,
								background: t.done ? "var(--success-soft)" : "var(--bg-secondary)",
								cursor: "pointer",
								fontSize: 13,
								color: t.done ? "var(--success)" : "var(--text-primary)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: t.done,
								onChange: () => toggle(li, ti)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: { textDecoration: t.done ? "line-through" : "none" },
								children: t.name
							})]
						}, ti))
					})]
				}, row.learner_id))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: showForm,
				onClose: () => setShowForm(false),
				title: "Onboard new learner",
				subtitle: `Host company: ${HOST_COMPANY} — fields marked with a red star are required.`,
				width: 760,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => setShowForm(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					type: "submit",
					form: "onboard-form",
					children: "Start Onboarding"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					id: "onboard-form",
					onSubmit: submit,
					style: {
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 14
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								gridColumn: "1 / -1",
								fontSize: 12,
								fontWeight: 700,
								color: "var(--text-muted)",
								textTransform: "uppercase",
								letterSpacing: .5,
								marginTop: 4
							},
							children: "Personal details"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								style: labelStyle$1,
								children: ["Full Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Req, {})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								style: field$1,
								value: form.full_name,
								onChange: set("full_name")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							style: labelStyle$1,
							children: ["Email", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Req, {})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							type: "email",
							style: field$1,
							value: form.email,
							onChange: set("email")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							style: labelStyle$1,
							children: ["Phone", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Req, {})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							style: field$1,
							value: form.phone,
							onChange: set("phone"),
							placeholder: "+27 ..."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							style: labelStyle$1,
							children: ["Alternate phone ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									color: "var(--text-muted)",
									fontWeight: 400
								},
								children: "(if we can't reach you)"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							style: field$1,
							value: form.alternate_phone,
							onChange: set("alternate_phone"),
							placeholder: "Optional"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							style: labelStyle$1,
							children: ["Address", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Req, {})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							style: field$1,
							value: form.address,
							onChange: set("address"),
							placeholder: "Street, suburb, city"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								gridColumn: "1 / -1",
								fontSize: 12,
								fontWeight: 700,
								color: "var(--text-muted)",
								textTransform: "uppercase",
								letterSpacing: .5,
								marginTop: 8
							},
							children: "Citizenship"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							style: labelStyle$1,
							children: ["Citizenship", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Req, {})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							style: field$1,
							value: form.citizenship,
							onChange: set("citizenship"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "SA Citizen" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Foreign" })]
						})] }),
						form.citizenship === "SA Citizen" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							style: labelStyle$1,
							children: ["SA ID number", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Req, {})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							style: field$1,
							value: form.id_number,
							onChange: set("id_number"),
							placeholder: "13-digit ID",
							maxLength: 13
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							style: labelStyle$1,
							children: ["Passport number", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Req, {})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							style: field$1,
							value: form.passport_number,
							onChange: set("passport_number")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								gridColumn: "1 / -1",
								fontSize: 12,
								fontWeight: 700,
								color: "var(--text-muted)",
								textTransform: "uppercase",
								letterSpacing: .5,
								marginTop: 8
							},
							children: "Education"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							style: labelStyle$1,
							children: ["Qualification", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Req, {})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							style: field$1,
							value: form.qualification,
							onChange: set("qualification"),
							placeholder: "e.g. Matric, Diploma in IT"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Year completed"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							style: field$1,
							value: form.year_completed,
							onChange: set("year_completed"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Select year…"
							}), YEARS.map((y) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: y }, y))]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Institution"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								style: field$1,
								value: form.institution,
								onChange: set("institution"),
								placeholder: "e.g. University of Johannesburg"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								gridColumn: "1 / -1",
								fontSize: 12,
								fontWeight: 700,
								color: "var(--text-muted)",
								textTransform: "uppercase",
								letterSpacing: .5,
								marginTop: 8
							},
							children: "Placement"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									style: labelStyle$1,
									children: [
										"Program",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Req, {}),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												color: "var(--text-muted)",
												fontWeight: 400,
												fontSize: 11
											},
											children: "(only programs your company offers)"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									list: "program-options",
									required: true,
									style: field$1,
									value: form.program,
									onChange: (e) => {
										setForm((f) => ({
											...f,
											program: e.target.value
										}));
										setProgramQuery(e.target.value);
									},
									placeholder: "Start typing to search…"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
									id: "program-options",
									children: matchingPrograms.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: p }, p))
								}),
								form.program && !availablePrograms.includes(form.program) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: 11,
										color: "var(--danger)",
										marginTop: 4
									},
									children: "Not an available program. Pick one from the list — or add it in Company Profile → Programs."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							style: labelStyle$1,
							children: ["Start date", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Req, {})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							type: "date",
							style: field$1,
							value: form.start_date,
							onChange: set("start_date")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							style: labelStyle$1,
							children: ["End date", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Req, {})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							type: "date",
							style: field$1,
							value: form.end_date,
							onChange: set("end_date")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Mentor"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								style: field$1,
								value: form.mentor,
								onChange: set("mentor"),
								placeholder: "Optional"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								gridColumn: "1 / -1",
								fontSize: 12,
								fontWeight: 700,
								color: "var(--text-muted)",
								textTransform: "uppercase",
								letterSpacing: .5,
								marginTop: 8
							},
							children: "Accessibility"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							style: {
								gridColumn: "1 / -1",
								display: "inline-flex",
								alignItems: "center",
								gap: 8,
								fontSize: 13
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: !!form.disability,
								onChange: set("disability")
							}), "Learner has a disability"]
						}),
						form.disability && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								style: labelStyle$1,
								children: ["Nature of disability", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Req, {})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								style: field$1,
								value: form.disability_nature,
								onChange: set("disability_nature"),
								placeholder: "e.g. Hearing impairment, mobility, visual"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								style: labelStyle$1,
								children: ["Short bio ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										color: "var(--text-muted)",
										fontWeight: 400
									},
									children: "(optional)"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								rows: 3,
								style: {
									...field$1,
									resize: "vertical"
								},
								value: form.bio,
								onChange: set("bio")
							})]
						})
					]
				})
			})
		]
	});
}
function parseYMD(key) {
	if (!key) return null;
	const [y, m, d] = key.split("-").map(Number);
	if (!y || !m || !d) return null;
	return new Date(y, m - 1, d);
}
function formatLongDate(key) {
	const dt = parseYMD(key);
	if (!dt) return key || "";
	return dt.toLocaleDateString("en-ZA", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric"
	});
}
function formatShortDate(key) {
	const dt = parseYMD(key);
	if (!dt) return key || "";
	return dt.toLocaleDateString("en-ZA");
}
var EVENT_TYPES = [
	"Assessment",
	"Induction",
	"Class",
	"Webinar",
	"Submission",
	"Review",
	"Workshop",
	"Meeting",
	"Visit"
];
var WEEKDAYS = [
	"Sun",
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat"
];
var toKey = (raw) => (raw || "").slice(0, 10);
function calendarGrid(year, monthIndex) {
	const pad = new Date(year, monthIndex, 1).getDay();
	const days = new Date(year, monthIndex + 1, 0).getDate();
	const cells = [];
	for (let i = 0; i < pad; i++) cells.push(null);
	for (let d = 1; d <= days; d++) cells.push({ day: d });
	while (cells.length % 7 !== 0) cells.push(null);
	return cells;
}
var empty$5 = {
	title: "",
	type: "Class",
	date: "",
	time: "",
	location: "",
	link: "",
	mandatory_attendance: false,
	description: ""
};
function Calendar$1() {
	const [events, setEvents] = useLocalStorage("host.calendar", seedCalendar);
	const [showForm, setShowForm] = (0, import_react.useState)(false);
	const [editingId, setEditingId] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)(empty$5);
	const [selectedDate, setSelectedDate] = (0, import_react.useState)(null);
	const [activeMonth, setActiveMonth] = (0, import_react.useState)(() => {
		const t = /* @__PURE__ */ new Date();
		return {
			year: t.getFullYear(),
			month: t.getMonth()
		};
	});
	const confirm = useConfirm();
	const eventsByDate = (0, import_react.useMemo)(() => {
		const map = {};
		events.forEach((e) => {
			const k = toKey(e.date);
			(map[k] = map[k] || []).push(e);
		});
		return map;
	}, [events]);
	const grid = calendarGrid(activeMonth.year, activeMonth.month);
	const monthLabel = new Date(activeMonth.year, activeMonth.month, 1).toLocaleDateString("en-ZA", {
		month: "long",
		year: "numeric"
	});
	const navMonth = (delta) => setActiveMonth((p) => {
		const d = new Date(p.year, p.month + delta, 1);
		return {
			year: d.getFullYear(),
			month: d.getMonth()
		};
	});
	const openCreate = (preDate) => {
		setForm({
			...empty$5,
			date: preDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		});
		setEditingId(null);
		setShowForm(true);
	};
	const openEdit = (e) => {
		setEditingId(e.id);
		setForm({
			...empty$5,
			...e,
			date: toKey(e.date)
		});
		setShowForm(true);
	};
	const del = async (e) => {
		if (!await confirm({
			title: "Delete Event",
			description: `Are you sure you want to delete "${e.title}" from the calendar?`,
			variant: "destructive",
			confirmText: "Delete Event"
		})) return;
		setEvents((prev) => prev.filter((x) => x.id !== e.id));
		toast.success("Event Deleted", { description: `"${e.title}" was removed.` });
	};
	const submit = (ev) => {
		ev.preventDefault();
		if (!form.title.trim() || !form.date) {
			toast.warning("Event Details Required", { description: "Title and date are required." });
			return;
		}
		if (editingId) {
			setEvents((prev) => prev.map((x) => x.id === editingId ? {
				...x,
				...form
			} : x));
			toast.success("Event Updated", { description: `"${form.title}" was updated.` });
		} else {
			setEvents((prev) => [...prev, {
				...form,
				id: uid("E")
			}]);
			toast.success("Event Scheduled", { description: `"${form.title}" was added to the calendar.` });
		}
		setShowForm(false);
	};
	const set = (k) => (e) => setForm((f) => ({
		...f,
		[k]: k === "mandatory_attendance" ? e.target.checked : e.target.value
	}));
	const dayEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];
	const dayHoliday = selectedDate ? holidayOn(selectedDate) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "Calendar",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: 16,
					gap: 12,
					flexWrap: "wrap"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						fontSize: 13,
						color: "var(--text-secondary)"
					},
					children: "Events, milestones and South African public holidays"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					onClick: () => openCreate(),
					children: "+ Add Event"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "minmax(0,1fr) 420px",
					gap: 20,
					alignItems: "flex-start"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								fontSize: 15,
								fontWeight: 700,
								marginBottom: 12
							},
							children: [selectedDate ? `Events on ${formatLongDate(selectedDate)}` : "All upcoming events", selectedDate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-ghost",
								style: { marginLeft: 10 },
								onClick: () => setSelectedDate(null),
								children: "Show all"
							})]
						}),
						dayHoliday && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "#fffbeb",
								border: "1px solid #fcd34d",
								color: "#78350f",
								padding: "14px 16px",
								borderRadius: 10,
								marginBottom: 12
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										fontWeight: 800,
										fontSize: 15,
										color: "#78350f"
									},
									children: ["🇿🇦 ", dayHoliday.name]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: 11,
										color: "#92400e",
										marginTop: 2,
										textTransform: "uppercase",
										letterSpacing: .4,
										fontWeight: 700
									},
									children: "South African Public Holiday"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: 13,
										marginTop: 8,
										color: "#78350f",
										lineHeight: 1.45
									},
									children: dayHoliday.description
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										fontSize: 12,
										marginTop: 8,
										color: "#92400e"
									},
									children: ["Date: ", formatLongDate(selectedDate)]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gap: 10
							},
							children: [
								(selectedDate ? dayEvents : events.slice(0, 30)).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										border: "1px solid var(--border-color)",
										borderLeft: "4px solid var(--brand)",
										borderRadius: 10,
										padding: 12
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											justifyContent: "space-between",
											gap: 8
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												style: {
													fontSize: 14,
													fontWeight: 700
												},
												children: e.title
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													fontSize: 11,
													color: "var(--text-muted)",
													marginTop: 2
												},
												children: [
													e.type,
													" • ",
													formatShortDate(toKey(e.date)),
													e.time ? ` • ${e.time}` : ""
												]
											}),
											e.location && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													fontSize: 12,
													color: "var(--text-secondary)",
													marginTop: 4
												},
												children: ["📍 ", e.location]
											}),
											e.link && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
												href: e.link,
												target: "_blank",
												rel: "noreferrer",
												style: {
													display: "inline-block",
													marginTop: 6,
													fontSize: 12,
													color: "var(--brand)",
													fontWeight: 600
												},
												children: "Open meeting link →"
											}),
											e.mandatory_attendance && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "badge badge-danger",
												style: {
													marginLeft: e.link ? 8 : 0,
													marginTop: 6
												},
												children: "Mandatory"
											}),
											e.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												style: {
													fontSize: 12,
													color: "var(--text-secondary)",
													marginTop: 6,
													marginBottom: 0
												},
												children: e.description
											})
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: { whiteSpace: "nowrap" },
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: "btn btn-ghost",
												onClick: () => openEdit(e),
												children: "Edit"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: "btn btn-ghost",
												style: { color: "var(--danger)" },
												onClick: () => del(e),
												children: "Delete"
											})]
										})]
									})
								}, e.id)),
								selectedDate && dayEvents.length === 0 && !dayHoliday && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										color: "var(--text-muted)",
										fontSize: 13,
										textAlign: "center",
										padding: 20
									},
									children: "No events on this day."
								}),
								selectedDate && dayEvents.length === 0 && dayHoliday && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										color: "var(--text-muted)",
										fontSize: 13,
										textAlign: "center",
										padding: 12
									},
									children: "No scheduled events — enjoy the public holiday."
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: 12
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-ghost",
									onClick: () => navMonth(-1),
									children: "‹"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontWeight: 800,
										fontSize: 15
									},
									children: monthLabel
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-ghost",
									onClick: () => navMonth(1),
									children: "›"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
								gap: 4,
								fontSize: 11,
								color: "var(--text-muted)",
								textAlign: "center",
								marginBottom: 6
							},
							children: WEEKDAYS.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: { fontWeight: 700 },
								children: w
							}, w))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
								gap: 4
							},
							children: grid.map((cell, idx) => {
								if (!cell) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { height: 56 } }, idx);
								const dateKey = `${activeMonth.year}-${String(activeMonth.month + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`;
								const isHoliday = holidayOn(dateKey);
								const dayEv = eventsByDate[dateKey] || [];
								const isSelected = selectedDate === dateKey;
								const isToday = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) === dateKey;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setSelectedDate(dateKey),
									onDoubleClick: () => openCreate(dateKey),
									title: isHoliday ? `${isHoliday.name} — ${isHoliday.description}` : "Click to view · Double-click to add event",
									style: {
										height: 56,
										padding: 4,
										borderRadius: 8,
										border: isToday ? "2px solid var(--brand)" : "1px solid var(--border-color)",
										background: isSelected ? "var(--brand-soft)" : isHoliday ? "var(--warning-soft)" : "var(--bg-primary)",
										cursor: "pointer",
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										gap: 2,
										position: "relative"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: 12,
												fontWeight: 700,
												color: isHoliday ? "#92400e" : "var(--text-primary)"
											},
											children: cell.day
										}),
										isHoliday && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: 8,
												color: "#92400e",
												fontWeight: 700,
												textAlign: "center",
												lineHeight: 1.1
											},
											children: isHoliday.name.length > 12 ? isHoliday.name.slice(0, 10) + "…" : isHoliday.name
										}),
										dayEv.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: {
											width: 6,
											height: 6,
											borderRadius: 6,
											background: "var(--brand)"
										} })
									]
								}, idx);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								marginTop: 12,
								fontSize: 11,
								color: "var(--text-muted)",
								display: "flex",
								gap: 12,
								flexWrap: "wrap"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: {
									display: "inline-block",
									width: 10,
									height: 10,
									background: "var(--warning-soft)",
									borderRadius: 3,
									marginRight: 4,
									verticalAlign: "middle"
								} }), " Public holiday"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: {
									display: "inline-block",
									width: 10,
									height: 10,
									background: "var(--brand)",
									borderRadius: 5,
									marginRight: 4,
									verticalAlign: "middle"
								} }), " Has events"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: {
									display: "inline-block",
									width: 10,
									height: 10,
									border: "2px solid var(--brand)",
									borderRadius: 3,
									marginRight: 4,
									verticalAlign: "middle"
								} }), " Today"] })
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: showForm,
				onClose: () => setShowForm(false),
				title: editingId ? "Edit event" : "New event",
				width: 640,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => setShowForm(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					type: "submit",
					form: "ev-form",
					children: editingId ? "Save" : "Create"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					id: "ev-form",
					onSubmit: submit,
					style: {
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
						gap: 14
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Title *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								style: field$1,
								value: form.title,
								onChange: set("title")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Type"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							style: field$1,
							value: form.type,
							onChange: set("type"),
							children: EVENT_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: t }, t))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Date *"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							type: "date",
							style: field$1,
							value: form.date,
							onChange: set("date")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Time"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "time",
							style: field$1,
							value: form.time,
							onChange: set("time")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Location"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							style: field$1,
							value: form.location,
							onChange: set("location")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Meeting link"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								style: field$1,
								value: form.link,
								onChange: set("link"),
								placeholder: "https://…"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Description"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								rows: 3,
								style: {
									...field$1,
									resize: "vertical"
								},
								value: form.description,
								onChange: set("description")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							style: {
								gridColumn: "1 / -1",
								display: "inline-flex",
								alignItems: "center",
								gap: 8,
								fontSize: 13
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: !!form.mandatory_attendance,
								onChange: set("mandatory_attendance")
							}), "Mandatory attendance"]
						})
					]
				})
			})
		]
	});
}
/**
* Draggable kanban board with drop targets on every column so users can move
* cards in any direction (backward or forward).
* props:
*  columns: [string]
*  items:   [{ id, status, ... }]
*  onMove:  (id, newStatus) => void
*  renderCard: (item) => ReactNode
*  columnAccent: (col) => cssColor
*/
function KanbanBoard({ columns, items, onMove, renderCard, columnAccent }) {
	const [dragId, setDragId] = (0, import_react.useState)(null);
	const [over, setOver] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: {
			display: "grid",
			gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
			gap: 12
		},
		children: columns.map((col) => {
			const colItems = items.filter((i) => i.status === col);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "kanban-col" + (over === col ? " drag-over" : ""),
				onDragOver: (e) => {
					e.preventDefault();
					setOver(col);
				},
				onDragLeave: () => setOver((o) => o === col ? null : o),
				onDrop: () => {
					if (dragId) onMove(dragId, col);
					setDragId(null);
					setOver(null);
				},
				style: {
					background: "var(--bg-secondary)",
					borderRadius: 10,
					padding: 10,
					minHeight: 320
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						fontSize: 11,
						fontWeight: 700,
						textTransform: "uppercase",
						color: "var(--text-muted)",
						marginBottom: 10,
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: {
							display: "inline-flex",
							alignItems: "center",
							gap: 6
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: {
							width: 8,
							height: 8,
							borderRadius: 999,
							background: columnAccent ? columnAccent(col) : "var(--brand)"
						} }), col]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: colItems.length })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gap: 8
					},
					children: [colItems.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "kanban-card",
						draggable: true,
						onDragStart: () => setDragId(item.id),
						onDragEnd: () => {
							setDragId(null);
							setOver(null);
						},
						children: renderCard(item)
					}, item.id)), colItems.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 11,
							color: "var(--text-muted)",
							textAlign: "center",
							padding: 20,
							border: "1px dashed var(--border-color)",
							borderRadius: 8
						},
						children: "Drop here"
					})]
				})]
			}, col);
		})
	});
}
var empty$4 = {
	name: "",
	client: "",
	description: "",
	status: "To Do",
	priority: "Medium",
	start_date: "",
	end_date: "",
	lead: "",
	assigned_learner_ids: []
};
var columnAccent$1 = (c) => c === "Completed" ? "var(--success)" : c === "Review" ? "var(--warning)" : c === "In Progress" ? "var(--brand)" : "var(--text-muted)";
var priorityColor$1 = (p) => p === "Critical" ? "var(--danger)" : p === "High" ? "var(--warning)" : p === "Low" ? "var(--text-muted)" : "var(--brand)";
function Projects() {
	const [projects, setProjects] = useLocalStorage("host.projects", seedProjects);
	const [learners] = useLocalStorage("host.learners", seedLearners);
	const [tasks] = useLocalStorage("host.tasks", seedTasks);
	const [q, setQ] = (0, import_react.useState)("");
	const [priorityFilter, setPriorityFilter] = (0, import_react.useState)("All");
	const [showForm, setShowForm] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)(empty$4);
	const confirm = useConfirm();
	const filtered = (0, import_react.useMemo)(() => projects.filter((p) => (priorityFilter === "All" || p.priority === priorityFilter) && (p.name.toLowerCase().includes(q.toLowerCase()) || (p.client || "").toLowerCase().includes(q.toLowerCase()))), [
		projects,
		q,
		priorityFilter
	]);
	const openAdd = () => {
		setEditing(null);
		setForm({
			...empty$4,
			start_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		});
		setShowForm(true);
	};
	const openEdit = (p) => {
		setEditing(p.id);
		setForm({
			...empty$4,
			...p,
			assigned_learner_ids: p.assigned_learner_ids || []
		});
		setShowForm(true);
	};
	const remove = async (p) => {
		if (!await confirm({
			title: "Delete Project",
			description: `Are you sure you want to delete project "${p.name}"? This action cannot be undone.`,
			variant: "destructive",
			confirmText: "Delete Project"
		})) return;
		setProjects((prev) => prev.filter((x) => x.id !== p.id));
		toast.success("Project Deleted", { description: `"${p.name}" was removed.` });
	};
	const submit = (e) => {
		e.preventDefault();
		if (!form.name.trim()) {
			toast.warning("Project Name Required", { description: "Please enter a name for the project." });
			return;
		}
		if (editing) {
			setProjects((prev) => prev.map((x) => x.id === editing ? {
				...x,
				...form
			} : x));
			toast.success("Project Updated", { description: `"${form.name}" has been updated.` });
		} else {
			setProjects((prev) => [{
				id: uid("P"),
				...form
			}, ...prev]);
			toast.success("Project Created", { description: `"${form.name}" has been added.` });
		}
		setShowForm(false);
	};
	const set = (k) => (e) => setForm((f) => ({
		...f,
		[k]: e.target.value
	}));
	const toggleLearner = (id) => setForm((f) => ({
		...f,
		assigned_learner_ids: (f.assigned_learner_ids || []).includes(id) ? f.assigned_learner_ids.filter((x) => x !== id) : [...f.assigned_learner_ids || [], id]
	}));
	const move = (id, status) => setProjects((prev) => prev.map((p) => p.id === id ? {
		...p,
		status
	} : p));
	const stats = [
		{
			label: "Total projects",
			value: projects.length,
			color: "var(--brand)"
		},
		{
			label: "In progress",
			value: projects.filter((p) => p.status === "In Progress").length,
			color: "var(--warning)"
		},
		{
			label: "Review",
			value: projects.filter((p) => p.status === "Review").length,
			color: "var(--warning)"
		},
		{
			label: "Completed",
			value: projects.filter((p) => p.status === "Completed").length,
			color: "var(--success)"
		},
		{
			label: "Assigned learners",
			value: new Set(projects.flatMap((p) => p.assigned_learner_ids || [])).size,
			color: "var(--text-primary)"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "Projects",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
					gap: 16,
					marginBottom: 18
				},
				children: stats.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 12,
							color: "var(--text-muted)"
						},
						children: s.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 28,
							fontWeight: 700,
							color: s.color
						},
						children: s.value
					})]
				}, s.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: 10,
							marginBottom: 16,
							flexWrap: "wrap"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: q,
								onChange: (e) => setQ(e.target.value),
								placeholder: "Search projects…",
								style: {
									flex: 1,
									minWidth: 240,
									padding: "10px 12px",
									border: "1px solid var(--input-border)",
									borderRadius: 8,
									background: "var(--input-bg)",
									color: "var(--input-text)"
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: priorityFilter,
								onChange: (e) => setPriorityFilter(e.target.value),
								style: {
									padding: "10px 12px",
									border: "1px solid var(--input-border)",
									borderRadius: 8,
									background: "var(--input-bg)",
									color: "var(--input-text)"
								},
								children: ["All", ...PROJECT_PRIORITIES].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-primary",
								onClick: openAdd,
								children: "+ New Project"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: 6,
							fontSize: 12,
							color: "var(--text-muted)",
							marginBottom: 10
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { size: 14 }), " Drag any project card into a different column to change its status — in any direction."]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanBoard, {
						columns: PROJECT_STATUSES,
						items: filtered,
						onMove: move,
						columnAccent: columnAccent$1,
						renderCard: (p) => {
							const projectTasks = tasks.filter((t) => t.project_id === p.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "card",
								style: {
									padding: 14,
									borderLeft: `4px solid ${priorityColor$1(p.priority)}`
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: 14,
											fontWeight: 700
										},
										children: p.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: 11,
											color: "var(--text-muted)",
											marginTop: 2
										},
										children: p.client
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: 12,
											color: "var(--text-secondary)",
											margin: "8px 0",
											display: "-webkit-box",
											WebkitLineClamp: 2,
											WebkitBoxOrient: "vertical",
											overflow: "hidden"
										},
										children: p.description
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											gap: 6,
											flexWrap: "wrap",
											marginTop: 8
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "chip",
												children: ["👤 ", p.lead]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "chip",
												children: ["Priority: ", p.priority]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "chip",
												children: [(p.assigned_learner_ids || []).length, " learners"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "chip",
												children: [
													"✓ ",
													projectTasks.filter((t) => t.status === "Completed").length,
													"/",
													projectTasks.length,
													" tasks"
												]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											marginTop: 10,
											display: "flex",
											gap: 4
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "btn btn-ghost",
											style: {
												padding: "4px 8px",
												fontSize: 11
											},
											onClick: () => openEdit(p),
											children: "Edit"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "btn btn-ghost",
											style: {
												padding: "4px 8px",
												fontSize: 11,
												color: "var(--danger)",
												marginLeft: "auto"
											},
											onClick: () => remove(p),
											children: "Delete"
										})]
									})
								]
							});
						}
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: showForm,
				onClose: () => setShowForm(false),
				title: editing ? "Edit project" : "New project",
				width: 720,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => setShowForm(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					type: "submit",
					form: "proj-form",
					children: editing ? "Save" : "Create"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					id: "proj-form",
					onSubmit: submit,
					style: {
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
						gap: 14
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Project name *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								style: field$1,
								value: form.name,
								onChange: set("name")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Client"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							style: field$1,
							value: form.client,
							onChange: set("client")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Lead"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							style: field$1,
							value: form.lead,
							onChange: set("lead")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Status"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							style: field$1,
							value: form.status,
							onChange: set("status"),
							children: PROJECT_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Priority"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							style: field$1,
							value: form.priority,
							onChange: set("priority"),
							children: PROJECT_PRIORITIES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Start"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							style: field$1,
							value: form.start_date,
							onChange: set("start_date")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "End"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							style: field$1,
							value: form.end_date,
							onChange: set("end_date")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Description"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								rows: 3,
								style: field$1,
								value: form.description,
								onChange: set("description")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Assign learners"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									display: "flex",
									flexWrap: "wrap",
									gap: 6,
									maxHeight: 140,
									overflow: "auto",
									padding: 4
								},
								children: learners.map((l) => {
									const on = (form.assigned_learner_ids || []).includes(l.id);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => toggleLearner(l.id),
										className: "chip",
										style: {
											cursor: "pointer",
											border: on ? "1px solid var(--brand)" : "1px solid var(--border-color)",
											background: on ? "var(--brand-soft)" : "var(--bg-secondary)",
											color: on ? "var(--brand)" : "var(--text-secondary)"
										},
										children: [on ? "✓ " : "", l.full_name]
									}, l.id);
								})
							})]
						})
					]
				})
			})
		]
	});
}
var empty$3 = {
	title: "",
	project_id: "",
	assignee_learner_id: "",
	status: "To Do",
	priority: "Medium",
	due_date: "",
	description: ""
};
var priorityColor = (p) => p === "Critical" ? "var(--danger)" : p === "High" ? "var(--warning)" : p === "Low" ? "var(--text-muted)" : "var(--brand)";
var columnAccent = (c) => c === "Completed" ? "var(--success)" : c === "Review" ? "var(--warning)" : c === "In Progress" ? "var(--brand)" : "var(--text-muted)";
function Tasks() {
	const [tasks, setTasks] = useLocalStorage("host.tasks", seedTasks);
	const [projects] = useLocalStorage("host.projects", seedProjects);
	const [learners] = useLocalStorage("host.learners", seedLearners);
	const [q, setQ] = (0, import_react.useState)("");
	const [projectFilter, setProjectFilter] = (0, import_react.useState)("All");
	const [view, setView] = (0, import_react.useState)("board");
	const [showForm, setShowForm] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)(empty$3);
	const confirm = useConfirm();
	const projectName = (id) => projects.find((p) => p.id === id)?.name || "—";
	const learnerName = (id) => learners.find((l) => l.id === id)?.full_name || "—";
	const filtered = (0, import_react.useMemo)(() => tasks.filter((t) => (projectFilter === "All" || t.project_id === projectFilter) && (t.title.toLowerCase().includes(q.toLowerCase()) || (t.description || "").toLowerCase().includes(q.toLowerCase()))), [
		tasks,
		q,
		projectFilter
	]);
	const openAdd = () => {
		setEditing(null);
		setForm({
			...empty$3,
			project_id: projects[0]?.id || "",
			assignee_learner_id: learners[0]?.id || ""
		});
		setShowForm(true);
	};
	const openEdit = (t) => {
		setEditing(t.id);
		setForm({
			...empty$3,
			...t
		});
		setShowForm(true);
	};
	const remove = async (t) => {
		if (!await confirm({
			title: "Delete Task",
			description: `Are you sure you want to delete task "${t.title}"? This cannot be undone.`,
			variant: "destructive",
			confirmText: "Delete Task"
		})) return;
		setTasks((prev) => prev.filter((x) => x.id !== t.id));
		toast.success("Task Deleted", { description: `"${t.title}" was removed.` });
	};
	const move = (id, status) => setTasks((prev) => prev.map((x) => x.id === id ? {
		...x,
		status
	} : x));
	const submit = (e) => {
		e.preventDefault();
		if (!form.title.trim()) {
			toast.warning("Task Title Required", { description: "Please enter a name for the task." });
			return;
		}
		if (!form.project_id) {
			toast.warning("Project Required", { description: "Please select an associated project." });
			return;
		}
		if (editing) {
			setTasks((prev) => prev.map((x) => x.id === editing ? {
				...x,
				...form
			} : x));
			toast.success("Task Updated", { description: `"${form.title}" has been updated.` });
		} else {
			setTasks((prev) => [{
				id: uid("T"),
				...form
			}, ...prev]);
			toast.success("Task Created", { description: `"${form.title}" has been added.` });
		}
		setShowForm(false);
	};
	const set = (k) => (e) => setForm((f) => ({
		...f,
		[k]: e.target.value
	}));
	const stats = [
		{
			label: "Total tasks",
			value: tasks.length,
			color: "var(--brand)"
		},
		{
			label: "To do",
			value: tasks.filter((t) => t.status === "To Do").length,
			color: "var(--text-muted)"
		},
		{
			label: "In progress",
			value: tasks.filter((t) => t.status === "In Progress").length,
			color: "var(--warning)"
		},
		{
			label: "Review",
			value: tasks.filter((t) => t.status === "Review").length,
			color: "var(--warning)"
		},
		{
			label: "Completed",
			value: tasks.filter((t) => t.status === "Completed").length,
			color: "var(--success)"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "Tasks",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
					gap: 16,
					marginBottom: 18
				},
				children: stats.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 12,
							color: "var(--text-muted)"
						},
						children: s.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 28,
							fontWeight: 700,
							color: s.color
						},
						children: s.value
					})]
				}, s.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						gap: 10,
						marginBottom: 16,
						flexWrap: "wrap"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: q,
							onChange: (e) => setQ(e.target.value),
							placeholder: "Search tasks…",
							style: {
								flex: 1,
								minWidth: 220,
								padding: "10px 12px",
								border: "1px solid var(--input-border)",
								borderRadius: 8,
								background: "var(--input-bg)",
								color: "var(--input-text)"
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: projectFilter,
							onChange: (e) => setProjectFilter(e.target.value),
							style: {
								padding: "10px 12px",
								border: "1px solid var(--input-border)",
								borderRadius: 8,
								background: "var(--input-bg)",
								color: "var(--input-text)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "All",
								children: "All projects"
							}), projects.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: p.id,
								children: p.name
							}, p.id))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "inline-flex",
								border: "1px solid var(--input-border)",
								borderRadius: 8,
								overflow: "hidden"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn " + (view === "board" ? "btn-primary" : "btn-ghost"),
								style: {
									borderRadius: 0,
									border: 0
								},
								onClick: () => setView("board"),
								children: "Board"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn " + (view === "list" ? "btn-primary" : "btn-ghost"),
								style: {
									borderRadius: 0,
									border: 0
								},
								onClick: () => setView("list"),
								children: "List"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn btn-primary",
							onClick: openAdd,
							children: "+ New Task"
						})
					]
				}), view === "board" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: 6,
						fontSize: 12,
						color: "var(--text-muted)",
						marginBottom: 10
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { size: 14 }), " Drag any task between columns — in either direction."]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanBoard, {
					columns: TASK_STATUSES,
					items: filtered,
					onMove: move,
					columnAccent,
					renderCard: (t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card",
						style: {
							padding: 12,
							borderLeft: `4px solid ${priorityColor(t.priority)}`
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 13,
									fontWeight: 700
								},
								children: t.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 11,
									color: "var(--text-muted)",
									marginTop: 3
								},
								children: projectName(t.project_id)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: 11,
									color: "var(--text-secondary)",
									marginTop: 6
								},
								children: ["👤 ", learnerName(t.assignee_learner_id)]
							}),
							t.due_date && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: 11,
									color: "var(--text-muted)",
									marginTop: 3
								},
								children: ["📅 ", t.due_date]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									marginTop: 8,
									display: "flex",
									gap: 4
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-ghost",
									style: {
										padding: "4px 8px",
										fontSize: 11
									},
									onClick: () => openEdit(t),
									children: "Edit"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-ghost",
									style: {
										padding: "4px 8px",
										fontSize: 11,
										color: "var(--danger)",
										marginLeft: "auto"
									},
									onClick: () => remove(t),
									children: "×"
								})]
							})
						]
					})
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { overflowX: "auto" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						style: {
							textAlign: "left",
							fontSize: 11,
							color: "var(--text-muted)",
							textTransform: "uppercase"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: { padding: "10px 0" },
								children: "Task"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Project" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Assignee" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Priority" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Due" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filtered.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						style: {
							borderTop: "1px solid var(--border-color)",
							fontSize: 13
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									padding: "12px 0",
									fontWeight: 500
								},
								children: t.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: projectName(t.project_id) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: learnerName(t.assignee_learner_id) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									color: priorityColor(t.priority),
									fontWeight: 600
								},
								children: t.priority
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: t.due_date }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: t.status,
								onChange: (e) => move(t.id, e.target.value),
								style: {
									padding: "4px 6px",
									fontSize: 12,
									borderRadius: 6,
									border: "1px solid var(--input-border)",
									background: "var(--input-bg)",
									color: "var(--input-text)"
								},
								children: TASK_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								style: { whiteSpace: "nowrap" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-ghost",
									onClick: () => openEdit(t),
									children: "Edit"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-ghost",
									style: { color: "var(--danger)" },
									onClick: () => remove(t),
									children: "Delete"
								})]
							})
						]
					}, t.id)) })] })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: showForm,
				onClose: () => setShowForm(false),
				title: editing ? "Edit task" : "New task",
				width: 640,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => setShowForm(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					type: "submit",
					form: "task-form",
					children: editing ? "Save" : "Create"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					id: "task-form",
					onSubmit: submit,
					style: {
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
						gap: 14
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Title *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								style: field$1,
								value: form.title,
								onChange: set("title")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Project"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							style: field$1,
							value: form.project_id,
							onChange: set("project_id"),
							children: projects.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: p.id,
								children: p.name
							}, p.id))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Assignee"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							style: field$1,
							value: form.assignee_learner_id,
							onChange: set("assignee_learner_id"),
							children: learners.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: l.id,
								children: l.full_name
							}, l.id))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Status"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							style: field$1,
							value: form.status,
							onChange: set("status"),
							children: TASK_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Priority"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							style: field$1,
							value: form.priority,
							onChange: set("priority"),
							children: PROJECT_PRIORITIES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Due date"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							style: field$1,
							value: form.due_date,
							onChange: set("due_date")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Description"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								rows: 3,
								style: field$1,
								value: form.description,
								onChange: set("description")
							})]
						})
					]
				})
			})
		]
	});
}
var FONTS = [
	"\"Brush Script MT\", cursive",
	"\"Segoe Script\", cursive",
	"Georgia, serif"
];
function SignaturePad({ onConfirm, onCancel, defaultName = "" }) {
	const [tab, setTab] = (0, import_react.useState)("draw");
	const canvasRef = (0, import_react.useRef)(null);
	const drawing = (0, import_react.useRef)(false);
	const [typed, setTyped] = (0, import_react.useState)(defaultName);
	const [font, setFont] = (0, import_react.useState)(FONTS[0]);
	const [uploadUrl, setUploadUrl] = (0, import_react.useState)(null);
	const [hasDrawn, setHasDrawn] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (tab !== "draw") return;
		const c = canvasRef.current;
		if (!c) return;
		const ctx = c.getContext("2d");
		ctx.lineWidth = 2.2;
		ctx.lineCap = "round";
		ctx.strokeStyle = "#0f172a";
	}, [tab]);
	const pos = (e) => {
		const c = canvasRef.current;
		const rect = c.getBoundingClientRect();
		const t = e.touches ? e.touches[0] : e;
		return {
			x: (t.clientX - rect.left) * (c.width / rect.width),
			y: (t.clientY - rect.top) * (c.height / rect.height)
		};
	};
	const down = (e) => {
		e.preventDefault();
		drawing.current = true;
		const { x, y } = pos(e);
		const ctx = canvasRef.current.getContext("2d");
		ctx.beginPath();
		ctx.moveTo(x, y);
		setHasDrawn(true);
	};
	const move = (e) => {
		if (!drawing.current) return;
		const { x, y } = pos(e);
		const ctx = canvasRef.current.getContext("2d");
		ctx.lineTo(x, y);
		ctx.stroke();
	};
	const up = () => {
		drawing.current = false;
	};
	const clear = () => {
		const c = canvasRef.current;
		c.getContext("2d").clearRect(0, 0, c.width, c.height);
		setHasDrawn(false);
	};
	const buildTypedDataUrl = () => {
		const c = document.createElement("canvas");
		c.width = 600;
		c.height = 160;
		const ctx = c.getContext("2d");
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, c.width, c.height);
		ctx.fillStyle = "#0f172a";
		ctx.font = `48px ${font}`;
		ctx.textBaseline = "middle";
		ctx.fillText(typed || "Signature", 20, c.height / 2);
		return c.toDataURL("image/png");
	};
	const handleUpload = (e) => {
		const f = e.target.files?.[0];
		if (!f) return;
		const reader = new FileReader();
		reader.onload = () => setUploadUrl(reader.result);
		reader.readAsDataURL(f);
	};
	const confirm = () => {
		if (tab === "draw") {
			if (!hasDrawn) return alert("Please draw your signature first.");
			onConfirm({
				dataUrl: canvasRef.current.toDataURL("image/png"),
				method: "drawn"
			});
		} else if (tab === "type") {
			if (!typed.trim()) return alert("Please type your name.");
			onConfirm({
				dataUrl: buildTypedDataUrl(),
				method: "typed",
				typed
			});
		} else {
			if (!uploadUrl) return alert("Please upload a signature image.");
			onConfirm({
				dataUrl: uploadUrl,
				method: "uploaded"
			});
		}
	};
	const tabStyle = (t) => ({
		padding: "8px 14px",
		borderRadius: 6,
		fontSize: 12,
		fontWeight: 600,
		cursor: "pointer",
		background: tab === t ? "var(--brand)" : "transparent",
		color: tab === t ? "white" : "var(--text-secondary)",
		border: "1px solid " + (tab === t ? "var(--brand)" : "var(--border-color)")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				display: "flex",
				gap: 6,
				marginBottom: 12
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					style: tabStyle("type"),
					onClick: () => setTab("type"),
					children: "Type"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					style: tabStyle("draw"),
					onClick: () => setTab("draw"),
					children: "Draw"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					style: tabStyle("upload"),
					onClick: () => setTab("upload"),
					children: "Upload"
				})
			]
		}),
		tab === "draw" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref: canvasRef,
			width: 600,
			height: 180,
			onMouseDown: down,
			onMouseMove: move,
			onMouseUp: up,
			onMouseLeave: up,
			onTouchStart: down,
			onTouchMove: move,
			onTouchEnd: up,
			style: {
				width: "100%",
				maxHeight: 200,
				background: "white",
				border: "1px dashed var(--input-border)",
				borderRadius: 8,
				touchAction: "none"
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				marginTop: 6,
				display: "flex",
				justifyContent: "space-between",
				fontSize: 11,
				color: "var(--text-muted)"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Draw with your mouse or finger" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "btn btn-ghost",
				style: {
					padding: "4px 10px",
					fontSize: 11
				},
				onClick: clear,
				children: "Clear"
			})]
		})] }),
		tab === "type" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			value: typed,
			onChange: (e) => setTyped(e.target.value),
			placeholder: "Type your full name",
			style: {
				width: "100%",
				padding: "10px 12px",
				border: "1px solid var(--input-border)",
				borderRadius: 8,
				background: "var(--input-bg)",
				color: "var(--input-text)"
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: {
				display: "flex",
				gap: 8,
				marginTop: 10,
				flexWrap: "wrap"
			},
			children: FONTS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setFont(f),
				style: {
					padding: "10px 14px",
					borderRadius: 8,
					cursor: "pointer",
					border: font === f ? "2px solid var(--brand)" : "1px solid var(--border-color)",
					background: "white",
					color: "#0f172a",
					fontFamily: f,
					fontSize: 22
				},
				children: typed || "Signature"
			}, f))
		})] }),
		tab === "upload" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			style: {
				display: "block",
				border: "2px dashed var(--input-border)",
				borderRadius: 10,
				padding: 30,
				textAlign: "center",
				cursor: "pointer",
				background: "var(--bg-secondary)"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						fontSize: 32,
						marginBottom: 6
					},
					children: "📤"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						fontSize: 13,
						fontWeight: 600
					},
					children: "Upload a signature image"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						fontSize: 11,
						color: "var(--text-muted)",
						marginTop: 4
					},
					children: "PNG or JPG with a transparent or white background works best"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "file",
					accept: "image/*",
					onChange: handleUpload,
					style: { display: "none" }
				})
			]
		}), uploadUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: {
				marginTop: 10,
				background: "white",
				border: "1px solid var(--border-color)",
				padding: 10,
				borderRadius: 8,
				textAlign: "center"
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: uploadUrl,
				alt: "Signature",
				style: { maxHeight: 120 }
			})
		})] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				display: "flex",
				justifyContent: "flex-end",
				gap: 8,
				marginTop: 16
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "btn btn-ghost",
				onClick: onCancel,
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "btn btn-primary",
				onClick: confirm,
				children: "Apply signature"
			})]
		})
	] });
}
function FilePreview({ url, mime, name, mockTitle, mockBody, height = 480 }) {
	const wrapper = {
		border: "1px solid var(--border-color)",
		borderRadius: 10,
		background: "var(--bg-secondary)",
		overflow: "hidden"
	};
	if (url) {
		if ((mime || "").startsWith("image/")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: wrapper,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: url,
				alt: name || "preview",
				style: {
					display: "block",
					maxWidth: "100%",
					maxHeight: height,
					margin: "0 auto"
				}
			})
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
			title: name || "preview",
			src: url,
			style: {
				width: "100%",
				height,
				border: 0,
				background: "white",
				...wrapper
			}
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			...wrapper,
			padding: 24,
			minHeight: height,
			color: "var(--text-primary)",
			background: "white",
			lineHeight: 1.6
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					borderBottom: "2px solid var(--brand)",
					paddingBottom: 10,
					marginBottom: 16
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						fontSize: 11,
						color: "var(--text-muted)",
						letterSpacing: ".08em",
						textTransform: "uppercase"
					},
					children: "Mavis Strategic Partners (Pty) Ltd — Official document"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					style: {
						margin: "4px 0 0",
						fontSize: 20
					},
					children: mockTitle || name || "Document"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				style: {
					marginTop: 0,
					fontSize: 13
				},
				children: mockBody || "This is a placeholder rendering used for local testing. In production, the uploaded document would be displayed here for review."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				style: { fontSize: 13 },
				children: "By signing below the reader confirms they have read, understood and agree to the contents of this document. Signed copies are retained by HR and shared with the relevant provider."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
				style: {
					fontSize: 13,
					paddingLeft: 20
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "All parties must comply with the Occupational Health & Safety Act, 1993." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Confidential information must not be shared outside the placement." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Any concerns or grievances must be raised via the standard channels." })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					marginTop: 30,
					borderTop: "1px dashed var(--border-color)",
					paddingTop: 10,
					fontSize: 11,
					color: "var(--text-muted)"
				},
				children: "Page 1 of 1 — generated for local testing."
			})
		]
	});
}
function verifyDocument({ name = "", size = 0, type = "" }) {
	const reasons = [];
	let score = 100;
	const lower = name.toLowerCase();
	if (/copy|duplicate|final_final|edited|scan(001|_new)/.test(lower)) {
		score -= 30;
		reasons.push("Filename contains suspicious edit markers.");
	}
	if (size > 0 && size < 20480) {
		score -= 25;
		reasons.push("File is unusually small for a legitimate document (< 20 KB).");
	}
	if (size > 20971520) {
		score -= 10;
		reasons.push("File is unusually large (> 20 MB) — may contain modified images.");
	}
	if (type && !/pdf|image|word|officedocument/.test(type)) {
		score -= 15;
		reasons.push("Unusual file type for a compliance document.");
	}
	if (/whatsapp|screenshot|screen shot|img_\d+/i.test(lower)) {
		score -= 20;
		reasons.push("Filename suggests a phone screenshot rather than an original scan.");
	}
	if ([...lower].reduce((a, c) => a + c.charCodeAt(0), 0) % 7 === 0) {
		score -= 15;
		reasons.push("Metadata check: creation and modification dates do not match.");
	}
	score = Math.max(0, Math.min(100, score));
	const status = score >= 80 ? "Verified" : score >= 55 ? "Needs Review" : "Suspicious";
	if (reasons.length === 0) reasons.push("No anomalies detected in filename, size, or metadata.");
	return {
		score,
		status,
		reasons
	};
}
var badgeFor$1 = (status) => status === "Verified" ? "badge-success" : status === "Needs Review" ? "badge-warning" : "badge-danger";
function Documents$1() {
	const [docs, setDocs] = useLocalStorage("host.documents", seedDocuments);
	const [q, setQ] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("All");
	const [signing, setSigning] = (0, import_react.useState)(null);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const [uploadForm, setUploadForm] = (0, import_react.useState)({
		category: "Policy",
		requires_signature: false,
		file: null,
		verification: null
	});
	const fileInput = (0, import_react.useRef)(null);
	const { push } = useNotifications();
	const confirm = useConfirm();
	const filtered = docs.filter((d) => (category === "All" || d.category === category) && d.name.toLowerCase().includes(q.toLowerCase()));
	const chooseFile = (e) => {
		const f = e.target.files?.[0];
		if (!f) return;
		const verification = verifyDocument({
			name: f.name,
			size: f.size,
			type: f.type
		});
		setUploadForm((u) => ({
			...u,
			file: f,
			verification
		}));
	};
	const doUpload = () => {
		if (!uploadForm.file) {
			toast.warning("Document Required", { description: "Please pick a file to upload first." });
			return;
		}
		const f = uploadForm.file;
		const nextDoc = {
			id: uid("D"),
			name: f.name,
			category: uploadForm.category,
			size: (f.size / 1024).toFixed(0) + " KB",
			uploaded: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			requires_signature: uploadForm.requires_signature,
			signed: false,
			review_status: uploadForm.requires_signature ? "Pending" : "N/A",
			verification: uploadForm.verification
		};
		setDocs((prev) => [nextDoc, ...prev]);
		push({
			title: `Document uploaded — ${nextDoc.name}`,
			body: `Authenticity: ${nextDoc.verification.status} (${nextDoc.verification.score}/100).`,
			link: "/host/documents",
			kind: "doc"
		});
		toast.success("Document Uploaded", { description: `"${nextDoc.name}" uploaded successfully.` });
		setUploading(false);
		setUploadForm({
			category: "Policy",
			requires_signature: false,
			file: null,
			verification: null
		});
	};
	const applySignature = (payload) => {
		setDocs((prev) => prev.map((d) => d.id === signing.id ? {
			...d,
			signed: true,
			signature_url: payload.dataUrl,
			signature_method: payload.method,
			signed_at: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			review_status: "Signed"
		} : d));
		push({
			title: "Document signed",
			body: `${signing.name} was signed (${payload.method}).`,
			link: "/host/documents",
			kind: "doc"
		});
		toast.success("Document Signed", { description: `"${signing.name}" has been signed.` });
		setSigning(null);
	};
	const remove = async (d) => {
		if (!await confirm({
			title: "Delete Document",
			description: `Are you sure you want to delete "${d.name}"? This action cannot be undone.`,
			variant: "destructive",
			confirmText: "Delete Document"
		})) return;
		setDocs((prev) => prev.filter((x) => x.id !== d.id));
		toast.success("Document Deleted", { description: `"${d.name}" was removed.` });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "Documents & E-Signatures",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card",
				style: {
					marginBottom: 16,
					display: "flex",
					gap: 10,
					flexWrap: "wrap"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Search documents…",
						style: {
							flex: 1,
							minWidth: 220,
							padding: "10px 12px",
							border: "1px solid var(--input-border)",
							borderRadius: 8,
							background: "var(--input-bg)",
							color: "var(--input-text)"
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: category,
						onChange: (e) => setCategory(e.target.value),
						style: {
							padding: "10px 12px",
							border: "1px solid var(--input-border)",
							borderRadius: 8,
							background: "var(--input-bg)",
							color: "var(--input-text)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "All" }), DOCUMENT_CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-primary",
						onClick: () => setUploading(true),
						children: "+ Upload Document"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { overflowX: "auto" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						style: {
							textAlign: "left",
							fontSize: 11,
							color: "var(--text-muted)",
							textTransform: "uppercase"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: { padding: "10px 0" },
								children: "Name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Category" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Size" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Uploaded" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Authenticity" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Signature" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filtered.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						style: {
							borderTop: "1px solid var(--border-color)",
							fontSize: 13
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									padding: "12px 0",
									fontWeight: 500
								},
								children: d.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: d.category }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: d.size }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: d.uploaded }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "badge " + badgeFor$1(d.verification?.status || "Verified"),
								title: d.verification?.reasons?.join("\n") || "",
								children: [
									d.verification?.status || "Verified",
									" · ",
									d.verification?.score ?? 100
								]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: d.requires_signature ? d.signed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "badge badge-success",
								children: ["Signed ", d.signed_at ? `· ${d.signed_at}` : ""]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "badge badge-warning",
								children: "Awaiting signature"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "badge badge-info",
								children: "Not required"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								style: { whiteSpace: "nowrap" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "btn btn-ghost",
										onClick: () => setSigning({
											...d,
											viewOnly: true
										}),
										children: "View"
									}),
									d.requires_signature && !d.signed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "btn btn-primary",
										onClick: () => setSigning(d),
										children: "Sign"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "btn btn-ghost",
										style: { color: "var(--danger)" },
										onClick: () => remove(d),
										children: "Delete"
									})
								]
							})
						]
					}, d.id)) })] })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: uploading,
				onClose: () => setUploading(false),
				title: "Upload document",
				subtitle: "Every upload is scanned for authenticity before being stored.",
				width: 620,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => setUploading(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					onClick: doUpload,
					disabled: !uploadForm.file,
					children: "Upload"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gap: 14
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "File"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: fileInput,
							type: "file",
							onChange: chooseFile,
							style: {
								...field$1,
								padding: 8
							}
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: 12
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Category"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								style: field$1,
								value: uploadForm.category,
								onChange: (e) => setUploadForm((u) => ({
									...u,
									category: e.target.value
								})),
								children: DOCUMENT_CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									display: "flex",
									alignItems: "end",
									gap: 8
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									style: {
										fontSize: 13,
										display: "flex",
										gap: 6,
										alignItems: "center"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: uploadForm.requires_signature,
										onChange: (e) => setUploadForm((u) => ({
											...u,
											requires_signature: e.target.checked
										}))
									}), "Requires signature"]
								})
							})]
						}),
						uploadForm.verification && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card",
							style: {
								padding: 14,
								background: "var(--bg-secondary)"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
										style: { fontSize: 13 },
										children: "Document authenticity check"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "badge " + badgeFor$1(uploadForm.verification.status),
										children: [
											uploadForm.verification.status,
											" · ",
											uploadForm.verification.score,
											"/100"
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									style: {
										margin: "8px 0 0",
										paddingLeft: 18,
										fontSize: 12,
										color: "var(--text-secondary)"
									},
									children: uploadForm.verification.reasons.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: r }, i))
								}),
								uploadForm.verification.status !== "Verified" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: 11,
										color: "var(--warning)",
										marginTop: 8
									},
									children: "⚠ This document will be flagged for manual HR review after upload."
								})
							]
						})
					]
				})
			}),
			signing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
				open: true,
				onClose: () => setSigning(null),
				title: signing.name,
				subtitle: signing.viewOnly ? "Signature preview (read-only)" : "Type, draw, or upload your signature — Adobe Sign style",
				width: 720,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePreview, {
					url: null,
					mime: "application/pdf",
					name: signing.name,
					mockTitle: signing.name.replace(/\.[^.]+$/, ""),
					mockBody: "This is a mock preview of the document. In production the actual PDF would render here. After you apply your signature it will be placed at the bottom of the last page and the document will be marked as signed.",
					height: 280
				}), signing.viewOnly ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: { marginTop: 14 },
					children: [signing.signature_url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "white",
							padding: 12,
							borderRadius: 8,
							textAlign: "center",
							border: "1px solid var(--border-color)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								fontSize: 11,
								color: "var(--text-muted)",
								marginBottom: 4
							},
							children: [
								"Applied signature (",
								signing.signature_method,
								")"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: signing.signature_url,
							alt: "Signature",
							style: { maxHeight: 100 }
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							marginTop: 10,
							textAlign: "right"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn btn-primary",
							onClick: () => setSigning(null),
							children: "Close"
						})
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { marginTop: 14 },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignaturePad, {
						defaultName: "Thandi Mokoena",
						onConfirm: applySignature,
						onCancel: () => setSigning(null)
					})
				})]
			})
		]
	});
}
function Messages() {
	const [msgs] = useLocalStorage("host.messages", seedMessages);
	const [selected, setSelected] = (0, import_react.useState)(msgs[0]);
	const [reply, setReply] = (0, import_react.useState)("");
	const [thread, setThread] = useLocalStorage("host.messages.thread", [{
		from: "them",
		text: "Please confirm intake numbers for July."
	}, {
		from: "me",
		text: "Will confirm by end of day. Currently 18 of 25 placements active."
	}]);
	const send = () => {
		if (!reply.trim()) return;
		setThread((t) => [...t, {
			from: "me",
			text: reply
		}]);
		setReply("");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, {
		title: "Messages",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card",
			style: {
				display: "grid",
				gridTemplateColumns: "300px 1fr",
				minHeight: 540,
				padding: 0,
				overflow: "hidden"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					borderRight: "1px solid var(--border-color)",
					overflow: "auto"
				},
				children: msgs.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					onClick: () => setSelected(m),
					style: {
						padding: 14,
						borderBottom: "1px solid var(--border-color)",
						cursor: "pointer",
						background: selected?.id === m.id ? "var(--brand-soft)" : "transparent"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "space-between"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontWeight: 600,
								fontSize: 13
							},
							children: m.from
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 11,
								color: "var(--text-muted)"
							},
							children: m.time
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 12,
							color: "var(--text-secondary)",
							marginTop: 4,
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap"
						},
						children: m.preview
					})]
				}, m.id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					flexDirection: "column"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							padding: 16,
							borderBottom: "1px solid var(--border-color)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: { fontWeight: 600 },
							children: selected?.from
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 12,
								color: "var(--text-muted)"
							},
							children: "Conversation"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							flex: 1,
							padding: 16,
							overflow: "auto",
							display: "flex",
							flexDirection: "column",
							gap: 10
						},
						children: thread.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								alignSelf: t.from === "me" ? "flex-end" : "flex-start",
								background: t.from === "me" ? "var(--brand)" : "var(--bg-secondary)",
								color: t.from === "me" ? "white" : "var(--text-primary)",
								padding: "10px 14px",
								borderRadius: 12,
								maxWidth: "72%",
								fontSize: 13
							},
							children: t.text
						}, i))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: 8,
							padding: 12,
							borderTop: "1px solid var(--border-color)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: reply,
							onChange: (e) => setReply(e.target.value),
							onKeyDown: (e) => e.key === "Enter" && send(),
							placeholder: "Write a reply…",
							style: {
								flex: 1,
								padding: "10px 12px",
								border: "1px solid var(--input-border)",
								borderRadius: 8,
								background: "var(--input-bg)",
								color: "var(--input-text)"
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn btn-primary",
							onClick: send,
							children: "Send"
						})]
					})
				]
			})]
		})
	});
}
function toCSV(rows) {
	if (!rows.length) return "";
	const keys = Object.keys(rows[0]);
	const esc = (v) => `"${String(v ?? "").replace(/"/g, "\"\"")}"`;
	return [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
}
function download(name, csv) {
	const blob = new Blob([csv], { type: "text/csv" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = name;
	a.click();
	setTimeout(() => URL.revokeObjectURL(url), 5e3);
}
function Reports() {
	const [learners] = useLocalStorage("host.learners", seedLearners);
	const [attendance] = useLocalStorage("host.attendance", seedAttendance);
	const [performance] = useLocalStorage("host.performance", seedPerformance);
	const [preview, setPreview] = (0, import_react.useState)(null);
	const learnerRows = learners.map((l) => ({
		id: l.id,
		name: l.full_name,
		program: l.program,
		status: l.status,
		attendance: l.attendance_rate + "%",
		performance: l.performance_score
	}));
	const attendanceRows = attendance.slice(0, 60).map((a) => ({
		date: a.date,
		learner: a.learner_name,
		status: a.status,
		in: a.check_in,
		out: a.check_out
	}));
	const perfRows = performance.map((p) => ({
		learner: p.learner_name,
		review_date: p.review_date,
		technical: p.technical,
		communication: p.communication,
		teamwork: p.teamwork,
		attitude: p.attitude
	}));
	const absenteeismRows = learners.map((l) => ({
		learner: l.full_name,
		attendance_rate: l.attendance_rate,
		absent_days: 30 - Math.round(l.attendance_rate * .3),
		risk: l.attendance_rate < 80 ? "High" : l.attendance_rate < 90 ? "Medium" : "Low"
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "Reports",
		children: [[{
			name: "Host Reports",
			icon: "⌂",
			items: [
				{
					id: "host-attendance",
					title: "Attendance report",
					desc: "Daily attendance across all placed learners.",
					rows: attendanceRows,
					file: "host-attendance.csv"
				},
				{
					id: "host-perf",
					title: "Performance report",
					desc: "Quarterly review scores per learner.",
					rows: perfRows,
					file: "host-performance.csv"
				},
				{
					id: "host-absent",
					title: "Absenteeism analysis",
					desc: "Risk categorisation based on attendance rate.",
					rows: absenteeismRows,
					file: "host-absenteeism.csv"
				},
				{
					id: "host-compliance",
					title: "Compliance report",
					desc: "POPIA, H&S, contracts, and BBBEE status.",
					rows: [
						{
							area: "POPIA training",
							completion: "92%",
							status: "On Track"
						},
						{
							area: "Health & Safety refresher",
							completion: "100%",
							status: "Complete"
						},
						{
							area: "Signed learner contracts",
							completion: "96%",
							status: "On Track"
						},
						{
							area: "BBBEE reporting docs",
							completion: "80%",
							status: "Review"
						}
					],
					file: "host-compliance.csv"
				}
			]
		}, {
			name: "General Reports",
			icon: "▥",
			items: [{
				id: "learners",
				title: "Placed learners register",
				desc: "Full register of currently placed learners.",
				rows: learnerRows,
				file: "learners.csv"
			}]
		}].map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: { marginBottom: 24 },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					fontSize: 12,
					fontWeight: 700,
					color: "var(--text-muted)",
					textTransform: "uppercase",
					letterSpacing: ".08em",
					margin: "4px 0 10px"
				},
				children: [
					cat.icon,
					" ",
					cat.name
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
					gap: 14
				},
				children: cat.items.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 15,
								fontWeight: 700
							},
							children: r.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 12,
								color: "var(--text-secondary)",
								margin: "6px 0 12px"
							},
							children: r.desc
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: 6
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-ghost",
								onClick: () => setPreview(r),
								children: "Preview"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-primary",
								onClick: () => download(r.file, toCSV(r.rows)),
								children: "Export CSV"
							})]
						})
					]
				}, r.id))
			})]
		}, cat.name)), preview && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
			open: true,
			onClose: () => setPreview(null),
			title: preview.title,
			width: 780,
			footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "btn btn-ghost",
				onClick: () => setPreview(null),
				children: "Close"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "btn btn-primary",
				onClick: () => download(preview.file, toCSV(preview.rows)),
				children: "Export CSV"
			})] }),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					overflow: "auto",
					maxHeight: "60vh"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: preview.rows[0] && Object.keys(preview.rows[0]).map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					style: {
						padding: "8px 10px",
						textAlign: "left",
						fontSize: 11,
						color: "var(--text-muted)",
						textTransform: "uppercase"
					},
					children: k
				}, k)) }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: preview.rows.slice(0, 100).map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
					style: {
						borderTop: "1px solid var(--border-color)",
						fontSize: 12
					},
					children: Object.values(r).map((v, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						style: { padding: "6px 10px" },
						children: v
					}, j))
				}, i)) })] })
			})
		})]
	});
}
var field = {
	display: "block",
	width: "100%",
	padding: "10px 12px",
	border: "1px solid var(--input-border)",
	borderRadius: 8,
	background: "var(--input-bg)",
	color: "var(--input-text)",
	fontSize: 13
};
var label = {
	display: "block",
	fontSize: 12,
	fontWeight: 500,
	color: "var(--text-secondary)",
	marginBottom: 6
};
function Settings$1() {
	const [profile, setProfile] = useLocalStorage("host.company_profile", hostProfile);
	const [learners] = useLocalStorage("host.learners", seedLearners);
	const [draft, setDraft] = (0, import_react.useState)(profile);
	const [saved, setSaved] = (0, import_react.useState)(false);
	const [err, setErr] = (0, import_react.useState)("");
	const placed = learners.length;
	const set = (k) => (e) => setDraft({
		...draft,
		[k]: e.target.value
	});
	const submit = (e) => {
		e.preventDefault();
		setErr("");
		const capacity = Number(draft.learner_capacity) || 0;
		if (capacity < placed) {
			setErr(`Learner capacity cannot be less than the current number of placed learners (${placed}). Please enter ${placed} or more.`);
			return;
		}
		const next = {
			...draft,
			learner_capacity: capacity,
			current_placements: placed
		};
		setProfile(next);
		setDraft(next);
		setSaved(true);
		setTimeout(() => setSaved(false), 2200);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardLayout, {
		title: "Host Settings",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "card",
			style: { maxWidth: 820 },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					style: {
						margin: "0 0 4px",
						fontSize: 16
					},
					children: "Company Profile"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						margin: "0 0 18px",
						fontSize: 12,
						color: "var(--text-muted)"
					},
					children: "These settings are stored in your browser and used across the whole app."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
						gap: 14
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: label,
							children: "Company Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							style: field,
							value: draft.company_name || "",
							onChange: set("company_name")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: label,
							children: "Industry"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							style: field,
							value: draft.industry || "",
							onChange: set("industry")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: label,
							children: "Contact Person"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							style: field,
							value: draft.contact_person || "",
							onChange: set("contact_person")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: label,
							children: "Email"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							style: field,
							value: draft.email || "",
							onChange: set("email")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: label,
							children: "Phone"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							style: field,
							value: draft.phone || "",
							onChange: set("phone")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: label,
							children: "B-BBEE Level"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							style: field,
							value: draft.bbbee_level || "",
							onChange: set("bbbee_level")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: label,
								children: "Physical Address"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								style: field,
								value: draft.address || "",
								onChange: set("address")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: label,
								children: "Learner Capacity"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								style: field,
								type: "number",
								min: placed,
								value: draft.learner_capacity || 0,
								onChange: set("learner_capacity")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: 11,
									color: "var(--text-muted)",
									marginTop: 4
								},
								children: [
									"Minimum ",
									placed,
									" (current placements)."
								]
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: label,
								children: "Current Placements"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								style: {
									...field,
									opacity: .7,
									cursor: "not-allowed"
								},
								type: "number",
								value: placed,
								readOnly: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 11,
									color: "var(--text-muted)",
									marginTop: 4
								},
								children: "Auto-pulled from Placed Learners."
							})
						] })
					]
				}),
				err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						marginTop: 14,
						padding: "10px 12px",
						borderLeft: "4px solid var(--danger)",
						background: "var(--danger-soft, #fee2e2)",
						color: "var(--danger)",
						fontSize: 13,
						borderRadius: 6
					},
					children: err
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						marginTop: 22,
						display: "flex",
						gap: 10,
						alignItems: "center"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "btn btn-primary",
							children: "Save changes"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn btn-ghost",
							onClick: () => setDraft(profile),
							children: "Reset"
						}),
						saved && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								color: "var(--success)",
								fontSize: 13
							},
							children: "✓ Settings saved locally"
						})
					]
				})
			]
		})
	});
}
function CompanyProfile() {
	const [profile, setProfile] = useLocalStorage("host.company_profile", hostProfile);
	const [learners] = useLocalStorage("host.learners", seedLearners);
	const [tab, setTab] = (0, import_react.useState)("overview");
	const [draft, setDraft] = (0, import_react.useState)(profile);
	const [savedFlash, setSavedFlash] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setProfile((p) => {
			const patch = {};
			if (!Array.isArray(p.departments) || p.departments.length === 0) patch.departments = hostProfile.departments;
			if (!Array.isArray(p.programs) || p.programs.length === 0) patch.programs = hostProfile.programs;
			return Object.keys(patch).length ? {
				...p,
				...patch
			} : p;
		});
	}, []);
	(0, import_react.useEffect)(() => {
		setDraft(profile);
	}, [
		profile.company_name,
		profile.contact_person,
		profile.email,
		profile.phone,
		profile.industry
	]);
	const setDraftField = (k) => (e) => setDraft((p) => ({
		...p,
		[k]: e.target.type === "checkbox" ? e.target.checked : e.target.value
	}));
	const saveProfile = () => {
		setProfile(draft);
		setSavedFlash(true);
		toast.success("Profile Saved", { description: "Company details updated successfully." });
		setTimeout(() => setSavedFlash(false), 2400);
	};
	const set = (k) => (e) => {
		setProfile((p) => ({
			...p,
			[k]: e.target.type === "checkbox" ? e.target.checked : e.target.value
		}));
		setDraft((p) => ({
			...p,
			[k]: e.target.type === "checkbox" ? e.target.checked : e.target.value
		}));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "My Company Profile",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				style: {
					marginBottom: 16,
					background: "var(--bg-primary)"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						gap: 12,
						flexWrap: "wrap"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 22,
								fontWeight: 800
							},
							children: profile.company_name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								fontSize: 13,
								color: "var(--text-secondary)"
							},
							children: [
								profile.industry,
								" · ",
								profile.address
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								marginTop: 8,
								display: "flex",
								gap: 6
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "badge badge-info",
									children: ["BBBEE ", profile.bbbee_level]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "badge badge-success",
									children: profile.approval_status
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "badge badge-purple",
									children: ["Reg ", profile.registration_number]
								})
							]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						style: {
							display: "flex",
							gap: 8,
							alignItems: "center",
							fontSize: 13,
							background: "var(--bg-primary)",
							padding: "10px 14px",
							borderRadius: 999,
							border: "1px solid var(--border-color)"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: profile.open_to_host,
								onChange: set("open_to_host")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: { fontWeight: 700 },
								children: "Open to Host new learners"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "badge " + (profile.open_to_host ? "badge-success" : "badge-danger"),
								children: profile.open_to_host ? "On" : "Off"
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				style: {
					marginBottom: 16,
					display: "flex",
					gap: 8,
					flexWrap: "wrap"
				},
				children: [
					"overview",
					"contacts",
					"programs",
					"learners",
					"automation"
				].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn " + (tab === t ? "btn-primary" : "btn-ghost"),
					onClick: () => setTab(t),
					children: t[0].toUpperCase() + t.slice(1)
				}, t))
			}),
			tab === "overview" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "2fr 1fr",
					gap: 16
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							style: {
								margin: "0 0 10px",
								fontSize: 15
							},
							children: "Company bio"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							rows: 5,
							value: draft.company_bio || "",
							onChange: setDraftField("company_bio"),
							style: {
								width: "100%",
								padding: 12,
								border: "1px solid var(--input-border)",
								borderRadius: 8,
								background: "var(--input-bg)",
								color: "var(--input-text)",
								fontSize: 13
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
								gap: 12,
								marginTop: 14
							},
							children: [
								["Address", "address"],
								["Industry", "industry"],
								["Sector", "sector"],
								["Website", "website"],
								["Company size", "employees"],
								["Years operating", "years_operating"],
								["Footprint", "footprint"]
							].map(([label, k]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 11,
									color: "var(--text-muted)",
									marginBottom: 4
								},
								children: label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: draft[k] || "",
								onChange: setDraftField(k),
								style: {
									width: "100%",
									padding: "8px 10px",
									border: "1px solid var(--input-border)",
									borderRadius: 8,
									background: "var(--input-bg)",
									color: "var(--input-text)",
									fontSize: 13
								}
							})] }, k))
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						style: {
							margin: "0 0 10px",
							fontSize: 15
						},
						children: "Learner capacity"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gap: 10
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 11,
									color: "var(--text-muted)"
								},
								children: "Learners needed this intake"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								value: draft.learners_requested || 0,
								onChange: setDraftField("learners_requested"),
								style: {
									width: 120,
									padding: "8px 10px",
									border: "1px solid var(--input-border)",
									borderRadius: 8,
									background: "var(--input-bg)",
									color: "var(--input-text)"
								}
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 11,
									color: "var(--text-muted)"
								},
								children: "Departments"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									display: "flex",
									gap: 6,
									flexWrap: "wrap",
									marginTop: 4
								},
								children: profile.departments.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "chip",
									children: d
								}, d))
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 11,
									color: "var(--text-muted)"
								},
								children: "Currently placed"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: 22,
									fontWeight: 800
								},
								children: [
									learners.length,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											fontSize: 12,
											color: "var(--text-muted)",
											fontWeight: 500
										},
										children: ["of ", profile.learner_capacity]
									})
								]
							})] })
						]
					})]
				})]
			}),
			(tab === "overview" || tab === "contacts") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card",
				style: {
					marginTop: 16,
					display: "flex",
					justifyContent: "flex-end",
					alignItems: "center",
					gap: 12
				},
				children: [
					savedFlash && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							color: "var(--success)",
							fontSize: 13
						},
						children: "✓ Changes saved"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-ghost",
						onClick: () => setDraft(profile),
						children: "Discard"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-primary",
						onClick: saveProfile,
						children: "Save changes"
					})
				]
			}),
			tab === "contacts" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					style: {
						margin: "0 0 10px",
						fontSize: 15
					},
					children: "Manager details"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
						gap: 12
					},
					children: [
						["Full name", "contact_person"],
						["Title", "contact_title"],
						["Email", "email"],
						["Alt email", "alt_email"],
						["Phone", "phone"]
					].map(([label, k]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 11,
							color: "var(--text-muted)",
							marginBottom: 4
						},
						children: label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: draft[k] || "",
						onChange: setDraftField(k),
						style: {
							width: "100%",
							padding: "8px 10px",
							border: "1px solid var(--input-border)",
							borderRadius: 8,
							background: "var(--input-bg)",
							color: "var(--input-text)",
							fontSize: 13
						}
					})] }, k))
				})]
			}),
			tab === "programs" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgramsAndDepartments, {
				profile,
				setProfile
			}),
			tab === "learners" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					style: {
						margin: "0 0 10px",
						fontSize: 15
					},
					children: "Learners in your workspace"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						textAlign: "left",
						fontSize: 11,
						color: "var(--text-muted)",
						textTransform: "uppercase"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							style: { padding: "8px 0" },
							children: "Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Program" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Education" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Experience" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: learners.slice(0, 10).map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						borderTop: "1px solid var(--border-color)",
						fontSize: 13
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: {
								padding: "10px 0",
								fontWeight: 600
							},
							children: l.full_name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: l.program }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: { color: "var(--text-secondary)" },
							children: (l.qualifications || [])[0] || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: { color: "var(--text-secondary)" },
							children: l.experience || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							className: "btn btn-ghost",
							to: "/host/learners",
							children: "View"
						}) })
					]
				}, l.id)) })] })]
			}),
			tab === "automation" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gap: 12
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontWeight: 700,
									fontSize: 14
								},
								children: "Quarterly manager reports"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 12,
									color: "var(--text-secondary)"
								},
								children: "Managers will be prompted to submit a report every quarter."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "badge badge-success",
								children: "Auto-prompt enabled"
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontWeight: 700,
									fontSize: 14
								},
								children: "Weekly timesheet approvals"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 12,
									color: "var(--text-secondary)"
								},
								children: "Every Friday managers must confirm timesheet accuracy for each learner (Approve / Not Approved)."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "badge badge-success",
								children: "Auto-prompt enabled"
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontWeight: 700,
									fontSize: 14
								},
								children: "Task monitoring"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 12,
									color: "var(--text-secondary)"
								},
								children: "Live dashboard tracks task progress across all assigned learners."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								className: "btn btn-ghost",
								to: "/host/tasks",
								children: "Open Tasks →"
							})]
						})
					})
				]
			})
		]
	});
}
function ProgramsAndDepartments({ profile, setProfile }) {
	const departments = Array.isArray(profile.departments) ? profile.departments : [];
	const programs = Array.isArray(profile.programs) ? profile.programs : [];
	const [newDept, setNewDept] = (0, import_react.useState)("");
	const [newProg, setNewProg] = (0, import_react.useState)("");
	const confirm = useConfirm();
	const prompt = usePrompt();
	const addDept = () => {
		const v = newDept.trim();
		if (!v) return;
		if (departments.includes(v)) {
			toast.error("Duplicate Department", { description: `"${v}" already exists.` });
			return;
		}
		setProfile((p) => ({
			...p,
			departments: [...p.departments || [], v]
		}));
		toast.success("Department Added", { description: `"${v}" was added.` });
		setNewDept("");
	};
	const removeDept = async (d) => {
		if (!await confirm({
			title: "Remove Department",
			description: `Are you sure you want to remove department "${d}"?`,
			variant: "destructive",
			confirmText: "Remove Department"
		})) return;
		setProfile((p) => ({
			...p,
			departments: (p.departments || []).filter((x) => x !== d)
		}));
		toast.success("Department Removed", { description: `"${d}" was removed.` });
	};
	const editDept = async (d) => {
		const v = await prompt({
			title: "Rename Department",
			description: `Enter the new name for "${d}":`,
			defaultValue: d,
			placeholder: "Department name...",
			required: true
		});
		if (!v || !v.trim() || v === d) return;
		const nv = v.trim();
		if (departments.includes(nv)) {
			toast.error("Duplicate Department", { description: `"${nv}" already exists.` });
			return;
		}
		setProfile((p) => ({
			...p,
			departments: (p.departments || []).map((x) => x === d ? nv : x)
		}));
		toast.success("Department Renamed", { description: `Renamed to "${nv}".` });
	};
	const addProg = () => {
		const v = newProg.trim();
		if (!v) return;
		if (programs.includes(v)) {
			toast.error("Duplicate Program", { description: `"${v}" already exists.` });
			return;
		}
		setProfile((p) => ({
			...p,
			programs: [...p.programs || [], v]
		}));
		toast.success("Program Added", { description: `"${v}" was added.` });
		setNewProg("");
	};
	const removeProg = async (pr) => {
		if (!await confirm({
			title: "Remove Program",
			description: `Are you sure you want to remove program "${pr}"?`,
			variant: "destructive",
			confirmText: "Remove Program"
		})) return;
		setProfile((p) => ({
			...p,
			programs: (p.programs || []).filter((x) => x !== pr)
		}));
		toast.success("Program Removed", { description: `"${pr}" was removed.` });
	};
	const editProg = async (pr) => {
		const v = await prompt({
			title: "Rename Program",
			description: `Enter the new name for "${pr}":`,
			defaultValue: pr,
			placeholder: "Program name...",
			required: true
		});
		if (!v || !v.trim() || v === pr) return;
		const nv = v.trim();
		if (programs.includes(nv)) {
			toast.error("Duplicate Program", { description: `"${nv}" already exists.` });
			return;
		}
		setProfile((p) => ({
			...p,
			programs: (p.programs || []).map((x) => x === pr ? nv : x)
		}));
		toast.success("Program Renamed", { description: `Renamed to "${nv}".` });
	};
	const inputStyle = {
		flex: 1,
		padding: "8px 10px",
		border: "1px solid var(--input-border)",
		borderRadius: 8,
		background: "var(--input-bg)",
		color: "var(--input-text)",
		fontSize: 13
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
			gap: 16
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					style: {
						margin: "0 0 4px",
						fontSize: 15
					},
					children: "Departments"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						fontSize: 12,
						color: "var(--text-muted)",
						marginBottom: 12
					},
					children: "Company departments hosting learners."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						gap: 8,
						marginBottom: 12
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						placeholder: "e.g. Marketing",
						value: newDept,
						onChange: (e) => setNewDept(e.target.value),
						onKeyDown: (e) => e.key === "Enter" && (e.preventDefault(), addDept()),
						style: inputStyle
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-primary",
						onClick: addDept,
						children: "+ Add"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						flexWrap: "wrap",
						gap: 8
					},
					children: [departments.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 13,
							color: "var(--text-muted)"
						},
						children: "No departments yet."
					}), departments.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "chip",
						style: {
							display: "inline-flex",
							alignItems: "center",
							gap: 6
						},
						children: [
							d,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => editDept(d),
								title: "Rename",
								style: {
									background: "transparent",
									border: "none",
									cursor: "pointer",
									color: "var(--brand)",
									fontSize: 12,
									padding: 0
								},
								children: "✎"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => removeDept(d),
								title: "Remove",
								style: {
									background: "transparent",
									border: "none",
									cursor: "pointer",
									color: "var(--danger)",
									fontWeight: 700,
									padding: 0
								},
								children: "×"
							})
						]
					}, d))]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					style: {
						margin: "0 0 4px",
						fontSize: 15
					},
					children: "Programs offered"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						fontSize: 12,
						color: "var(--text-muted)",
						marginBottom: 12
					},
					children: "Only these programs will be available when onboarding a learner."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						gap: 8,
						marginBottom: 12
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						placeholder: "e.g. Robotics NQF5",
						value: newProg,
						onChange: (e) => setNewProg(e.target.value),
						onKeyDown: (e) => e.key === "Enter" && (e.preventDefault(), addProg()),
						style: inputStyle
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-primary",
						onClick: addProg,
						children: "+ Add"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gap: 6
					},
					children: [programs.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 13,
							color: "var(--text-muted)"
						},
						children: "No programs yet."
					}), programs.map((pr) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							padding: "8px 12px",
							border: "1px solid var(--border-color)",
							borderRadius: 8,
							background: "var(--bg-secondary)",
							fontSize: 13
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: pr }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: 4
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => editProg(pr),
								className: "btn btn-ghost",
								style: { color: "var(--brand)" },
								children: "Edit"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => removeProg(pr),
								className: "btn btn-ghost",
								style: { color: "var(--danger)" },
								children: "Remove"
							})]
						})]
					}, pr))]
				})
			]
		})]
	});
}
var empty$2 = {
	host_full_name: "",
	contact_number: "",
	contact_email: "",
	alt_email: "",
	contact_title: "",
	company_name: "",
	registration_number: "",
	business_address: "",
	company_overview: "",
	sector: "",
	years_operating: 1,
	footprint: "",
	employees: 0,
	learners_current: 0,
	learners_previous: 0,
	last_intake: "",
	website: "",
	learners_needed: 0,
	roles_needed: "",
	accommodate_disability: false,
	disability_types: "",
	virtual_site_visit: false,
	proximity_transport: ""
};
var labelStyle = {
	fontSize: 11,
	color: "var(--text-muted)",
	marginBottom: 4,
	display: "block",
	textTransform: "uppercase",
	letterSpacing: ".05em"
};
var inputStyle = {
	width: "100%",
	padding: "10px 12px",
	border: "1px solid var(--input-border)",
	borderRadius: 8,
	background: "var(--input-bg)",
	color: "var(--input-text)",
	fontSize: 13
};
function Field({ label, k, form, set, type = "text", full }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: { gridColumn: full ? "1 / -1" : "auto" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			style: labelStyle,
			children: label
		}), type === "textarea" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
			rows: 3,
			style: inputStyle,
			value: form[k],
			onChange: set(k)
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type,
			style: inputStyle,
			value: form[k],
			onChange: set(k)
		})]
	});
}
function HostCheck() {
	const [form, setForm] = useLocalStorage("host.host_check", empty$2);
	const [saved, setSaved] = (0, import_react.useState)(false);
	const set = (k) => (e) => setForm((f) => ({
		...f,
		[k]: e.target.type === "checkbox" ? e.target.checked : e.target.type === "number" ? Number(e.target.value) : e.target.value
	}));
	const submit = (e) => {
		e.preventDefault();
		setSaved(true);
		setTimeout(() => setSaved(false), 3e3);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "Host Employer Check",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card",
			style: {
				marginBottom: 16,
				background: "var(--brand-soft)",
				border: "1px solid var(--brand)"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					fontSize: 14,
					fontWeight: 700
				},
				children: "Host intake & vetting form"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					fontSize: 12,
					color: "var(--text-secondary)",
					marginTop: 4
				},
				children: "Complete this once per intake cycle. Your responses inform learner matching, site visits, and reporting."
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "card",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						fontSize: 12,
						fontWeight: 700,
						color: "var(--text-muted)",
						textTransform: "uppercase",
						letterSpacing: ".05em",
						marginBottom: 12
					},
					children: "Contact person"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
						gap: 12
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Host full name",
							k: "host_full_name",
							form,
							set
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Title / position",
							k: "contact_title",
							form,
							set
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Contact number",
							k: "contact_number",
							form,
							set
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Contact email",
							k: "contact_email",
							form,
							set,
							type: "email"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Alternative email",
							k: "alt_email",
							form,
							set,
							type: "email"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						fontSize: 12,
						fontWeight: 700,
						color: "var(--text-muted)",
						textTransform: "uppercase",
						letterSpacing: ".05em",
						margin: "22px 0 12px"
					},
					children: "Company details"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
						gap: 12
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Company name",
							k: "company_name",
							form,
							set
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Registration number",
							k: "registration_number",
							form,
							set
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Business address",
							k: "business_address",
							form,
							set,
							full: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Company overview",
							k: "company_overview",
							form,
							set,
							type: "textarea",
							full: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Sector / industry",
							k: "sector",
							form,
							set
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Years of operation",
							k: "years_operating",
							form,
							set,
							type: "number"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Footprint (provinces / regions)",
							k: "footprint",
							form,
							set
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Website / portfolio link",
							k: "website",
							form,
							set
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Number of employees",
							k: "employees",
							form,
							set,
							type: "number"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						fontSize: 12,
						fontWeight: 700,
						color: "var(--text-muted)",
						textTransform: "uppercase",
						letterSpacing: ".05em",
						margin: "22px 0 12px"
					},
					children: "Learner hosting"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
						gap: 12
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Learners currently hosting",
							k: "learners_current",
							form,
							set,
							type: "number"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Learners previously hosted",
							k: "learners_previous",
							form,
							set,
							type: "number"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Date of last intake",
							k: "last_intake",
							form,
							set,
							type: "date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Number of learners requested / needed",
							k: "learners_needed",
							form,
							set,
							type: "number"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Specific roles to be filled",
							k: "roles_needed",
							form,
							set,
							type: "textarea",
							full: true
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						fontSize: 12,
						fontWeight: 700,
						color: "var(--text-muted)",
						textTransform: "uppercase",
						letterSpacing: ".05em",
						margin: "22px 0 12px"
					},
					children: "Inclusion & logistics"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
						gap: 12
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							style: {
								display: "flex",
								gap: 8,
								alignItems: "center",
								fontSize: 13,
								marginTop: 20
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: form.accommodate_disability,
								onChange: set("accommodate_disability")
							}), "Can accommodate a person living with a disability"]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Which disabilities can you support?",
							k: "disability_types",
							form,
							set
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							style: {
								display: "flex",
								gap: 8,
								alignItems: "center",
								fontSize: 13,
								marginTop: 20
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: form.virtual_site_visit,
								onChange: set("virtual_site_visit")
							}), "Willing to accept a virtual site visit"]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Proximity to public transport",
							k: "proximity_transport",
							form,
							set
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "flex-end",
						gap: 8,
						marginTop: 22
					},
					children: [saved && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "badge badge-success",
						style: { alignSelf: "center" },
						children: "✓ Saved"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "btn btn-primary",
						children: "Save intake form"
					})]
				})
			]
		})]
	});
}
var CRITERIA = [
	{
		key: "skills",
		label: "Skills Matching",
		icon: "🧠"
	},
	{
		key: "qualification",
		label: "Qualification Matching",
		icon: "◆"
	},
	{
		key: "geo",
		label: "Geographic Matching",
		icon: "📍"
	},
	{
		key: "disability",
		label: "Disability Inclusion",
		icon: "♿"
	},
	{
		key: "industry",
		label: "Industry Matching",
		icon: "🏭"
	}
];
function Marketplace() {
	const [available] = useLocalStorage("host.hr.available_learners", seedAvailableLearners);
	const [shortlist, setShortlist] = useLocalStorage("host.hr.shortlist", []);
	const [enabled, setEnabled] = useLocalStorage("host.marketplace.criteria", {
		skills: true,
		qualification: true,
		geo: true,
		disability: true,
		industry: true
	});
	const [q, setQ] = (0, import_react.useState)("");
	const [viewing, setViewing] = (0, import_react.useState)(null);
	const { push } = useNotifications();
	const scored = (0, import_react.useMemo)(() => {
		return available.map((l) => {
			let base = l.match_score;
			const off = Object.entries(enabled).filter(([, v]) => !v).length;
			const adj = Math.max(50, base - off * 6);
			return {
				...l,
				adjusted: adj
			};
		}).filter((l) => l.full_name.toLowerCase().includes(q.toLowerCase()) || l.program.toLowerCase().includes(q.toLowerCase()) || l.skills.some((s) => s.toLowerCase().includes(q.toLowerCase()))).sort((a, b) => b.adjusted - a.adjusted);
	}, [
		available,
		enabled,
		q
	]);
	const toggleShortlist = (id, name) => {
		const isAdding = !shortlist.includes(id);
		setShortlist((prev) => isAdding ? [...prev, id] : prev.filter((x) => x !== id));
		if (isAdding) {
			push({
				title: "Learner shortlisted",
				body: `${name} was added to your shortlist.`,
				link: "/host/marketplace",
				kind: "recruit"
			});
			toast.success("Added to Shortlist", { description: `${name} was added to candidate shortlist.` });
		} else toast.info("Removed from Shortlist", { description: `${name} was removed from candidate shortlist.` });
	};
	const requestPlacement = (l) => {
		push({
			title: "Placement request sent",
			body: `${l.full_name}'s provider has been notified of your interest.`,
			link: "/host/marketplace",
			kind: "recruit"
		});
		toast.success("Placement Request Sent", { description: `Placement request submitted for ${l.full_name}. Provider notified.` });
	};
	const scoreColor = (s) => s >= 90 ? "var(--success)" : s >= 75 ? "var(--warning)" : "var(--text-muted)";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "Learner Marketplace",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card",
				style: {
					marginBottom: 16,
					background: "var(--bg-primary)"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						gap: 12,
						alignItems: "center",
						flexWrap: "wrap"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: { fontSize: 34 },
						children: "🤖"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							flex: 1,
							minWidth: 240
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 16,
								fontWeight: 800
							},
							children: "Advanced AI Matching Engine"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 12,
								color: "var(--text-secondary)"
							},
							children: "Toggle criteria to re-score every available learner against your host profile."
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						gap: 8,
						flexWrap: "wrap",
						marginTop: 14
					},
					children: CRITERIA.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setEnabled((en) => ({
							...en,
							[c.key]: !en[c.key]
						})),
						style: {
							padding: "8px 12px",
							borderRadius: 999,
							fontSize: 12,
							fontWeight: 600,
							background: enabled[c.key] ? "var(--brand)" : "var(--bg-primary)",
							color: enabled[c.key] ? "white" : "var(--text-secondary)",
							border: "1px solid " + (enabled[c.key] ? "var(--brand)" : "var(--border-color)"),
							cursor: "pointer"
						},
						children: [
							c.icon,
							" ",
							c.label,
							" ",
							enabled[c.key] ? "✓" : ""
						]
					}, c.key))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				style: { marginBottom: 16 },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: q,
					onChange: (e) => setQ(e.target.value),
					placeholder: "Search by name, program, or skill…",
					style: {
						width: "100%",
						padding: "10px 12px",
						border: "1px solid var(--input-border)",
						borderRadius: 8,
						background: "var(--input-bg)",
						color: "var(--input-text)"
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
					gap: 14
				},
				children: scored.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					style: { borderTop: `3px solid ${scoreColor(l.adjusted)}` },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-start",
								gap: 8
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 15,
									fontWeight: 700
								},
								children: l.full_name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 11,
									color: "var(--text-muted)"
								},
								children: l.program
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: { textAlign: "right" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										fontSize: 22,
										fontWeight: 800,
										color: scoreColor(l.adjusted)
									},
									children: [l.adjusted, "%"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: 10,
										color: "var(--text-muted)"
									},
									children: "match"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 12,
								color: "var(--text-secondary)",
								marginTop: 8
							},
							children: l.bio
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								marginTop: 10,
								display: "flex",
								gap: 6,
								flexWrap: "wrap"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "chip",
									children: ["📍 ", l.location]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "chip",
									children: ["Availability: ", l.availability]
								}),
								l.disability && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "chip",
									style: {
										color: "var(--purple)",
										borderColor: "var(--purple)"
									},
									children: ["♿ ", l.disability]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								marginTop: 8,
								display: "flex",
								gap: 4,
								flexWrap: "wrap"
							},
							children: l.skills.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "badge badge-info",
								children: s
							}, s))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								marginTop: 12,
								display: "flex",
								gap: 6
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-primary",
									onClick: () => setViewing(l),
									children: "View match"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-ghost",
									onClick: () => toggleShortlist(l.id, l.full_name),
									children: shortlist.includes(l.id) ? "★ Shortlisted" : "☆ Shortlist"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-ghost",
									style: { marginLeft: "auto" },
									onClick: () => requestPlacement(l),
									children: "Request →"
								})
							]
						})
					]
				}, l.id))
			}),
			viewing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
				open: true,
				onClose: () => setViewing(null),
				title: viewing.full_name,
				subtitle: `Match score: ${viewing.adjusted}% · ${viewing.program}`,
				width: 640,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => setViewing(null),
					children: "Close"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					onClick: () => {
						requestPlacement(viewing);
						setViewing(null);
					},
					children: "Request placement"
				})] }),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 13,
							color: "var(--text-secondary)",
							marginBottom: 14
						},
						children: viewing.bio
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: 10,
							fontSize: 12,
							marginBottom: 14
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Provider:" }),
								" ",
								viewing.provider
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Location:" }),
								" ",
								viewing.location
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Availability:" }),
								" ",
								viewing.availability
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Experience:" }),
								" ",
								viewing.years_experience,
								" yr(s)"
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Industry:" }),
								" ",
								viewing.industry
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Disability:" }),
								" ",
								viewing.disability || "—"
							] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							fontSize: 12,
							fontWeight: 700,
							marginBottom: 6
						},
						children: [
							"Why the AI matched this learner to ",
							"Mavis Strategic Partners",
							":"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						style: {
							margin: 0,
							paddingLeft: 18,
							fontSize: 12,
							color: "var(--text-secondary)"
						},
						children: viewing.match_reasons.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: r }, i))
					})
				]
			})
		]
	});
}
function HostRecruitment() {
	const [available] = useLocalStorage("host.hr.available_learners", seedAvailableLearners);
	const [shortlist, setShortlist] = useLocalStorage("host.hr.shortlist", []);
	const [interviews, setInterviews] = useLocalStorage("host.hr.interviews", [{
		id: "INT-1",
		learner_id: "AL-2",
		learner: "Ayanda Pillay",
		date: "2026-07-05",
		time: "10:00",
		mode: "MS Teams",
		status: "Scheduled"
	}]);
	const [decisions, setDecisions] = useLocalStorage("host.hr.decisions", {});
	const [scheduling, setScheduling] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)({
		date: "",
		time: "10:00",
		mode: "MS Teams"
	});
	const { push } = useNotifications();
	const recommended = available.filter((a) => a.match_score >= 80);
	const shortlisted = available.filter((l) => shortlist.includes(l.id));
	const decide = (id, decision, name) => {
		setDecisions((d) => ({
			...d,
			[id]: decision
		}));
		push({
			title: `Learner ${decision.toLowerCase()}`,
			body: `${name} was ${decision.toLowerCase()}.`,
			link: "/host/recruitment",
			kind: "recruit"
		});
	};
	const submitInterview = () => {
		setInterviews((prev) => [{
			id: uid("INT"),
			learner_id: scheduling.id,
			learner: scheduling.full_name,
			...form,
			status: "Scheduled"
		}, ...prev]);
		push({
			title: "Interview scheduled",
			body: `${scheduling.full_name} — ${form.date} @ ${form.time} (${form.mode})`,
			link: "/host/recruitment",
			kind: "recruit"
		});
		setScheduling(null);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "Recruitment",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
					gap: 16,
					marginBottom: 18
				},
				children: [
					{
						label: "Recommended (AI)",
						value: recommended.length,
						color: "var(--brand)"
					},
					{
						label: "Shortlisted",
						value: shortlisted.length,
						color: "var(--warning)"
					},
					{
						label: "Interviews",
						value: interviews.length,
						color: "var(--purple)"
					},
					{
						label: "Accepted",
						value: Object.values(decisions).filter((d) => d === "Accepted").length,
						color: "var(--success)"
					}
				].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 12,
							color: "var(--text-muted)"
						},
						children: s.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 28,
							fontWeight: 700,
							color: s.color
						},
						children: s.value
					})]
				}, s.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card",
				style: { marginBottom: 16 },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					style: {
						margin: "0 0 12px",
						fontSize: 15
					},
					children: "🤖 Recommended learners"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
						gap: 14
					},
					children: recommended.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card",
						style: {
							padding: 14,
							background: "var(--bg-secondary)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-start"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: { fontWeight: 700 },
								children: l.full_name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 11,
									color: "var(--text-muted)"
								},
								children: l.program
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "badge badge-success",
								children: [l.match_score, "%"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								marginTop: 10,
								display: "flex",
								gap: 4,
								flexWrap: "wrap"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-ghost",
								onClick: () => setShortlist((prev) => prev.includes(l.id) ? prev.filter((x) => x !== l.id) : [...prev, l.id]),
								children: shortlist.includes(l.id) ? "★ Shortlisted" : "☆ Shortlist"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-ghost",
								onClick: () => {
									setScheduling(l);
									setForm({
										date: "",
										time: "10:00",
										mode: "MS Teams"
									});
								},
								children: "📅 Interview"
							})]
						})]
					}, l.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card",
				style: { marginBottom: 16 },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					style: {
						margin: "0 0 12px",
						fontSize: 15
					},
					children: "Shortlisted candidates"
				}), shortlisted.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						color: "var(--text-muted)",
						fontSize: 13
					},
					children: "Shortlist recommended learners to see them here."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						textAlign: "left",
						fontSize: 11,
						color: "var(--text-muted)",
						textTransform: "uppercase"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							style: { padding: "8px 0" },
							children: "Learner"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Program" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Match" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Decision" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: shortlisted.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						borderTop: "1px solid var(--border-color)",
						fontSize: 13
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: {
								padding: "10px 0",
								fontWeight: 600
							},
							children: l.full_name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: l.program }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [l.match_score, "%"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: decisions[l.id] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "badge " + (decisions[l.id] === "Accepted" ? "badge-success" : "badge-danger"),
							children: decisions[l.id]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "badge badge-warning",
							children: "Pending"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							style: { whiteSpace: "nowrap" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-success",
								onClick: () => decide(l.id, "Accepted", l.full_name),
								children: "✓ Accept"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-ghost",
								style: { color: "var(--danger)" },
								onClick: () => decide(l.id, "Rejected", l.full_name),
								children: "✕ Reject"
							})]
						})
					]
				}, l.id)) })] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					style: {
						margin: "0 0 12px",
						fontSize: 15
					},
					children: "Scheduled interviews"
				}), interviews.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						color: "var(--text-muted)",
						fontSize: 13
					},
					children: "No interviews scheduled yet."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						textAlign: "left",
						fontSize: 11,
						color: "var(--text-muted)",
						textTransform: "uppercase"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							style: { padding: "8px 0" },
							children: "Learner"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Date" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Time" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Mode" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: interviews.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						borderTop: "1px solid var(--border-color)",
						fontSize: 13
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: {
								padding: "10px 0",
								fontWeight: 500
							},
							children: i.learner
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: i.date }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: i.time }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: i.mode }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "badge badge-info",
							children: i.status
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn btn-ghost",
							style: { color: "var(--danger)" },
							onClick: () => setInterviews((prev) => prev.filter((x) => x.id !== i.id)),
							children: "Cancel"
						}) })
					]
				}, i.id)) })] })]
			}),
			scheduling && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: true,
				onClose: () => setScheduling(null),
				title: `Schedule interview — ${scheduling.full_name}`,
				width: 480,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => setScheduling(null),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					onClick: submitInterview,
					disabled: !form.date,
					children: "Schedule"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gap: 12
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 11,
								color: "var(--text-muted)"
							},
							children: "Date"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							value: form.date,
							onChange: (e) => setForm({
								...form,
								date: e.target.value
							}),
							style: {
								width: "100%",
								padding: "8px 10px",
								borderRadius: 8,
								border: "1px solid var(--input-border)",
								background: "var(--input-bg)",
								color: "var(--input-text)"
							}
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 11,
								color: "var(--text-muted)"
							},
							children: "Time"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "time",
							value: form.time,
							onChange: (e) => setForm({
								...form,
								time: e.target.value
							}),
							style: {
								width: "100%",
								padding: "8px 10px",
								borderRadius: 8,
								border: "1px solid var(--input-border)",
								background: "var(--input-bg)",
								color: "var(--input-text)"
							}
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 11,
								color: "var(--text-muted)"
							},
							children: "Mode"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: form.mode,
							onChange: (e) => setForm({
								...form,
								mode: e.target.value
							}),
							style: {
								width: "100%",
								padding: "8px 10px",
								borderRadius: 8,
								border: "1px solid var(--input-border)",
								background: "var(--input-bg)",
								color: "var(--input-text)"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "MS Teams" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Google Meet" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "In person" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Phone" })
							]
						})] })
					]
				})
			})
		]
	});
}
function Workforce() {
	const [learners] = useLocalStorage("host.learners", seedLearners);
	const [incidents, setIncidents] = useLocalStorage("host.incidents", seedIncidents);
	const [coaching] = useLocalStorage("host.coaching", seedCoaching);
	const [tab, setTab] = (0, import_react.useState)("assigned");
	const [addingIncident, setAddingIncident] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)({
		learner: "",
		category: "Health & Safety",
		severity: "Low",
		description: ""
	});
	const submitIncident = () => {
		setIncidents((prev) => [{
			id: uid("IN"),
			date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			status: "Open",
			...form
		}, ...prev]);
		setAddingIncident(null);
		setForm({
			learner: "",
			category: "Health & Safety",
			severity: "Low",
			description: ""
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "Workforce Management",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				style: {
					marginBottom: 16,
					display: "flex",
					gap: 8,
					flexWrap: "wrap"
				},
				children: [
					["assigned", "Assigned Learners"],
					["attendance", "Attendance Monitor"],
					["performance", "Performance"],
					["incidents", "Incidents"],
					["coaching", "Coaching Notes"]
				].map(([k, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn " + (tab === k ? "btn-primary" : "btn-ghost"),
					onClick: () => setTab(k),
					children: l
				}, k))
			}),
			tab === "assigned" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						textAlign: "left",
						fontSize: 11,
						color: "var(--text-muted)",
						textTransform: "uppercase"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							style: { padding: "10px 0" },
							children: "Learner"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Program" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Mentor" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" })
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: learners.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						borderTop: "1px solid var(--border-color)",
						fontSize: 13
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: {
								padding: "10px 0",
								fontWeight: 600
							},
							children: l.full_name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: l.program }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: l.mentor }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "badge " + (l.status === "Active" ? "badge-success" : l.status === "At Risk" ? "badge-danger" : "badge-info"),
							children: l.status
						}) })
					]
				}, l.id)) })] })
			}),
			tab === "attendance" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						fontSize: 13,
						marginBottom: 10,
						color: "var(--text-secondary)"
					},
					children: "Attendance is now managed centrally in the HR portal."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					className: "btn btn-primary",
					to: "/hr/attendance",
					children: "Open Attendance Register →"
				})]
			}),
			tab === "performance" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						textAlign: "left",
						fontSize: 11,
						color: "var(--text-muted)",
						textTransform: "uppercase"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							style: { padding: "10px 0" },
							children: "Learner"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Attendance" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Score" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Progress" })
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: learners.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						borderTop: "1px solid var(--border-color)",
						fontSize: 13
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: {
								padding: "10px 0",
								fontWeight: 600
							},
							children: l.full_name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [l.attendance_rate, "%"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [l.performance_score, "/100"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: { width: 260 },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									height: 8,
									background: "var(--bg-secondary)",
									borderRadius: 999
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
									width: `${l.progress}%`,
									height: "100%",
									background: "var(--brand)",
									borderRadius: 999
								} })
							})
						})
					]
				}, l.id)) })] })
			}),
			tab === "incidents" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						justifyContent: "flex-end",
						marginBottom: 12
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-primary",
						onClick: () => setAddingIncident(true),
						children: "+ Log Incident"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						textAlign: "left",
						fontSize: 11,
						color: "var(--text-muted)",
						textTransform: "uppercase"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							style: { padding: "10px 0" },
							children: "Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Learner" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Category" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Severity" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Details" })
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: incidents.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						borderTop: "1px solid var(--border-color)",
						fontSize: 13
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: { padding: "10px 0" },
							children: i.date
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: { fontWeight: 500 },
							children: i.learner
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: i.category }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "badge " + (i.severity === "High" ? "badge-danger" : i.severity === "Medium" ? "badge-warning" : "badge-info"),
							children: i.severity
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "badge " + (i.status === "Resolved" ? "badge-success" : "badge-warning"),
							children: i.status
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: { color: "var(--text-secondary)" },
							children: i.description
						})
					]
				}, i.id)) })] })]
			}),
			tab === "coaching" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { marginBottom: 12 },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						className: "btn btn-primary",
						to: "/host/coaching",
						children: "Open full coaching notes →"
					})
				}), coaching.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						padding: "12px 0",
						borderTop: "1px solid var(--border-color)"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							fontSize: 13,
							fontWeight: 600
						},
						children: [
							c.learner_name,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									fontSize: 11,
									color: "var(--text-muted)",
									fontWeight: 400
								},
								children: [
									"· ",
									c.date,
									" · by ",
									c.mentor
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 12,
							color: "var(--text-secondary)",
							marginTop: 4
						},
						children: c.note
					})]
				}, c.id))]
			}),
			addingIncident && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: true,
				onClose: () => setAddingIncident(null),
				title: "Log incident",
				width: 520,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => setAddingIncident(null),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					onClick: submitIncident,
					disabled: !form.learner || !form.description,
					children: "Save"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gap: 12
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: form.learner,
							onChange: (e) => setForm({
								...form,
								learner: e.target.value
							}),
							style: {
								padding: 10,
								border: "1px solid var(--input-border)",
								borderRadius: 8,
								background: "var(--input-bg)",
								color: "var(--input-text)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "— pick learner —"
							}), learners.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: l.full_name }, l.id))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: form.category,
							onChange: (e) => setForm({
								...form,
								category: e.target.value
							}),
							style: {
								padding: 10,
								border: "1px solid var(--input-border)",
								borderRadius: 8,
								background: "var(--input-bg)",
								color: "var(--input-text)"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Health & Safety" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Punctuality" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Conduct" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Equipment" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Other" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: form.severity,
							onChange: (e) => setForm({
								...form,
								severity: e.target.value
							}),
							style: {
								padding: 10,
								border: "1px solid var(--input-border)",
								borderRadius: 8,
								background: "var(--input-bg)",
								color: "var(--input-text)"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Low" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Medium" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "High" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							rows: 3,
							placeholder: "Description…",
							value: form.description,
							onChange: (e) => setForm({
								...form,
								description: e.target.value
							}),
							style: {
								padding: 10,
								border: "1px solid var(--input-border)",
								borderRadius: 8,
								background: "var(--input-bg)",
								color: "var(--input-text)"
							}
						})
					]
				})
			})
		]
	});
}
var empty$1 = {
	learner_id: "",
	learner_name: "",
	goal: "",
	kpi: "",
	quarter: "Q3 2026",
	progress: 0,
	status: "On Track",
	development_plan: ""
};
function KPI() {
	const [kpis, setKpis] = useLocalStorage("host.kpis", seedKPIs);
	const [learners] = useLocalStorage("host.learners", seedLearners);
	const [form, setForm] = (0, import_react.useState)(null);
	const confirm = useConfirm();
	const openAdd = () => setForm({ ...empty$1 });
	const openEdit = (k) => setForm({ ...k });
	const remove = async (k) => {
		if (!await confirm({
			title: "Delete Goal",
			description: `Are you sure you want to delete the goal "${k.goal}"?`,
			variant: "destructive",
			confirmText: "Delete Goal"
		})) return;
		setKpis((prev) => prev.filter((x) => x.id !== k.id));
		toast.success("Goal Deleted", { description: `Goal for ${k.learner_name} was removed.` });
	};
	const submit = () => {
		if (!form.learner_id || !form.goal) {
			toast.warning("Goal Details Required", { description: "Please select a learner and specify the goal." });
			return;
		}
		const l = learners.find((x) => x.id === form.learner_id);
		const payload = {
			...form,
			learner_name: l?.full_name || form.learner_name,
			progress: Number(form.progress)
		};
		if (form.id) {
			setKpis((prev) => prev.map((x) => x.id === form.id ? payload : x));
			toast.success("Goal Updated", { description: `Goal for ${payload.learner_name} updated.` });
		} else {
			setKpis((prev) => [{
				id: uid("K"),
				...payload
			}, ...prev]);
			toast.success("Goal Assigned", { description: `Goal assigned to ${payload.learner_name}.` });
		}
		setForm(null);
	};
	const set = (k) => (e) => setForm((f) => ({
		...f,
		[k]: e.target.value
	}));
	const stats = [
		{
			label: "Goals",
			value: kpis.length,
			color: "var(--brand)"
		},
		{
			label: "On track",
			value: kpis.filter((k) => k.status === "On Track").length,
			color: "var(--success)"
		},
		{
			label: "At risk",
			value: kpis.filter((k) => k.status === "At Risk").length,
			color: "var(--danger)"
		},
		{
			label: "Completed",
			value: kpis.filter((k) => k.status === "Completed").length,
			color: "var(--purple)"
		}
	];
	const barColor = (s) => s === "On Track" ? "var(--brand)" : s === "At Risk" ? "var(--danger)" : s === "Completed" ? "var(--success)" : "var(--warning)";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "KPI Management",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
					gap: 16,
					marginBottom: 18
				},
				children: stats.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 12,
							color: "var(--text-muted)"
						},
						children: s.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 28,
							fontWeight: 700,
							color: s.color
						},
						children: s.value
					})]
				}, s.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				style: {
					marginBottom: 12,
					display: "flex",
					justifyContent: "flex-end"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					onClick: openAdd,
					children: "+ Assign Goal"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit,minmax(360px,1fr))",
					gap: 14
				},
				children: kpis.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					style: { borderTop: `3px solid ${barColor(k.status)}` },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-start"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 11,
									color: "var(--text-muted)"
								},
								children: k.quarter
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: { fontWeight: 700 },
								children: k.learner_name
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "badge " + (k.status === "On Track" ? "badge-info" : k.status === "At Risk" ? "badge-danger" : k.status === "Completed" ? "badge-success" : "badge-warning"),
								children: k.status
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								fontSize: 13,
								marginTop: 8
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Goal:" }),
								" ",
								k.goal
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								fontSize: 12,
								color: "var(--text-secondary)",
								marginTop: 4
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "KPI:" }),
								" ",
								k.kpi
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { marginTop: 10 },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									fontSize: 11,
									color: "var(--text-muted)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Progress" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [k.progress, "%"] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									height: 8,
									background: "var(--bg-secondary)",
									borderRadius: 999,
									marginTop: 4
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
									width: `${k.progress}%`,
									height: "100%",
									background: barColor(k.status),
									borderRadius: 999
								} })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
							style: {
								marginTop: 10,
								fontSize: 12
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
								style: {
									cursor: "pointer",
									color: "var(--text-secondary)"
								},
								children: "Development plan"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									padding: "6px 0",
									color: "var(--text-secondary)"
								},
								children: k.development_plan
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								marginTop: 10,
								display: "flex",
								gap: 6
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-ghost",
								onClick: () => openEdit(k),
								children: "Edit"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-ghost",
								style: {
									color: "var(--danger)",
									marginLeft: "auto"
								},
								onClick: () => remove(k),
								children: "Delete"
							})]
						})
					]
				}, k.id))
			}),
			form && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: true,
				onClose: () => setForm(null),
				title: form.id ? "Edit goal" : "New goal",
				width: 600,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => setForm(null),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					onClick: submit,
					children: "Save"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
						gap: 12
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Learner"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								style: field$1,
								value: form.learner_id,
								onChange: set("learner_id"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "— pick —"
								}), learners.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: l.id,
									children: l.full_name
								}, l.id))]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Quarter"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							style: field$1,
							value: form.quarter,
							onChange: set("quarter")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Status"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							style: field$1,
							value: form.status,
							onChange: set("status"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "On Track" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "At Risk" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Off Track" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Completed" })
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Goal"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								style: field$1,
								value: form.goal,
								onChange: set("goal")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "KPI / measure"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								style: field$1,
								value: form.kpi,
								onChange: set("kpi")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Progress %"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							min: 0,
							max: 100,
							style: field$1,
							value: form.progress,
							onChange: set("progress")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Development plan"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								rows: 3,
								style: field$1,
								value: form.development_plan,
								onChange: set("development_plan")
							})]
						})
					]
				})
			})
		]
	});
}
function Contracts() {
	const [contracts, setContracts] = useLocalStorage("host.contracts", seedContracts);
	const [signing, setSigning] = (0, import_react.useState)(null);
	const [creating, setCreating] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		title: "",
		party: "",
		expires: ""
	});
	const { push } = useNotifications();
	const generate = () => {
		setContracts((prev) => [{
			id: uid("C"),
			title: form.title,
			party: form.party,
			expires: form.expires || null,
			status: "Awaiting Signature",
			signed_at: null,
			signed_by: null,
			signature_url: null
		}, ...prev]);
		setCreating(false);
		setForm({
			title: "",
			party: "",
			expires: ""
		});
		push({
			title: "Contract generated",
			body: `${form.title} is ready for signature.`,
			link: "/host/contracts",
			kind: "doc"
		});
	};
	const apply = (payload) => {
		setContracts((prev) => prev.map((c) => c.id === signing.id ? {
			...c,
			status: "Signed",
			signed_at: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			signed_by: "Thandi Mokoena",
			signature_url: payload.dataUrl,
			signature_method: payload.method
		} : c));
		push({
			title: "Contract signed",
			body: `${signing.title} was signed.`,
			link: "/host/contracts",
			kind: "doc"
		});
		setSigning(null);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "Contract Management",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card",
				style: {
					marginBottom: 16,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						fontWeight: 700,
						fontSize: 15
					},
					children: [contracts.length, " contracts"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						fontSize: 12,
						color: "var(--text-secondary)"
					},
					children: "Generate, e-sign (Adobe Sign–style: type / draw / upload), and store all placement and host agreements."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					onClick: () => setCreating(true),
					children: "+ Generate Contract"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						textAlign: "left",
						fontSize: 11,
						color: "var(--text-muted)",
						textTransform: "uppercase"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							style: { padding: "10px 0" },
							children: "Title"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Party" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Signed at" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Expires" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: contracts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						borderTop: "1px solid var(--border-color)",
						fontSize: 13
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: {
								padding: "12px 0",
								fontWeight: 600
							},
							children: c.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: c.party }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "badge " + (c.status === "Signed" ? "badge-success" : c.status === "Draft" ? "badge-info" : "badge-warning"),
							children: c.status
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: c.signed_at || "—" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: c.expires || "—" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							style: { whiteSpace: "nowrap" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-ghost",
								onClick: () => setSigning({
									...c,
									viewOnly: true
								}),
								children: "View"
							}), c.status !== "Signed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-primary",
								onClick: () => setSigning(c),
								children: "Sign"
							})]
						})
					]
				}, c.id)) })] })
			}),
			creating && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: true,
				onClose: () => setCreating(false),
				title: "Generate contract",
				width: 480,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => setCreating(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					onClick: generate,
					disabled: !form.title || !form.party,
					children: "Generate"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gap: 12
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							placeholder: "Contract title",
							value: form.title,
							onChange: (e) => setForm({
								...form,
								title: e.target.value
							}),
							style: {
								padding: 10,
								border: "1px solid var(--input-border)",
								borderRadius: 8,
								background: "var(--input-bg)",
								color: "var(--input-text)"
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							placeholder: "Party (e.g. Mavis Strategic Partners / Neo Mabaso)",
							value: form.party,
							onChange: (e) => setForm({
								...form,
								party: e.target.value
							}),
							style: {
								padding: 10,
								border: "1px solid var(--input-border)",
								borderRadius: 8,
								background: "var(--input-bg)",
								color: "var(--input-text)"
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							value: form.expires,
							onChange: (e) => setForm({
								...form,
								expires: e.target.value
							}),
							style: {
								padding: 10,
								border: "1px solid var(--input-border)",
								borderRadius: 8,
								background: "var(--input-bg)",
								color: "var(--input-text)"
							}
						})
					]
				})
			}),
			signing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
				open: true,
				onClose: () => setSigning(null),
				title: signing.title,
				subtitle: signing.viewOnly ? "Signature preview" : "Adobe Sign–style: type, draw, or upload your signature",
				width: 720,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePreview, {
					url: null,
					mime: "application/pdf",
					name: signing.title,
					mockTitle: signing.title,
					mockBody: "This is a mock preview of the contract. In production the actual PDF would render here for review before signing.",
					height: 260
				}), signing.viewOnly ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: { marginTop: 14 },
					children: [signing.signature_url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "white",
							padding: 12,
							borderRadius: 8,
							border: "1px solid var(--border-color)",
							textAlign: "center"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								fontSize: 11,
								color: "var(--text-muted)"
							},
							children: [
								"Signed by ",
								signing.signed_by,
								" (",
								signing.signature_method,
								")"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: signing.signature_url,
							alt: "Signature",
							style: { maxHeight: 100 }
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							textAlign: "right",
							marginTop: 10
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn btn-primary",
							onClick: () => setSigning(null),
							children: "Close"
						})
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { marginTop: 14 },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignaturePad, {
						defaultName: "Thandi Mokoena",
						onConfirm: apply,
						onCancel: () => setSigning(null)
					})
				})]
			})
		]
	});
}
function Coaching() {
	const [notes, setNotes] = useLocalStorage("host.coaching", seedCoaching);
	const [learners] = useLocalStorage("host.learners", seedLearners);
	const [form, setForm] = (0, import_react.useState)(null);
	const confirm = useConfirm();
	const openAdd = () => setForm({
		learner_id: "",
		date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		mentor: "Thandi Mokoena",
		note: "",
		mood: "Positive"
	});
	const submit = () => {
		if (!form.learner_id || !form.note) {
			toast.warning("Details Required", { description: "Please pick a learner and add a coaching note." });
			return;
		}
		const l = learners.find((x) => x.id === form.learner_id);
		if (form.id) {
			setNotes((prev) => prev.map((n) => n.id === form.id ? {
				...form,
				learner_name: l?.full_name || ""
			} : n));
			toast.success("Coaching Note Updated", { description: `Note for ${l?.full_name || ""} updated.` });
		} else {
			setNotes((prev) => [{
				id: uid("CN"),
				...form,
				learner_name: l?.full_name || ""
			}, ...prev]);
			toast.success("Coaching Note Added", { description: `Note added for ${l?.full_name || ""}.` });
		}
		setForm(null);
	};
	const remove = async (n) => {
		if (!await confirm({
			title: "Delete Coaching Note",
			description: `Are you sure you want to delete this coaching note for "${n.learner_name}"?`,
			variant: "destructive",
			confirmText: "Delete Note"
		})) return;
		setNotes((prev) => prev.filter((x) => x.id !== n.id));
		toast.success("Note Deleted", { description: "Coaching note was removed." });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "Coaching Notes",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				style: {
					marginBottom: 16,
					display: "flex",
					justifyContent: "flex-end"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					onClick: openAdd,
					children: "+ Add Coaching Note"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "grid",
					gap: 12
				},
				children: notes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: { fontWeight: 700 },
								children: n.learner_name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: 11,
									color: "var(--text-muted)"
								},
								children: [
									n.date,
									" · by ",
									n.mentor
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "badge " + (n.mood === "Positive" ? "badge-success" : n.mood === "Needs Attention" ? "badge-warning" : "badge-info"),
								children: n.mood
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 13,
								marginTop: 10,
								color: "var(--text-secondary)"
							},
							children: n.note
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								marginTop: 10,
								display: "flex",
								gap: 6,
								justifyContent: "flex-end"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-ghost",
								onClick: () => setForm(n),
								children: "Edit"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-ghost",
								style: { color: "var(--danger)" },
								onClick: () => remove(n),
								children: "Delete"
							})]
						})
					]
				}, n.id))
			}),
			form && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: true,
				onClose: () => setForm(null),
				title: form.id ? "Edit note" : "New coaching note",
				width: 520,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => setForm(null),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					onClick: submit,
					children: "Save"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gap: 12
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Learner"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							style: field$1,
							value: form.learner_id,
							onChange: (e) => setForm({
								...form,
								learner_id: e.target.value
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "— pick —"
							}), learners.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: l.id,
								children: l.full_name
							}, l.id))]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: 12
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Date"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "date",
								style: field$1,
								value: form.date,
								onChange: (e) => setForm({
									...form,
									date: e.target.value
								})
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Mood"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								style: field$1,
								value: form.mood,
								onChange: (e) => setForm({
									...form,
									mood: e.target.value
								}),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Positive" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Neutral" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Needs Attention" })
								]
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Note"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							rows: 4,
							style: field$1,
							value: form.note,
							onChange: (e) => setForm({
								...form,
								note: e.target.value
							})
						})] })
					]
				})
			})
		]
	});
}
function HRDashboard() {
	const [employees] = useLocalStorage("hr.employees", seedEmployees);
	const [vacancies] = useLocalStorage("host.hr.vacancies", seedVacancies);
	const [applicants] = useLocalStorage("host.hr.applicants", seedApplicants);
	const [leave] = useLocalStorage("host.hr.leave", seedLeave);
	const [learnerLeave] = useLocalStorage("host.hr.learner_leave", seedLearnerLeaveRequests);
	const [training] = useLocalStorage("host.hr.training", seedTraining);
	const [attendanceRecords] = useLocalStorage("host.attendance", seedAttendance);
	const empByType = [
		"Permanent",
		"Contract",
		"Temporary"
	].map((t, i) => ({
		label: t,
		value: employees.filter((e) => e.employment_type === t).length,
		color: [
			"#2563eb",
			"#d97706",
			"#7c3aed"
		][i]
	}));
	const empByDept = Array.from(new Set(employees.map((e) => e.department))).map((d) => ({
		label: d,
		value: employees.filter((e) => e.department === d).length
	}));
	const empByGender = [{
		label: "Female",
		value: employees.filter((e) => e.gender === "Female").length,
		color: "#7c3aed"
	}, {
		label: "Male",
		value: employees.filter((e) => e.gender === "Male").length,
		color: "#2563eb"
	}];
	const empByAge = [
		"20-29",
		"30-39",
		"40-49",
		"50+"
	].map((b) => ({
		label: b,
		value: employees.filter((e) => e.age_band === b).length
	}));
	const trainingCompletion = training.map((t) => ({
		label: t.title.slice(0, 8),
		value: Math.round(t.completed / t.enrolled * 100)
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "HR Executive Dashboard",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					marginBottom: 8,
					fontSize: 12,
					fontWeight: 700,
					color: "var(--text-muted)",
					textTransform: "uppercase",
					letterSpacing: ".08em"
				},
				children: "Workforce Analytics"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
					gap: 12,
					marginBottom: 22
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total employees",
						value: employees.length,
						color: "var(--purple)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "New hires (30d)",
						value: 2,
						sub: "+1 vs last month",
						trend: 50
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Terminations (30d)",
						value: 0,
						sub: "No exits",
						trend: 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Turnover rate",
						value: "3.2%",
						sub: "Rolling 12 months",
						color: "var(--success)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Active employees",
						value: employees.length - 1,
						sub: `${employees.length - 1} of ${employees.length}`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
					gap: 14,
					marginBottom: 22
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 12,
								color: "var(--text-muted)",
								marginBottom: 8
							},
							children: "EMPLOYMENT TYPE"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Donut, {
							data: empByType,
							size: 160,
							thickness: 20
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 12,
								color: "var(--text-muted)",
								marginBottom: 8
							},
							children: "DEPARTMENT HEADCOUNT"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarChart, {
							data: empByDept,
							height: 180,
							color: "#7c3aed"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 12,
								color: "var(--text-muted)",
								marginBottom: 8
							},
							children: "DIVERSITY — GENDER"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Donut, {
							data: empByGender,
							size: 160,
							thickness: 20
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
					gap: 14,
					marginBottom: 22
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 12,
							color: "var(--text-muted)",
							marginBottom: 8
						},
						children: "AGE DISTRIBUTION"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarChart, {
						data: empByAge,
						height: 180
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 12,
							color: "var(--text-muted)",
							marginBottom: 8
						},
						children: "EMPLOYMENT EQUITY OVERVIEW"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							display: "grid",
							gap: 6,
							fontSize: 12
						},
						children: [
							["Black African", 65],
							["Coloured", 12],
							["Indian", 8],
							["White", 15]
						].map(([g, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: g }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [v, "%"] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								height: 6,
								background: "var(--bg-secondary)",
								borderRadius: 999
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
								width: v + "%",
								height: "100%",
								background: "var(--purple)",
								borderRadius: 999
							} })
						})] }, g))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					marginBottom: 8,
					fontSize: 12,
					fontWeight: 700,
					color: "var(--text-muted)",
					textTransform: "uppercase",
					letterSpacing: ".08em"
				},
				children: "Recruitment Dashboard"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
					gap: 12,
					marginBottom: 14
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Open vacancies",
						value: vacancies.filter((v) => v.status === "Open").length
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Applications received",
						value: vacancies.reduce((s, v) => s + v.applicants, 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Shortlisted",
						value: 4
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Interviews scheduled",
						value: 6
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
					gap: 14,
					marginBottom: 22
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 12,
							color: "var(--text-muted)",
							marginBottom: 8
						},
						children: "RECRUITMENT FUNNEL"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarChart, {
						data: [
							{
								label: "Applied",
								value: 115
							},
							{
								label: "Screen",
								value: 62
							},
							{
								label: "Interview",
								value: 28
							},
							{
								label: "Offer",
								value: 9
							},
							{
								label: "Hire",
								value: 5
							}
						],
						height: 200
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 12,
							color: "var(--text-muted)",
							marginBottom: 8
						},
						children: "TIME TO HIRE (days)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineChart, {
						data: [
							{
								label: "Feb",
								value: 42
							},
							{
								label: "Mar",
								value: 38
							},
							{
								label: "Apr",
								value: 32
							},
							{
								label: "May",
								value: 30
							},
							{
								label: "Jun",
								value: 28
							}
						],
						height: 200,
						color: "#7c3aed"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: 8
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						fontSize: 12,
						fontWeight: 700,
						color: "var(--text-muted)",
						textTransform: "uppercase",
						letterSpacing: ".08em"
					},
					children: "Real-time Attendance & Time Tracking"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						gap: 12
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/admin/attendance",
						style: {
							fontSize: 12,
							color: "var(--purple)",
							fontWeight: 600
						},
						children: "Live Command Center (Teams View) ↗"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/hr/attendance",
						style: {
							fontSize: 12,
							color: "var(--text-secondary)",
							fontWeight: 500
						},
						children: "Full Register →"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
					gap: 12,
					marginBottom: 22
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Clocked In",
						value: attendanceRecords.filter((r) => r.status === "Clocked In" || r.status === "Present").length,
						color: "var(--success)",
						sub: "Active today"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "On Break",
						value: attendanceRecords.filter((r) => r.status === "On Break").length,
						color: "var(--warning)",
						sub: "Temporary break"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Clocked Out",
						value: attendanceRecords.filter((r) => r.status === "Clocked Out").length,
						sub: "Shift ended"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "On Leave / Absent",
						value: attendanceRecords.filter((r) => r.status === "On Leave" || r.status === "Absent").length,
						color: "var(--danger)",
						sub: "Unavailable"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					marginBottom: 8,
					fontSize: 12,
					fontWeight: 700,
					color: "var(--text-muted)",
					textTransform: "uppercase",
					letterSpacing: ".08em"
				},
				children: "Leave Dashboard"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
					gap: 12,
					marginBottom: 14
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Currently on leave",
						value: leave.filter((l) => l.status === "Approved").length + learnerLeave.filter((l) => l.status === "Approved").length
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Pending approvals",
						value: leave.filter((l) => l.status === "Pending").length + learnerLeave.filter((l) => l.status === "Pending").length,
						color: "var(--warning)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Leave utilisation",
						value: "42%",
						sub: "YTD"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Sick leave trend",
						value: "↓ 12%",
						color: "var(--success)",
						sub: "vs last quarter"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
					gap: 14,
					marginBottom: 22
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 12,
							color: "var(--text-muted)",
							marginBottom: 8
						},
						children: "ATTENDANCE — LAST 2 WEEKS"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineChart, {
						data: attendanceTrend,
						height: 200
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 12,
							color: "var(--text-muted)",
							marginBottom: 8
						},
						children: "PERFORMANCE TREND"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarChart, {
						data: performanceTrend,
						height: 200,
						color: "#16a34a"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
					gap: 14
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 12,
								color: "var(--text-muted)",
								marginBottom: 8
							},
							children: "LEARNING DASHBOARD"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarChart, {
							data: trainingCompletion,
							height: 180
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/hr/training",
							style: {
								display: "inline-block",
								marginTop: 8,
								fontSize: 12,
								color: "var(--purple)"
							},
							children: "View training →"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 12,
							color: "var(--text-muted)",
							marginBottom: 8
						},
						children: "COMPLIANCE DASHBOARD"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							display: "grid",
							gap: 8,
							fontSize: 12
						},
						children: [
							["Employment Equity report", "Submitted"],
							["Skills Development report", "Draft"],
							["POPIA compliance", "On track"],
							["Expiring contracts", "2 in 30d"],
							["Expiring certifications", "4 in 60d"],
							["Policy acceptance", "96%"]
						].map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								padding: "6px 0",
								borderTop: "1px solid var(--border-color)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: k }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: v })]
						}, k))
					})]
				})]
			})
		]
	});
}
var statusBadge$1 = (s) => {
	if (s === "Present" || s === "Clocked In") return "badge-success";
	if (s === "On Break") return "badge-warning";
	if (s === "Clocked Out") return "badge-purple";
	if (s === "On Leave") return "badge-info";
	return "badge-danger";
};
function HRAttendance() {
	const [records, setRecords] = useLocalStorage("host.attendance", seedAttendance);
	const [q, setQ] = (0, import_react.useState)("");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("All");
	const [date, setDate] = (0, import_react.useState)("");
	const filtered = (0, import_react.useMemo)(() => records.filter((r) => (statusFilter === "All" || r.status === statusFilter) && (!date || r.date === date) && (r.learner_name.toLowerCase().includes(q.toLowerCase()) || (r.mentor || "").toLowerCase().includes(q.toLowerCase()))), [
		records,
		q,
		statusFilter,
		date
	]);
	const setStatus = (id, status) => setRecords((prev) => prev.map((r) => r.id === id ? {
		...r,
		status
	} : r));
	const toggleFlag = (id, flag) => setRecords((prev) => prev.map((r) => r.id === id ? {
		...r,
		leave_flags: {
			...r.leave_flags,
			[flag]: !r.leave_flags?.[flag]
		}
	} : r));
	const stats = ATTENDANCE_STATUSES.map((s) => ({
		label: s,
		value: filtered.filter((r) => r.status === s).length
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "Work Attendance Register",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					marginBottom: 16,
					padding: "12px 16px",
					background: "var(--card-bg)",
					border: "1px solid var(--purple)",
					borderRadius: 10,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					flexWrap: "wrap",
					gap: 10
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					style: {
						fontWeight: 700,
						color: "var(--text-primary)",
						fontSize: 13
					},
					children: "🟢 Live Workforce Command Center (Teams Presence)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						margin: "2px 0 0",
						fontSize: 12,
						color: "var(--text-secondary)"
					},
					children: "View real-time check-ins, active hours, and break timers across all company departments and interns."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "/admin/attendance",
					style: {
						padding: "6px 14px",
						background: "var(--purple)",
						color: "#fff",
						borderRadius: 6,
						fontSize: 12,
						fontWeight: 600,
						textDecoration: "none"
					},
					children: "Open Live Presence View ↗"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
					gap: 12,
					marginBottom: 16
				},
				children: stats.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					style: { padding: 14 },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 11,
							color: "var(--text-muted)"
						},
						children: s.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 22,
							fontWeight: 700
						},
						children: s.value
					})]
				}, s.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card",
				style: {
					marginBottom: 16,
					display: "flex",
					gap: 10,
					flexWrap: "wrap"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Search learner or mentor…",
						style: {
							flex: 1,
							minWidth: 220,
							padding: "10px 12px",
							border: "1px solid var(--input-border)",
							borderRadius: 8,
							background: "var(--input-bg)",
							color: "var(--input-text)"
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "date",
						value: date,
						onChange: (e) => setDate(e.target.value),
						style: {
							padding: "10px 12px",
							border: "1px solid var(--input-border)",
							borderRadius: 8,
							background: "var(--input-bg)",
							color: "var(--input-text)"
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: statusFilter,
						onChange: (e) => setStatusFilter(e.target.value),
						style: {
							padding: "10px 12px",
							border: "1px solid var(--input-border)",
							borderRadius: 8,
							background: "var(--input-bg)",
							color: "var(--input-text)"
						},
						children: ["All", ...ATTENDANCE_STATUSES].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { overflowX: "auto" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						style: {
							textAlign: "left",
							fontSize: 11,
							color: "var(--text-muted)",
							textTransform: "uppercase"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: { padding: "10px 6px" },
								children: "Learner"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Contact" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Sponsor" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Host" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Mentor" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Mentor #" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Date" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								title: "Sick Leave",
								children: "SL"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								title: "Public Holiday",
								children: "PH"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								title: "Annual Leave",
								children: "AL"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								title: "Compassionate Leave",
								children: "CL"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filtered.slice(0, 200).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						style: {
							borderTop: "1px solid var(--border-color)",
							fontSize: 12
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									padding: "10px 6px",
									fontWeight: 600
								},
								children: r.learner_name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: { color: "var(--text-secondary)" },
								children: r.contact
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.sponsor }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.host }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.mentor }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: { color: "var(--text-secondary)" },
								children: r.mentor_phone
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.date }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: r.status,
								onChange: (e) => setStatus(r.id, e.target.value),
								style: {
									padding: "4px 6px",
									borderRadius: 6,
									fontSize: 11,
									border: "1px solid var(--input-border)",
									background: "var(--input-bg)",
									color: "var(--input-text)"
								},
								children: ATTENDANCE_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: { marginTop: 2 },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "badge " + statusBadge$1(r.status),
									children: r.status
								})
							})] }),
							[
								"SL",
								"PH",
								"AL",
								"CL"
							].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: { textAlign: "center" },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: !!r.leave_flags?.[f],
									onChange: () => toggleFlag(r.id, f)
								})
							}, f))
						]
					}, r.id)) })] })
				})
			})
		]
	});
}
var badgeFor = (v) => v === "Verified" ? "badge-success" : v === "Needs Review" ? "badge-warning" : "badge-danger";
function Leave() {
	const [tab, setTab] = (0, import_react.useState)("learner");
	const [learnerLeave, setLearnerLeave] = useLocalStorage("host.hr.learner_leave", seedLearnerLeaveRequests);
	const [staffLeave, setStaffLeave] = useLocalStorage("host.hr.leave", seedLeave);
	const [reviewing, setReviewing] = (0, import_react.useState)(null);
	const [staffForm, setStaffForm] = (0, import_react.useState)(null);
	const [rejectModal, setRejectModal] = (0, import_react.useState)(null);
	const [rejectNote, setRejectNote] = (0, import_react.useState)("");
	const { push } = useNotifications();
	const decideApprove = (id, learnerName) => {
		setLearnerLeave((prev) => prev.map((r) => r.id === id ? {
			...r,
			status: "Approved",
			decided_by: "Thandi Mokoena",
			decided_at: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		} : r));
		push({
			title: "Leave approved",
			body: `${learnerName}'s request has been approved.`,
			link: "/hr/leave",
			kind: "leave"
		});
		toast.success("Leave Approved", { description: `${learnerName}'s leave request was approved.` });
		setReviewing(null);
	};
	const openRejectModal = (id, learnerName) => {
		setRejectNote("");
		setRejectModal({
			id,
			learnerName
		});
	};
	const confirmReject = () => {
		const { id, learnerName } = rejectModal;
		setLearnerLeave((prev) => prev.map((r) => r.id === id ? {
			...r,
			status: "Rejected",
			decided_by: "Thandi Mokoena",
			decided_at: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			decision_note: rejectNote.trim() || void 0
		} : r));
		push({
			title: "Leave rejected",
			body: `${learnerName}'s request has been rejected.`,
			link: "/hr/leave",
			kind: "leave"
		});
		toast.error("Leave Rejected", { description: `${learnerName}'s leave request was rejected.` });
		setRejectModal(null);
		setRejectNote("");
		setReviewing(null);
	};
	const submitStaff = (e) => {
		e.preventDefault();
		if (!staffForm.employee.trim()) {
			toast.warning("Employee Required", { description: "Please enter the employee name before saving." });
			return;
		}
		if (staffForm.id) setStaffLeave((prev) => prev.map((x) => x.id === staffForm.id ? staffForm : x));
		else setStaffLeave((prev) => [{
			...staffForm,
			id: uid("LV")
		}, ...prev]);
		toast.success(staffForm.id ? "Leave Updated" : "Leave Added", { description: `Staff leave record saved for ${staffForm.employee}.` });
		setStaffForm(null);
	};
	const summary = [
		{
			label: "Learner requests",
			value: learnerLeave.length,
			color: "var(--purple)"
		},
		{
			label: "Pending review",
			value: learnerLeave.filter((r) => r.status === "Pending").length,
			color: "var(--warning)"
		},
		{
			label: "Approved",
			value: learnerLeave.filter((r) => r.status === "Approved").length,
			color: "var(--success)"
		},
		{
			label: "Rejected",
			value: learnerLeave.filter((r) => r.status === "Rejected").length,
			color: "var(--danger)"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "Leave Management",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
					gap: 16,
					marginBottom: 18
				},
				children: summary.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 12,
							color: "var(--text-muted)"
						},
						children: s.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 28,
							fontWeight: 700,
							color: s.color
						},
						children: s.value
					})]
				}, s.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card",
				style: {
					marginBottom: 16,
					display: "flex",
					gap: 8,
					flexWrap: "wrap"
				},
				children: [[
					[
						"learner",
						"Learner Requests",
						learnerLeave.length
					],
					[
						"staff",
						"Staff Leave",
						staffLeave.length
					],
					[
						"balances",
						"Leave Balances",
						seedLeaveBalances.length
					],
					[
						"calendar",
						"Calendar & Holidays",
						ZA_PUBLIC_HOLIDAYS.length
					]
				].map(([k, l, n]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "btn " + (tab === k ? "btn-primary" : "btn-ghost"),
					onClick: () => setTab(k),
					children: [
						l,
						" (",
						n,
						")"
					]
				}, k)), tab === "staff" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					style: { marginLeft: "auto" },
					onClick: () => setStaffForm({
						employee: "",
						type: "Annual",
						from: "",
						to: "",
						days: 1,
						status: "Pending",
						reason: ""
					}),
					children: "+ Add Staff Leave"
				})]
			}),
			tab === "learner" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: 6,
						fontSize: 12,
						color: "var(--text-muted)",
						marginBottom: 10
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { size: 14 }), " HR cannot delete a learner's request — only the learner who submitted it can withdraw it."]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { overflowX: "auto" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						style: {
							textAlign: "left",
							fontSize: 11,
							color: "var(--text-muted)",
							textTransform: "uppercase"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: { padding: "10px 0" },
								children: "Learner"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Type" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "From → To" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Days" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Document" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Authenticity" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: learnerLeave.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						style: {
							borderTop: "1px solid var(--border-color)",
							fontSize: 13
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								style: { padding: "12px 0" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: { fontWeight: 600 },
									children: r.learner_name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										fontSize: 11,
										color: "var(--text-muted)"
									},
									children: [
										r.program,
										" · Submitted ",
										r.submitted_at
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.type }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								style: { color: "var(--text-secondary)" },
								children: [
									r.from,
									" → ",
									r.to
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.days }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.document_name ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									display: "inline-flex",
									alignItems: "center",
									gap: 4,
									fontSize: 12
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { size: 13 }),
									" ",
									r.document_name
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: { color: "var(--text-muted)" },
								children: "—"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.doc_verification ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "badge " + badgeFor(r.doc_verification.status),
								title: r.doc_verification.reasons?.join(", "),
								children: r.doc_verification.status
							}) : "—" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "badge " + (r.status === "Approved" ? "badge-success" : r.status === "Rejected" ? "badge-danger" : "badge-warning"),
								children: r.status
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-primary",
								onClick: () => setReviewing(r),
								children: "Review"
							}) })
						]
					}, r.id)) })] })
				})]
			}),
			tab === "staff" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						textAlign: "left",
						fontSize: 11,
						color: "var(--text-muted)",
						textTransform: "uppercase"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							style: { padding: "10px 0" },
							children: "Employee"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Type" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "From" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "To" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Days" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Reason" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: staffLeave.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						borderTop: "1px solid var(--border-color)",
						fontSize: 13
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: {
								padding: "12px 0",
								fontWeight: 500
							},
							children: r.employee
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.type }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.from }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.to }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.days }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "badge " + (r.status === "Approved" ? "badge-success" : r.status === "Declined" ? "badge-danger" : "badge-warning"),
							children: r.status
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: { color: "var(--text-secondary)" },
							children: r.reason
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							style: { whiteSpace: "nowrap" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-ghost",
								onClick: () => setStaffForm(r),
								children: "Edit"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-ghost",
								style: { color: "var(--danger)" },
								onClick: () => setStaffLeave((prev) => prev.filter((x) => x.id !== r.id)),
								children: "Delete"
							})]
						})
					]
				}, r.id)) })] })
			}),
			tab === "balances" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						textAlign: "left",
						fontSize: 11,
						color: "var(--text-muted)",
						textTransform: "uppercase"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						style: { padding: "10px 0" },
						children: "Employee"
					}), LEAVE_TYPES.filter((t) => !["Maternity", "Paternity"].includes(t)).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: t }, t))]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: seedLeaveBalances.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						borderTop: "1px solid var(--border-color)",
						fontSize: 13
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						style: {
							padding: "10px 0",
							fontWeight: 500
						},
						children: b.employee
					}), LEAVE_TYPES.filter((t) => !["Maternity", "Paternity"].includes(t)).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: b[t] ?? "—" }, t))]
				}, b.employee_id)) })] })
			}),
			tab === "calendar" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					style: {
						margin: "0 0 12px",
						fontSize: 15
					},
					children: "South African public holidays"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
						gap: 10
					},
					children: ZA_PUBLIC_HOLIDAYS.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card",
						style: {
							padding: 12,
							background: "var(--bg-secondary)"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 12,
									color: "var(--brand)",
									fontWeight: 700
								},
								children: h.date
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: { fontWeight: 600 },
								children: h.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 11,
									color: "var(--text-secondary)",
									marginTop: 4
								},
								children: h.description
							})
						]
					}, h.date))
				})]
			}),
			reviewing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
				open: true,
				onClose: () => setReviewing(null),
				title: `Leave request — ${reviewing.learner_name}`,
				subtitle: `${reviewing.type} · ${reviewing.days} day(s) · ${reviewing.from} → ${reviewing.to}`,
				width: 780,
				footer: reviewing.status === "Pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-ghost",
						onClick: () => setReviewing(null),
						children: "Close"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-danger",
						onClick: () => openRejectModal(reviewing.id, reviewing.learner_name),
						children: "Reject"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-primary",
						onClick: () => decideApprove(reviewing.id, reviewing.learner_name),
						children: "Approve"
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					onClick: () => setReviewing(null),
					children: "Close"
				}),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
							gap: 12,
							fontSize: 13,
							marginBottom: 14
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								color: "var(--text-muted)",
								fontSize: 11
							},
							children: "Program"
						}), reviewing.program] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								color: "var(--text-muted)",
								fontSize: 11
							},
							children: "Status"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "badge " + (reviewing.status === "Approved" ? "badge-success" : reviewing.status === "Rejected" ? "badge-danger" : "badge-warning"),
							children: reviewing.status
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: { marginBottom: 14 },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 11,
								color: "var(--text-muted)"
							},
							children: "Reason"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 13,
								color: "var(--text-secondary)",
								marginTop: 2
							},
							children: reviewing.reason
						})]
					}),
					reviewing.doc_verification && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card",
						style: {
							padding: 12,
							background: "var(--bg-secondary)",
							marginBottom: 12
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
								style: { fontSize: 12 },
								children: "Document authenticity check"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "badge " + badgeFor(reviewing.doc_verification.status),
								children: [
									reviewing.doc_verification.status,
									" · ",
									reviewing.doc_verification.score,
									"/100"
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							style: {
								margin: "6px 0 0",
								paddingLeft: 18,
								fontSize: 12,
								color: "var(--text-secondary)"
							},
							children: reviewing.doc_verification.reasons.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: r }, i))
						})]
					}),
					reviewing.document_name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePreview, {
						url: reviewing.document_url,
						mime: reviewing.document_type,
						name: reviewing.document_name,
						mockTitle: reviewing.document_name.replace(/\.[^.]+$/, ""),
						mockBody: `Mock rendering of the ${reviewing.type.toLowerCase()} supporting document uploaded by the learner.`,
						height: 280
					})
				]
			}),
			staffForm && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: true,
				onClose: () => setStaffForm(null),
				title: staffForm.id ? "Edit leave" : "Add staff leave",
				width: 520,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => setStaffForm(null),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					type: "submit",
					form: "stf",
					children: "Save"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					id: "stf",
					onSubmit: submitStaff,
					style: {
						display: "grid",
						gap: 12
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Employee"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							style: field$1,
							value: staffForm.employee,
							onChange: (e) => setStaffForm({
								...staffForm,
								employee: e.target.value
							}),
							required: true
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
								gap: 12
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: labelStyle$1,
									children: "Type"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									style: field$1,
									value: staffForm.type,
									onChange: (e) => setStaffForm({
										...staffForm,
										type: e.target.value
									}),
									children: LEAVE_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: t }, t))
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: labelStyle$1,
									children: "Status"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									style: field$1,
									value: staffForm.status,
									onChange: (e) => setStaffForm({
										...staffForm,
										status: e.target.value
									}),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Pending" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Approved" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Declined" })
									]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: labelStyle$1,
									children: "From"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									style: field$1,
									value: staffForm.from,
									onChange: (e) => setStaffForm({
										...staffForm,
										from: e.target.value
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: labelStyle$1,
									children: "To"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									style: field$1,
									value: staffForm.to,
									onChange: (e) => setStaffForm({
										...staffForm,
										to: e.target.value
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: labelStyle$1,
									children: "Days"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									style: field$1,
									value: staffForm.days,
									onChange: (e) => setStaffForm({
										...staffForm,
										days: Number(e.target.value)
									})
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Reason"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							rows: 3,
							style: field$1,
							value: staffForm.reason,
							onChange: (e) => setStaffForm({
								...staffForm,
								reason: e.target.value
							})
						})] })
					]
				})
			}),
			rejectModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: true,
				onClose: () => {
					setRejectModal(null);
					setRejectNote("");
				},
				title: "Reject leave request",
				subtitle: `Provide a reason for rejecting ${rejectModal.learnerName}'s request. This will be visible to the learner.`,
				width: 480,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => {
						setRejectModal(null);
						setRejectNote("");
					},
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "btn btn-danger",
					onClick: confirmReject,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, {
						size: 15,
						style: { marginRight: 6 }
					}), "Confirm Rejection"]
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						style: labelStyle$1,
						children: ["Reason for rejection ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								color: "var(--text-muted)",
								fontWeight: 400
							},
							children: "(optional)"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						autoFocus: true,
						rows: 4,
						style: {
							...field$1,
							resize: "vertical",
							marginTop: 6
						},
						placeholder: "e.g. Insufficient supporting documentation. Please re-apply with a medical certificate.",
						value: rejectNote,
						onChange: (e) => setRejectNote(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 11,
							color: "var(--text-muted)",
							marginTop: 6
						},
						children: "Leave blank to reject without a note. The learner will still be notified."
					})
				] })
			})
		]
	});
}
var totalHours = (r) => (r.projects || []).reduce((s, p) => s + Number(p.hours || 0), 0);
var emptyEntry = () => ({
	employee: "",
	date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
	clock_in: "08:00",
	clock_out: "17:00",
	projects: [{
		name: "",
		hours: 0,
		manager_comment: ""
	}],
	status: "Present",
	notes: ""
});
var statusBadge = (s) => s === "Present" ? "badge-success" : s === "Clocked In" ? "badge-info" : s === "Clocked Out" ? "badge-purple" : s === "On Leave" ? "badge-warning" : "badge-danger";
function Timesheets() {
	const [list, setList] = useLocalStorage("host.hr.timesheets", seedTimesheets);
	const [projects] = useLocalStorage("host.projects", seedProjects);
	const [expanded, setExpanded] = (0, import_react.useState)({});
	const [form, setForm] = (0, import_react.useState)(null);
	const confirm = useConfirm();
	const openAdd = () => setForm(emptyEntry());
	const openEdit = (r) => setForm({
		...r,
		projects: (r.projects || []).map((p) => ({
			manager_comment: "",
			...p
		}))
	});
	const remove = async (r) => {
		if (!await confirm({
			title: "Delete Timesheet",
			description: `Are you sure you want to delete the timesheet for "${r.employee}" on ${r.date}?`,
			variant: "destructive",
			confirmText: "Delete Timesheet"
		})) return;
		setList((prev) => prev.filter((x) => x.id !== r.id));
		toast.success("Timesheet Deleted", { description: `Timesheet for ${r.employee} was removed.` });
	};
	const submit = (e) => {
		e.preventDefault();
		if (!form.employee.trim()) {
			toast.warning("Employee Required", { description: "Please enter employee name." });
			return;
		}
		const clean = {
			...form,
			projects: form.projects.filter((p) => p.name.trim()).map((p) => ({
				name: p.name,
				hours: Number(p.hours) || 0,
				manager_comment: p.manager_comment || ""
			}))
		};
		if (form.id) {
			setList((prev) => prev.map((x) => x.id === form.id ? clean : x));
			toast.success("Timesheet Updated", { description: `Timesheet for ${clean.employee} was updated.` });
		} else {
			setList((prev) => [{
				...clean,
				id: uid("TS")
			}, ...prev]);
			toast.success("Timesheet Created", { description: `Timesheet logged for ${clean.employee}.` });
		}
		setForm(null);
	};
	const setStatus = (r, status) => setList((prev) => prev.map((x) => x.id === r.id ? {
		...x,
		status
	} : x));
	const updProj = (i, k, v) => setForm((f) => {
		const ps = [...f.projects];
		ps[i] = {
			...ps[i],
			[k]: v
		};
		return {
			...f,
			projects: ps
		};
	});
	const addProj = () => setForm((f) => ({
		...f,
		projects: [...f.projects, {
			name: "",
			hours: 0,
			manager_comment: ""
		}]
	}));
	const removeProj = (i) => setForm((f) => ({
		...f,
		projects: f.projects.filter((_, j) => j !== i)
	}));
	const summary = [{
		label: "Total hours logged",
		value: list.reduce((s, r) => s + totalHours(r), 0).toFixed(1)
	}, ...ATTENDANCE_STATUSES.map((s) => ({
		label: s,
		value: list.filter((r) => r.status === s).length
	}))];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "Timesheet Management",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
					gap: 12,
					marginBottom: 18
				},
				children: summary.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					style: { padding: 14 },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 11,
							color: "var(--text-muted)"
						},
						children: s.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 22,
							fontWeight: 700
						},
						children: s.value
					})]
				}, s.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				style: {
					marginBottom: 16,
					display: "flex",
					justifyContent: "flex-end"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					onClick: openAdd,
					children: "+ Add Timesheet"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { overflowX: "auto" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						style: {
							textAlign: "left",
							fontSize: 11,
							color: "var(--text-muted)",
							textTransform: "uppercase"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: { padding: "10px 0" },
								children: "Employee"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Date" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Clock In" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Clock Out" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Total" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Projects" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: list.map((r) => {
						const isOpen = !!expanded[r.id];
						const ps = r.projects || [];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							style: {
								borderTop: "1px solid var(--border-color)",
								fontSize: 13
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									style: {
										padding: "12px 0",
										fontWeight: 500
									},
									children: r.employee
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.date }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.clock_in || "—" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.clock_out || "—" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [totalHours(r).toFixed(2), "h"] }) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: "btn btn-ghost",
									onClick: () => setExpanded((e) => ({
										...e,
										[r.id]: !e[r.id]
									})),
									style: { padding: "4px 8px" },
									children: [
										ps.length,
										" project",
										ps.length === 1 ? "" : "s",
										" ",
										isOpen ? "▲" : "▼"
									]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: r.status,
									onChange: (e) => setStatus(r, e.target.value),
									style: {
										padding: "4px 6px",
										borderRadius: 6,
										fontSize: 11,
										border: "1px solid var(--input-border)",
										background: "var(--input-bg)",
										color: "var(--input-text)"
									},
									children: ATTENDANCE_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: { marginTop: 2 },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "badge " + statusBadge(r.status),
										children: r.status
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									style: { whiteSpace: "nowrap" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "btn btn-ghost",
										onClick: () => openEdit(r),
										children: "Edit"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "btn btn-ghost",
										style: { color: "var(--danger)" },
										onClick: () => remove(r),
										children: "Delete"
									})]
								})
							]
						}), isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
							style: { background: "var(--bg-secondary)" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								colSpan: 8,
								style: { padding: "10px 12px" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: 11,
											color: "var(--text-muted)",
											marginBottom: 6,
											textTransform: "uppercase",
											letterSpacing: ".05em"
										},
										children: [
											"Project breakdown for ",
											r.employee,
											" — ",
											r.date
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
										style: { width: "100%" },
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											style: {
												textAlign: "left",
												fontSize: 11,
												color: "var(--text-muted)"
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													style: {
														padding: "4px 6px",
														width: 30
													},
													children: "#"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Project" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													style: { width: 80 },
													children: "Hours"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													style: { width: 220 },
													children: "Share"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Manager comment" })
											]
										}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: ps.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											style: {
												borderTop: "1px solid var(--border-color)",
												fontSize: 12,
												verticalAlign: "top"
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													style: { padding: "8px 6px" },
													children: i + 1
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: p.name }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [Number(p.hours).toFixed(2), "h"] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													style: {
														height: 6,
														background: "var(--bg-primary)",
														borderRadius: 999
													},
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
														width: `${totalHours(r) ? p.hours / totalHours(r) * 100 : 0}%`,
														height: "100%",
														background: "var(--purple)",
														borderRadius: 999
													} })
												}) }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													style: {
														color: p.manager_comment ? "var(--text-secondary)" : "var(--text-muted)",
														fontStyle: p.manager_comment ? "normal" : "italic"
													},
													children: p.manager_comment || "No comment"
												})
											]
										}, i)) })]
									}),
									r.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											marginTop: 8,
											fontSize: 12,
											color: "var(--text-secondary)"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Notes:" }),
											" ",
											r.notes
										]
									})
								]
							})
						})] }, r.id);
					}) })] })
				})
			}),
			form && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: true,
				onClose: () => setForm(null),
				title: form.id ? "Edit timesheet" : "New timesheet",
				width: 820,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => setForm(null),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					type: "submit",
					form: "ts-form",
					children: form.id ? "Save" : "Create"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					id: "ts-form",
					onSubmit: submit,
					style: {
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 14
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Employee *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								style: field$1,
								value: form.employee,
								onChange: (e) => setForm({
									...form,
									employee: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Date"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							style: field$1,
							value: form.date,
							onChange: (e) => setForm({
								...form,
								date: e.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Status"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							style: field$1,
							value: form.status,
							onChange: (e) => setForm({
								...form,
								status: e.target.value
							}),
							children: ATTENDANCE_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Clock in"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "time",
							style: field$1,
							value: form.clock_in,
							onChange: (e) => setForm({
								...form,
								clock_in: e.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Clock out"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "time",
							style: field$1,
							value: form.clock_out,
							onChange: (e) => setForm({
								...form,
								clock_out: e.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									style: labelStyle$1,
									children: [
										"Projects — total ",
										form.projects.reduce((s, p) => s + Number(p.hours || 0), 0).toFixed(2),
										"h"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										display: "grid",
										gap: 8
									},
									children: form.projects.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "grid",
											gridTemplateColumns: "1fr 100px 1.5fr auto",
											gap: 8
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												style: field$1,
												value: p.name,
												onChange: (e) => updProj(i, "name", e.target.value),
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "",
														children: "— project —"
													}),
													projects.map((pr) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: pr.name }, pr.id)),
													p.name && !projects.some((pr) => pr.name === p.name) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: p.name })
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												step: "0.25",
												style: field$1,
												value: p.hours,
												onChange: (e) => updProj(i, "hours", e.target.value)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												style: field$1,
												placeholder: "Manager comment…",
												value: p.manager_comment || "",
												onChange: (e) => updProj(i, "manager_comment", e.target.value)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "btn btn-ghost",
												style: { color: "var(--danger)" },
												onClick: () => removeProj(i),
												children: "×"
											})
										]
									}, i))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "btn btn-ghost",
									style: { marginTop: 8 },
									onClick: addProj,
									children: "+ Add project"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Notes"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								rows: 2,
								style: field$1,
								value: form.notes,
								onChange: (e) => setForm({
									...form,
									notes: e.target.value
								})
							})]
						})
					]
				})
			})
		]
	});
}
function ComingSoon({ title, tagline, features = [] }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card",
			style: {
				padding: 40,
				textAlign: "center",
				background: "var(--bg-primary)"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
					size: 52,
					strokeWidth: 1.5,
					style: {
						marginBottom: 10,
						color: "var(--brand)"
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "badge badge-purple",
					style: { marginBottom: 12 },
					children: "Coming Soon"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					style: {
						margin: "0 0 8px",
						fontSize: 24
					},
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						margin: "0 auto",
						maxWidth: 560,
						color: "var(--text-secondary)",
						fontSize: 14
					},
					children: tagline
				})
			]
		}), features.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: {
				display: "grid",
				gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
				gap: 14,
				marginTop: 20
			},
			children: features.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							marginBottom: 8,
							color: "var(--brand)"
						},
						children: f.icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(f.icon, { size: 22 }) : "◆"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontWeight: 700,
							fontSize: 14,
							marginBottom: 4
						},
						children: f.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 12,
							color: "var(--text-secondary)"
						},
						children: f.body
					})
				]
			}, i))
		})]
	});
}
function Relations() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComingSoon, {
		title: "Employee Relations",
		tagline: "A single hub for grievances, disciplinary cases, warnings, wellness/EAP, satisfaction surveys, exit interviews, and CCMA documentation — all with confidential audit trails.",
		features: [
			{
				icon: Scale,
				title: "Grievance & disciplinary",
				body: "Case files, warnings register, and CCMA-ready documentation."
			},
			{
				icon: HeartPulse,
				title: "Wellness & EAP",
				body: "Anonymous access to counselling and mental health support."
			},
			{
				icon: ChartColumn,
				title: "Satisfaction surveys",
				body: "Pulse and annual surveys with trend analytics."
			},
			{
				icon: LogOut,
				title: "Exit interviews",
				body: "Structured exit workflows and offboarding."
			},
			{
				icon: Award,
				title: "Recognition",
				body: "Peer-nominated recognition and rewards."
			},
			{
				icon: FileText,
				title: "Policy acknowledgement",
				body: "Track who has read and acknowledged each policy."
			}
		]
	});
}
var empty = {
	title: "",
	department: "",
	type: "Full-time",
	location: "",
	posted: "",
	closes: "",
	applicants: 0,
	status: "Open",
	salary: "",
	description: "",
	requirements: [],
	tags: []
};
var typeColor = (t) => t === "Leanership" ? "var(--purple)" : t === "Intern" ? "var(--warning)" : t === "Contract" ? "var(--brand)" : "var(--success)";
function Recruitment() {
	const [tab, setTab] = (0, import_react.useState)("vacancies");
	const [vacancies, setVacancies] = useLocalStorage("host.hr.vacancies", seedVacancies);
	const [applicants, setApplicants] = useLocalStorage("host.hr.applicants", seedApplicants);
	const [q, setQ] = (0, import_react.useState)("");
	const [typeFilter, setTypeFilter] = (0, import_react.useState)("All");
	const [viewing, setViewing] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)(null);
	const [applicantForm, setApplicantForm] = (0, import_react.useState)(null);
	const { push } = useNotifications();
	const confirm = useConfirm();
	const filtered = (0, import_react.useMemo)(() => vacancies.filter((v) => (typeFilter === "All" || v.type === typeFilter) && (v.title.toLowerCase().includes(q.toLowerCase()) || (v.department || "").toLowerCase().includes(q.toLowerCase()) || (v.tags || []).some((t) => t.toLowerCase().includes(q.toLowerCase())))), [
		vacancies,
		q,
		typeFilter
	]);
	const openAdd = () => setForm({
		...empty,
		posted: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
	});
	const openEdit = (v) => setForm({
		...empty,
		...v
	});
	const submitVacancy = (e) => {
		e.preventDefault();
		if (!form.title.trim()) return toast.warning("Title is required");
		const clean = {
			...form,
			requirements: typeof form.requirements === "string" ? form.requirements.split("\n").filter(Boolean) : form.requirements,
			tags: typeof form.tags === "string" ? form.tags.split(",").map((s) => s.trim()).filter(Boolean) : form.tags
		};
		if (form.id) setVacancies((prev) => prev.map((x) => x.id === form.id ? clean : x));
		else {
			setVacancies((prev) => [{
				id: uid("V"),
				...clean
			}, ...prev]);
			push({
				title: "New vacancy posted",
				body: form.title,
				link: "/hr/recruitment",
				kind: "recruit"
			});
		}
		setForm(null);
	};
	const remove = async (v) => {
		if (await confirm({
			title: "Delete vacancy?",
			description: `Delete ${v.title}?`
		})) setVacancies((prev) => prev.filter((x) => x.id !== v.id));
	};
	const submitApplicant = (e) => {
		e.preventDefault();
		if (applicantForm.id) setApplicants((prev) => prev.map((x) => x.id === applicantForm.id ? applicantForm : x));
		else setApplicants((prev) => [{
			id: uid("A"),
			...applicantForm
		}, ...prev]);
		setApplicantForm(null);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "Recruitment & Selection",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card",
				style: {
					marginBottom: 16,
					display: "flex",
					gap: 8,
					flexWrap: "wrap"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "btn " + (tab === "vacancies" ? "btn-primary" : "btn-ghost"),
						onClick: () => setTab("vacancies"),
						children: [
							"Vacancies (",
							vacancies.length,
							")"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "btn " + (tab === "applicants" ? "btn-primary" : "btn-ghost"),
						onClick: () => setTab("applicants"),
						children: [
							"Applicants (",
							applicants.length,
							")"
						]
					}),
					tab === "vacancies" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-primary",
						style: { marginLeft: "auto" },
						onClick: openAdd,
						children: "+ Post Vacancy"
					}),
					tab === "applicants" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-primary",
						style: { marginLeft: "auto" },
						onClick: () => setApplicantForm({
							name: "",
							vacancy: vacancies[0]?.title || "",
							stage: "Screening",
							score: 0,
							applied: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
						}),
						children: "+ Add Applicant"
					})
				]
			}),
			tab === "vacancies" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card",
				style: {
					marginBottom: 16,
					display: "flex",
					gap: 10,
					flexWrap: "wrap"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: q,
					onChange: (e) => setQ(e.target.value),
					placeholder: "Search jobs, tags, department…",
					style: {
						flex: 1,
						minWidth: 240,
						padding: "10px 12px",
						border: "1px solid var(--input-border)",
						borderRadius: 8,
						background: "var(--input-bg)",
						color: "var(--input-text)"
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					value: typeFilter,
					onChange: (e) => setTypeFilter(e.target.value),
					style: {
						padding: "10px 12px",
						border: "1px solid var(--input-border)",
						borderRadius: 8,
						background: "var(--input-bg)",
						color: "var(--input-text)"
					},
					children: ["All", ...VACANCY_TYPES].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: t }, t))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "grid",
					gap: 12
				},
				children: filtered.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "card",
					style: {
						padding: 18,
						borderLeft: `4px solid ${typeColor(v.type)}`
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: 14,
							alignItems: "flex-start"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								width: 48,
								height: 48,
								borderRadius: 10,
								background: "var(--purple-soft)",
								color: "var(--purple)",
								display: "grid",
								placeItems: "center",
								fontSize: 20,
								fontWeight: 700
							},
							children: "Mavis Strategic Partners"[0]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								flex: 1,
								minWidth: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										gap: 10,
										flexWrap: "wrap"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: 16,
											fontWeight: 800
										},
										children: v.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: 12,
											color: "var(--text-secondary)"
										},
										children: [
											"Mavis Strategic Partners",
											" · ",
											v.department
										]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "badge " + (v.status === "Open" ? "badge-success" : v.status === "Closed" ? "badge-danger" : "badge-warning"),
										children: v.status
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										marginTop: 8,
										display: "flex",
										gap: 6,
										flexWrap: "wrap"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "chip",
											style: {
												color: typeColor(v.type),
												borderColor: typeColor(v.type)
											},
											children: v.type
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "chip",
											children: ["📍 ", v.location]
										}),
										v.salary && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "chip",
											children: ["💰 ", v.salary]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "chip",
											children: [v.applicants, " applicants"]
										}),
										v.closes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "chip",
											children: ["⏰ Closes ", v.closes]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									style: {
										fontSize: 13,
										color: "var(--text-secondary)",
										margin: "10px 0 0",
										display: "-webkit-box",
										WebkitLineClamp: 2,
										WebkitBoxOrient: "vertical",
										overflow: "hidden"
									},
									children: v.description
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										marginTop: 8,
										display: "flex",
										gap: 4,
										flexWrap: "wrap"
									},
									children: (v.tags || []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "badge badge-info",
										children: t
									}, t))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										marginTop: 12,
										display: "flex",
										gap: 6
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "btn btn-primary",
											onClick: () => setViewing(v),
											children: "View job"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "btn btn-ghost",
											onClick: () => openEdit(v),
											children: "Edit"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "btn btn-ghost",
											style: {
												color: "var(--danger)",
												marginLeft: "auto"
											},
											onClick: () => remove(v),
											children: "Delete"
										})
									]
								})
							]
						})]
					})
				}, v.id))
			})] }),
			tab === "applicants" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						textAlign: "left",
						fontSize: 11,
						color: "var(--text-muted)",
						textTransform: "uppercase"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							style: { padding: "10px 0" },
							children: "Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Vacancy" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Stage" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Score" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Applied" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: applicants.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						borderTop: "1px solid var(--border-color)",
						fontSize: 13
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: {
								padding: "10px 0",
								fontWeight: 600
							},
							children: a.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: a.vacancy }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "badge badge-info",
							children: a.stage
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: a.score }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: a.applied }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn btn-ghost",
							onClick: () => setApplicantForm(a),
							children: "Edit"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn btn-ghost",
							style: { color: "var(--danger)" },
							onClick: () => setApplicants((prev) => prev.filter((x) => x.id !== a.id)),
							children: "Delete"
						})] })
					]
				}, a.id)) })] })
			}),
			viewing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
				open: true,
				onClose: () => setViewing(null),
				title: viewing.title,
				subtitle: `Mavis Strategic Partners · ${viewing.department} · ${viewing.location}`,
				width: 720,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => setViewing(null),
					children: "Close"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					onClick: () => toast.info("Applicants can apply from the public careers portal."),
					children: "Share job link"
				})] }),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: 6,
							marginBottom: 14,
							flexWrap: "wrap"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "chip",
								style: {
									color: typeColor(viewing.type),
									borderColor: typeColor(viewing.type)
								},
								children: viewing.type
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "chip",
								children: ["💰 ", viewing.salary]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "chip",
								children: ["⏰ Closes ", viewing.closes]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "chip",
								children: [viewing.applicants, " applicants"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							fontSize: 13,
							marginBottom: 14
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "About the role" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: {
								marginTop: 4,
								color: "var(--text-secondary)"
							},
							children: viewing.description
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: { fontSize: 13 },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Requirements" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							style: {
								marginTop: 4,
								paddingLeft: 18,
								color: "var(--text-secondary)"
							},
							children: (viewing.requirements || []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: r }, r))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: { marginTop: 12 },
						children: (viewing.tags || []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "badge badge-info",
							style: { marginRight: 4 },
							children: t
						}, t))
					})
				]
			}),
			form && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: true,
				onClose: () => setForm(null),
				title: form.id ? "Edit vacancy" : "Post vacancy",
				width: 720,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => setForm(null),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					type: "submit",
					form: "vac-form",
					children: "Save"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					id: "vac-form",
					onSubmit: submitVacancy,
					style: {
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 12
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Job title *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								style: field$1,
								value: form.title,
								onChange: (e) => setForm({
									...form,
									title: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Department"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							style: field$1,
							value: form.department,
							onChange: (e) => setForm({
								...form,
								department: e.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Type"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							style: field$1,
							value: form.type,
							onChange: (e) => setForm({
								...form,
								type: e.target.value
							}),
							children: VACANCY_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: t }, t))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Location"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							style: field$1,
							value: form.location,
							onChange: (e) => setForm({
								...form,
								location: e.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Salary"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							style: field$1,
							value: form.salary,
							onChange: (e) => setForm({
								...form,
								salary: e.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Posted"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							style: field$1,
							value: form.posted,
							onChange: (e) => setForm({
								...form,
								posted: e.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Closes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							style: field$1,
							value: form.closes,
							onChange: (e) => setForm({
								...form,
								closes: e.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Status"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							style: field$1,
							value: form.status,
							onChange: (e) => setForm({
								...form,
								status: e.target.value
							}),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Open" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Interviewing" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Closed" })
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Applicants"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							style: field$1,
							value: form.applicants,
							onChange: (e) => setForm({
								...form,
								applicants: Number(e.target.value)
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Description"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								rows: 3,
								style: field$1,
								value: form.description,
								onChange: (e) => setForm({
									...form,
									description: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Requirements (one per line)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								rows: 3,
								style: field$1,
								value: Array.isArray(form.requirements) ? form.requirements.join("\n") : form.requirements,
								onChange: (e) => setForm({
									...form,
									requirements: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Tags (comma-separated)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								style: field$1,
								value: Array.isArray(form.tags) ? form.tags.join(", ") : form.tags,
								onChange: (e) => setForm({
									...form,
									tags: e.target.value
								})
							})]
						})
					]
				})
			}),
			applicantForm && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: true,
				onClose: () => setApplicantForm(null),
				title: applicantForm.id ? "Edit applicant" : "Add applicant",
				width: 520,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => setApplicantForm(null),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					type: "submit",
					form: "app-form",
					children: "Save"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					id: "app-form",
					onSubmit: submitApplicant,
					style: {
						display: "grid",
						gap: 12
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							placeholder: "Full name",
							style: field$1,
							value: applicantForm.name,
							onChange: (e) => setApplicantForm({
								...applicantForm,
								name: e.target.value
							}),
							required: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							style: field$1,
							value: applicantForm.vacancy,
							onChange: (e) => setApplicantForm({
								...applicantForm,
								vacancy: e.target.value
							}),
							children: vacancies.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: v.title }, v.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							style: field$1,
							value: applicantForm.stage,
							onChange: (e) => setApplicantForm({
								...applicantForm,
								stage: e.target.value
							}),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Screening" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Interview" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Assessment" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Offer" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Rejected" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							placeholder: "Score",
							style: field$1,
							value: applicantForm.score,
							onChange: (e) => setApplicantForm({
								...applicantForm,
								score: Number(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							style: field$1,
							value: applicantForm.applied,
							onChange: (e) => setApplicantForm({
								...applicantForm,
								applied: e.target.value
							})
						})
					]
				})
			})
		]
	});
}
function Talent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComingSoon, {
		title: "Talent Management",
		tagline: "Succession planning, skills matrices, career paths, competency frameworks, and internal mobility — one workspace for every talent decision.",
		features: [
			{
				icon: "👑",
				title: "Succession planning",
				body: "Identify successors for every critical role."
			},
			{
				icon: "🧭",
				title: "Career paths",
				body: "Visualise growth journeys and lateral moves."
			},
			{
				icon: "🧬",
				title: "Skills matrix",
				body: "Score every competency across your team."
			},
			{
				icon: "🌟",
				title: "High potential",
				body: "Spot rising stars and readiness levels."
			},
			{
				icon: "🗺",
				title: "IDPs",
				body: "Individual Development Plans with progress tracking."
			},
			{
				icon: "📈",
				title: "Talent analytics",
				body: "Bench strength and internal mobility rates."
			}
		]
	});
}
function Training() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComingSoon, {
		title: "Training & Development",
		tagline: "Full LMS, skills gap analysis, mandatory compliance training, certification tracking, WSP/ATR reporting, and CPD — everything you need to grow your people.",
		features: [
			{
				icon: GraduationCap,
				title: "Learning Management",
				body: "Online, classroom, and webinar training in one catalogue."
			},
			{
				icon: FileText,
				title: "Certification tracking",
				body: "Expiry alerts and renewal workflows."
			},
			{
				icon: Scale,
				title: "Compliance training",
				body: "Mandatory training coverage across your workforce."
			},
			{
				icon: ChartColumn,
				title: "Skills gap analysis",
				body: "Identify gaps between required and actual competencies."
			},
			{
				icon: ClipboardList,
				title: "WSP & ATR",
				body: "Workplace Skills Plan and Annual Training Report exports."
			},
			{
				icon: Target,
				title: "CPD tracking",
				body: "Continuous professional development points."
			}
		]
	});
}
var seedReviews = [
	{
		id: "PR-1",
		employee: "Thandi Mokoena",
		period: "Q2 2026",
		overall: 4.6,
		goals_met: 5,
		goals_total: 5,
		feedback: "360° feedback: leadership and empathy praised.",
		pip: false,
		promotion: true
	},
	{
		id: "PR-2",
		employee: "Sipho Dlamini",
		period: "Q2 2026",
		overall: 4.1,
		goals_met: 4,
		goals_total: 5,
		feedback: "Strong technical delivery. Communication needs coaching.",
		pip: false,
		promotion: false
	},
	{
		id: "PR-3",
		employee: "Karabo Mthembu",
		period: "Q2 2026",
		overall: 2.6,
		goals_met: 1,
		goals_total: 4,
		feedback: "Attendance issues affecting delivery. PIP initiated.",
		pip: true,
		promotion: false
	}
];
function HRPerformance() {
	const [reviews, setReviews] = useLocalStorage("hr.reviews", seedReviews);
	const [form, setForm] = (0, import_react.useState)(null);
	const openAdd = () => setForm({
		employee: seedEmployees[0]?.full_name || "",
		period: "Q3 2026",
		overall: 3.5,
		goals_met: 0,
		goals_total: 5,
		feedback: "",
		pip: false,
		promotion: false
	});
	const submit = () => {
		if (form.id) setReviews((prev) => prev.map((x) => x.id === form.id ? form : x));
		else setReviews((prev) => [{
			id: uid("PR"),
			...form
		}, ...prev]);
		setForm(null);
	};
	const chart = reviews.map((r) => ({
		label: r.employee,
		value: Math.round(r.overall * 20)
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "Performance Management",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: 14,
					marginBottom: 18
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 12,
							color: "var(--text-muted)",
							marginBottom: 8
						},
						children: "OVERALL SCORES (%) — CURRENT PERIOD"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarChart, {
						data: chart,
						height: 200,
						color: "#7c3aed"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						style: {
							margin: "0 0 8px",
							fontSize: 15
						},
						children: "Highlights"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						style: {
							margin: 0,
							paddingLeft: 18,
							fontSize: 13,
							color: "var(--text-secondary)"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [reviews.filter((r) => r.overall >= 4).length, " high performers this cycle"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [reviews.filter((r) => r.pip).length, " employee(s) on a PIP"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [reviews.filter((r) => r.promotion).length, " promotion recommendation(s) pending"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "360° feedback active for all senior roles" })
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				style: {
					marginBottom: 12,
					display: "flex",
					justifyContent: "flex-end"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					onClick: openAdd,
					children: "+ Add review"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						textAlign: "left",
						fontSize: 11,
						color: "var(--text-muted)",
						textTransform: "uppercase"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							style: { padding: "10px 0" },
							children: "Employee"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Period" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Overall" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Goals" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "PIP" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Promotion" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Feedback" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: reviews.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						borderTop: "1px solid var(--border-color)",
						fontSize: 13
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: {
								padding: "12px 0",
								fontWeight: 600
							},
							children: r.employee
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.period }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: r.overall.toFixed(1) }), " / 5"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
							r.goals_met,
							"/",
							r.goals_total
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.pip ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "badge badge-danger",
							children: "Yes"
						}) : "—" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.promotion ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "badge badge-success",
							children: "Recommended"
						}) : "—" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: { color: "var(--text-secondary)" },
							children: r.feedback
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn btn-ghost",
							onClick: () => setForm(r),
							children: "Edit"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn btn-ghost",
							style: { color: "var(--danger)" },
							onClick: () => setReviews((prev) => prev.filter((x) => x.id !== r.id)),
							children: "Delete"
						})] })
					]
				}, r.id)) })] })
			}),
			form && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: true,
				onClose: () => setForm(null),
				title: form.id ? "Edit review" : "New review",
				width: 600,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => setForm(null),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					onClick: submit,
					children: "Save"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 12
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: labelStyle$1,
									children: "Employee / Learner (search by name or email)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									style: field$1,
									placeholder: "Type a name or email…",
									value: form.employee,
									onChange: (e) => setForm({
										...form,
										employee: e.target.value
									}),
									list: "hr-employee-suggest"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
									id: "hr-employee-suggest",
									children: seedEmployees.filter((x) => {
										const q = (form.employee || "").toLowerCase().trim();
										if (!q) return true;
										return x.full_name.toLowerCase().includes(q) || (x.email || "").toLowerCase().includes(q);
									}).map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: x.full_name,
										children: x.email
									}, x.id))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Period"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							style: field$1,
							value: form.period,
							onChange: (e) => setForm({
								...form,
								period: e.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Overall (0-5)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							step: "0.1",
							min: "0",
							max: "5",
							style: field$1,
							value: form.overall,
							onChange: (e) => setForm({
								...form,
								overall: Number(e.target.value)
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Goals met"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							style: field$1,
							value: form.goals_met,
							onChange: (e) => setForm({
								...form,
								goals_met: Number(e.target.value)
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Goals total"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							style: field$1,
							value: form.goals_total,
							onChange: (e) => setForm({
								...form,
								goals_total: Number(e.target.value)
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: 6,
								fontSize: 13
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: form.pip,
								onChange: (e) => setForm({
									...form,
									pip: e.target.checked
								})
							}), " On PIP"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: 6,
								fontSize: 13
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: form.promotion,
								onChange: (e) => setForm({
									...form,
									promotion: e.target.checked
								})
							}), " Promotion recommended"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { gridColumn: "1 / -1" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Feedback"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								rows: 3,
								style: field$1,
								value: form.feedback,
								onChange: (e) => setForm({
									...form,
									feedback: e.target.value
								})
							})]
						})
					]
				})
			})
		]
	});
}
function HRAdmin() {
	const [tab, setTab] = (0, import_react.useState)("employees");
	const [employees, setEmployees] = useLocalStorage("hr.employees", seedEmployees);
	const [announcements, setAnnouncements] = useLocalStorage("hr.announcements", seedAnnouncements);
	const [letters, setLetters] = useLocalStorage("hr.letters", seedLetters);
	const [audit] = useLocalStorage("hr.audit", seedAudit);
	const [form, setForm] = (0, import_react.useState)(null);
	const [annForm, setAnnForm] = (0, import_react.useState)(null);
	const submitEmployee = () => {
		if (!form.full_name) return alert("Name required");
		if (form.id.startsWith("NEW")) setEmployees((prev) => [{
			...form,
			id: uid("E")
		}, ...prev]);
		else setEmployees((prev) => prev.map((x) => x.id === form.id ? form : x));
		setForm(null);
	};
	const generateLetter = () => {
		const emp = window.prompt("Employee full name?");
		const type = window.prompt("Letter type? (e.g. Employment Verification)");
		if (!emp || !type) return;
		setLetters((prev) => [{
			id: uid("HL"),
			employee: emp,
			type,
			generated: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		}, ...prev]);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "HR Administration",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				style: {
					marginBottom: 16,
					display: "flex",
					gap: 8,
					flexWrap: "wrap"
				},
				children: [
					["employees", "Employees"],
					["announcements", "Announcements"],
					["letters", "HR Letters"],
					["audit", "Audit Log"],
					["popia", "POPIA & Compliance"]
				].map(([k, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn " + (tab === k ? "btn-primary" : "btn-ghost"),
					onClick: () => setTab(k),
					children: l
				}, k))
			}),
			tab === "employees" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				style: {
					marginBottom: 12,
					display: "flex",
					justifyContent: "flex-end"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					onClick: () => setForm({
						id: "NEW",
						full_name: "",
						role: "",
						department: "",
						email: "",
						phone: "",
						employment_type: "Permanent",
						join_date: "",
						manager: "",
						gender: "Female",
						age_band: "30-39"
					}),
					children: "+ Add Employee"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						textAlign: "left",
						fontSize: 11,
						color: "var(--text-muted)",
						textTransform: "uppercase"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							style: { padding: "10px 0" },
							children: "Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Role" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Department" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Type" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Manager" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Joined" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: employees.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						borderTop: "1px solid var(--border-color)",
						fontSize: 13
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: {
								padding: "10px 0",
								fontWeight: 600
							},
							children: e.full_name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: e.role }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: e.department }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "badge badge-info",
							children: e.employment_type
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: e.manager }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: e.join_date }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn btn-ghost",
							onClick: () => setForm(e),
							children: "Edit"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn btn-ghost",
							style: { color: "var(--danger)" },
							onClick: () => setEmployees((prev) => prev.filter((x) => x.id !== e.id)),
							children: "Delete"
						})] })
					]
				}, e.id)) })] })
			})] }),
			tab === "announcements" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				style: {
					marginBottom: 12,
					display: "flex",
					justifyContent: "flex-end"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					onClick: () => setAnnForm({
						title: "",
						body: "",
						author: "HR Department"
					}),
					children: "+ Post Announcement"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "grid",
					gap: 12
				},
				children: announcements.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontWeight: 700,
									fontSize: 15
								},
								children: a.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: 11,
									color: "var(--text-muted)"
								},
								children: [
									a.posted,
									" · ",
									a.author
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 13,
								color: "var(--text-secondary)",
								marginTop: 8
							},
							children: a.body
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								marginTop: 8,
								textAlign: "right"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-ghost",
								style: { color: "var(--danger)" },
								onClick: () => setAnnouncements((prev) => prev.filter((x) => x.id !== a.id)),
								children: "Delete"
							})
						})
					]
				}, a.id))
			})] }),
			tab === "letters" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				style: {
					marginBottom: 12,
					display: "flex",
					justifyContent: "flex-end"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					onClick: generateLetter,
					children: "+ Generate HR Letter"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						textAlign: "left",
						fontSize: 11,
						color: "var(--text-muted)",
						textTransform: "uppercase"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							style: { padding: "10px 0" },
							children: "Employee"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Type" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Generated" })
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: letters.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						borderTop: "1px solid var(--border-color)",
						fontSize: 13
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: {
								padding: "10px 0",
								fontWeight: 500
							},
							children: l.employee
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: l.type }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: l.generated })
					]
				}, l.id)) })] })
			})] }),
			tab === "audit" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						textAlign: "left",
						fontSize: 11,
						color: "var(--text-muted)",
						textTransform: "uppercase"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							style: { padding: "10px 0" },
							children: "When"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Actor" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Action" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Target" })
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: audit.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					style: {
						borderTop: "1px solid var(--border-color)",
						fontSize: 13
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: {
								padding: "10px 0",
								fontFamily: "monospace",
								fontSize: 12
							},
							children: a.at
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: a.actor }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: a.action }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							style: { color: "var(--text-secondary)" },
							children: a.target
						})
					]
				}, a.id)) })] })
			}),
			tab === "popia" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "grid",
					gap: 12
				},
				children: [
					[
						"POPIA compliance status",
						"96%",
						"var(--success)"
					],
					[
						"Employees who acknowledged latest privacy policy",
						"54 / 56",
						"var(--brand)"
					],
					[
						"Data retention audits (last 12 months)",
						"3 completed",
						"var(--purple)"
					],
					[
						"Data subject access requests",
						"1 open",
						"var(--warning)"
					]
				].map(([k, v, c]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: { fontSize: 13 },
						children: k
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 20,
							fontWeight: 700,
							color: c
						},
						children: v
					})]
				}, k))
			}),
			form && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: true,
				onClose: () => setForm(null),
				title: form.id.startsWith("NEW") ? "Add employee" : "Edit employee",
				width: 600,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => setForm(null),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					onClick: submitEmployee,
					children: "Save"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 12
					},
					children: [
						[
							["Full name", "full_name"],
							["Role", "role"],
							["Department", "department"],
							["Email", "email"],
							["Phone", "phone"],
							["Manager", "manager"]
						].map(([label, k]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							style: field$1,
							value: form[k] || "",
							onChange: (e) => setForm({
								...form,
								[k]: e.target.value
							})
						})] }, k)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Employment type"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							style: field$1,
							value: form.employment_type,
							onChange: (e) => setForm({
								...form,
								employment_type: e.target.value
							}),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Permanent" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Contract" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Temporary" })
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Join date"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							style: field$1,
							value: form.join_date || "",
							onChange: (e) => setForm({
								...form,
								join_date: e.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Gender"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							style: field$1,
							value: form.gender,
							onChange: (e) => setForm({
								...form,
								gender: e.target.value
							}),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Female" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Male" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Other" })
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Age band"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							style: field$1,
							value: form.age_band,
							onChange: (e) => setForm({
								...form,
								age_band: e.target.value
							}),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "20-29" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "30-39" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "40-49" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "50+" })
							]
						})] })
					]
				})
			}),
			annForm && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: true,
				onClose: () => setAnnForm(null),
				title: "Post announcement",
				width: 520,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => setAnnForm(null),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					onClick: () => {
						setAnnouncements((prev) => [{
							id: uid("AN"),
							posted: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
							...annForm
						}, ...prev]);
						setAnnForm(null);
					},
					children: "Post"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gap: 10
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							placeholder: "Title",
							style: field$1,
							value: annForm.title,
							onChange: (e) => setAnnForm({
								...annForm,
								title: e.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							rows: 4,
							placeholder: "Body",
							style: field$1,
							value: annForm.body,
							onChange: (e) => setAnnForm({
								...annForm,
								body: e.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							placeholder: "Author",
							style: field$1,
							value: annForm.author,
							onChange: (e) => setAnnForm({
								...annForm,
								author: e.target.value
							})
						})
					]
				})
			})
		]
	});
}
function HRIntegrations() {
	const [ints, setInts] = useLocalStorage("hr.integrations", seedIntegrations);
	const toggle = (id) => setInts((prev) => prev.map((i) => i.id === id ? {
		...i,
		status: i.status === "Connected" ? "Not Connected" : "Connected",
		last_sync: i.status === "Connected" ? null : (/* @__PURE__ */ new Date()).toISOString().slice(0, 16).replace("T", " ")
	} : i));
	const cats = Array.from(new Set(ints.map((i) => i.category)));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "Integrations",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card",
			style: {
				marginBottom: 16,
				background: "var(--bg-primary)"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					fontSize: 14,
					fontWeight: 700
				},
				children: "Connect your existing HR tooling"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					fontSize: 12,
					color: "var(--text-secondary)",
					marginTop: 4
				},
				children: "Payroll, biometric devices, ERP, LMS, job boards, e-signature, SSO/MFA, and BI. Toggle to enable a live connection (demo — no external calls made)."
			})]
		}), cats.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: { marginBottom: 22 },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					fontSize: 11,
					fontWeight: 700,
					textTransform: "uppercase",
					letterSpacing: ".08em",
					color: "var(--text-muted)",
					marginBottom: 8
				},
				children: cat
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
					gap: 12
				},
				children: ints.filter((i) => i.category === cat).map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					style: { padding: 16 },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: { fontWeight: 700 },
								children: i.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "badge " + (i.status === "Connected" ? "badge-success" : "badge-danger"),
								children: i.status
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								fontSize: 11,
								color: "var(--text-muted)",
								marginTop: 6
							},
							children: ["Last sync: ", i.last_sync || "—"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn btn-ghost",
							style: { marginTop: 10 },
							onClick: () => toggle(i.id),
							children: i.status === "Connected" ? "Disconnect" : "Connect"
						})
					]
				}, i.id))
			})]
		}, cat))]
	});
}
var accessOptions = ["HR only", "Employee + HR"];
function Documents() {
	const [documents, setDocuments] = useLocalStorage("hr.employee_documents", []);
	const [selectedEmployee, setSelectedEmployee] = (0, import_react.useState)(seedEmployees[0]?.id || "");
	const [uploadOpen, setUploadOpen] = (0, import_react.useState)(false);
	const [access, setAccess] = (0, import_react.useState)("HR only");
	const [file, setFile] = (0, import_react.useState)(null);
	const fileInput = (0, import_react.useRef)(null);
	const employees = (0, import_react.useMemo)(() => seedEmployees, []);
	const employee = employees.find((item) => item.id === selectedEmployee) || employees[0];
	const employeeDocuments = documents.filter((document) => document.employee_id === employee?.id);
	const upload = () => {
		if (!file || !employee) return;
		const reader = new FileReader();
		reader.onload = () => {
			setDocuments((previous) => [{
				id: uid("DOC"),
				employee_id: employee.id,
				employee_name: employee.full_name,
				name: file.name,
				type: file.type || "application/octet-stream",
				size: file.size,
				access,
				uploaded: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				data_url: reader.result
			}, ...previous]);
			setFile(null);
			setAccess("HR only");
			setUploadOpen(false);
		};
		reader.readAsDataURL(file);
	};
	const remove = (document) => {
		if (window.confirm(`Delete ${document.name}?`)) setDocuments((previous) => previous.filter((item) => item.id !== document.id));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "Employee Documents",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				style: { marginBottom: 16 },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						gap: 12,
						alignItems: "center",
						flexWrap: "wrap"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 16,
							fontWeight: 700
						},
						children: "Employee document folders"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 12,
							color: "var(--text-secondary)",
							marginTop: 4
						},
						children: "Each employee has a separate folder. Access is set per document and managed by HR."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "btn btn-primary",
						onClick: () => setUploadOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { size: 15 }), " Upload document"]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "minmax(210px, .7fr) minmax(0, 1.8fr)",
					gap: 16,
					alignItems: "start"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					style: { padding: 10 },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							padding: "8px 10px",
							fontSize: 11,
							color: "var(--text-muted)",
							textTransform: "uppercase",
							letterSpacing: ".08em",
							fontWeight: 700
						},
						children: "Employee folders"
					}), employees.map((item) => {
						const count = documents.filter((document) => document.employee_id === item.id).length;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setSelectedEmployee(item.id),
							style: {
								width: "100%",
								display: "flex",
								alignItems: "center",
								gap: 10,
								padding: "10px",
								border: 0,
								borderRadius: 8,
								background: selectedEmployee === item.id ? "var(--brand-soft)" : "transparent",
								color: "var(--text-primary)",
								textAlign: "left",
								cursor: "pointer"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Folder, {
									size: 17,
									color: "var(--brand)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										flex: 1,
										fontSize: 12,
										fontWeight: 600
									},
									children: item.full_name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "badge badge-info",
									children: count
								})
							]
						}, item.id);
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "start",
							gap: 10,
							marginBottom: 14
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: 18,
								fontWeight: 700
							},
							children: employee?.full_name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								color: "var(--text-secondary)",
								fontSize: 12
							},
							children: [
								employee?.role,
								" · ",
								employee?.department
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "badge badge-purple",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { size: 12 }), " HR controlled"]
						})]
					}), employeeDocuments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							padding: "30px 10px",
							textAlign: "center",
							color: "var(--text-muted)",
							fontSize: 13
						},
						children: "No documents in this employee folder yet."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							display: "grid",
							gap: 8
						},
						children: employeeDocuments.map((document) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: 10,
								padding: 10,
								border: "1px solid var(--border-color)",
								borderRadius: 8
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
									size: 18,
									color: "var(--brand)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										flex: 1,
										minWidth: 0
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: 13,
											fontWeight: 600,
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap"
										},
										children: document.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: 11,
											color: "var(--text-muted)"
										},
										children: [
											document.uploaded,
											" · ",
											Math.max(1, Math.round(document.size / 1024)),
											" KB"
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "badge badge-info",
									children: document.access
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-ghost",
									onClick: () => remove(document),
									"aria-label": `Delete ${document.name}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 15 })
								})
							]
						}, document.id))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: uploadOpen,
				onClose: () => setUploadOpen(false),
				title: `Upload to ${employee?.full_name || "employee folder"}`,
				width: 520,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => setUploadOpen(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					onClick: upload,
					disabled: !file,
					children: "Upload document"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gap: 14
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Employee folder"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							style: field$1,
							value: selectedEmployee,
							onChange: (event) => setSelectedEmployee(event.target.value),
							children: employees.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: item.id,
								children: item.full_name
							}, item.id))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Document"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: fileInput,
							type: "file",
							style: {
								...field$1,
								padding: 8
							},
							onChange: (event) => setFile(event.target.files?.[0] || null)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Access restriction"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								style: field$1,
								value: access,
								onChange: (event) => setAccess(event.target.value),
								children: accessOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: option }, option))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									marginTop: 5,
									fontSize: 11,
									color: "var(--text-muted)"
								},
								children: "HR only keeps the document private. Employee + HR allows the employee to view it once employee self-service is enabled."
							})
						] })
					]
				})
			})
		]
	});
}
var money = (value) => `R ${Number(value || 0).toLocaleString("en-ZA", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
})}`;
var emptyRecord = (employee) => ({
	id: "",
	employee_id: employee?.id || "",
	employee: employee?.full_name || "",
	basic_salary: 0,
	sales_amount: 0,
	sales_percent: 0,
	incentive: 0,
	gift: 0,
	uif: 0,
	loan: 0,
	advance_salary: 0,
	period: (/* @__PURE__ */ new Date()).toISOString().slice(0, 7)
});
function totals(record) {
	const salesCommission = Number(record.sales_amount || 0) * (Number(record.sales_percent || 0) / 100);
	const gross = Number(record.basic_salary || 0) + salesCommission + Number(record.incentive || 0) + Number(record.gift || 0);
	const deductions = Number(record.uif || 0) + Number(record.loan || 0) + Number(record.advance_salary || 0);
	return {
		salesCommission,
		gross,
		deductions,
		net: gross - deductions
	};
}
function Payroll() {
	const [records, setRecords] = useLocalStorage("hr.payroll_records", []);
	const [selectedEmployee, setSelectedEmployee] = (0, import_react.useState)(seedEmployees[0]?.id || "");
	const [form, setForm] = (0, import_react.useState)(null);
	const employee = seedEmployees.find((item) => item.id === selectedEmployee) || seedEmployees[0];
	const selectedRecords = records.filter((record) => record.employee_id === selectedEmployee);
	const monthTotal = (0, import_react.useMemo)(() => selectedRecords.reduce((sum, record) => sum + totals(record).net, 0), [selectedRecords]);
	const save = (event) => {
		event.preventDefault();
		const next = {
			...form,
			employee_id: selectedEmployee,
			employee: employee.full_name
		};
		setRecords((previous) => next.id ? previous.map((record) => record.id === next.id ? next : record) : [{
			...next,
			id: uid("PAY")
		}, ...previous]);
		setForm(null);
	};
	const remove = (record) => {
		if (window.confirm(`Delete payroll record for ${record.employee}?`)) setRecords((previous) => previous.filter((item) => item.id !== record.id));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardLayout, {
		title: "Payroll Platform",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card",
				style: { marginBottom: 16 },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						gap: 12,
						alignItems: "center",
						flexWrap: "wrap"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 16,
							fontWeight: 700
						},
						children: "Payroll workspace"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 12,
							color: "var(--text-secondary)",
							marginTop: 4
						},
						children: "Calculate sales commission, incentives, gifts, deductions and net pay by employee and month."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "badge badge-purple",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { size: 12 }), " HR controlled"]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "minmax(210px, .7fr) minmax(0, 1.8fr)",
					gap: 16,
					alignItems: "start"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					style: { padding: 10 },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							padding: "8px 10px",
							fontSize: 11,
							color: "var(--text-muted)",
							textTransform: "uppercase",
							letterSpacing: ".08em",
							fontWeight: 700
						},
						children: "Employees"
					}), seedEmployees.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setSelectedEmployee(item.id),
						style: {
							width: "100%",
							display: "flex",
							alignItems: "center",
							gap: 10,
							padding: 10,
							border: 0,
							borderRadius: 8,
							background: selectedEmployee === item.id ? "var(--brand-soft)" : "transparent",
							color: "var(--text-primary)",
							textAlign: "left",
							cursor: "pointer"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, {
							size: 16,
							color: "var(--brand)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								flex: 1,
								fontSize: 12,
								fontWeight: 600
							},
							children: item.full_name
						})]
					}, item.id))]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								gap: 10,
								alignItems: "start",
								marginBottom: 14
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 18,
									fontWeight: 700
								},
								children: employee?.full_name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 12,
									color: "var(--text-secondary)"
								},
								children: employee?.role
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "btn btn-primary",
								onClick: () => setForm(emptyRecord(employee)),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 15 }), " New payroll"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card",
							style: {
								padding: 14,
								background: "var(--bg-secondary)",
								marginBottom: 14
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 11,
									color: "var(--text-muted)",
									textTransform: "uppercase"
								},
								children: "Selected records net total"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 25,
									fontWeight: 800,
									color: "var(--brand)",
									marginTop: 3
								},
								children: money(monthTotal)
							})]
						}),
						selectedRecords.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								padding: "25px 10px",
								textAlign: "center",
								color: "var(--text-muted)",
								fontSize: 13
							},
							children: "No payroll records yet for this employee."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "grid",
								gap: 8
							},
							children: selectedRecords.map((record) => {
								const calculated = totals(record);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										border: "1px solid var(--border-color)",
										borderRadius: 8,
										padding: 12
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											justifyContent: "space-between",
											gap: 10,
											alignItems: "center"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: record.period }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												fontSize: 11,
												color: "var(--text-muted)",
												marginTop: 3
											},
											children: [
												"Basic ",
												money(record.basic_salary),
												" · Sales commission ",
												money(calculated.salesCommission)
											]
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
											style: { color: "var(--brand)" },
											children: money(calculated.net)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											flexWrap: "wrap",
											gap: 6,
											marginTop: 10,
											fontSize: 11
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "badge badge-info",
												children: ["Gross ", money(calculated.gross)]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "badge badge-warning",
												children: ["Deductions ", money(calculated.deductions)]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: "btn btn-ghost",
												onClick: () => setForm(record),
												children: "Edit"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: "btn btn-ghost",
												style: { color: "var(--danger)" },
												onClick: () => remove(record),
												"aria-label": "Delete payroll record",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 14 })
											})
										]
									})]
								}, record.id);
							})
						})
					]
				})]
			}),
			form && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: true,
				onClose: () => setForm(null),
				title: `Payroll — ${employee?.full_name}`,
				subtitle: "All amounts are in South African Rand (ZAR).",
				width: 700,
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-ghost",
					onClick: () => setForm(null),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary",
					type: "submit",
					form: "payroll-form",
					children: "Save payroll"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					id: "payroll-form",
					onSubmit: save,
					style: {
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 12
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Pay period"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							type: "month",
							style: field$1,
							value: form.period,
							onChange: (event) => setForm({
								...form,
								period: event.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Basic salary"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							min: "0",
							type: "number",
							step: "0.01",
							style: field$1,
							value: form.basic_salary,
							onChange: (event) => setForm({
								...form,
								basic_salary: event.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Sales amount"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							min: "0",
							type: "number",
							step: "0.01",
							style: field$1,
							value: form.sales_amount,
							onChange: (event) => setForm({
								...form,
								sales_amount: event.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Sales %"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							min: "0",
							type: "number",
							step: "0.01",
							style: field$1,
							value: form.sales_percent,
							onChange: (event) => setForm({
								...form,
								sales_percent: event.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Incentive"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							min: "0",
							type: "number",
							step: "0.01",
							style: field$1,
							value: form.incentive,
							onChange: (event) => setForm({
								...form,
								incentive: event.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Gift"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							min: "0",
							type: "number",
							step: "0.01",
							style: field$1,
							value: form.gift,
							onChange: (event) => setForm({
								...form,
								gift: event.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "UIF deduction"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							min: "0",
							type: "number",
							step: "0.01",
							style: field$1,
							value: form.uif,
							onChange: (event) => setForm({
								...form,
								uif: event.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Loan deduction"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							min: "0",
							type: "number",
							step: "0.01",
							style: field$1,
							value: form.loan,
							onChange: (event) => setForm({
								...form,
								loan: event.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Advance salary deduction"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							min: "0",
							type: "number",
							step: "0.01",
							style: field$1,
							value: form.advance_salary,
							onChange: (event) => setForm({
								...form,
								advance_salary: event.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								gridColumn: "1 / -1",
								padding: 12,
								borderRadius: 8,
								background: "var(--bg-secondary)"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										fontSize: 13
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sales commission" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: money(totals(form).salesCommission) })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										fontSize: 13,
										marginTop: 6
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Gross pay" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: money(totals(form).gross) })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										fontSize: 15,
										marginTop: 8,
										color: "var(--brand)"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Net pay" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: money(totals(form).net) })]
								})
							]
						})
					]
				})
			})
		]
	});
}
function App() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Routes, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/host",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HostDashboard, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/learners",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlacedLearners, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/marketplace",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Marketplace, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/recruitment",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HostRecruitment, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/workforce",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Workforce, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/kpi",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KPI, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/contracts",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Contracts, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/coaching",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coaching, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/performance",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Performance, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/onboarding",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Onboarding, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/calendar",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/schedule",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/host/calendar",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/projects",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Projects, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/tasks",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tasks, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/documents",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Documents$1, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/messages",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Messages, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/reports",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reports, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/company",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompanyProfile, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/check",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HostCheck, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/settings",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings$1, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/attendance",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/hr/attendance",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/hr",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HRDashboard, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/hr/attendance",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HRAttendance, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/hr/leave",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leave, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/hr/timesheets",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timesheets, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/hr/relations",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Relations, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/hr/recruitment",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Recruitment, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/hr/talent",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Talent, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/hr/training",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Training, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/hr/performance",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HRPerformance, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/hr/admin",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HRAdmin, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/hr/integrations",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HRIntegrations, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/hr/documents",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Documents, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/hr/payroll",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Payroll, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/hr/leave",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/hr/leave",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/hr/timesheets",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/hr/timesheets",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/hr/relations",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/hr/relations",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/hr/recruitment",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/hr/recruitment",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/hr/talent",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/hr/talent",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/host/hr/training",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/hr/training",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "*",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/host",
				replace: true
			})
		})
	] });
}
/**
* Mounts the ported Host + HR portal inside the MSP shell.
*
* The portal was authored as a standalone Vite app using react-router-dom
* BrowserRouter. Converting 30+ pages to TanStack file routes would be a
* multi-day rewrite, so we run its internal router in a MemoryRouter,
* scoped inside `.host-portal-root` so styles/tokens don't leak.
*/
function HostPortalEmbedded({ initialPath = "/host" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "host-portal-root",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemoryRouter, {
			initialEntries: [initialPath],
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(App, {})
		}) }) })
	});
}
//#endregion
export { HostPortalEmbedded as t };
