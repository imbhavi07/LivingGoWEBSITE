import { useUser, usePathname } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OwnerDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      // Not signed in -> redirect to owner login
      const loginUrl = new URL("/owner/login", window.location.origin);
      loginUrl.searchParams.set("next", pathname);
      window.location.href = loginUrl.toString();
      return;
    }

    const role = (user.publicMetadata as { role?: string })?.role;
    if (role !== "owner" && role !== "admin") {
      // User is signed in but not owner or admin -> redirect to owner login
      const loginUrl = new URL("/owner/login", window.location.origin);
      loginUrl.searchParams.set("next", pathname);
      window.location.href = loginUrl.toString();
      return;
    }
  }, [isLoaded, user, router, pathname]);

  return (
    <>
      {children}
    </>
  );
}