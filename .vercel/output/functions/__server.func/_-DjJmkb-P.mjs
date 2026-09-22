import { N as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as Route$5 } from "./_ssr/router-CnySpYPM.mjs";
import { t as HostPortalEmbedded } from "./_ssr/EmbeddedApp-COS0Ykr2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_-DjJmkb-P.js
var import_jsx_runtime = require_jsx_runtime();
function HostSplat() {
	const { _splat } = Route$5.useParams();
	const splat = _splat ?? "";
	const initialPath = splat.startsWith("hr") ? "/" + splat : "/host/" + splat;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HostPortalEmbedded, { initialPath }, initialPath);
}
//#endregion
export { HostSplat as component };
