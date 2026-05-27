import { OwnerShell } from "@/components/owner/OwnerShell";
import { OwnerPropertyForm } from "@/components/owner/OwnerPropertyForm";

export default function NewOwnerPropertyPage() {
  return (
    <OwnerShell>
      <div className="mb-6">
        <p className="text-sm font-bold uppercase text-clay">New listing</p>
        <h1 className="mt-2 text-3xl font-black text-ink sm:text-5xl">
          Add Property
        </h1>
      </div>
      <OwnerPropertyForm />
    </OwnerShell>
  );
}