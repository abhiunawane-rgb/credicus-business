"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { useActionFeedback } from "@/components/providers/action-feedback-provider";
import type { CandidateTransferRecord } from "@/lib/candidate-types";
import { displayNameForEmail } from "@/lib/demo-accounts";
import { toLocalDateKey } from "@/lib/list-filters";

function statusClass(status: CandidateTransferRecord["status"]) {
  if (status === "approved") return "border-green-200 bg-green-50 text-green-700";
  if (status === "rejected") return "border-red-200 bg-red-50 text-red-700";
  return "border-amber-200 bg-amber-50 text-amber-800";
}

function TransferRow({
  transfer,
  mode,
  onResolve,
  busyId,
}: {
  transfer: CandidateTransferRecord;
  mode: "incoming" | "outgoing";
  onResolve?: (id: string, action: "approve" | "reject") => Promise<void>;
  busyId?: string | null;
}) {
  const isBusy = busyId === transfer.id;

  return (
    <article className="ui-card p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-credicus-ink">{transfer.candidate_name}</h3>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${statusClass(transfer.status)}`}>
              {transfer.status}
            </span>
          </div>
          <p className="text-sm text-credicus-ink-secondary">
            {mode === "incoming" ? (
              <>
                Requested by <strong>{displayNameForEmail(transfer.requested_by)}</strong>
              </>
            ) : (
              <>
                Current owner <strong>{displayNameForEmail(transfer.from_owner)}</strong>
              </>
            )}
          </p>
          <p className="text-xs text-credicus-ink-muted">
            Requested on {toLocalDateKey(transfer.created_at)}
            {transfer.resolved_at ? ` · Resolved on ${toLocalDateKey(transfer.resolved_at)}` : ""}
          </p>
          {transfer.message ? (
            <p className="text-sm text-credicus-gray">“{transfer.message}”</p>
          ) : null}
        </div>

        {mode === "incoming" && transfer.status === "pending" && onResolve ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => void onResolve(transfer.id, "approve")}
              className="ui-button-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
            >
              <Check className="h-4 w-4" />
              Approve
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => void onResolve(transfer.id, "reject")}
              className="ui-button-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
            >
              <X className="h-4 w-4" />
              Reject
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function TransferRequestsPanel() {
  const { notify } = useActionFeedback();
  const [incoming, setIncoming] = useState<CandidateTransferRecord[]>([]);
  const [outgoing, setOutgoing] = useState<CandidateTransferRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const [incomingRes, outgoingRes] = await Promise.all([
        fetch("/api/candidates/transfers?view=incoming", { credentials: "same-origin" }),
        fetch("/api/candidates/transfers?view=outgoing", { credentials: "same-origin" }),
      ]);
      const incomingBody = (await incomingRes.json()) as { data?: CandidateTransferRecord[] };
      const outgoingBody = (await outgoingRes.json()) as { data?: CandidateTransferRecord[] };
      setIncoming(incomingBody.data ?? []);
      setOutgoing(outgoingBody.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTransfers();
  }, [loadTransfers]);

  async function handleResolve(id: string, action: "approve" | "reject") {
    setBusyId(id);
    try {
      const response = await fetch(`/api/candidates/transfers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ action }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        notify.error(body.error ?? "Could not update transfer request.");
        return;
      }
      notify.success(
        action === "approve"
          ? "Transfer approved. Candidate is now in the requester's list."
          : "Transfer request rejected.",
      );
      await loadTransfers();
      if (action === "approve") {
        window.dispatchEvent(new CustomEvent("credicus:transfer-resolved"));
      }
    } finally {
      setBusyId(null);
    }
  }

  const pendingIncoming = incoming.filter((transfer) => transfer.status === "pending");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-credicus-ink">Transfer Requests</h2>
        <p className="mt-1 text-sm text-credicus-gray">
          Approve requests from other recruiters, or track candidates you asked to take over.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-credicus-gray">Loading transfer requests...</p>
      ) : (
        <>
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-credicus-ink">Needs your approval</h3>
              {pendingIncoming.length > 0 ? (
                <span className="rounded-full bg-credicus-primary px-2.5 py-0.5 text-xs font-semibold text-credicus-ink">
                  {pendingIncoming.length} pending
                </span>
              ) : null}
            </div>
            {pendingIncoming.length === 0 ? (
              <p className="ui-card p-4 text-sm text-credicus-gray">No pending requests waiting for your approval.</p>
            ) : (
              pendingIncoming.map((transfer) => (
                <TransferRow
                  key={transfer.id}
                  transfer={transfer}
                  mode="incoming"
                  onResolve={handleResolve}
                  busyId={busyId}
                />
              ))
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-credicus-ink">Your requests</h3>
            {outgoing.length === 0 ? (
              <p className="ui-card p-4 text-sm text-credicus-gray">
                You have not requested any candidate transfers yet. Use Talent Pool to request ownership.
              </p>
            ) : (
              outgoing.map((transfer) => (
                <TransferRow key={transfer.id} transfer={transfer} mode="outgoing" />
              ))
            )}
          </section>

          {incoming.some((transfer) => transfer.status !== "pending") ? (
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-credicus-ink">Past approvals</h3>
              {incoming
                .filter((transfer) => transfer.status !== "pending")
                .map((transfer) => (
                  <TransferRow key={transfer.id} transfer={transfer} mode="incoming" />
                ))}
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
