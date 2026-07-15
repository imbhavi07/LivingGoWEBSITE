"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPropertyForm } from "@/components/admin/AdminPropertyForm";
import { useCreateProperty } from "@/hooks/useAdmin";
import { useToast } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { isAxiosError } from "axios"; // ✅ FIXED: Imported directly from axios

export default function CreatePropertyPage() {
  const { create: createProperty } = useCreateProperty();
  const { showToast } = useToast();
  const router = useRouter();
  const { user, isLoading } = useAuthContext();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      setIsReady(true);
    }
  }, [isLoading, user]);

  const handleSubmit = async (formData: FormData) => {
    try {
      await createProperty(formData);
      showToast("Property created successfully!", "success");
      router.push("/admin/properties");
    } catch (err: unknown) {
      let message = "Failed to create property. Please try again.";
      
      // ✅ Now TypeScript knows exactly what this is!
      if (isAxiosError(err)) {
        const serverMsg = err.response?.data?.message;
        if (typeof serverMsg === "string" && serverMsg.trim()) {
          message = serverMsg;
        }
      }
      showToast(message, "error");
    }
  };

  const handleCancel = () => {
    router.push("/admin/properties");
  };

  if (!isReady) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <p className="text-xl text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/properties" className="flex items-center gap-2 font-semibold text-muted hover:text-ink transition">
          <ArrowLeft className="h-4 w-4" />
          Back to Properties
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-ink">Create New Property</h1>
      </div>

      <AdminPropertyForm onSave={handleSubmit} onCancel={handleCancel} />
    </main>
  );
}