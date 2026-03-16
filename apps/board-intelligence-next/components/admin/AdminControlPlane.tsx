"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useOrganization } from "@/components/providers/OrganizationProvider";

export default function AdminControlPlane() {
  const { user } = useAuth();
  const { organizationId } = useOrganization();

  const [entityType, setEntityType] = useState("platform_admin_action");
  const [action, setAction] = useState("manual_checkpoint");
  const [reason, setReason] = useState("Quarterly compliance checkpoint executed by governance lead.");
  const [status, setStatus] = useState<string | null>(null);

  async function appendAuditEvent(): Promise<void> {
    setStatus(null);

    try {
      if (!organizationId) {
        throw new Error("No organization selected");
      }

      const response = await fetch("/api/v1/audit-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          decisionCycleId: null,
          entityType,
          entityId: null,
          action,
          actor: user?.id ?? "system",
          reason,
          requestId: `admin-${Date.now()}`,
          details: [
            {
              fieldName: "admin_reason",
              oldValue: null,
              newValue: reason,
            },
          ],
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to append audit event");
      }

      setStatus(`Audit event ${payload.audit.log.id} appended.`);
    } catch (auditError) {
      const message = auditError instanceof Error ? auditError.message : String(auditError);
      setStatus(message);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">Admin Control Plane</h2>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="text-xs text-slate-300">
          Entity Type
          <input
            value={entityType}
            onChange={(event) => setEntityType(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
        </label>

        <label className="text-xs text-slate-300">
          Action
          <input
            value={action}
            onChange={(event) => setAction(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
        </label>
      </div>

      <label className="mt-3 block text-xs text-slate-300">
        Reason
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={4}
          className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
        />
      </label>

      <button
        type="button"
        onClick={() => void appendAuditEvent()}
        className="mt-3 rounded-xl border border-amber-400/70 px-4 py-2 text-sm font-semibold text-amber-200 hover:bg-amber-500/15"
      >
        Append Audit Event
      </button>

      <div className="mt-4 rounded-lg border border-slate-700 bg-slate-950/70 p-3 text-xs text-slate-300">
        <p>
          Current actor: <span className="font-semibold text-slate-100">{user?.name ?? "Unknown"}</span>
        </p>
        <p className="mt-1">
          Roles: <span className="font-semibold text-slate-100">{user?.roles.join(", ") ?? "-"}</span>
        </p>
      </div>

      {status ? <p className="mt-3 text-xs text-slate-200">{status}</p> : null}
    </section>
  );
}
