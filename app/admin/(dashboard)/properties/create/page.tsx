"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPropertyForm } from "@/components/admin/AdminPropertyForm";
import { useCreateProperty } from "@/hooks/useAdmin";
import { useToast } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";

export default function CreatePropertyPage() {
  const { create: createProperty } = useCreateProperty();
  const { showToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    try {
      await createProperty(formData);
      showToast("Property created successfully!", "success");
      router.push("/admin/properties");
    } catch (error: unknown) {
      showToast("Failed to create property. Please try again.", "error");
    }
  };

  const handleCancel = () => {
    router.push("/admin/properties");
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center gap-3">
        {/* Fixed: Removed the <a> tag entirely and moved styles to the Link */}
        <Link href="/admin/properties" className="flex items-center gap-2 font-semibold text-muted hover:text-ink transition">
          <ArrowLeft className="h-4 w-4" />
          Back to Properties
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-black text-ink">Create New Property</h1>
      </div>

      <AdminPropertyForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </main>
  );
}