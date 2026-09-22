import { r as __toESM } from "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime, a as Overlay2, c as Title2, i as Description2, n as Cancel, o as Portal2, r as Content2, s as Root2, t as Action } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as buttonVariants, r as cn } from "./button-D_VAx1TB.mjs";
import { t as supabase } from "./client-yJUBr8rP.mjs";
import { R as redirect, _ as createRootRouteWithContext, b as useRouter, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { d as Trash2, l as TriangleAlert, lt as CircleAlert, st as CircleQuestionMark, z as Info } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CnySpYPM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-CfHHfFfS.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
var STORAGE_KEY = "msp-theme";
var ThemeContext = (0, import_react.createContext)({
	theme: "dark",
	toggle: () => {},
	setTheme: () => {}
});
/**
* Inline script that runs before React hydrates so we never get a flash of the
* wrong theme. Default is dark.
*/
function ThemeScript() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: `(function(){try{var s=localStorage.getItem('${STORAGE_KEY}');var t=s||'dark';if(t==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.classList.add('dark');}})();` } });
}
function ThemeProvider({ children }) {
	const [theme, setThemeState] = (0, import_react.useState)("dark");
	(0, import_react.useEffect)(() => {
		const stored = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) || "dark";
		setThemeState(stored);
	}, []);
	const setTheme = (0, import_react.useCallback)((t) => {
		setThemeState(t);
		if (typeof window === "undefined") return;
		localStorage.setItem(STORAGE_KEY, t);
		document.documentElement.classList.toggle("dark", t === "dark");
		document.documentElement.style.colorScheme = t;
	}, []);
	const toggle = (0, import_react.useCallback)(() => setTheme(theme === "dark" ? "light" : "dark"), [theme, setTheme]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeContext.Provider, {
		value: {
			theme,
			toggle,
			setTheme
		},
		children
	});
}
var useTheme = () => (0, import_react.useContext)(ThemeContext);
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		gap: 12,
		icons: {
			success: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "toast-badge toast-badge-success",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
					width: "20",
					height: "20",
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "#ffffff",
					strokeWidth: "3.2",
					strokeLinecap: "round",
					strokeLinejoin: "round",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: "20 6 9 17 4 12" })
				})
			}),
			error: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "toast-badge toast-badge-error",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					width: "18",
					height: "18",
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "#ffffff",
					strokeWidth: "3",
					strokeLinecap: "round",
					strokeLinejoin: "round",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "18",
						y1: "6",
						x2: "6",
						y2: "18"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "6",
						y1: "6",
						x2: "18",
						y2: "18"
					})]
				})
			}),
			warning: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "toast-badge toast-badge-warning",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					width: "18",
					height: "18",
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "#ffffff",
					strokeWidth: "3",
					strokeLinecap: "round",
					strokeLinejoin: "round",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 8v5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "12",
						cy: "17",
						r: "1",
						fill: "#ffffff"
					})]
				})
			}),
			info: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "toast-badge toast-badge-info",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					width: "18",
					height: "18",
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "#ffffff",
					strokeWidth: "3",
					strokeLinecap: "round",
					strokeLinejoin: "round",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "12",
						cy: "8",
						r: "1",
						fill: "#ffffff"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 12v4" })]
				})
			})
		},
		toastOptions: { classNames: {
			toast: [
				"group toast",
				"group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-4",
				"group-[.toaster]:rounded-[20px] group-[.toaster]:px-5 group-[.toaster]:py-4",
				"group-[.toaster]:min-w-[320px] group-[.toaster]:max-w-[420px]",
				"group-[.toaster]:bg-white group-[.toaster]:text-slate-900",
				"group-[.toaster]:border group-[.toaster]:border-black/[0.06]",
				"group-[.toaster]:shadow-[0_12px_36px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.05)]",
				"dark:group-[.toaster]:bg-slate-900 dark:group-[.toaster]:text-slate-50",
				"dark:group-[.toaster]:border-white/[0.1]",
				"dark:group-[.toaster]:shadow-[0_12px_36px_-4px_rgba(0,0,0,0.5)]",
				"group-[.toaster]:font-sans"
			].join(" "),
			title: [
				"group-[.toast]:font-semibold",
				"group-[.toast]:text-[15px]",
				"group-[.toast]:leading-snug",
				"group-[.toast]:text-slate-900",
				"dark:group-[.toast]:text-slate-50"
			].join(" "),
			description: [
				"group-[.toast]:text-[13px]",
				"group-[.toast]:leading-relaxed",
				"group-[.toast]:mt-0.5",
				"group-[.toast]:text-slate-500",
				"dark:group-[.toast]:text-slate-400"
			].join(" "),
			closeButton: [
				"group-[.toast]:!bg-slate-100 group-[.toast]:!border-slate-200",
				"dark:group-[.toast]:!bg-slate-800 dark:group-[.toast]:!border-slate-700",
				"group-[.toast]:!text-slate-500 dark:group-[.toast]:!text-slate-400",
				"group-[.toast]:!rounded-full"
			].join(" "),
			actionButton: [
				"group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
				"group-[.toast]:rounded-xl group-[.toast]:font-medium group-[.toast]:text-xs",
				"group-[.toast]:px-3.5 group-[.toast]:py-2"
			].join(" "),
			cancelButton: [
				"group-[.toast]:bg-slate-100 group-[.toast]:text-slate-600",
				"dark:group-[.toast]:bg-slate-800 dark:group-[.toast]:text-slate-300",
				"group-[.toast]:rounded-xl group-[.toast]:text-xs",
				"group-[.toast]:px-3.5 group-[.toast]:py-2"
			].join(" ")
		} },
		...props
	});
};
var AlertDialog = Root2;
var AlertDialogPortal = Portal2;
var AlertDialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay2, {
	className: cn("fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
AlertDialogOverlay.displayName = Overlay2.displayName;
var AlertDialogContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props
})] }));
AlertDialogContent.displayName = Content2.displayName;
var AlertDialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
AlertDialogHeader.displayName = "AlertDialogHeader";
var AlertDialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
AlertDialogFooter.displayName = "AlertDialogFooter";
var AlertDialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title2, {
	ref,
	className: cn("text-lg font-semibold", className),
	...props
}));
AlertDialogTitle.displayName = Title2.displayName;
var AlertDialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description2, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
AlertDialogDescription.displayName = Description2.displayName;
var AlertDialogAction = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
	ref,
	className: cn(buttonVariants(), className),
	...props
}));
AlertDialogAction.displayName = Action.displayName;
var AlertDialogCancel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cancel, {
	ref,
	className: cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className),
	...props
}));
AlertDialogCancel.displayName = Cancel.displayName;
var ModalContext = (0, import_react.createContext)(null);
var globalConfirmBridge = null;
var globalPromptBridge = null;
var confirmModal = (options) => {
	if (globalConfirmBridge) return globalConfirmBridge(options);
	const msg = typeof options === "string" ? options : options.description || options.title || "";
	return Promise.resolve(typeof window !== "undefined" ? window.confirm(msg) : true);
};
var promptModal = (options) => {
	if (globalPromptBridge) return globalPromptBridge(options);
	const msg = typeof options === "string" ? options : options.description || options.title || "";
	const def = typeof options === "string" ? "" : options.defaultValue || "";
	return Promise.resolve(typeof window !== "undefined" ? window.prompt(msg, def) : null);
};
function ModalProvider({ children }) {
	const [confirmState, setConfirmState] = (0, import_react.useState)(null);
	const [promptState, setPromptState] = (0, import_react.useState)(null);
	const promptInputRef = (0, import_react.useRef)(null);
	const confirm = (0, import_react.useCallback)((options) => {
		const opts = typeof options === "string" ? {
			description: options,
			title: "Confirm Action"
		} : options;
		return new Promise((resolve) => {
			setConfirmState({
				isOpen: true,
				options: {
					title: opts.title || "Are you sure?",
					description: opts.description || "This action cannot be undone.",
					confirmText: opts.confirmText || (opts.variant === "destructive" ? "Delete" : "Confirm"),
					cancelText: opts.cancelText || "Cancel",
					variant: opts.variant || (opts.title?.toLowerCase().includes("delete") || opts.title?.toLowerCase().includes("remove") ? "destructive" : "primary"),
					icon: opts.icon
				},
				resolve
			});
		});
	}, []);
	const prompt = (0, import_react.useCallback)((options) => {
		const opts = typeof options === "string" ? { title: options } : options;
		return new Promise((resolve) => {
			setPromptState({
				isOpen: true,
				options: {
					title: opts.title || "Input Required",
					description: opts.description || "",
					defaultValue: opts.defaultValue || "",
					placeholder: opts.placeholder || "Enter value...",
					confirmText: opts.confirmText || "Submit",
					cancelText: opts.cancelText || "Cancel",
					required: opts.required ?? false,
					multiline: opts.multiline ?? false
				},
				value: opts.defaultValue || "",
				error: null,
				resolve
			});
			setTimeout(() => {
				promptInputRef.current?.focus();
			}, 50);
		});
	}, []);
	globalConfirmBridge = confirm;
	globalPromptBridge = prompt;
	const handleConfirmAction = () => {
		if (confirmState) {
			confirmState.resolve(true);
			setConfirmState(null);
		}
	};
	const handleConfirmCancel = () => {
		if (confirmState) {
			confirmState.resolve(false);
			setConfirmState(null);
		}
	};
	const handlePromptSubmit = (e) => {
		if (e) e.preventDefault();
		if (!promptState) return;
		if (promptState.options.required && !promptState.value.trim()) {
			setPromptState((prev) => prev ? {
				...prev,
				error: "This field is required"
			} : null);
			return;
		}
		promptState.resolve(promptState.value.trim());
		setPromptState(null);
	};
	const handlePromptCancel = () => {
		if (promptState) {
			promptState.resolve(null);
			setPromptState(null);
		}
	};
	const getVariantStyles = (variant) => {
		switch (variant) {
			case "destructive": return {
				iconBg: "bg-destructive/10 text-destructive border-destructive/20",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-5 w-5" }),
				actionClass: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm"
			};
			case "warning": return {
				iconBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-5 w-5" }),
				actionClass: "bg-amber-600 text-white hover:bg-amber-700 shadow-sm"
			};
			case "info": return {
				iconBg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-5 w-5" }),
				actionClass: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
			};
			default: return {
				iconBg: "bg-primary/10 text-primary border-primary/20",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { className: "h-5 w-5" }),
				actionClass: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
			};
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ModalContext.Provider, {
		value: {
			confirm,
			prompt
		},
		children: [
			children,
			confirmState && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: confirmState.isOpen,
				onOpenChange: (open) => {
					if (!open) handleConfirmCancel();
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, {
					className: "sm:max-w-[440px] border border-border/80 bg-card/95 p-6 backdrop-blur-xl shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border", getVariantStyles(confirmState.options.variant).iconBg),
							children: confirmState.options.icon || getVariantStyles(confirmState.options.variant).icon
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5 flex-1 pt-0.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, {
								className: "text-base font-semibold text-foreground tracking-tight",
								children: confirmState.options.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, {
								className: "text-sm text-muted-foreground leading-relaxed",
								children: confirmState.options.description
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, {
						className: "mt-6 flex-row justify-end gap-2.5 sm:space-x-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
							onClick: handleConfirmCancel,
							className: "rounded-xl border-border/70 hover:bg-muted/60 text-sm font-medium transition-colors",
							children: confirmState.options.cancelText
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
							onClick: handleConfirmAction,
							className: cn("rounded-xl font-medium text-sm transition-all px-4 py-2", getVariantStyles(confirmState.options.variant).actionClass),
							children: confirmState.options.confirmText
						})]
					})]
				})
			}),
			promptState && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: promptState.isOpen,
				onOpenChange: (open) => {
					if (!open) handlePromptCancel();
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogContent, {
					className: "sm:max-w-[480px] border border-border/80 bg-card/95 p-6 backdrop-blur-xl shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handlePromptSubmit,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-5 w-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5 flex-1 pt-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, {
										className: "text-base font-semibold text-foreground tracking-tight",
										children: promptState.options.title
									}), promptState.options.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, {
										className: "text-sm text-muted-foreground leading-relaxed",
										children: promptState.options.description
									}) : null]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 space-y-2",
								children: [promptState.options.multiline ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									ref: promptInputRef,
									value: promptState.value,
									onChange: (e) => setPromptState((prev) => prev ? {
										...prev,
										value: e.target.value,
										error: null
									} : null),
									placeholder: promptState.options.placeholder,
									rows: 3,
									className: "w-full rounded-xl border border-input bg-background/80 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: promptInputRef,
									type: "text",
									value: promptState.value,
									onChange: (e) => setPromptState((prev) => prev ? {
										...prev,
										value: e.target.value,
										error: null
									} : null),
									placeholder: promptState.options.placeholder,
									className: "w-full rounded-xl border border-input bg-background/80 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
								}), promptState.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium text-destructive",
									children: promptState.error
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, {
								className: "mt-6 flex-row justify-end gap-2.5 sm:space-x-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: handlePromptCancel,
									className: "rounded-xl border border-border/70 px-4 py-2 text-sm font-medium hover:bg-muted/60 text-foreground transition-colors",
									children: promptState.options.cancelText
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-sm transition-all",
									children: promptState.options.confirmText
								})]
							})
						]
					})
				})
			})
		]
	});
}
function useConfirm() {
	const ctx = (0, import_react.useContext)(ModalContext);
	if (!ctx) return confirmModal;
	return ctx.confirm;
}
function usePrompt() {
	const ctx = (0, import_react.useContext)(ModalContext);
	if (!ctx) return promptModal;
	return ctx.prompt;
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$27 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Mavis Strategic Partners — Portal" },
			{
				name: "description",
				content: "Internal portal for Mavis Strategic Partners. Grow. Design. Thrive."
			},
			{
				name: "author",
				content: "Mavis Strategic Partners"
			},
			{
				property: "og:title",
				content: "Mavis Strategic Partners — Portal"
			},
			{
				property: "og:description",
				content: "Internal portal for the Mavis Strategic Partners team."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary"
			}
		],
		links: [
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				type: "image/png",
				href: "/favicon.png"
			},
			{
				rel: "apple-touch-icon",
				href: "/favicon.png"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeScript, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			children,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
				position: "top-right",
				offset: 20
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$27.useRouteContext();
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		try {
			const { data: sub } = supabase.auth.onAuthStateChange((event) => {
				if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
				router.invalidate();
				if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
			});
			return () => {
				sub?.subscription?.unsubscribe();
			};
		} catch (e) {
			console.warn("Auth state change error:", e);
		}
	}, [router, queryClient]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModalProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) })
	});
}
var Route$26 = createFileRoute("/")({ beforeLoad: () => {
	throw redirect({ to: "/home" });
} });
var $$splitComponentImporter$25 = () => import("./route-CeSGXW-L.mjs");
var Route$25 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		try {
			const { data, error } = await supabase.auth.getUser();
			if (!error && data?.user) return { user: data.user };
		} catch (err) {
			console.warn("Supabase auth check error:", err);
		}
		if (typeof window !== "undefined") {
			const demoUser = localStorage.getItem("msp.demoUser");
			if (demoUser) try {
				return { user: JSON.parse(demoUser) };
			} catch {}
		}
		throw redirect({
			to: "/auth",
			replace: true
		});
	},
	component: lazyRouteComponent($$splitComponentImporter$25, "component")
});
var $$splitComponentImporter$24 = () => import("./auth-BaeyiQbh.mjs");
var Route$24 = createFileRoute("/auth")({
	ssr: false,
	head: () => ({ meta: [{ title: "Sign In — Mavis Strategic Partners" }] }),
	component: lazyRouteComponent($$splitComponentImporter$24, "component")
});
var $$splitComponentImporter$23 = () => import("./departments-ChG9rumL.mjs");
var Route$23 = createFileRoute("/_authenticated/departments")({
	head: () => ({ meta: [{ title: "Departments — MSP Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$23, "component")
});
var $$splitComponentImporter$22 = () => import("./glossary-Dqn0iYtN.mjs");
var Route$22 = createFileRoute("/_authenticated/glossary")({
	head: () => ({ meta: [{ title: "Glossary — MSP Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$22, "component")
});
var $$splitComponentImporter$21 = () => import("./home-B5oKp5cJ.mjs");
var Route$21 = createFileRoute("/_authenticated/home")({
	head: () => ({ meta: [{ title: "Home — MSP Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$21, "component")
});
var $$splitComponentImporter$20 = () => import("./pricing-DKapDKjB.mjs");
var Route$20 = createFileRoute("/_authenticated/pricing")({
	head: () => ({ meta: [{ title: "Pricing — MSP Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var $$splitComponentImporter$19 = () => import("./reports-DnYY_HW_.mjs");
var Route$19 = createFileRoute("/_authenticated/reports")({
	head: () => ({ meta: [{ title: "Monthly Reports — MSP Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
var $$splitComponentImporter$18 = () => import("./review-BbIIUIZA.mjs");
var Route$18 = createFileRoute("/_authenticated/review")({
	head: () => ({ meta: [{ title: "Portal Review — MSP Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./roadmap-Ddy7cgUJ.mjs");
var Route$17 = createFileRoute("/_authenticated/roadmap")({
	head: () => ({ meta: [{ title: "Client Roadmap — MSP Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("./services-DCsOCMhz.mjs");
var Route$16 = createFileRoute("/_authenticated/services")({
	head: () => ({ meta: [{ title: "Services — MSP Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./sops-DEcrtjBF.mjs");
var Route$15 = createFileRoute("/_authenticated/sops")({
	head: () => ({ meta: [{ title: "SOP Library — MSP Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./tools-CsmcILIU.mjs");
var Route$14 = createFileRoute("/_authenticated/tools")({
	head: () => ({ meta: [{ title: "Tools — MSP Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./who-we-are-wTSkrMiq.mjs");
var Route$13 = createFileRoute("/_authenticated/who-we-are")({
	head: () => ({ meta: [{ title: "Who We Are — MSP Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./attendance-Ciq7cx-S.mjs");
var Route$12 = createFileRoute("/_authenticated/admin/attendance")({
	head: () => ({ meta: [{ title: "Admin Command Center — Workforce Attendance" }] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./audit-D_aHp4zS.mjs");
var Route$11 = createFileRoute("/_authenticated/admin/audit")({
	head: () => ({ meta: [{ title: "Audit Logs — MSP Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./content-BvTnSn6l.mjs");
var Route$10 = createFileRoute("/_authenticated/admin/content")({
	head: () => ({ meta: [{ title: "Content Editor — MSP Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./kpis-CeuI59cp.mjs");
var Route$9 = createFileRoute("/_authenticated/admin/kpis")({
	head: () => ({ meta: [{ title: "KPI Dashboards — MSP Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./sales-playbook-B9uwoVN7.mjs");
var Route$8 = createFileRoute("/_authenticated/admin/sales-playbook")({
	head: () => ({ meta: [{ title: "Sales Playbook — MSP Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./team-6x932u6X.mjs");
var Route$7 = createFileRoute("/_authenticated/admin/team")({
	head: () => ({ meta: [{ title: "Team Management — MSP Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./host-BzHTqOW8.mjs");
var Route$6 = createFileRoute("/_authenticated/host/")({
	ssr: false,
	head: () => ({ meta: [{ title: "All In One — MSP Portal" }] }),
	beforeLoad: async () => {
		if (typeof window !== "undefined") {
			const selected = localStorage.getItem("msp.selectedPortal");
			if (selected === "manager" || selected === "admin") return;
		}
		try {
			const { data } = await supabase.auth.getUser();
			if (!data?.user) return;
			const { data: isManager } = await supabase.rpc("is_manager_or_above", { _user_id: data.user.id });
			if (isManager) return;
			const { data: profile } = await supabase.from("profiles").select("department").eq("id", data.user.id).maybeSingle();
			if (profile?.department === "Human Resources") return;
		} catch {}
		if (typeof window !== "undefined" && !["manager", "hr"].includes(localStorage.getItem("msp.selectedPortal") || "")) throw redirect({ to: "/home" });
	},
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("../_-DjJmkb-P.mjs");
var Route$5 = createFileRoute("/_authenticated/host/$")({
	ssr: false,
	head: () => ({ meta: [{ title: "All In One — MSP Portal" }] }),
	beforeLoad: async () => {
		if (typeof window !== "undefined") {
			const selected = localStorage.getItem("msp.selectedPortal");
			if (selected === "manager" || selected === "admin") return;
		}
		try {
			const { data } = await supabase.auth.getUser();
			if (!data?.user) return;
			const { data: isManager } = await supabase.rpc("is_manager_or_above", { _user_id: data.user.id });
			if (isManager) return;
			const { data: profile } = await supabase.from("profiles").select("department").eq("id", data.user.id).maybeSingle();
			if (profile?.department === "Human Resources") return;
		} catch {}
		if (typeof window !== "undefined" && !["manager", "hr"].includes(localStorage.getItem("msp.selectedPortal") || "")) throw redirect({ to: "/home" });
	},
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./declaration-DAB5_kVZ.mjs");
var Route$4 = createFileRoute("/_authenticated/me/declaration")({
	head: () => ({ meta: [{ title: "HR Documents — MSP Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./leave-BIWmDjbo.mjs");
var Route$3 = createFileRoute("/_authenticated/me/leave")({
	head: () => ({ meta: [{ title: "Leave Requests — MSP Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./profile-WrUC6iqP.mjs");
var Route$2 = createFileRoute("/_authenticated/me/profile")({
	head: () => ({ meta: [{ title: "My Profile — MSP Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./admin-EA0hvVcv.mjs");
var Route$1 = createFileRoute("/_authenticated/portal/admin")({
	head: () => ({ meta: [{ title: "Admin Portal — MSP" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./other-B12vfHR7.mjs");
var Route = createFileRoute("/_authenticated/portal/other")({
	head: () => ({ meta: [{ title: "Contractor Portal — MSP" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$26.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$27
});
var AuthenticatedRouteRoute = Route$25.update({
	id: "/_authenticated",
	getParentRoute: () => Route$27
});
var AuthRoute = Route$24.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$27
});
var AuthenticatedDepartmentsRoute = Route$23.update({
	id: "/departments",
	path: "/departments",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedGlossaryRoute = Route$22.update({
	id: "/glossary",
	path: "/glossary",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedHomeRoute = Route$21.update({
	id: "/home",
	path: "/home",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedPricingRoute = Route$20.update({
	id: "/pricing",
	path: "/pricing",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedReportsRoute = Route$19.update({
	id: "/reports",
	path: "/reports",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedReviewRoute = Route$18.update({
	id: "/review",
	path: "/review",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedRoadmapRoute = Route$17.update({
	id: "/roadmap",
	path: "/roadmap",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedServicesRoute = Route$16.update({
	id: "/services",
	path: "/services",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSopsRoute = Route$15.update({
	id: "/sops",
	path: "/sops",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedToolsRoute = Route$14.update({
	id: "/tools",
	path: "/tools",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedWhoWeAreRoute = Route$13.update({
	id: "/who-we-are",
	path: "/who-we-are",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminAttendanceRoute = Route$12.update({
	id: "/admin/attendance",
	path: "/admin/attendance",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminAuditRoute = Route$11.update({
	id: "/admin/audit",
	path: "/admin/audit",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminContentRoute = Route$10.update({
	id: "/admin/content",
	path: "/admin/content",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminKpisRoute = Route$9.update({
	id: "/admin/kpis",
	path: "/admin/kpis",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminSalesPlaybookRoute = Route$8.update({
	id: "/admin/sales-playbook",
	path: "/admin/sales-playbook",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminTeamRoute = Route$7.update({
	id: "/admin/team",
	path: "/admin/team",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedHostIndexRoute = Route$6.update({
	id: "/host/",
	path: "/host/",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedRouteRouteChildren = {
	AuthenticatedDepartmentsRoute,
	AuthenticatedGlossaryRoute,
	AuthenticatedHomeRoute,
	AuthenticatedPricingRoute,
	AuthenticatedReportsRoute,
	AuthenticatedReviewRoute,
	AuthenticatedRoadmapRoute,
	AuthenticatedServicesRoute,
	AuthenticatedSopsRoute,
	AuthenticatedToolsRoute,
	AuthenticatedWhoWeAreRoute,
	AuthenticatedAdminAttendanceRoute,
	AuthenticatedAdminAuditRoute,
	AuthenticatedAdminContentRoute,
	AuthenticatedAdminKpisRoute,
	AuthenticatedAdminSalesPlaybookRoute,
	AuthenticatedAdminTeamRoute,
	AuthenticatedHostSplatRoute: Route$5.update({
		id: "/host/$",
		path: "/host/$",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedMeDeclarationRoute: Route$4.update({
		id: "/me/declaration",
		path: "/me/declaration",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedMeLeaveRoute: Route$3.update({
		id: "/me/leave",
		path: "/me/leave",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedMeProfileRoute: Route$2.update({
		id: "/me/profile",
		path: "/me/profile",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedPortalAdminRoute: Route$1.update({
		id: "/portal/admin",
		path: "/portal/admin",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedPortalOtherRoute: Route.update({
		id: "/portal/other",
		path: "/portal/other",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedHostIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AuthRoute
};
var routeTree = Route$27._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { ThemeProvider as a, usePrompt as i, Route$5 as n, useTheme as o, useConfirm as r, router_exports as t };
