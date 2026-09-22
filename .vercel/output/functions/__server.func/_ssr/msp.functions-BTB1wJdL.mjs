import { r as createServerFn } from "./server-izeDNJF1.mjs";
import { a as stringType, i as objectType, r as enumType, t as arrayType } from "../_libs/zod.mjs";
import { E as createSsrRpc } from "./portal-pages-DPIQvV86.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/msp.functions-BTB1wJdL.js
var askMsp = createServerFn({ method: "POST" }).inputValidator((input) => objectType({ messages: arrayType(objectType({
	role: enumType(["user", "assistant"]),
	content: stringType().min(1).max(4e3)
})).min(1).max(30) }).parse(input)).handler(createSsrRpc("eba41f4d942a834854e418e7e372fa216cb0eb8f8001b15ace2e96079141a931"));
//#endregion
export { askMsp };
