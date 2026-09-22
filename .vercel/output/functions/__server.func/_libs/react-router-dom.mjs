import { r as __toESM } from "../_runtime.mjs";
import { l as require_react_dom, u as require_react } from "./@floating-ui/react-dom+[...].mjs";
import { f as stripBasename, i as createPath } from "./remix-run__router.mjs";
import { c as useNavigate, l as useResolvedPath, o as useHref, r as NavigationContext, s as useLocation } from "./react-router.mjs";
//#region node_modules/react-router-dom/dist/index.js
var import_react = /* @__PURE__ */ __toESM(require_react());
require_react_dom();
/**
* React Router DOM v6.30.6
*
* Copyright (c) Remix Software Inc.
*
* This source code is licensed under the MIT license found in the
* LICENSE.md file in the root directory of this source tree.
*
* @license MIT
*/
function _extends() {
	return _extends = Object.assign ? Object.assign.bind() : function(n) {
		for (var e = 1; e < arguments.length; e++) {
			var t = arguments[e];
			for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
		}
		return n;
	}, _extends.apply(null, arguments);
}
function _objectWithoutPropertiesLoose(r, e) {
	if (null == r) return {};
	var t = {};
	for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
		if (-1 !== e.indexOf(n)) continue;
		t[n] = r[n];
	}
	return t;
}
function isModifiedEvent(event) {
	return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
function shouldProcessLinkClick(event, target) {
	return event.button === 0 && (!target || target === "_self") && !isModifiedEvent(event);
}
var _excluded = [
	"onClick",
	"relative",
	"reloadDocument",
	"replace",
	"state",
	"target",
	"to",
	"preventScrollReset",
	"viewTransition"
];
var REACT_ROUTER_VERSION = "6";
try {
	window.__reactRouterVersion = REACT_ROUTER_VERSION;
} catch (e) {}
var isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
var ABSOLUTE_URL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
/**
* The public API for rendering a history-aware `<a>`.
*/
var Link = /*#__PURE__*/ import_react.forwardRef(function LinkWithRef(_ref7, ref) {
	let { onClick, relative, reloadDocument, replace, state, target, to, preventScrollReset, viewTransition } = _ref7, rest = _objectWithoutPropertiesLoose(_ref7, _excluded);
	let { basename } = import_react.useContext(NavigationContext);
	let absoluteHref;
	let isExternal = false;
	if (typeof to === "string" && ABSOLUTE_URL_REGEX.test(to)) {
		absoluteHref = to;
		if (isBrowser) try {
			let currentUrl = new URL(window.location.href);
			let targetUrl = to.startsWith("//") ? new URL(currentUrl.protocol + to) : new URL(to);
			let path = stripBasename(targetUrl.pathname, basename);
			if (targetUrl.origin === currentUrl.origin && path != null) to = path + targetUrl.search + targetUrl.hash;
			else isExternal = true;
		} catch (e) {}
	}
	let href = useHref(to, { relative });
	let internalOnClick = useLinkClickHandler(to, {
		replace,
		state,
		target,
		preventScrollReset,
		relative,
		viewTransition
	});
	function handleClick(event) {
		if (onClick) onClick(event);
		if (!event.defaultPrevented) internalOnClick(event);
	}
	return /*#__PURE__*/ import_react.createElement("a", _extends({}, rest, {
		href: absoluteHref || href,
		onClick: isExternal || reloadDocument ? onClick : handleClick,
		ref,
		target
	}));
});
var DataRouterHook;
(function(DataRouterHook) {
	DataRouterHook["UseScrollRestoration"] = "useScrollRestoration";
	DataRouterHook["UseSubmit"] = "useSubmit";
	DataRouterHook["UseSubmitFetcher"] = "useSubmitFetcher";
	DataRouterHook["UseFetcher"] = "useFetcher";
	DataRouterHook["useViewTransitionState"] = "useViewTransitionState";
})(DataRouterHook || (DataRouterHook = {}));
var DataRouterStateHook;
(function(DataRouterStateHook) {
	DataRouterStateHook["UseFetcher"] = "useFetcher";
	DataRouterStateHook["UseFetchers"] = "useFetchers";
	DataRouterStateHook["UseScrollRestoration"] = "useScrollRestoration";
})(DataRouterStateHook || (DataRouterStateHook = {}));
/**
* Handles the click behavior for router `<Link>` components. This is useful if
* you need to create custom `<Link>` components with the same click behavior we
* use in our exported `<Link>`.
*/
function useLinkClickHandler(to, _temp) {
	let { target, replace: replaceProp, state, preventScrollReset, relative, viewTransition } = _temp === void 0 ? {} : _temp;
	let navigate = useNavigate();
	let location = useLocation();
	let path = useResolvedPath(to, { relative });
	return import_react.useCallback((event) => {
		if (shouldProcessLinkClick(event, target)) {
			event.preventDefault();
			let replace = replaceProp !== void 0 ? replaceProp : createPath(location) === createPath(path);
			navigate(to, {
				replace,
				state,
				preventScrollReset,
				relative,
				viewTransition
			});
		}
	}, [
		location,
		navigate,
		path,
		replaceProp,
		state,
		target,
		to,
		preventScrollReset,
		relative,
		viewTransition
	]);
}
//#endregion
export { Link as t };
