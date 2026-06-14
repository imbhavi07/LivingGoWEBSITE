"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { useOwnerApproval, useOwnerApprovals } from "@/hooks/useAdmin";
import { formatIST } from "@/lib/utils";

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
              <DocumentViewer title="Official DigiLocker Document" src={approval.aadhaarFrontUrl} />
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

{/* I think abhi yeh kaam karna chalu kar lega */}

function DocumentViewer({ title, src }: { title: string; src: string }) {
  const isPdf = src.toLowerCase().includes('.pdf');
  const isXml = src.toLowerCase().includes('.xml');

  return (
    <div className="overflow-hidden rounded-3xl bg-linen p-3">
      <p className="mb-3 text-sm font-black text-ink">{title}</p>
      {isPdf ? (
        <>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white">
            <embed src={src} type="application/pdf" className="w-full h-full" />
          </div>
          <p className="mt-2 text-sm text-center">
            <a href={src} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
              View PDF
            </a>
          </p>
        </>
      ) : isXml ? (
        <>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-linen border-2 border-dashed border-primary-200 flex h-full items-center justify-center">
            <p className="text-sm text-center text-primary-600">
              XML Data Document
            </p>
          </div>
          <p className="mt-2 text-sm text-center">
            <a href={src} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
              View XML
            </a>
          </p>
        </>
      ) : (
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white">
          <Image src={src} alt={title} fill className="object-cover" sizes="50vw" />
        </div>
      )}
    </div>
  );
}