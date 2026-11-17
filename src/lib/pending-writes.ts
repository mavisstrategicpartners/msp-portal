/**
 * Tracks database writes that pages start in the background (useSupabaseTable), so a success
 * notification raised at the same moment can wait for the server's answer instead of claiming
 * success too early. See notify.ts.
 */
type Token = { done: boolean; error: string | null };
const inflight = new Set<Token>();
let waiters: ((r: { ok: boolean; error: string | null }) => void)[] = [];
let firstError: string | null = null;
const MAX_WAIT_MS = 20_000;

function flush() {
  if (inflight.size > 0) return;
  const r = { ok: firstError === null, error: firstError };
  firstError = null;
  const w = waiters;
  waiters = [];
  w.forEach((fn) => fn(r));
}

export const pendingWrites = {
  /** Call when a write starts; call the returned function exactly once when it finishes. */
  begin() {
    const t: Token = { done: false, error: null };
    inflight.add(t);
    const timer = setTimeout(() => end("The server did not respond in time."), MAX_WAIT_MS);
    function end(error?: string | null) {
      if (t.done) return;
      t.done = true;
      clearTimeout(timer);
      if (error && !firstError) firstError = error;
      inflight.delete(t);
      // Let other writes started in the same tick register before reporting.
      setTimeout(flush, 0);
    }
    return end;
  },
  active() {
    return inflight.size > 0;
  },
  settled(): Promise<{ ok: boolean; error: string | null }> {
    if (inflight.size === 0) return Promise.resolve({ ok: true, error: null });
    return new Promise((res) => waiters.push(res));
  },
};
