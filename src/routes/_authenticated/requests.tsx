import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Inbox, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAuthHeaders } from "@/lib/api-auth-headers";
import { DEPARTMENTS } from "@/lib/departments";
import { REQUEST_TYPES, typeByKey, type DeptRecord } from "@/lib/department-modules";

export const Route = createFileRoute("/_authenticated/requests")({
  head: () => ({ meta: [{ title: "Requests to departments — MSP" }] }),
  component: RequestsPage,
});

const deptName = (k: string) => DEPARTMENTS.find((d) => d.key === k)?.name ?? k;

/** Any employee raises work with another department here and follows its progress. */
function RequestsPage() {
  const q = useQuery({
    queryKey: ["staff", "records", "mine"],
    queryFn: async () => {
      const res = await fetch("/api/staff/records/mine", { headers: await getAuthHeaders() });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Could not load your requests.");
      return (await res.json()) as { records: DeptRecord[] };
    },
  });
  const mine = q.data?.records ?? [];
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Requests to departments</h1>
        <p className="text-sm text-muted-foreground">
          Ask another department for help. Your request goes to that department's manager, and you are notified as it progresses.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REQUEST_TYPES.map((t) => (
          <Link
            key={t.key}
            to={`/work/${t.slug}` as any}
            className="group rounded-xl border border-border bg-card p-4 transition hover:border-primary/40"
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{deptName(t.department)}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{t.openToAll!.action}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
            <p className="mt-2 text-xs font-medium text-primary">
              Start <ArrowRight className="inline h-3 w-3" />
            </p>
          </Link>
        ))}
      </section>

      <section className="rounded-xl border border-border bg-card">
        <header className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Inbox className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">My requests</h2>
        </header>
        {q.isLoading ? (
          <p className="flex items-center gap-2 p-6 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
          </p>
        ) : q.error ? (
          <p className="p-6 text-xs text-muted-foreground">{(q.error as Error).message}</p>
        ) : mine.length ? (
          <ul className="divide-y divide-border">
            {mine.map((r) => {
              const t = typeByKey(r.record_type);
              const done = t?.done.includes(r.status);
              return (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <div className="min-w-0">
                    <Link to={`/work/${t?.slug ?? r.record_type}` as any} className="text-sm font-medium text-foreground hover:text-primary">
                      {r.title}
                    </Link>
                    <p className="text-[11px] text-muted-foreground">
                      {deptName(r.department_key)} · {t?.singular ?? r.record_type} · raised {new Date(r.created_at).toLocaleDateString("en-ZA")}
                      {r.assigned_to_name ? ` · handled by ${r.assigned_to_name}` : ""}
                    </p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${done ? "text-muted-foreground" : ""}`}>
                    {r.status}
                  </Badge>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="p-6 text-center text-xs text-muted-foreground">You have not raised any requests yet.</p>
        )}
      </section>
    </div>
  );
}
