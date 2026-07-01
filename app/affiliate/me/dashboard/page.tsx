import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  MousePointerClick,
  UserPlus,
  Home,
  Wallet,
  Clock3,
  IndianRupee,
  Sparkles,
} from "lucide-react";
import { CopyLinkButton, RequestPayoutButton } from "@/components/DashboardActions";

// ----------------------------------------------------------------------------
// NOTE ON PLACEMENT: Next.js reserves `app/api/**` for Route Handlers, but a
// `page.tsx` dropped in that same tree is still valid — it just means this
// dashboard is reachable at the URL /api/affiliate/me/dashboard rather than
// a conventional page path. If you'd rather this live at a normal route
// (e.g. /dashboard or /earn), move this file there — everything below is
// otherwise self-contained. This file intentionally does NOT collide with
// the route handler at app/api/me/dashboard/route.ts (different path).
// ----------------------------------------------------------------------------

interface DashboardData {
  profile: {
    displayName: string;
    status: "PENDING_REVIEW" | "APPROVED" | "SUSPENDED" | "REJECTED";
    personaType: "STUDENT" | "CREATOR" | "AFFILIATE";
    lifetimeEarned: string;
    pendingBalance: string;
    availableBalance: string;
    paidOutTotal: string;
    minPayoutThreshold: string;
  };
  code: string | null;
  funnel: {
    totalClicks: number;
    totalSignups: number;
    totalConversions: number;
    conversionRate: number;
    pendingPayoutCount: number;
    readyPayoutCount: number;
  };
  recentLedger: { id: string; type: string; amount: string; note: string | null; createdAt: string }[];
}

// Server-side fetch straight to the Express backend — this page IS the
// server boundary, so there's no need to hop through the /api/me/dashboard
// BFF route the way the client-rendered earn/page.tsx does.
async function getDashboardData(): Promise<
  { kind: "ok"; data: DashboardData } | { kind: "not_registered" } | { kind: "error"; status: number }
