import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as cn } from "./button-D_VAx1TB.mjs";
import { t as supabase } from "./client-yJUBr8rP.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-profile-CeWEBsPJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Card = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("rounded-lg border bg-card text-card-foreground shadow-sm", className),
	...props
}));
Card.displayName = "Card";
var CardHeader = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex flex-col space-y-1.5 p-6", className),
	...props
}));
CardHeader.displayName = "CardHeader";
var CardTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("font-semibold leading-none tracking-tight", className),
	...props
}));
CardTitle.displayName = "CardTitle";
var CardDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
CardDescription.displayName = "CardDescription";
var CardContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("p-6 pt-0", className),
	...props
}));
CardContent.displayName = "CardContent";
var CardFooter = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex items-center p-6 pt-0", className),
	...props
}));
CardFooter.displayName = "CardFooter";
function useProfile() {
	return useQuery({
		queryKey: ["profile"],
		queryFn: async () => {
			let user = null;
			try {
				const { data: u } = await supabase.auth.getUser();
				user = u?.user ?? null;
			} catch (e) {
				console.warn("Error fetching user in useProfile:", e);
			}
			if (!user && typeof window !== "undefined") {
				const demo = localStorage.getItem("msp.demoUser");
				if (demo) try {
					user = JSON.parse(demo);
				} catch {}
			}
			if (!user) return null;
			let profile = null;
			let roles = [];
			try {
				const [{ data: p }, { data: r }] = await Promise.all([supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(), supabase.from("user_roles").select("role").eq("user_id", user.id)]);
				profile = p;
				roles = r ?? [];
			} catch (e) {
				console.warn("Error fetching profile from Supabase:", e);
			}
			const emailLower = (user.email || "").toLowerCase();
			const isSiphelele = emailLower.includes("siphelele") || emailLower.includes("malotana");
			const isHRUser = emailLower.includes("hr") || emailLower.includes("thandi");
			const selectedRole = typeof window !== "undefined" ? localStorage.getItem("msp.selectedPortal") || "staff" : "staff";
			const resolvedTier = isSiphelele ? "root_admin" : profile?.role_tier || (selectedRole === "admin" ? "root_admin" : selectedRole === "manager" ? "manager" : isHRUser ? "manager" : "staff");
			const defaultName = isSiphelele ? "Siphelele Malotana" : isHRUser ? "Thandi Mokoena" : user.user_metadata?.full_name || (user.email ? user.email.split("@")[0].replace(".", " ") : "Team Member");
			const resolvedProfile = profile || {
				id: user.id,
				full_name: defaultName,
				email: user.email || "siphelele.malotana@mavisstrategicpartners.co.za",
				phone: "+27 11 000 0000",
				avatar_url: null,
				department: isHRUser ? "Human Resources" : isSiphelele ? "Engineering & Operations" : "Staff Department",
				job_title: isHRUser ? "HR Manager" : isSiphelele ? "Software Engineer / Admin Lead" : "Staff Member",
				is_active: true,
				onboarding_completed: true,
				role_tier: resolvedTier
			};
			const isAdmin = roles.some((r) => r.role === "admin") || resolvedTier === "root_admin";
			return {
				user,
				profile: resolvedProfile,
				isAdmin,
				isHR: profile?.department === "Human Resources",
				roleTier: resolvedTier,
				isRootAdmin: resolvedTier === "root_admin",
				isManagerOrAbove: ["root_admin", "manager"].includes(resolvedTier)
			};
		},
		staleTime: 6e4
	});
}
//#endregion
export { useProfile as n, Card as t };
