import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime, d as DialogContent, f as DialogDescription, h as DialogTitle, l as Dialog, m as DialogPortal, p as DialogOverlay, u as DialogClose } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { r as cn, t as Button } from "./button-D_VAx1TB.mjs";
import { t as supabase } from "./client-yJUBr8rP.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $ as Compass, A as Map$1, C as Plus, Ct as Bot, F as ListTree, K as FilePenLine, N as Lock, O as MessageCircle, Ot as ArrowRight, S as PowerOff, St as Briefcase, T as PenLine, U as Gauge, X as ExternalLink, a as User, ct as CircleCheck, ft as ChevronUp, g as ShieldCheck, gt as ChartColumn, h as Sparkles, ht as Check, i as Users, it as ClipboardCheck, j as Mail, lt as CircleAlert, mt as ChevronDown, n as Wrench, nt as Clock, o as UserX, p as Tag, pt as ChevronRight, q as FileChartColumn, rt as ClipboardList, t as X, v as Send, w as Phone, wt as BookOpen, x as RotateCcw, xt as Building2, y as Search, yt as CalendarDays } from "../_libs/lucide-react.mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./server-DqrjEvo4.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-jv28EVVg.mjs";
import { a as stringType, i as objectType, n as booleanType, r as enumType } from "../_libs/zod.mjs";
import { n as useProfile, t as Card } from "./use-profile-BAMyUr1m.mjs";
import { t as Input } from "./input-CyugdGDp.mjs";
import { n as AvatarFallback, t as Avatar } from "./avatar-CjSr-yN4.mjs";
import { a as DialogTitle$1, i as DialogHeader, n as DialogContent$1, o as Label, r as DialogDescription$1, t as Dialog$1 } from "./label-CZlT6bkC.mjs";
import { n as format, t as parseISO } from "../_libs/date-fns.mjs";
import { n as CheckboxIndicator, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { i as Trigger, n as Portal, r as Root2, t as Content2 } from "../_libs/radix-ui__react-popover.mjs";
import { n as Root, t as Indicator } from "../_libs/radix-ui__react-progress.mjs";
import { a as SelectItemIndicator, c as SelectPortal, d as SelectSeparator$1, f as SelectTrigger$1, i as SelectItem$1, l as SelectScrollDownButton$1, m as SelectViewport, n as SelectContent$1, o as SelectItemText, p as SelectValue$1, r as SelectIcon, s as SelectLabel$1, t as Select$1, u as SelectScrollUpButton$1 } from "../_libs/@radix-ui/react-select+[...].mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
import { i as Trigger$1, n as List, r as Root2$1, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/portal-pages-CNZfpSVn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var createTeamMemberSchema = objectType({
	email: stringType().email(),
	password: stringType().min(8),
	fullName: stringType().min(2),
	jobTitle: stringType().optional(),
	department: stringType().optional(),
	accessLevel: enumType([
		"staff",
		"manager",
		"hr",
		"superadmin"
	]).default("staff"),
	role: enumType(["admin", "user"]).default("user")
});
var createTeamMember = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => createTeamMemberSchema.parse(data)).handler(createSsrRpc("94e3d6b0a5205320fd9ba8db5cb4203f6f544416368229f4eccd00021138b1f3"));
var updateTeamMemberSchema = objectType({
	userId: stringType().uuid(),
	fullName: stringType().optional(),
	jobTitle: stringType().nullable().optional(),
	department: stringType().nullable().optional(),
	phone: stringType().nullable().optional(),
	isActive: booleanType().optional()
});
var updateTeamMember = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => updateTeamMemberSchema.parse(data)).handler(createSsrRpc("1b1bce20e53e7468d01059b612ffc15445ca64b555906f1f7ff85e9f7623c910"));
var setRoleSchema = objectType({
	userId: stringType().uuid(),
	makeAdmin: booleanType()
});
var setAdminRole = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => setRoleSchema.parse(data)).handler(createSsrRpc("187914f9251ed9244b70b0dd4cad9ddd430053b8a038071b8d1807b7fc91e2e2"));
var alertVariants = cva("relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7", {
	variants: { variant: {
		default: "bg-background text-foreground",
		destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
	} },
	defaultVariants: { variant: "default" }
});
var Alert = import_react.forwardRef(({ className, variant, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	role: "alert",
	className: cn(alertVariants({ variant }), className),
	...props
}));
Alert.displayName = "Alert";
var AlertTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
	ref,
	className: cn("mb-1 font-medium leading-none tracking-tight", className),
	...props
}));
AlertTitle.displayName = "AlertTitle";
var AlertDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("text-sm [&_p]:leading-relaxed", className),
	...props
}));
AlertDescription.displayName = "AlertDescription";
var badgeVariants = cva("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
		secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
		destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
		outline: "text-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
var Popover = Root2;
var PopoverTrigger = Trigger;
var PopoverContent = import_react.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	align,
	sideOffset,
	className: cn("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)", className),
	...props
}) }));
PopoverContent.displayName = Content2.displayName;
var Progress = import_react.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Indicator, {
		className: "h-full w-full flex-1 bg-primary transition-all",
		style: { transform: `translateX(-${100 - (value || 0)}%)` }
	})
}));
Progress.displayName = Root.displayName;
var Select = Select$1;
var SelectValue = SelectValue$1;
var SelectTrigger = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
	ref,
	className: cn("flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 opacity-50" })
	})]
}));
SelectTrigger.displayName = SelectTrigger$1.displayName;
var SelectScrollUpButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4" })
}));
SelectScrollUpButton.displayName = SelectScrollUpButton$1.displayName;
var SelectScrollDownButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" })
}));
SelectScrollDownButton.displayName = SelectScrollDownButton$1.displayName;
var SelectContent = import_react.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent$1, {
	ref,
	className: cn("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
	position,
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
			className: cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton, {})
	]
}) }));
SelectContent.displayName = SelectContent$1.displayName;
var SelectLabel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectLabel$1, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", className),
	...props
}));
SelectLabel.displayName = SelectLabel$1.displayName;
var SelectItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
	ref,
	className: cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children })]
}));
SelectItem.displayName = SelectItem$1.displayName;
var SelectSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSeparator$1, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
SelectSeparator.displayName = SelectSeparator$1.displayName;
var Sheet = Dialog;
var SheetPortal = DialogPortal;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = DialogOverlay.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = import_react.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	}), children]
})] }));
SheetContent.displayName = DialogContent.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = DialogTitle.displayName;
var SheetDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = DialogDescription.displayName;
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = Switch$1.displayName;
var Table = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: "relative w-full overflow-auto",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
		ref,
		className: cn("w-full caption-bottom text-sm", className),
		...props
	})
}));
Table.displayName = "Table";
var TableHeader = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
	ref,
	className: cn("[&_tr]:border-b", className),
	...props
}));
TableHeader.displayName = "TableHeader";
var TableBody = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
	ref,
	className: cn("[&_tr:last-child]:border-0", className),
	...props
}));
TableBody.displayName = "TableBody";
var TableFooter = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", {
	ref,
	className: cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className),
	...props
}));
TableFooter.displayName = "TableFooter";
var TableRow = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
	ref,
	className: cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className),
	...props
}));
TableRow.displayName = "TableRow";
var TableHead = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
	ref,
	className: cn("h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className),
	...props
}));
TableHead.displayName = "TableHead";
var TableCell = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
	ref,
	className: cn("p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className),
	...props
}));
TableCell.displayName = "TableCell";
var TableCaption = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("caption", {
	ref,
	className: cn("mt-4 text-sm text-muted-foreground", className),
	...props
}));
TableCaption.displayName = "TableCaption";
var Tabs = Root2$1;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className),
	...props
}));
TabsList.displayName = List.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger$1, {
	ref,
	className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className),
	...props
}));
TabsTrigger.displayName = Trigger$1.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
	ref,
	className: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className),
	...props
}));
TabsContent.displayName = Content.displayName;
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
async function copyToClipboard(text, successMessage) {
	try {
		await navigator.clipboard.writeText(text);
		toast.success(successMessage);
	} catch {
		toast.info(text);
	}
}
var DEPARTMENTS = [
	"CEO",
	"Managing Director",
	"Operations Manager",
	"Client Relationship Manager",
	"Sales Team",
	"Social Media Manager",
	"Admin Department",
	"Human Resources",
	"Graphics Team",
	"Marketing Team",
	"IT Department",
	"Intern"
];
var DEPARTMENT_META = {
	"CEO": {
		purpose: "Sets vision, direction and final approvals across the company.",
		reports_to: "The board / founder"
	},
	"Managing Director": {
		purpose: "Owns day-to-day execution against the CEO's strategy.",
		reports_to: "CEO"
	},
	"Operations Manager": {
		purpose: "Runs delivery, workflows and cross-team coordination.",
		reports_to: "Managing Director"
	},
	"Client Relationship Manager": {
		purpose: "Owns client retention, communication and reporting rhythm.",
		reports_to: "Operations Manager"
	},
	"Sales Team": {
		purpose: "Books, qualifies and closes new business.",
		reports_to: "Managing Director"
	},
	"Social Media Manager": {
		purpose: "Plans, produces and publishes client social content.",
		reports_to: "Operations Manager"
	},
	"Admin Department": {
		purpose: "Invoicing, finance, HR admin and internal systems.",
		reports_to: "Managing Director"
	},
	"Human Resources": {
		purpose: "People, culture, leave, declarations and onboarding.",
		reports_to: "Managing Director"
	},
	"Graphics Team": {
		purpose: "Designs all client and internal visual assets — social graphics, ad creatives, presentation materials.",
		reports_to: "Operations Manager"
	},
	"Marketing Team": {
		purpose: "Owns MSP's own brand marketing, lead generation, and market positioning — separate from client campaign work.",
		reports_to: "Managing Director"
	},
	"IT Department": {
		purpose: "Manages internal tools, portal infrastructure, hosting, domains, and technical support for the team.",
		reports_to: "Operations Manager"
	},
	"Intern": {
		purpose: "Learning across departments and supporting live delivery.",
		reports_to: "Assigned mentor / Operations Manager"
	}
};
var ROADMAP = [
	{
		title: "Contract signed",
		owner: "Sales",
		detail: "Signed proposal, invoice, payment confirmation and kickoff handover."
	},
	{
		title: "Welcome + setup",
		owner: "Operations",
		detail: "Welcome message, GHL sub-account, folders, channels and access list."
	},
	{
		title: "Kickoff call",
		owner: "CRM",
		detail: "Confirm goals, offer, audience, assets, timelines and approval process."
	},
	{
		title: "Strategy document",
		owner: "Operations",
		detail: "Translate business goals into funnel, content, tracking and reporting plan."
	},
	{
		title: "Build phase",
		owner: "Delivery",
		detail: "Campaigns, websites, automations, forms, pixels, integrations and QA."
	},
	{
		title: "Launch",
		owner: "Operations",
		detail: "Final checklist, client approval, budgets live, monitoring window scheduled."
	},
	{
		title: "Optimise",
		owner: "Delivery",
		detail: "Weekly checks, creative refresh, CRM hygiene, client updates and escalations."
	},
	{
		title: "Report + retain",
		owner: "CRM",
		detail: "Monthly report by the 7th, call, upsell triggers and retention plan."
	}
];
var FAQS = [
	{
		q: "Do we guarantee leads?",
		a: "No. We sell a system: offer, tracking, creative, follow-up and optimisation. We forecast honestly and improve from data."
	},
	{
		q: "Who pays ad spend?",
		a: "The client pays platforms directly. MSP never handles ad spend money."
	},
	{
		q: "How fast should leads be contacted?",
		a: "Within 10 minutes at minimum; within 5 minutes where possible. Speed is a sales advantage."
	},
	{
		q: "Can clients use stock images?",
		a: "Only as a last resort. Real photos and videos from the client usually outperform generic content."
	},
	{
		q: "When does SEO work?",
		a: "Local SEO can move in 4–8 weeks. Full SEO usually takes 3–6 months or longer in competitive industries."
	}
];
var CONTENT_TABLES = [
	"sops",
	"services",
	"packages",
	"pricing_items",
	"tools",
	"glossary_terms",
	"sales_faq"
];
var PRICING_TAB_ORDER = [
	"Monthly Marketing Retainers",
	"Website Development (once-off)",
	"CRM & Automation Setup (once-off)",
	"SEO",
	"Social Media Add-Ons",
	"AI Chatbot & Integrations",
	"Mobile App Development",
	"Standalone / One-Off Services"
];
function pageTitle(icon, eyebrow, title, description) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(icon, { className: "h-3.5 w-3.5" }),
					" ",
					eyebrow
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 text-3xl font-bold tracking-tight md:text-4xl",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-3xl text-sm text-muted-foreground md:text-base",
				children: description
			})
		] })
	});
}
function EmptyState({ title, description }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "border-dashed p-8 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "mx-auto h-8 w-8 text-muted-foreground" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-3 text-lg font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: description
			})
		]
	});
}
function useTable(key, table, order = "sort_order") {
	return useQuery({
		queryKey: [key],
		queryFn: async () => {
			try {
				const { data, error } = await supabase.from(table).select("*").order(order, { ascending: true });
				if (error) {
					console.warn(`Error querying table ${table}:`, error);
					return [];
				}
				return data ?? [];
			} catch (err) {
				console.warn(`Query exception for table ${table}:`, err);
				return [];
			}
		},
		staleTime: 6e4
	});
}
function splitText(value) {
	if (!value) return [];
	return value.split(/\s*·\s*|\n|;\s*/).map((part) => part.trim()).filter(Boolean);
}
function parseNumberedSteps(text) {
	if (!text) return [];
	return text.split(/\n+/).map((l) => l.trim()).filter(Boolean).map((line) => line.replace(/^\d+\.\s*/, ""));
}
function WhoWeArePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [pageTitle(Compass, "Company OS", "Who We Are", "Mavis Strategic Partners is a growth systems partner: marketing, websites, automation, apps and AI built around measurable outcomes."), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-[1.2fr_0.8fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-semibold",
						children: "Internal operating promise"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm leading-6 text-muted-foreground",
						children: "We do not run random campaigns. We build systems that help clients capture leads, respond fast, convert better and retain more customers. Every team member works from SOPs, reports through the correct channel and escalates with a recommended solution."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 grid gap-3 sm:grid-cols-2",
						children: [
							["Leads over followers", "Revenue beats vanity metrics."],
							["Systems over campaigns", "A repeatable machine beats one-off work."],
							["Automation over manual work", "If it can be automated, it should be."],
							["Data over opinions", "Numbers decide. Opinions guide."]
						].map(([title, desc]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md border border-border bg-secondary/30 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold",
								children: title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: desc
							})]
						}, title))
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-semibold",
						children: "Escalation rule"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm leading-6 text-muted-foreground",
						children: "Problems move upward only with context, options and a recommended decision. Client threats, legal risk, budget decisions and unresolved performance issues must be escalated fast."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 space-y-3",
						children: DEPARTMENTS.slice(0, 5).map((department, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-xs font-bold text-primary",
								children: index + 1
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: department })]
						}, department))
					})
				]
			})]
		})]
	});
}
var SERVICE_TOOL_MAP = {
	"meta-ads": "meta-business",
	"facebook-ads": "meta-business",
	"google-ads": "google-ads",
	"tiktok-ads": "tiktok-ads",
	"social-media": "meta-business",
	"crm-automation": "gohighlevel",
	"chatbots": "gohighlevel",
	"seo": "google-ads",
	"web-development": "gohighlevel",
	"reporting": "gohighlevel"
};
function ServicesPage() {
	const { data = [], isLoading } = useTable("services", "services");
	const { data: tools = [] } = useTable("tools-svc", "tools");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [pageTitle(Briefcase, "Offer library", "Our Services", "The approved services MSP sells, with a step-by-step of exactly how we deliver each one — plus direct links to the tools and pages that back them up."), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Loading services",
		description: "Pulling the latest service library."
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-4",
		children: data.map((service) => {
			const steps = parseNumberedSteps(service.what_we_do);
			const toolSlug = SERVICE_TOOL_MAP[service.slug];
			const relatedTool = toolSlug ? tools.find((t) => t.slug === toolSlug) : void 0;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5 sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-xl font-semibold",
								children: service.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-primary",
								children: service.tagline
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: "w-fit",
							children: "Service"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3 sm:gap-4 md:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md border border-border bg-secondary/30 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
									children: "Who it's for"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm",
									children: service.who_for
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md border border-border bg-secondary/30 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
									children: "Client receives"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm",
									children: service.client_receives
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md border border-primary/30 bg-primary/5 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold uppercase tracking-wide text-primary",
									children: "Outcome"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm",
									children: service.outcome
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
							children: "What we do — step by step"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mt-3 space-y-2",
							children: steps.length ? steps.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex gap-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary",
									children: i + 1
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "leading-6",
									children: step
								})]
							}, i)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "text-sm text-muted-foreground",
								children: "Steps not yet documented."
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex flex-wrap gap-2 border-t border-border pt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/pricing",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "mr-2 h-4 w-4" }), " See pricing"]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/sops",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "mr-2 h-4 w-4" }), " SOP for this"]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/roadmap",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map$1, { className: "mr-2 h-4 w-4" }), " Delivery roadmap"]
								})
							}),
							relatedTool?.login_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: relatedTool.login_url,
								target: "_blank",
								rel: "noreferrer",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "mr-2 h-4 w-4" }),
										" Open ",
										relatedTool.name
									]
								})
							})
						]
					})
				]
			}, service.id);
		})
	})] });
}
function PricingPage() {
	const { data: packages = [] } = useTable("packages", "packages");
	const { data: items = [] } = useTable("pricing-items", "pricing_items");
	const grouped = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const item of items) {
			const list = map.get(item.section) ?? [];
			list.push(item);
			map.set(item.section, list);
		}
		return map;
	}, [items]);
	const sections = ["Monthly Marketing Retainers", ...PRICING_TAB_ORDER.slice(1).filter((s) => grouped.has(s))];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		pageTitle(Tag, "Rate card", "Pricing & Packages", "The full internal price list — monthly retainers plus every à la carte service. Every figure is editable by admins."),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: sections[0],
			className: "w-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList, {
					className: "flex h-auto flex-wrap justify-start gap-1",
					children: sections.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: s,
						className: "text-xs",
						children: s
					}, s))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "Monthly Marketing Retainers",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
						children: packages.map((pkg, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: cn("p-5", index === 2 && "border-primary/40 bg-primary/5"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: index === 2 ? "default" : "outline",
									children: index === 2 ? "Popular" : "Retainer"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-4 text-xl font-semibold",
									children: pkg.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-3xl font-bold tracking-tight text-primary",
									children: pkg.price
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm text-muted-foreground",
									children: pkg.best_for
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "mt-5 w-full",
									variant: index === 2 ? "default" : "outline",
									onClick: () => copyToClipboard(`${pkg.name} — ${pkg.price}: ${pkg.best_for ?? ""}`, "Package copied for proposal"),
									children: "Use in proposal"
								})
							]
						}, pkg.id))
					})
				}),
				PRICING_TAB_ORDER.slice(1).map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: section,
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "p-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "w-1/3",
								children: "Item"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Description" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "w-1/5 text-right",
								children: "Price"
							})
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: (grouped.get(section) ?? []).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-medium",
								children: row.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-sm text-muted-foreground",
								children: row.description
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right font-semibold text-primary",
								children: row.price
							})
						] }, row.id)) })] })
					})
				}, section))
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
			className: "mt-6 border-primary/20 bg-primary/5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Never included in packages" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: "Ad spend (paid directly by the client to the platform), CRM setup & automation (unless on Scale Plus / Elite Unlimited), website development, and mobile app development — these are always scoped and quoted individually." })
			]
		})
	] });
}
function GlossaryPage() {
	const { data = [] } = useTable("glossary", "glossary_terms", "term");
	const { data: tools = [] } = useTable("tools-lookup", "tools");
	const [query, setQuery] = (0, import_react.useState)("");
	const [active, setActive] = (0, import_react.useState)(null);
	const filtered = data.filter((item) => `${item.term} ${item.definition}`.toLowerCase().includes(query.toLowerCase()));
	const activeTool = active ? tools.find((t) => t.slug === active.tool_slug) : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		pageTitle(ListTree, "Language", "Glossary", "Every acronym, metric and delivery term used at MSP — click any term for the full breakdown and how to act on it."),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mb-4 max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "pl-9",
				placeholder: "Search terms…",
				value: query,
				onChange: (e) => setQuery(e.target.value)
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 md:grid-cols-2 xl:grid-cols-3",
			children: filtered.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setActive(item),
				className: "text-left",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4 transition hover:border-primary/40 hover:shadow-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold",
							children: item.term
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4 text-muted-foreground" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground line-clamp-2",
						children: item.definition
					})]
				})
			}, item.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
			open: !!active,
			onOpenChange: (o) => !o && setActive(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetContent, {
				className: "w-full sm:max-w-lg overflow-y-auto",
				children: active && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
					className: "text-2xl",
					children: active.term
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: active.definition })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xs font-semibold uppercase tracking-wide text-primary",
							children: "Full definition"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-6",
							children: active.full_definition || active.definition
						})] }),
						active.why_it_matters && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xs font-semibold uppercase tracking-wide text-primary",
							children: "Why it matters at MSP"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-6 text-muted-foreground",
							children: active.why_it_matters
						})] }),
						active.how_to_steps && active.how_to_steps.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xs font-semibold uppercase tracking-wide text-primary",
							children: "How to work with this — step by step"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mt-2 space-y-2",
							children: active.how_to_steps.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex gap-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary",
									children: i + 1
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "leading-6",
									children: step
								})]
							}, i))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "flex flex-wrap gap-2",
							children: [activeTool && activeTool.login_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: activeTool.login_url,
								target: "_blank",
								rel: "noreferrer",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "mr-2 h-4 w-4" }),
										" Open ",
										activeTool.name
									]
								})
							}), active.service_slug && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/services",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, { className: "mr-2 h-4 w-4" }), " Related service"]
								})
							})]
						})
					]
				})] })
			})
		})
	] });
}
function SopsPage() {
	const { data = [], isLoading } = useTable("sops", "sops");
	const [department, setDepartment] = (0, import_react.useState)("all");
	const filtered = department === "all" ? data : data.filter((sop) => sop.department === department);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		pageTitle(BookOpen, "How we work", "SOP Library", "Department roles, reporting lines, KPIs, operating rhythms and key procedures from the master portal document."),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4 max-w-xs",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: department,
				onValueChange: setDepartment,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Department" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: "all",
					children: "All departments"
				}), DEPARTMENTS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: item,
					children: item
				}, item))] })]
			})
		}),
		isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Loading SOPs",
			description: "Pulling the latest SOP library."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-4",
			children: filtered.map((sop) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 md:flex-row md:items-start md:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							children: sop.department
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-3 text-xl font-semibold",
							children: sop.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: sop.role_purpose
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm text-muted-foreground md:text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground",
								children: "Reports to:"
							}),
							" ",
							sop.reports_to || "—"
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground",
								children: "Tools:"
							}),
							" ",
							sop.primary_tools || "—"
						] })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
					defaultValue: "responsibilities",
					className: "mt-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
							className: "flex h-auto flex-wrap justify-start",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "responsibilities",
									children: "Responsibilities"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "rhythm",
									children: "Rhythm"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "sops",
									children: "Key SOPs"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "kpis",
									children: "KPIs"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "responsibilities",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BulletList, {
								items: splitText(sop.core_responsibilities),
								fallback: sop.core_responsibilities
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "rhythm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-6 text-muted-foreground",
								children: sop.daily_weekly_monthly
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "sops",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-6 text-muted-foreground",
								children: sop.key_sops
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "kpis",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BulletList, {
								items: splitText(sop.kpis),
								fallback: sop.kpis
							})
						})
					]
				})]
			}, sop.id))
		})
	] });
}
function BulletList({ items, fallback }) {
	if (!items.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: fallback || "No details added yet."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "grid gap-2 text-sm text-muted-foreground md:grid-cols-2",
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mt-0.5 h-4 w-4 shrink-0 text-primary" }), item]
		}, item))
	});
}
function RoadmapPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [pageTitle(Map$1, "Client delivery", "Client Build Roadmap", "The standard path from signed client to launch, optimisation and retention."), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-4 md:grid-cols-2",
		children: ROADMAP.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "p-5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground",
					children: index + 1
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-semibold",
								children: step.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								children: step.owner
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: step.detail
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/sops",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									className: "h-7 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "mr-1.5 h-3 w-3" }),
										" ",
										step.owner,
										" SOP"
									]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/tools",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									className: "h-7 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "mr-1.5 h-3 w-3" }), " Tools"]
								})
							})]
						})
					]
				})]
			})
		}, step.title))
	})] });
}
var CATEGORY_ORDER = [
	"CRM",
	"Ads & Social",
	"Ads",
	"Analytics",
	"SEO",
	"Tracking",
	"Local SEO",
	"Finance",
	"Internal Comms",
	"Files",
	"Client Comms",
	"Design",
	"AI Reporting",
	"Admin/Infra"
];
function ToolsPage() {
	const { data = [] } = useTable("tools", "tools");
	const { data: profileData } = useProfile();
	const isAdmin = profileData?.isAdmin ?? false;
	const visible = data.filter((t) => !t.admin_only || isAdmin);
	const grouped = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const t of visible) {
			const cat = t.category || "Other";
			const list = map.get(cat) ?? [];
			list.push(t);
			map.set(cat, list);
		}
		return map;
	}, [visible]);
	const orderedCats = [...CATEGORY_ORDER.filter((c) => grouped.has(c)), ...[...grouped.keys()].filter((c) => !CATEGORY_ORDER.includes(c))];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [pageTitle(Wrench, "Systems", "Tools & Systems", "Every approved company platform, grouped by category. Every card opens the tool's real login page in a new tab."), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-8",
		children: orderedCats.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground",
			children: cat
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
			children: (grouped.get(cat) ?? []).map((tool) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolCard, { tool }, tool.id))
		})] }, cat))
	})] });
}
function ToolCard({ tool }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-start justify-between gap-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "truncate text-base font-semibold",
							children: tool.name
						}), tool.admin_only && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "text-[10px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mr-1 h-2.5 w-2.5" }), " Admin"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: tool.category
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted-foreground line-clamp-2",
				children: tool.what_it_is
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: [tool.login_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: tool.login_url,
					target: "_blank",
					rel: "noreferrer",
					className: "inline-flex",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "mr-2 h-4 w-4" }), " Open login"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => setOpen((v) => !v),
					children: open ? "Hide details" : "How we use it"
				})]
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-2 border-t border-border pt-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: "What it is: "
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: tool.what_it_is
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: "Why we use it: "
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: tool.why_we_use
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: "How to set it up: "
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: tool.how_to_use
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: "Who uses it: "
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: tool.who_uses
					})] })
				]
			})
		]
	});
}
function DepartmentsPage() {
	const { data = [] } = useQuery({
		queryKey: ["all-profiles"],
		queryFn: async () => {
			const { data, error } = await supabase.from("profiles").select("*");
			if (error) throw error;
			return data ?? [];
		}
	});
	const byDept = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const p of data) {
			const d = p.department || "Unassigned";
			const list = map.get(d) ?? [];
			list.push(p);
			map.set(d, list);
		}
		return map;
	}, [data]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [pageTitle(Building2, "Org structure", "Departments", "Every department, its purpose, who it reports to and who's currently in it. Click through to that department's SOP."), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
		children: DEPARTMENTS.map((dept) => {
			const meta = DEPARTMENT_META[dept];
			const members = byDept.get(dept) ?? [];
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-lg font-semibold",
							children: dept
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							children: members.length
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: meta?.purpose
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium text-foreground",
								children: "Reports to:"
							}),
							" ",
							meta?.reports_to
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-muted-foreground",
							children: "Team members"
						}), members.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: members.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 rounded-full border border-border bg-secondary/40 py-1 pl-1 pr-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
									className: "h-6 w-6",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
										className: "bg-primary/15 text-[10px] text-primary",
										children: dept === "CEO" ? "EX" : (m.full_name || m.email).slice(0, 2).toUpperCase()
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs",
									children: dept === "CEO" ? "Executive team" : m.full_name || m.email.split("@")[0]
								})]
							}, m.id))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs italic text-muted-foreground",
							children: "No one assigned yet."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/sops",
						className: "mt-4 inline-flex text-sm text-primary hover:underline",
						children: ["View SOP ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })]
					})
				]
			}, dept);
		})
	})] });
}
function ProfilePage() {
	const queryClient = useQueryClient();
	const { data } = useProfile();
	const profile = data?.profile;
	const [form, setForm] = (0, import_react.useState)({
		full_name: "",
		phone: ""
	});
	const [password, setPassword] = (0, import_react.useState)("");
	const [prefs, setPrefs] = (0, import_react.useState)({
		digest: true,
		logChat: true
	});
	const [declaration, setDeclaration] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (profile) setForm({
			full_name: profile.full_name || "",
			phone: profile.phone || ""
		});
	}, [profile?.id]);
	(0, import_react.useEffect)(() => {
		(async () => {
			const { data: rows } = await supabase.from("employee_declarations").select("*").order("submitted_at", { ascending: false }).limit(1);
			setDeclaration(rows?.[0] ?? null);
		})();
	}, []);
	const saveProfile = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.from("profiles").update({
				full_name: form.full_name,
				phone: form.phone || null
			}).eq("id", profile.id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Profile updated");
			queryClient.invalidateQueries({ queryKey: ["profile"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const changePassword = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.auth.updateUser({ password });
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Password updated");
			setPassword("");
		},
		onError: (e) => toast.error(e.message)
	});
	if (!profile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Loading profile",
		description: "One moment."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [pageTitle(User, "Workspace", "My Profile", "Everything about you in one scrollable panel — no tabs, no wizards."), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-2xl space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "p-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
						className: "h-16 w-16",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
							className: "bg-primary/15 text-lg text-primary",
							children: (profile.full_name || profile.email).slice(0, 2).toUpperCase()
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-lg font-semibold",
							children: profile.full_name || "Portal user"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: profile.email
						}),
						data?.isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							className: "mt-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mr-1 h-3 w-3" }), " Admin"]
						})
					] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold",
						children: "Your details"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Full name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.full_name,
								onChange: (e) => setForm({
									...form,
									full_name: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Phone" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.phone,
								onChange: (e) => setForm({
									...form,
									phone: e.target.value
								}),
								placeholder: "+27…"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Department" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: profile.department || "Not set",
									disabled: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: "Changed by an admin."
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Job title" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: profile.job_title || "Not set",
								disabled: true
							})] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4",
						disabled: saveProfile.isPending,
						onClick: () => saveProfile.mutate(),
						children: "Save changes"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-semibold",
					children: "Password"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "password",
						placeholder: "New password",
						value: password,
						onChange: (e) => setPassword(e.target.value)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: password.length < 8 || changePassword.isPending,
						onClick: () => changePassword.mutate(),
						children: "Update"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-semibold",
					children: "Notification preferences"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-md border border-border p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm",
							children: "Email digest"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: prefs.digest,
							onCheckedChange: (v) => setPrefs({
								...prefs,
								digest: v
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-md border border-border p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm",
							children: "Log chatbot conversations"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: prefs.logChat,
							onCheckedChange: (v) => setPrefs({
								...prefs,
								logChat: v
							})
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-semibold",
					children: "Non-Solicitation / HR Declaration"
				}), declaration ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-success flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }),
						" Completed on ",
						declaration.declaration_date
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Not yet completed."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/me/declaration",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							children: "Complete now"
						})
					})]
				})]
			})
		]
	})] });
}
function LeavePage() {
	const queryClient = useQueryClient();
	const { data: profileData } = useProfile();
	const { data = [] } = useQuery({
		queryKey: ["leave-requests"],
		queryFn: async () => {
			const { data: rows, error } = await supabase.from("leave_requests").select("*").order("created_at", { ascending: false });
			if (error) throw error;
			return rows ?? [];
		}
	});
	const [form, setForm] = (0, import_react.useState)({
		start: "",
		end: "",
		reason: ""
	});
	const submit = useMutation({
		mutationFn: async () => {
			const userId = profileData?.user?.id;
			if (!userId) throw new Error("You must be signed in.");
			const { error } = await supabase.from("leave_requests").insert({
				user_id: userId,
				start_date: form.start,
				end_date: form.end,
				reason: form.reason,
				status: "pending"
			});
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Leave request submitted");
			setForm({
				start: "",
				end: "",
				reason: ""
			});
			queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
		},
		onError: (error) => toast.error(error.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			pageTitle(CalendarDays, "HR", "Leave Requests", "Submit and track your leave requests inside the portal."),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: "New request"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-4 md:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Start date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: form.start,
								onChange: (e) => setForm((f) => ({
									...f,
									start: e.target.value
								}))
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "End date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: form.end,
								onChange: (e) => setForm((f) => ({
									...f,
									end: e.target.value
								}))
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "md:col-span-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Reason" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									value: form.reason,
									onChange: (e) => setForm((f) => ({
										...f,
										reason: e.target.value
									})),
									placeholder: "Family responsibility, annual leave, sick leave…"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4",
						disabled: !form.start || !form.end || !form.reason || submit.isPending,
						onClick: () => submit.mutate(),
						children: "Submit request"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "My requests"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Dates" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Reason" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: data.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [
						row.start_date,
						" → ",
						row.end_date
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: row.reason }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: row.status
					}) })
				] }, row.id)) })] })]
			})
		]
	});
}
function DeclarationPage() {
	const queryClient = useQueryClient();
	const { data: profileData } = useProfile();
	const [ack, setAck] = (0, import_react.useState)(false);
	const [signature, setSignature] = (0, import_react.useState)("");
	const [outsideWork, setOutsideWork] = (0, import_react.useState)("");
	const { data: existing } = useQuery({
		queryKey: ["declaration"],
		queryFn: async () => {
			const { data, error } = await supabase.from("employee_declarations").select("*").maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const submit = useMutation({
		mutationFn: async () => {
			const profile = profileData?.profile;
			const user = profileData?.user;
			if (!user) throw new Error("You must be signed in.");
			const { error } = await supabase.from("employee_declarations").insert({
				user_id: user.id,
				company_name: "Mavis Strategic Partners",
				employee_name: profile?.full_name || user.email || signature,
				position: profile?.job_title || "Team Member",
				id_number: "N/A",
				declaration_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				outside_employment_details: outsideWork || null,
				non_solicitation_months: 12,
				confidentiality_acknowledged: ack,
				signature_typed_name: signature
			});
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("HR declaration submitted");
			queryClient.invalidateQueries({ queryKey: ["declaration"] });
		},
		onError: (error) => toast.error(error.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			pageTitle(FilePenLine, "HR", "HR Documents", "Sign the internal confidentiality and conflict declaration."),
			existing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
				className: "border-primary/20 bg-primary/5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Declaration submitted" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, { children: [
						"Signed as ",
						existing.signature_typed_name,
						" on ",
						existing.declaration_date,
						"."
					] })
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: "Employee declaration"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: "I acknowledge confidentiality, non-solicitation and company information handling rules for Mavis Strategic Partners."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Outside employment / conflict details" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: outsideWork,
								onChange: (e) => setOutsideWork(e.target.value),
								placeholder: "Type none, or explain any outside work."
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-start gap-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									checked: ack,
									onCheckedChange: (value) => setAck(Boolean(value))
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "I understand and acknowledge the confidentiality declaration." })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Typed signature" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: signature,
								onChange: (e) => setSignature(e.target.value),
								placeholder: "Your full name"
							})] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "mt-4",
						disabled: !ack || signature.length < 2 || submit.isPending || Boolean(existing),
						onClick: () => submit.mutate(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "mr-2 h-4 w-4" }), " Submit declaration"]
					})
				]
			})
		]
	});
}
function TeamPage() {
	const queryClient = useQueryClient();
	const { data: profileData, isLoading: profileLoading } = useProfile();
	const [addOpen, setAddOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const isAdmin = profileData?.isAdmin ?? false;
	const { data = [] } = useQuery({
		queryKey: ["team"],
		queryFn: async () => {
			const [{ data: profiles }, { data: roles }] = await Promise.all([supabase.from("profiles").select("*").order("created_at", { ascending: false }), supabase.from("user_roles").select("*")]);
			const adminIds = new Set((roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));
			return (profiles ?? []).map((p) => ({
				...p,
				is_admin: adminIds.has(p.id)
			}));
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			pageTitle(Users, "Admin", "Team Management", "One table, one click. Add, edit, promote or deactivate — no wizards."),
			profileLoading ? null : isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setAddOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 h-4 w-4" }), " Add user"]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
				className: "border-primary/20 bg-primary/5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Admins only" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: "Only administrators can add or manage portal users." })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "p-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Name" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Email" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Department" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Role" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Last Login" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: data.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamRowActions, {
					row,
					onEdit: () => setEditing(row),
					canManage: isAdmin
				}, row.id)) })] })
			}),
			isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddUserDrawer, {
				open: addOpen,
				onOpenChange: setAddOpen,
				onCreated: () => queryClient.invalidateQueries({ queryKey: ["team"] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditUserDrawer, {
				row: editing,
				onClose: () => setEditing(null),
				onSaved: () => queryClient.invalidateQueries({ queryKey: ["team"] })
			})
		]
	});
}
function TeamRowActions({ row, onEdit, canManage }) {
	const queryClient = useQueryClient();
	const toggleAdmin = useMutation({
		mutationFn: () => setAdminRole({ data: {
			userId: row.id,
			makeAdmin: !row.is_admin
		} }),
		onSuccess: () => {
			toast.success(row.is_admin ? "Admin revoked" : "Admin granted");
			queryClient.invalidateQueries({ queryKey: ["team"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const toggleActive = useMutation({
		mutationFn: () => updateTeamMember({ data: {
			userId: row.id,
			isActive: !row.is_active
		} }),
		onSuccess: () => {
			toast.success(row.is_active ? "User deactivated" : "User reactivated");
			queryClient.invalidateQueries({ queryKey: ["team"] });
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-medium",
			children: row.full_name || "—"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs text-muted-foreground",
			children: row.job_title || "Team member"
		})] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-sm",
			children: row.email
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-sm",
			children: row.department || "—"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			variant: row.is_admin ? "default" : "outline",
			children: row.is_admin ? "Admin" : row.department === "Intern" ? "Intern" : "Staff"
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			variant: row.is_active ? "default" : "outline",
			className: row.is_active ? "" : "text-muted-foreground",
			children: row.is_active ? "Active" : "Inactive"
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-xs text-muted-foreground",
			children: row.last_login_at ? new Date(row.last_login_at).toLocaleDateString() : "—"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-right",
			children: canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-end gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: onEdit,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "h-3.5 w-3.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
						className: "w-64",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm",
							children: row.is_admin ? "Revoke admin rights?" : "Grant admin rights?"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							className: "mt-3 w-full",
							disabled: toggleAdmin.isPending,
							onClick: () => toggleAdmin.mutate(),
							children: row.is_admin ? "Revoke admin" : "Grant admin"
						})]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserX, { className: "h-3.5 w-3.5" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
						className: "w-64",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm",
							children: row.is_active ? "Deactivate this user?" : "Reactivate this user?"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							className: "mt-3 w-full",
							variant: row.is_active ? "destructive" : "default",
							disabled: toggleActive.isPending,
							onClick: () => toggleActive.mutate(),
							children: row.is_active ? "Deactivate" : "Reactivate"
						})]
					})] })
				]
			})
		})
	] });
}
function AddUserDrawer({ open, onOpenChange, onCreated }) {
	const [form, setForm] = (0, import_react.useState)({
		email: "",
		fullName: "",
		department: "Sales Team",
		jobTitle: "",
		accessLevel: "staff"
	});
	const [password, setPassword] = (0, import_react.useState)("");
	const create = useMutation({
		mutationFn: () => createTeamMember({ data: {
			...form,
			password: password || generateTempPassword(),
			role: "user"
		} }),
		onSuccess: () => {
			toast.success("Invite sent — user provisioned");
			onCreated();
			onOpenChange(false);
			setForm({
				email: "",
				fullName: "",
				department: "Sales Team",
				jobTitle: "",
				accessLevel: "staff"
			});
			setPassword("");
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			className: "w-full sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "Add user" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: "One form. Fires the invite immediately." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Full name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.fullName,
							onChange: (e) => setForm({
								...form,
								fullName: e.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "email",
							value: form.email,
							onChange: (e) => setForm({
								...form,
								email: e.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Department" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: form.department,
							onValueChange: (v) => setForm({
								...form,
								department: v
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: DEPARTMENTS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: d,
								children: d
							}, d)) })]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Access level" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: form.accessLevel,
							onValueChange: (v) => setForm({
								...form,
								accessLevel: v,
								...v === "hr" ? { department: "Human Resources" } : {}
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "staff",
									children: "Staff"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "manager",
									children: "Manager"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "hr",
									children: "HR"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "superadmin",
									children: "Superadmin"
								})
							] })]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Job title" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.jobTitle,
							onChange: (e) => setForm({
								...form,
								jobTitle: e.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Temporary password (optional)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "text",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							placeholder: "Leave blank to auto-generate"
						})] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "mt-6 w-full",
					disabled: !form.email || !form.fullName || create.isPending,
					onClick: () => create.mutate(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "mr-2 h-4 w-4" }), " Send invite"]
				})
			]
		})
	});
}
function generateTempPassword() {
	return "Msp" + Math.random().toString(36).slice(2, 10) + "!";
}
function EditUserDrawer({ row, onClose, onSaved }) {
	const [form, setForm] = (0, import_react.useState)({
		fullName: "",
		department: "",
		jobTitle: "",
		phone: "",
		isActive: true
	});
	(0, import_react.useEffect)(() => {
		if (row) setForm({
			fullName: row.full_name || "",
			department: row.department || "",
			jobTitle: row.job_title || "",
			phone: row.phone || "",
			isActive: row.is_active
		});
	}, [row?.id]);
	const save = useMutation({
		mutationFn: () => updateTeamMember({ data: {
			userId: row.id,
			fullName: form.fullName,
			department: form.department || null,
			jobTitle: form.jobTitle || null,
			phone: form.phone || null,
			isActive: form.isActive
		} }),
		onSuccess: () => {
			toast.success("User updated");
			onSaved();
			onClose();
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open: !!row,
		onOpenChange: (o) => !o && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			className: "w-full sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "Edit user" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: row?.email })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Full name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.fullName,
							onChange: (e) => setForm({
								...form,
								fullName: e.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Department" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: form.department,
							onValueChange: (v) => setForm({
								...form,
								department: v
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select department" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: DEPARTMENTS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: d,
								children: d
							}, d)) })]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Job title" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.jobTitle,
							onChange: (e) => setForm({
								...form,
								jobTitle: e.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Phone" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.phone,
							onChange: (e) => setForm({
								...form,
								phone: e.target.value
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between rounded-md border border-border p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm",
								children: "Active"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: form.isActive,
								onCheckedChange: (v) => setForm({
									...form,
									isActive: v
								})
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-6 w-full",
					disabled: save.isPending,
					onClick: () => save.mutate(),
					children: "Save"
				})
			]
		})
	});
}
function AuditPage() {
	const { data = [] } = useQuery({
		queryKey: ["audit-logs"],
		queryFn: async () => {
			const { data, error } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100);
			if (error) throw error;
			return data ?? [];
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [pageTitle(ShieldCheck, "Admin", "Audit Logs", "System events and admin actions recorded for accountability."), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "p-5",
		children: data.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Time" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Action" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Target" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Details" })
		] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: data.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: new Date(row.created_at).toLocaleString() }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: row.action }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: row.target_id || "—" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "max-w-xs truncate",
				children: JSON.stringify(row.details ?? {})
			})
		] }, row.id)) })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "No audit logs yet",
			description: "Admin actions will appear here as the portal is used."
		})
	})] });
}
function SalesPlaybookPage() {
	const services = useTable("services", "services").data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			pageTitle(ClipboardList, "Admin", "Sales Playbook", "Approved talk tracks, qualification rules and objection answers for MSP sales calls."),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[0.9fr_1.1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: "Qualification criteria"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BulletList, { items: [
						"Budget",
						"Intent",
						"Authority",
						"Timeline",
						"Need at least 3 of 4 before proposal"
					] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: "Proposal structure"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BulletList, { items: [
						"Problem",
						"Strategy",
						"Platforms",
						"Deliverables",
						"Pricing",
						"Outcomes",
						"Clear CTA"
					] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 md:grid-cols-2",
				children: FAQS.map((faq) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: faq.q
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: faq.a
					})]
				}, faq.q))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Service pitch shortcuts"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-3 md:grid-cols-2",
					children: services.map((service) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/services",
						className: "rounded-md border border-border p-3 transition hover:border-primary/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: service.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: service.tagline
						})]
					}, service.id))
				})]
			})
		]
	});
}
function KpisPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [pageTitle(ChartColumn, "Admin", "KPI Dashboards", "A lightweight operating scorecard until live BI dashboards are connected."), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4",
		children: [
			[
				"Client retention",
				90,
				"Target 90%+"
			],
			[
				"On-time reports",
				100,
				"Due by 7th"
			],
			[
				"Lead response",
				86,
				"Under 10 min"
			],
			[
				"SOP compliance",
				94,
				"Weekly audit"
			]
		].map(([name, value, note]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, { className: "h-5 w-5 text-primary" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted-foreground",
					children: name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-3xl font-bold",
					children: [value, "%"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
					className: "mt-3",
					value
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: note
				})
			]
		}, name))
	})] });
}
function ContentEditorPage() {
	const [table, setTable] = (0, import_react.useState)("services");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [pageTitle(PenLine, "Admin", "Content Editor", "Review portal content tables — quick verify before publishing SOP or pricing changes."), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Content status"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Every content table used in the portal."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: table,
					onValueChange: setTable,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "w-full md:w-56",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: CONTENT_TABLES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: item,
						children: item
					}, item)) })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContentPreview, { table })]
		})]
	});
}
function ContentPreview({ table }) {
	const { data = [] } = useQuery({
		queryKey: ["content-preview", table],
		queryFn: async () => {
			const { data, error } = await supabase.from(table).select("*").limit(8);
			if (error) throw error;
			return data ?? [];
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
		className: "mt-4 max-h-96 overflow-auto rounded-md border border-border bg-secondary/30 p-4 text-xs text-muted-foreground",
		children: JSON.stringify(data, null, 2)
	});
}
function MspChatPanel({ open, onOpenChange }) {
	const initial = [{
		from: "msp",
		text: "Hi, I'm Msp — the Mavis Strategic Partners assistant. Ask about SOPs, services, pricing, tools or the client roadmap."
	}];
	const [messages, setMessages] = (0, import_react.useState)(initial);
	const [input, setInput] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	const shortcuts = (0, import_react.useMemo)(() => [
		"What's included in Growth Pro?",
		"How fast should I contact a new lead?",
		"Where do monthly reports live?",
		"What tools do we use?"
	], []);
	const { data: profileData } = useProfile();
	async function send(value = input) {
		const question = value.trim();
		if (!question || pending) return;
		const next = [...messages, {
			from: "you",
			text: question
		}];
		setMessages(next);
		setInput("");
		setPending(true);
		try {
			const payload = next.map((m) => ({
				role: m.from === "you" ? "user" : "assistant",
				content: m.text
			}));
			const { askMsp } = await import("./msp.functions-COlrN7l-.mjs");
			const result = await askMsp({ data: { messages: payload } });
			setMessages((items) => [...items, {
				from: "msp",
				text: result.text
			}]);
		} catch (err) {
			console.error(err);
			const msg = err instanceof Error ? err.message : "Msp is unavailable right now. Try again in a moment.";
			setMessages((items) => [...items, {
				from: "msp",
				text: `Sorry — ${msg}`
			}]);
		} finally {
			setPending(false);
		}
	}
	function reset() {
		setMessages(initial);
		setInput("");
		toast.success("Started a fresh Msp chat.");
	}
	async function endChat() {
		if (profileData?.user && messages.length > 1) try {
			const transcript = messages.map((m) => `${m.from}: ${m.text}`).join("\n");
			await supabase.from("chat_logs").insert({
				user_id: profileData.user.id,
				role: "transcript",
				content: transcript
			});
			toast.success("Chat transcript saved.");
		} catch {
			toast.info("Chat ended.");
		}
		onOpenChange(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog$1, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
			className: "max-w-2xl gap-0 overflow-hidden border-border/80 p-0 shadow-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-b border-border bg-secondary/30 px-5 py-4 sm:px-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle$1, {
								className: "flex items-center gap-2 text-base",
								children: ["Msp Assistant ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									className: "gap-1 border-success/30 text-[10px] font-medium text-success",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-success" }), " Online"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
								className: "mt-0.5 text-xs",
								children: "Your internal guide to MSP workflows, tools, services and SOPs."
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								onClick: reset,
								title: "Reset conversation",
								className: "h-8 w-8",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-4 w-4" })
							})
						})]
					})
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-h-[min(46vh,420px)] min-h-64 space-y-4 overflow-y-auto bg-background/60 px-5 py-5 sm:px-6",
					children: [messages.map((message, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("flex items-end gap-2.5", message.from === "you" && "justify-end"),
						children: [message.from === "msp" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm", message.from === "you" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border bg-card text-foreground"),
							children: message.text
						})]
					}, index)), pending && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-primary" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" })
								]
							})
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 border-t border-border bg-secondary/20 px-5 py-4 sm:px-6",
					children: [
						messages.length === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground",
							children: "Suggested prompts"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: shortcuts.map((shortcut) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								className: "h-8 rounded-full bg-background text-xs",
								disabled: pending,
								onClick: () => send(shortcut),
								children: shortcut
							}, shortcut))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "flex items-center gap-2 rounded-xl border border-input bg-background p-1.5 shadow-sm",
							onSubmit: (event) => {
								event.preventDefault();
								send();
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: input,
								onChange: (e) => setInput(e.target.value),
								onKeyDown: (e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										send();
									}
								},
								placeholder: "Ask Msp anything about the portal…",
								disabled: pending,
								className: "h-9 border-0 bg-transparent shadow-none focus-visible:ring-0"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								size: "icon",
								disabled: pending || !input.trim(),
								className: "h-9 w-9 shrink-0 rounded-lg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] text-muted-foreground",
								children: "Msp uses approved MSP knowledge and may need confirmation for sensitive decisions."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								variant: "ghost",
								size: "sm",
								onClick: endChat,
								className: "shrink-0 text-xs text-muted-foreground hover:text-destructive",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PowerOff, { className: "mr-1.5 h-3.5 w-3.5" }), " End chat & save"]
							})]
						})
					]
				})
			]
		})
	});
}
function NotificationsPanel({ open, onOpenChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog$1, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, { children: "Notifications" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, { children: "Portal alerts and reminders." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: [
				"Monthly reports are due by the 7th.",
				"New users must be added by an admin only.",
				"Use Msp for SOP and pricing questions."
			].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-3 rounded-md border border-border p-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "mt-0.5 h-4 w-4 text-primary" }), item]
			}, item))
		})] })
	});
}
function HelpPanel({ open, onOpenChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog$1, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, { children: "Help" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, { children: "Fast paths for common portal actions." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/sops",
					onClick: () => onOpenChange(false),
					className: "flex items-center justify-between rounded-md border border-border p-3 text-sm hover:border-primary/40",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "mr-2 inline h-4 w-4 text-primary" }), "Read SOPs"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/admin/team",
					onClick: () => onOpenChange(false),
					className: "flex items-center justify-between rounded-md border border-border p-3 text-sm hover:border-primary/40",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "mr-2 inline h-4 w-4 text-primary" }), "Add team member"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => {
						onOpenChange(false);
						window.dispatchEvent(new Event("msp:open"));
					},
					className: "flex items-center justify-between rounded-md border border-border p-3 text-left text-sm hover:border-primary/40",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "mr-2 inline h-4 w-4 text-primary" }), "Ask Msp"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })]
				})
			]
		})] })
	});
}
function PortalSearchDialog({ open, onOpenChange }) {
	const items = [
		[
			"Dashboard",
			"/home",
			Compass
		],
		[
			"Who We Are",
			"/who-we-are",
			Compass
		],
		[
			"Services",
			"/services",
			Briefcase
		],
		[
			"Pricing",
			"/pricing",
			Tag
		],
		[
			"Glossary",
			"/glossary",
			ListTree
		],
		[
			"SOP Library",
			"/sops",
			BookOpen
		],
		[
			"Roadmap",
			"/roadmap",
			Map$1
		],
		[
			"Tools",
			"/tools",
			Wrench
		],
		[
			"Departments",
			"/departments",
			Building2
		],
		[
			"My Profile",
			"/me/profile",
			User
		],
		[
			"Leave Requests",
			"/me/leave",
			CalendarDays
		],
		[
			"HR Documents",
			"/me/declaration",
			FilePenLine
		],
		[
			"Team Management",
			"/admin/team",
			Users
		],
		[
			"Audit Logs",
			"/admin/audit",
			ShieldCheck
		],
		[
			"Sales Playbook",
			"/admin/sales-playbook",
			ClipboardList
		],
		[
			"KPI Dashboards",
			"/admin/kpis",
			ChartColumn
		],
		[
			"Content Editor",
			"/admin/content",
			PenLine
		],
		[
			"Monthly Reports",
			"/reports",
			FileChartColumn
		]
	];
	const [query, setQuery] = (0, import_react.useState)("");
	const filtered = items.filter(([label]) => label.toLowerCase().includes(query.toLowerCase()));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog$1, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, { children: "Search portal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, { children: "Jump to any working portal page." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					autoFocus: true,
					className: "pl-9",
					placeholder: "Search pages…",
					value: query,
					onChange: (e) => setQuery(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-h-80 space-y-1 overflow-y-auto",
				children: filtered.map(([label, to, IconComponent]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to,
					onClick: () => onOpenChange(false),
					className: "flex items-center gap-3 rounded-md p-3 text-sm hover:bg-secondary",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconComponent, { className: "h-4 w-4 text-primary" }),
						label,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-auto h-4 w-4 text-muted-foreground" })
					]
				}, to))
			})
		] })
	});
}
function SettingsPanel({ open, onOpenChange }) {
	const [compact, setCompact] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog$1, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, { children: "Portal settings" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, { children: "Local display preferences for this device." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between rounded-md border border-border p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Compact mode"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Tighten spacing for denser review."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					checked: compact,
					onCheckedChange: setCompact
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 text-sm text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4" }), " info@msp.co.za"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-4 w-4" }), " Company contact details can be added by admins."]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4" }), " Invite-only internal portal."]
					})
				]
			})
		] })
	});
}
function ReviewPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [pageTitle(ClipboardCheck, "Portal review", "Portal Functionality Review", "A quick checklist of what is now wired and working."), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-3 md:grid-cols-2 xl:grid-cols-3",
		children: [
			"Dashboard",
			"Who We Are",
			"Services",
			"Pricing",
			"Glossary",
			"SOPs",
			"Roadmap",
			"Tools",
			"Departments",
			"Profile",
			"Leave",
			"HR Documents",
			"Team",
			"Audit",
			"Sales Playbook",
			"KPIs",
			"Content Editor",
			"Msp Chat"
		].map((page) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "flex items-center gap-3 p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-5 w-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: page
			})]
		}, page))
	})] });
}
var REPORT_TYPE_LABEL = {
	growth_strategy: "Growth Strategy / Content Audit",
	ads_performance: "Ads Performance",
	seo_gbp: "SEO & Google Business Profile",
	website_spec: "Website Development Spec"
};
var STATUS_LABEL = {
	draft: "Draft",
	internal_review: "Internal Review",
	sent_to_client: "Sent to Client"
};
function MonthlyReportsPage() {
	const { data: profileData } = useProfile();
	const canEdit = profileData?.isManagerOrAbove ?? false;
	const [selectedClient, setSelectedClient] = (0, import_react.useState)("all");
	const [selectedReport, setSelectedReport] = (0, import_react.useState)(null);
	const { data: clients = [] } = useQuery({
		queryKey: ["clients"],
		queryFn: async () => {
			const { data, error } = await supabase.from("clients").select("*").order("name");
			if (error) throw error;
			return data;
		}
	});
	const { data: reports = [] } = useQuery({
		queryKey: ["monthly_reports"],
		queryFn: async () => {
			const { data, error } = await supabase.from("monthly_reports").select("*").order("reporting_month", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const filteredReports = selectedClient === "all" ? reports : reports.filter((r) => r.client_id === selectedClient);
	const clientMap = (0, import_react.useMemo)(() => new Map(clients.map((c) => [c.id, c])), [clients]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		pageTitle(FileChartColumn, "Client Delivery", "Monthly Reports", canEdit ? "Create, review and export monthly client reports across all four report types." : "Read-only view of live client reports — a learning window into how we present results."),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap items-end gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				className: "mb-1 text-xs",
				children: "Filter by client"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: selectedClient,
				onValueChange: (v) => setSelectedClient(v),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					className: "w-64",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: "all",
					children: "All clients"
				}), clients.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: c.id,
					children: c.name
				}, c.id))] })]
			})] }), canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "ml-auto",
				disabled: true,
				title: "Report authoring UI coming next",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 h-4 w-4" }), " New report"]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3",
			children: clients.map((c) => {
				const rc = reports.filter((r) => r.client_id === c.id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold",
								children: c.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: c.industry
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								children: [
									rc.length,
									" report",
									rc.length === 1 ? "" : "s"
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-foreground",
									children: "Package:"
								}),
								" ",
								c.active_package || "—"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-foreground",
									children: "Contact:"
								}),
								" ",
								c.contact_email || "—"
							]
						})
					]
				}, c.id);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Report" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Client" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Type" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Month" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Prepared by" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "text-right",
					children: "Action"
				})
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [filteredReports.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "font-medium",
					children: r.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: clientMap.get(r.client_id)?.name || "—" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					children: REPORT_TYPE_LABEL[r.report_type]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: format(parseISO(r.reporting_month), "MMM yyyy") }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: r.prepared_by_name || "—" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					className: cn(r.status === "sent_to_client" && "bg-success/20 text-success", r.status === "internal_review" && "bg-warning/20 text-warning", r.status === "draft" && "bg-muted text-muted-foreground"),
					children: STATUS_LABEL[r.status]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "text-right",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => setSelectedReport(r),
						children: ["Open ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-1 h-4 w-4" })]
					})
				})
			] }, r.id)), filteredReports.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				colSpan: 7,
				className: "text-center text-sm text-muted-foreground py-8",
				children: "No reports yet."
			}) })] })] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
			open: !!selectedReport,
			onOpenChange: (o) => !o && setSelectedReport(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetContent, {
				className: "w-full sm:max-w-3xl overflow-y-auto",
				children: selectedReport && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: selectedReport.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetDescription, { children: [
					clientMap.get(selectedReport.client_id)?.name,
					" · ",
					REPORT_TYPE_LABEL[selectedReport.report_type],
					" · ",
					format(parseISO(selectedReport.reporting_month), "MMMM yyyy"),
					" · ",
					STATUS_LABEL[selectedReport.status]
				] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportBody, { report: selectedReport })
				})] })
			})
		})
	] });
}
function Section({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "mb-2 text-sm font-semibold uppercase tracking-wider text-primary",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-sm text-foreground",
			children
		})]
	});
}
function ReportBody({ report }) {
	const d = report.data || {};
	const attachment = d.pdf_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
		title: "Attached document",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
			href: d.pdf_url,
			target: "_blank",
			rel: "noopener noreferrer",
			className: "inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-accent",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileChartColumn, { className: "h-4 w-4 text-primary" }), d.pdf_name || "Download full report (PDF)"]
		})
	}) : null;
	if (report.report_type === "growth_strategy") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		attachment,
		d.introduction && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Introduction",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: d.introduction })
		}),
		d.doing_well && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "What we're doing well",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "list-disc pl-5 space-y-1",
				children: d.doing_well.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: x }, i))
			})
		}),
		d.missing_opportunities && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Where we're missing opportunities",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "list-disc pl-5 space-y-1",
				children: d.missing_opportunities.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: x }, i))
			})
		}),
		d.market_context && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Market context",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: d.market_context })
		}),
		d.roadmap && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Strategic roadmap",
			children: d.roadmap.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold",
					children: p.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "list-disc pl-5",
					children: p.actions.map((a, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: a }, j))
				})]
			}, i))
		}),
		d.next_steps && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Next steps",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "list-decimal pl-5 space-y-1",
				children: d.next_steps.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: x }, i))
			})
		})
	] });
	if (report.report_type === "ads_performance") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		attachment,
		d.executive_summary && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Executive summary",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: d.executive_summary })
		}),
		d.campaigns && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Campaigns",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Campaign" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Spend" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Leads" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "CPL" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Impr." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "CTR" })
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: d.campaigns.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: c.name }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: ["R", c.spend] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: c.leads }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: ["R", c.cpl] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: c.impressions.toLocaleString() }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [c.ctr, "%"] })
			] }, i)) })] })
		}),
		d.ad_sets && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Ad set breakdown",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Ad set" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Spend" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Leads" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "CPL" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "CTR" })
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: d.ad_sets.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: c.name }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: ["R", c.spend] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: c.leads }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: ["R", c.cpl] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [c.ctr, "%"] })
			] }, i)) })] })
		}),
		d.platform_split && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
			title: "Platform split",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Facebook: ",
				d.platform_split.facebook_impressions_pct,
				"% impressions / ",
				d.platform_split.facebook_leads,
				" leads · CPM R",
				d.platform_split.facebook_cpm
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Instagram: ",
				d.platform_split.instagram_impressions_pct,
				"% impressions / ",
				d.platform_split.instagram_leads,
				" leads · CPM R",
				d.platform_split.instagram_cpm
			] })]
		}),
		d.device_split && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Device split",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "list-disc pl-5",
				children: d.device_split.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					x.device,
					": ",
					x.impressions.toLocaleString(),
					" impressions, ",
					x.leads,
					" leads"
				] }, i))
			})
		}),
		d.demographics && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Demographics",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: "Gender"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "list-disc pl-5",
					children: d.demographics.gender.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						x.label,
						": ",
						x.leads,
						" leads @ R",
						x.cpl,
						" CPL (",
						x.impressions_pct,
						"% impressions)"
					] }, i))
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: "Age"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "list-disc pl-5",
					children: d.demographics.age.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						x.bracket,
						": ",
						x.leads,
						" leads @ R",
						x.cpl,
						" CPL"
					] }, i))
				})] })]
			})
		}),
		d.recommendations && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Recommendations",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "whitespace-pre-line",
				children: d.recommendations
			})
		})
	] });
	if (report.report_type === "seo_gbp") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		attachment,
		d.executive_summary && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Executive summary",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: d.executive_summary })
		}),
		d.business_overview && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Client business overview",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: d.business_overview })
		}),
		d.gbp_actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "GBP actions completed",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "list-disc pl-5",
				children: d.gbp_actions.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: x }, i))
			})
		}),
		d.gbp_metrics && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "GBP performance",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 md:grid-cols-5",
				children: Object.entries(d.gbp_metrics).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground capitalize",
						children: k.replace(/_/g, " ")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-2xl font-bold text-primary",
						children: String(v)
					})]
				}, k))
			})
		}),
		d.keywords && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Keyword research",
			children: Object.entries(d.keywords).map(([group, kws]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium capitalize",
					children: group.replace(/_/g, " ")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 flex flex-wrap gap-1.5",
					children: kws.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: k
					}, k))
				})]
			}, group))
		}),
		d.visibility_check && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Manual visibility check",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: d.visibility_check })
		}),
		d.issues_identified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Issues identified",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "list-disc pl-5",
				children: d.issues_identified.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: x }, i))
			})
		}),
		d.next_actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Next actions",
			children: Object.entries(d.next_actions).map(([g, list]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium capitalize",
					children: g.replace(/_/g, " ")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "list-disc pl-5",
					children: list.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: x }, i))
				})]
			}, g))
		}),
		d.final_summary && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Final summary",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: d.final_summary })
		})
	] });
	if (report.report_type === "website_spec") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		attachment,
		d.website_type && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Website type",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: d.website_type })
		}),
		d.primary_objective && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Primary objective",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: d.primary_objective })
		}),
		d.navigation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Navigation",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5",
				children: d.navigation.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					children: n
				}, n))
			})
		}),
		d.pages && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Pages",
			children: d.pages.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 rounded-md border border-border p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-semibold",
						children: [
							p.name,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground",
								children: ["— H1: ", p.h1]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm",
						children: p.body
					}),
					p.ctas?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: "CTAs:"
							}),
							" ",
							p.ctas.join(" · ")
						]
					}) : null,
					p.sections?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 list-disc pl-5 text-sm",
						children: p.sections.map((s, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-medium",
								children: [s.label, ":"]
							}),
							" ",
							s.body
						] }, j))
					}) : null
				]
			}, i))
		}),
		d.technical_seo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "Technical SEO",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid grid-cols-2 gap-1",
				children: Object.entries(d.technical_seo).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: cn("h-4 w-4", v ? "text-success" : "text-muted-foreground") }), k.replace(/_/g, " ")]
				}, k))
			})
		}),
		d.url_structure && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			title: "URL structure",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid grid-cols-2 gap-1 font-mono text-xs",
				children: d.url_structure.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: u }, u))
			})
		})
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
		className: "text-xs",
		children: JSON.stringify(d, null, 2)
	});
}
//#endregion
export { TeamPage as C, createSsrRpc as E, SopsPage as S, WhoWeArePage as T, SalesPlaybookPage as _, GlossaryPage as a, Sheet as b, LeavePage as c, NotificationsPanel as d, PortalSearchDialog as f, RoadmapPage as g, ReviewPage as h, DepartmentsPage as i, MonthlyReportsPage as l, ProfilePage as m, ContentEditorPage as n, HelpPanel as o, PricingPage as p, DeclarationPage as r, KpisPage as s, AuditPage as t, MspChatPanel as u, ServicesPage as v, ToolsPage as w, SheetContent as x, SettingsPanel as y };
