"use client";

import { useCallback, useEffect, useState } from "react";
import {
  approveListing,
  approveOwner,
  deleteListing,
  deleteUser,
  getAdminListing,
  getAdminListings,
  getAdminStats,
  getAdminUsers,
  getOwnerApproval,
  getOwnerApprovals,
  rejectListing,
  rejectOwner,
  suspendUser
} from "@/lib/api/admin";
import { useToast } from "@/contexts/ToastContext";
import type { AdminListing, AdminStats, AdminUser, OwnerApproval } from "@/types/admin";

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .finally(() => setIsLoading(false));
  }, []);

  return { stats, isLoading };
}

export function useAdminListings(search = "") {
  const { showToast } = useToast();
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setIsLoading(true);
    getAdminListings(search)
      .then(setListings)
      .finally(() => setIsLoading(false));
  }, [search]);

  useEffect(() => {
    const timeout = window.setTimeout(refresh, 250);
    return () => window.clearTimeout(timeout);
  }, [refresh]);

  async function approve(id: string) {
    const updated = await approveListing(id);
    setListings((current) => current.map((listing) => (listing.id === id ? updated ?? { ...listing, status: "approved" } : listing)));
    showToast("Listing approved. It is now public.", "success");
  }

  async function reject(id: string) {
    const updated = await rejectListing(id);
    setListings((current) => current.map((listing) => (listing.id === id ? updated ?? { ...listing, status: "rejected" } : listing)));
    showToast("Listing rejected.", "info");
  }

  async function remove(id: string) {
    await deleteListing(id);
    setListings((current) => current.filter((listing) => listing.id !== id));
    showToast("Listing removed.", "success");
  }

  return { listings, isLoading, approve, reject, remove };
}

export function useAdminListing(id: string) {
  const [listing, setListing] = useState<AdminListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAdminListing(id)
      .then(setListing)
      .finally(() => setIsLoading(false));
  }, [id]);

  return { listing, isLoading };
}

export function useAdminUsers(search = "") {
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setIsLoading(true);
    getAdminUsers(search)
      .then(setUsers)
      .finally(() => setIsLoading(false));
  }, [search]);

  useEffect(() => {
    const timeout = window.setTimeout(refresh, 250);
    return () => window.clearTimeout(timeout);
  }, [refresh]);

  async function suspend(id: string) {
    await suspendUser(id);
    setUsers((current) => current.map((user) => (user.id === id ? { ...user, status: "suspended" } : user)));
    showToast("User suspended.", "success");
  }

  async function remove(id: string) {
    await deleteUser(id);
    setUsers((current) => current.filter((user) => user.id !== id));
    showToast("Spam account deleted.", "success");
  }

  return { users, isLoading, suspend, remove };
}

export function useOwnerApprovals() {
  const { showToast } = useToast();
  const [approvals, setApprovals] = useState<OwnerApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setIsLoading(true);
    getOwnerApprovals()
      .then(setApprovals)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function approve(id: string) {
    await approveOwner(id);
    setApprovals((current) => current.filter((approval) => approval.id !== id));
    showToast("Owner approved. They can now log in.", "success");
  }

  async function reject(id: string) {
    await rejectOwner(id);
    setApprovals((current) => current.filter((approval) => approval.id !== id));
    showToast("Owner rejected.", "info");
  }

  return { approvals, isLoading, refresh, approve, reject };
}

export function useOwnerApproval(id: string) {
  const [approval, setApproval] = useState<OwnerApproval | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getOwnerApproval(id)
      .then(setApproval)
      .finally(() => setIsLoading(false));
  }, [id]);

  return { approval, isLoading };
}