> {
  const authData = await auth();
  const { userId, getToken } = authData;
  if (!userId) redirect("/sign-in?redirect_url=/api/affiliate/me/dashboard");

  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    console.error("BACKEND_API_URL is not set");
    return { kind: "error", status: 500 };
  }

  const token = await getToken();
  const res = await fetch(`${backendUrl}/api/affiliate/me/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (res.status === 404) return { kind: "not_registered" };
  if (!res.ok) return { kind: "error", status: res.status };

  const data = (await res.json()) as DashboardData;
  return { kind: "ok", data };
}

export default async function AffiliateDashboardPage() {
  const result = await getDashboardData();

  if (result.kind === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linen px-6 text-center text-ink">
        <p className="text-sm text-ink/50">
          Couldn&apos;t load your dashboard right now. Please try again shortly.
        </p>
      </div>
    );
  }

  if (result.kind === "not_registered") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-linen px-6 text-center text-ink">
        <Sparkles size={28} className="text-clay" />
        <h1 className="text-lg font-semibold">You&apos;re not registered yet</h1>
        <p className="max-w-sm text-sm text-ink/50">
          Apply as a creator or independent affiliate to get your trackable referral code.
        </p>
        <a
          href="/earn/apply"
          className="mt-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-linen hover:opacity-90"
        >
          Apply now
        </a>
      </div>
    );
  }

  const { profile, code, funnel, recentLedger } = result.data;
  const referralLink = code ? `https://livinggo.app/r/${code}` : null;
  const isPending = profile.status === "PENDING_REVIEW";

  return (
    <div className="min-h-screen bg-linen text-ink">
      <header className="border-b border-ink/10 px-6 py-6 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-medium uppercase tracking-wide text-moss">
            {profile.personaType === "CREATOR"
              ? "Creator workspace"
              : profile.personaType === "AFFILIATE"
              ? "Affiliate workspace"
              : "Referral workspace"}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Hey, {profile.displayName}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-6 py-8 sm:px-10">
        {isPending && (
          <div className="rounded-xl border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay">
            Your application is under Super Admin review. Your code will activate once approved.
          </div>
        )}

        {/* Referral link */}
        <section className="rounded-2xl border border-ink/10 bg-white/60 p-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/50">Your link</p>
          <div className="flex items-center gap-3 rounded-xl border border-ink/15 bg-linen px-4 py-3">
            <code className="flex-1 truncate text-sm text-ink/80">{referralLink ?? "Pending approval"}</code>
            <CopyLinkButton link={referralLink} />
          </div>
        </section>

        {/* Funnel metrics */}
        <section>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink/50">Funnel</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MetricCard icon={<MousePointerClick size={16} />} label="Link clicks" value={funnel.totalClicks} />
            <MetricCard icon={<UserPlus size={16} />} label="Signups" value={funnel.totalSignups} />
            <MetricCard icon={<Home size={16} />} label="Bookings" value={funnel.totalConversions} accent="moss" />
            <MetricCard icon={<Sparkles size={16} />} label="Conv. rate" value={`${funnel.conversionRate}%`} accent="clay" />
          </div>
        </section>

        {/* Balances */}
        <section>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink/50">Balance</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <BalanceCard
              icon={<Clock3 size={16} />}
              label="Pending clearance"
              amount={profile.pendingBalance}
              hint={`${funnel.pendingPayoutCount} booking(s) in review window`}
            />
            <BalanceCard
              icon={<Wallet size={16} />}
              label="Available to withdraw"
              amount={profile.availableBalance}
              hint={`Payout kicks in above ₹${profile.minPayoutThreshold}`}
              accent="moss"
              highlight
            />
            <BalanceCard icon={<IndianRupee size={16} />} label="Lifetime paid out" amount={profile.paidOutTotal} />
          </div>
        </section>

        {/* Ledger */}
        <section>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink/50">Recent activity</p>
          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white/60">
            {recentLedger.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-ink/40">
                No activity yet — share your link to get your first click.
              </p>
            ) : (
              <ul className="divide-y divide-ink/10">
                {recentLedger.map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                    <div>
                      <p className="font-medium text-ink/80">{formatLedgerType(entry.type)}</p>
                      {entry.note && <p className="text-xs text-ink/40">{entry.note}</p>}
                    </div>
                    <span className={`font-mono text-sm ${Number(entry.amount) < 0 ? "text-clay" : "text-moss"}`}>
                      {Number(entry.amount) >= 0 ? "+" : ""}₹{entry.amount}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

// ----------------------------------------------------------------------------

function MetricCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent?: "moss" | "clay";
}) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white/60 p-4">
      <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-ink/50">
        <span className={accent === "moss" ? "text-moss" : accent === "clay" ? "text-clay" : "text-ink/40"}>
          {icon}
        </span>
        {label}
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function BalanceCard({
  icon,
  label,
  amount,
  hint,
  accent,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  amount: string;
  hint?: string;
  accent?: "moss";
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 ${highlight ? "border-moss/30 bg-moss/10" : "border-ink/10 bg-white/60"}`}>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-ink/50">
        <span className={accent === "moss" ? "text-moss" : "text-ink/40"}>{icon}</span>
        {label}
      </div>
      <p className="text-2xl font-semibold tracking-tight">₹{amount}</p>
      {hint && <p className="mt-1 text-xs text-ink/40">{hint}</p>}
      {highlight && Number(amount) > 0 && <RequestPayoutButton />}
    </div>
  );
}

function formatLedgerType(type: string) {
  switch (type) {
    case "EARNED_PENDING":
      return "Commission earned (pending)";
    case "EARNED_CONFIRMED":
      return "Commission cleared";
    case "PAID_OUT":
      return "Payout sent";
    case "ADJUSTMENT":
      return "Manual adjustment";
    case "VOIDED":
      return "Reversed";
    default:
      return type;
  }
}