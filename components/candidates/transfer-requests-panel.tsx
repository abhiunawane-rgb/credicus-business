"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { useActionFeedback } from "@/components/providers/action-feedback-provider";
import type { CandidateTransferRecord } from "@/lib/candidate-types";
import { displayNameForEmail } from "@/lib/demo-accounts";
import { toLocalDateKey } from "@/lib/list-filters";

type TransferRequestsPanelProps = {
  currentUserEmail?: string;
};

const STATUS_LABELS: Record<CandidateTransferRecord["status"], string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

function statusClass(status: CandidateTransferRecord["status"]) {
  if (status === "approved") return "border-green-200 bg-green-50 text-green-700";
  if (status === "rejected") return "border-red-200 bg-red-50 text-red-700";
  return "border-amber-200 bg-amber-50 text-amber-800";
}

function RecruiterCell({ email }: { email: string }) {
  return (
    <div className="min-w-[10rem]">
      <p className="font-medium text-credicus-ink">{displayNameForEmail(email)}</p>
      <p className="text-xs text-credicus-ink-muted">{email}</p>
    </div>
  );
}

function TransferTable({
  rows,
  variant,
  onResolve,
  busyId,
}: {
  rows: CandidateTransferRecord[];
  variant: "incoming" | "outgoing";
  onResolve?: (id: string, action: "approve" | "reject") => Promise<void>;
  busyId?: string | null;
}) {
  if (rows.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-credicus-gray">
        {variant === "incoming"
          ? "No transfer requests received from other recruiters yet."
          : "You have not sent any transfer requests yet. Use Talent Pool to request a candidate."}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-credicus-line-subtle bg-credicus-surface text-left text-xs font-semibold uppercase tracking-wide text-credicus-ink-muted">
            <th className="px-4 py-3">Candidate</th>
            {variant === "incoming" ? (
              <th className="px-4 py-3">Sent by</th>
            ) : (
              <th className="px-4 py-3">Current owner</th>
            )}
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Requested on</th>
            <th className="px-4 py-3">Resolved on</th>
            {variant === "incoming" ? <th className="px-4 py-3">Action</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((transfer) => {
            const isBusy = busyId === transfer.id;
            const personEmail = variant === "incoming" ? transfer.requested_by : transfer.from_owner;

            return (
              <tr key={transfer.id} className="border-b border-gray-100 hover:bg-credicus-surface/80">
                <td className="px-4 py-3 font-medium text-credicus-ink">{transfer.candidate_name}</td>
                <td className="px-4 py-3">
                  <RecruiterCell email={personEmail} />
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClass(transfer.status)}`}
                  >
                    {STATUS_LABELS[transfer.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-credicus-ink-secondary">{toLocalDateKey(transfer.created_at)}</td>
                <td className="px-4 py-3 text-credicus-ink-secondary">
                  {transfer.resolved_at ? toLocalDateKey(transfer.resolved_at) : "—"}
                </td>
                {variant === "incoming" ? (
                  <td className="px-4 py-3">
                    {transfer.status === "pending" && onResolve ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void onResolve(transfer.id, "approve")}
                          className="ui-button-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void onResolve(transfer.id, "reject")}
                          className="ui-button-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-credicus-ink-muted">—</span>
                    )}
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function TransferRequestsPanel({ currentUserEmail }: TransferRequestsPanelProps) {
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

  const incomingPending = useMemo(
    () => incoming.filter((transfer) => transfer.status === "pending"),
    [incoming],
  );
  const outgoingPending = useMemo(
    () => outgoing.filter((transfer) => transfer.status === "pending"),
    [outgoing],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-credicus-ink">Transfer Requests</h2>
        <p className="mt-1 text-sm text-credicus-gray">
          See who sent you transfer requests, track requests you sent, and check status for both.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="ui-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-credicus-ink-muted">Received</p>
          <p className="mt-1 text-2xl font-bold text-credicus-ink">{incoming.length}</p>
          <p className="text-xs text-credicus-gray">{incomingPending.length} pending</p>
        </div>
        <div className="ui-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-credicus-ink-muted">Sent by you</p>
          <p className="mt-1 text-2xl font-bold text-credicus-ink">{outgoing.length}</p>
          <p className="text-xs text-credicus-gray">{outgoingPending.length} pending</p>
        </div>
        <div className="ui-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-credicus-ink-muted">Approved</p>
          <p className="mt-1 text-2xl font-bold text-green-700">
            {[...incoming, ...outgoing].filter((transfer) => transfer.status === "approved").length}
          </p>
        </div>
        <div className="ui-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-credicus-ink-muted">Rejected</p>
          <p className="mt-1 text-2xl font-bold text-red-700">
            {[...incoming, ...outgoing].filter((transfer) => transfer.status === "rejected").length}
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-credicus-gray">Loading transfer requests...</p>
      ) : (
        <>
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-credicus-ink">Requests received from others</h3>
                <p className="text-sm text-credicus-gray">
                  Candidates other recruiters asked you to transfer. You are the current owner.
                </p>
              </div>
              {incomingPending.length > 0 ? (
                <span className="rounded-full bg-credicus-primary px-2.5 py-0.5 text-xs font-semibold text-credicus-ink">
                  {incomingPending.length} need approval
                </span>
              ) : null}
            </div>
            <div className="ui-card overflow-hidden">
              <TransferTable
                rows={incoming}
                variant="incoming"
                onResolve={handleResolve}
                busyId={busyId}
              />
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-credicus-ink">Requests sent by you</h3>
              <p className="text-sm text-credicus-gray">
                {currentUserEmail ? (
                  <>
                    Transfers requested by <strong>{displayNameForEmail(currentUserEmail)}</strong> ({currentUserEmail})
                  </>
                ) : (
                  "Transfers you requested from Talent Pool."
                )}
              </p>
            </div>
            <div className="ui-card overflow-hidden">
              <TransferTable rows={outgoing} variant="outgoing" />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
