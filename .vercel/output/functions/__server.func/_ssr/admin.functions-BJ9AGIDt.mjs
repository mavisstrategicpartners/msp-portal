import { r as createServerFn } from "./server-DTXGfBpA.mjs";
import { t as createServerRpc } from "./createServerRpc-DPZZ8Zcn.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-FloeaehL.mjs";
import { a as stringType, i as objectType, n as booleanType, r as enumType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.functions-BJ9AGIDt.js
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
var createTeamMember_createServerFn_handler = createServerRpc({
	id: "94e3d6b0a5205320fd9ba8db5cb4203f6f544416368229f4eccd00021138b1f3",
	name: "createTeamMember",
	filename: "src/lib/admin.functions.ts"
}, (opts) => createTeamMember.__executeServer(opts));
var createTeamMember = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => createTeamMemberSchema.parse(data)).handler(createTeamMember_createServerFn_handler, async ({ data, context }) => {
	const db = context.supabase;
	const { data: allowed, error: roleError } = await db.rpc("has_role", {
		_user_id: context.userId,
		_role: "admin"
	});
	if (roleError || !allowed) throw new Response("Only admins can add portal users", { status: 403 });
	if (data.accessLevel === "superadmin") {
		const { data: rootAdmin, error: rootError } = await db.rpc("is_root_admin", { _user_id: context.userId });
		if (rootError || !rootAdmin) throw new Response("Only superadmins can create superadmin accounts", { status: 403 });
	}
	const { supabaseAdmin } = await import("./client.server-C4gGyK0D.mjs");
	const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
		email: data.email,
		password: data.password,
		email_confirm: true,
		user_metadata: { full_name: data.fullName }
	});
	if (createError) throw createError;
	const user = created.user;
	if (!user) throw new Error("The user account was not created.");
	const profilePayload = {
		id: user.id,
		email: data.email,
		full_name: data.fullName,
		job_title: data.jobTitle || null,
		department: data.accessLevel === "hr" ? "Human Resources" : data.department || null,
		role_tier: data.accessLevel === "manager" ? "manager" : data.accessLevel === "superadmin" ? "root_admin" : "staff",
		is_active: true,
		onboarding_completed: false
	};
	const { error: profileError } = await supabaseAdmin.from("profiles").upsert(profilePayload);
	if (profileError) throw profileError;
	const { error: roleInsertError } = await supabaseAdmin.from("user_roles").upsert({
		user_id: user.id,
		role: data.accessLevel === "manager" || data.accessLevel === "superadmin" ? "admin" : data.role
	}, { onConflict: "user_id,role" });
	if (roleInsertError) throw roleInsertError;
	await supabaseAdmin.from("audit_logs").insert({
		actor_id: context.userId,
		action: "team_member_created",
		target_id: user.id,
		details: {
			email: data.email,
			accessLevel: data.accessLevel,
			role: data.role,
			department: data.department || null
		}
	});
	return {
		id: user.id,
		email: data.email
	};
});
async function ensureAdmin(context) {
	const { data: allowed, error } = await context.supabase.rpc("has_role", {
		_user_id: context.userId,
		_role: "admin"
	});
	if (error || !allowed) throw new Response("Admins only", { status: 403 });
}
var updateTeamMemberSchema = objectType({
	userId: stringType().uuid(),
	fullName: stringType().optional(),
	jobTitle: stringType().nullable().optional(),
	department: stringType().nullable().optional(),
	phone: stringType().nullable().optional(),
	isActive: booleanType().optional()
});
var updateTeamMember_createServerFn_handler = createServerRpc({
	id: "1b1bce20e53e7468d01059b612ffc15445ca64b555906f1f7ff85e9f7623c910",
	name: "updateTeamMember",
	filename: "src/lib/admin.functions.ts"
}, (opts) => updateTeamMember.__executeServer(opts));
var updateTeamMember = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => updateTeamMemberSchema.parse(data)).handler(updateTeamMember_createServerFn_handler, async ({ data, context }) => {
	await ensureAdmin(context);
	const { supabaseAdmin } = await import("./client.server-C4gGyK0D.mjs");
	const patch = {};
	if (data.fullName !== void 0) patch.full_name = data.fullName;
	if (data.jobTitle !== void 0) patch.job_title = data.jobTitle;
	if (data.department !== void 0) patch.department = data.department;
	if (data.phone !== void 0) patch.phone = data.phone;
	if (data.isActive !== void 0) patch.is_active = data.isActive;
	const { error } = await supabaseAdmin.from("profiles").update(patch).eq("id", data.userId);
	if (error) throw error;
	await supabaseAdmin.from("audit_logs").insert({
		actor_id: context.userId,
		action: "team_member_updated",
		target_id: data.userId,
		details: patch
	});
	return { ok: true };
});
var setRoleSchema = objectType({
	userId: stringType().uuid(),
	makeAdmin: booleanType()
});
var setAdminRole_createServerFn_handler = createServerRpc({
	id: "187914f9251ed9244b70b0dd4cad9ddd430053b8a038071b8d1807b7fc91e2e2",
	name: "setAdminRole",
	filename: "src/lib/admin.functions.ts"
}, (opts) => setAdminRole.__executeServer(opts));
var setAdminRole = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => setRoleSchema.parse(data)).handler(setAdminRole_createServerFn_handler, async ({ data, context }) => {
	await ensureAdmin(context);
	const { supabaseAdmin } = await import("./client.server-C4gGyK0D.mjs");
	const db = supabaseAdmin;
	if (data.makeAdmin) await db.from("user_roles").upsert({
		user_id: data.userId,
		role: "admin"
	}, { onConflict: "user_id,role" });
	else await db.from("user_roles").delete().eq("user_id", data.userId).eq("role", "admin");
	await db.from("audit_logs").insert({
		actor_id: context.userId,
		action: data.makeAdmin ? "admin_granted" : "admin_revoked",
		target_id: data.userId
	});
	return { ok: true };
});
//#endregion
export { createTeamMember_createServerFn_handler, setAdminRole_createServerFn_handler, updateTeamMember_createServerFn_handler };
