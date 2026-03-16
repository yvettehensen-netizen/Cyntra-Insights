import type { AuditEntry } from "@/lib/cd-types";

export default function AuditLogViewer({ audit }: { audit: AuditEntry[] }) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">Audit Log Viewer</h2>

      {audit.length ? (
        <ol className="mt-3 space-y-3">
          {audit.map((entry) => (
            <li key={entry.log.id} className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {entry.log.entity_type} • {entry.log.action}
                  </p>
                  <p className="text-xs text-slate-400">
                    Actor {entry.log.actor} • {new Date(entry.log.happened_at).toLocaleString()}
                  </p>
                </div>
                <p className="font-mono text-[10px] text-slate-500">{entry.log.event_hash.slice(0, 16)}…</p>
              </div>

              {entry.details.length ? (
                <div className="mt-3 overflow-auto rounded-lg border border-slate-800">
                  <table className="min-w-full border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-left uppercase tracking-wider text-slate-500">
                        <th className="px-2 py-2">Field</th>
                        <th className="px-2 py-2">Old</th>
                        <th className="px-2 py-2">New</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.details.map((detail) => (
                        <tr key={`${entry.log.id}-${detail.field_name}`} className="border-b border-slate-900 text-slate-300">
                          <td className="px-2 py-2 font-medium">{detail.field_name}</td>
                          <td className="px-2 py-2">{detail.old_value ?? "-"}</td>
                          <td className="px-2 py-2">{detail.new_value ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-slate-400">No audit events yet.</p>
      )}
    </section>
  );
}
