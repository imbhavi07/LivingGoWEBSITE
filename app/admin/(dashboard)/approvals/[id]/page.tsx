"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { useOwnerApproval, useOwnerApprovals } from "@/hooks/useAdmin";
import { formatIST } from "@/lib/utils";
import type { OwnerApproval } from "@/types/admin";

export default function AdminApprovalDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { approval, isLoading } = useOwnerApproval(params.id);
  const { approve, reject } = useOwnerApprovals();

  async function handleApprove() {
    await approve(params.id);
    router.push("/admin/approvals");
  }

  async function handleReject() {
    await reject(params.id);
    router.push("/admin/approvals");
  }

  return (
    <AdminShell>
      {isLoading ? <div className="h-[620px] animate-pulse rounded-3xl bg-white shadow-soft" /> : null}
      {!isLoading && !approval ? <EmptyState title="Owner application not found" message="This application may already have been processed." /> : null}
      {approval ? (
        <div className="grid gap-6">
          <section className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-black/5">
            <p className="text-sm font-black uppercase text-clay">Owner verification packet</p>
            <h1 className="mt-2 text-3xl font-black text-ink">{approval.name}</h1>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Info label="Email" value={approval.email} />
              <Info label="Phone" value={approval.phone} />
              <Info label="Owner type" value={approval.ownerType} />
              <Info label="Aadhaar number" value={approval.aadhaarNumber} />
              <Info label="Legal accepted" value={formatIST(approval.legalAcceptedAt)} />
              <Info label="Submitted" value={formatIST(approval.createdAt)} />
            </div>
            <div className="mt-3 grid gap-4">
              <DigitalIdentityBadge approval={approval} />
            </div>
          </section>
          <aside className="h-fit rounded-3xl bg-white p-6 shadow-soft ring-1 ring-black/5">
            <p className="text-sm font-black uppercase text-muted">Decision</p>
            <p className="mt-2 text-sm leading-6 text-muted">Approve only after reviewing the owner identity proof and legal acceptance.</p>
            <div className="mt-5 grid gap-3">
              <Button onClick={() => void handleApprove()}>Approve owner</Button>
              <Button variant="secondary" onClick={() => void handleReject()}>Reject application</Button>
            </div>
          </aside>
        </div>
      ) : null}
    </AdminShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-linen p-4">
      <p className="text-xs font-black uppercase text-muted">{label}</p>
      <p className="mt-2 text-sm font-bold text-ink">{value}</p>
    </div>
  );
}

function DigitalIdentityBadge({ approval }: { approval: OwnerApproval }) {
  const redactedAadhar = approval.aadhaarNumber
    ? approval.aadhaarNumber.replace(/^\d{4}(\d{4})\d{4}$/, 'XXXX-XXXX-$1')
    : 'Not provided';

  return (
    <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] text-green-700">
        Verified by DigiLocker
      </span>
      <div className="flex mt-4">
        <Image
          src={approval.aadhaarFrontUrl}
          alt="Aadhaar Front"
          width={96}
          height={128}
          className="w-24 h-32 rounded-lg object-cover"
        />
        <Image
          src={approval.aadhaarBackUrl}
          alt="Aadhaar Back"
          width={96}
          height={128}
          className="w-24 h-32 rounded-lg object-cover ml-4"
        />
        <div className="ml-4 space-y-2">
          <p className="text-sm font-medium text-ink">{approval.name}</p>
          <p className="text-sm text-muted">{approval.phone}</p>
          <p className="text-sm font-mono text-ink">{redactedAadhar}</p>
        </div>
      </div>
      <a
        href="https://eaadhaar.uidai.gov.in/genaadhaar"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block w-full rounded-lg bg-blue-600 py-2 text-center text-white text-sm"
      >
        Verify via Official QR Portal
      </a>
    </div>
  );
}