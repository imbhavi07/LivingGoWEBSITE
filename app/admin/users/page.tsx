"use client";

import { Trash2, UserX } from "lucide-react";
import { useState } from "react";
import { AdminSearch } from "@/components/admin/AdminSearch";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { buttonClasses } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { useAdminUsers } from "@/hooks/useAdmin";
import { cn, formatIST } from "@/lib/utils";
import Link from "next/link";

type RoleFilter = "all" | "student" | "owner";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const { users, isLoading, suspend, remove } = useAdminUsers(search);

  const filtered = roleFilter === "all" ? users : users.filter((user) => user.role === roleFilter);

  return (
    <AdminShell>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-clay">User management</p>
          <h1 className="mt-2 text-3xl font-black text-ink sm:text-5xl">Platform users</h1>
        </div>
        <AdminSearch value={search} onChange={setSearch} placeholder="Search users, email, role" />
      </div>
      <div className="mb-5 flex gap-2">
        {(["all", "student", "owner"] as RoleFilter[]).map((role) => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-bold capitalize transition",
              roleFilter === role ? "bg-ink text-white" : "bg-white text-muted shadow-soft hover:text-ink"
            )}
          >
            {role === "all" ? "All users" : role === "student" ? "Students" : "Owners"}
          </button>
        ))}
      </div>
      {isLoading ? <div className="h-96 animate-pulse rounded-3xl bg-white shadow-soft" /> : null}
      {!isLoading && filtered.length === 0 ? <EmptyState title="No users found" message="No user accounts match that search." /> : null}
      {!isLoading && filtered.length ? (
        <section className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-black/5">
          <div className="hidden grid-cols-[1.2fr_1fr_120px_120px_160px_180px] gap-4 border-b border-black/5 px-5 py-4 text-xs font-black uppercase text-muted lg:grid">
            <p>User</p>
            <p>Email</p>
            <p>Role</p>
            <p>Status</p>
            <p>Joined</p>
            <p className="text-right">Actions</p>
          </div>
          {filtered.map((user) => (
            <article key={user.id} className="grid gap-3 border-b border-black/5 p-5 last:border-0 lg:grid-cols-[1.2fr_1fr_120px_120px_160px_180px] lg:items-center">
              <div>
                {user.role === "owner" ? (
                <Link
                  href={`/admin/users/${user.id}`}
                    className="font-black text-ink hover:underline"
                >
                    {user.name}
                  </Link>
              ) : (
                  <p className="font-black text-ink">{user.name}</p>
                )}
                <p className="mt-1 text-xs font-semibold text-muted">{user.listingsCount} listings</p>
              </div>
              <p className="text-sm font-semibold text-muted">{user.email}</p>
              <p className="text-sm font-black capitalize text-ink">{user.role}</p>
              <AdminStatusBadge status={user.status} />
              <p className="text-xs font-semibold text-muted">{formatIST(user.joinedAt)}</p>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button className={buttonClasses("secondary", undefined, "px-4 text-amber-700")} onClick={() => void suspend(user.id)}>
                  <UserX className="h-4 w-4" aria-hidden />
                  Suspend
                </button>
                <button
                  className={buttonClasses("ghost", undefined, "px-4 text-red-700")}
                  onClick={() => {
                    if (confirm("Delete this spam account?")) void remove(user.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </AdminShell>
  );
}
