"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CandidateStatusTable from "@/components/dashboard/candidate-status-table";
import { useActionFeedback } from "@/components/providers/action-feedback-provider";

export default function RecruiterCandidatesClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { notify } = useActionFeedback();

  useEffect(() => {
    const added = searchParams.get("added");
    const missing = searchParams.get("missing");
    if (added) {
      notify.success("Candidate is in your list.", "Candidate added");
      router.replace("/dashboard/recruiter/candidates");
    } else if (missing) {
      notify.warning(
        "That candidate record was not found. It may still be saving — refresh the list.",
        "Record missing",
      );
      router.replace("/dashboard/recruiter/candidates");
    }
  }, [searchParams, notify, router]);

  return (
    <CandidateStatusTable
      detailBasePath="/dashboard/recruiter/candidates"
      scope="mine"
      showDateFilters
      showJoinExitDates
    />
  );
}
