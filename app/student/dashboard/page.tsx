"use client";

// app/student/dashboard/page.tsx  (FULL REPLACEMENT)

import { useEffect, useState } from "react";
import {
  CreditCard, Activity, MapPin, TrendingUp, Timer,
  Check, Loader2, Banknote, Home, ChevronDown, X
} from "lucide-react";
import { StudentShell } from "@/components/student/StudentShell";
import { Button } from "@/components/Button";
import { StarRating } from "@/components/StarRating";
import { MyBookings } from "@/components/student/MyBookings";
import {
  getStudentResidence,
  getApprovedPropertyList,
  markResidence,
  type ResidenceInfo,
  type PropertyListItem,
} from "@/lib/api/residence";

export default function StudentDashboardPage() {

  const [residence, setResidence] = useState<ResidenceInfo>(null);
  const [residenceLoading, setResidenceLoading] = useState(true);

  const [pgList, setPgList] = useState<PropertyListItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownQuery, setDropdownQuery] = useState("");
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [markError, setMarkError] = useState<string | null>(null);

  // Load current residence
  useEffect(() => {
    (async () => {
      try {
        const res = await getStudentResidence();
        setResidence(res);
      } catch {
        // ignore — dashboard still works without residence data
      } finally {
        setResidenceLoading(false);
      }
    })();
  }, []);

  // Load PG list when dropdown opens
  useEffect(() => {
    if (showDropdown && pgList.length === 0) {
      getApprovedPropertyList().then(setPgList);
    }
  }, [showDropdown, pgList.length]);

  const filteredPgs = pgList.filter(
    (pg) =>
      pg.title.toLowerCase().includes(dropdownQuery.toLowerCase()) ||
      pg.location.toLowerCase().includes(dropdownQuery.toLowerCase())
  );

  async function handleSelectPg(pg: PropertyListItem) {
    setMarkingId(pg.id);
    setMarkError(null);
    try {
      const result = await markResidence(pg.id);
      setResidence({
        propertyId: pg.id,
        propertyTitle: pg.title,
        location: pg.location,
        occupiedBeds: result.occupiedBeds,
        totalBeds: result.totalBeds,
        availableBeds: result.availableBeds,
      });
      setShowDropdown(false);
      setDropdownQuery("");
    } catch (err: unknown) {
      setMarkError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setMarkingId(null);
    }
  }

  return (
    <StudentShell>
      <div className="space-y-8">

        {/* ── Current Residence ─────────────────────────────────────────── */}
        <section className="bg-white rounded-3xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-2xl font-bold text-ink flex items-center gap-2">
              <Home className="h-5 w-5" />
              Current Residence
            </h2>

            {/* "I'm an existing tenant" button */}
            {!residence && (
              <div className="relative">
              <button
                onClick={() => { setShowDropdown((v) => !v); setMarkError(null); }}
                className="flex items-center gap-2 rounded-xl border border-black/10 bg-linen px-4 py-2 text-sm font-semibold text-ink hover:bg-black/5 transition-colors"
              >
                <Home className="h-4 w-4" />
                I am an existing tenant
                <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-lg border border-black/10 z-50 overflow-hidden">
                  <div className="p-3 border-b border-black/5 flex items-center gap-2">
                    <input
                      type="text"
                      value={dropdownQuery}
                      onChange={(e) => setDropdownQuery(e.target.value)}
                      placeholder="Search PG name or location…"
                      className="flex-1 text-sm outline-none placeholder:text-muted"
                      autoFocus
                    />
                    {dropdownQuery && (
                      <button onClick={() => setDropdownQuery("")} aria-label="Clear search">
                        <X className="h-4 w-4 text-muted" />
                      </button>
                    )}
                  </div>

                  <ul className="max-h-56 overflow-y-auto divide-y divide-black/5">
                    {pgList.length === 0 && (
                      <li className="p-4 text-sm text-muted text-center">Loading…</li>
                    )}
                    {pgList.length > 0 && filteredPgs.length === 0 && (
                      <li className="p-4 text-sm text-muted text-center">No matching PGs found</li>
                    )}
                    {filteredPgs.map((pg) => (
                      <li key={pg.id}>
                        <button
                          onClick={() => handleSelectPg(pg)}
                          disabled={markingId === pg.id}
                          className="w-full text-left px-4 py-3 hover:bg-linen transition-colors flex items-center gap-3 disabled:opacity-60"
                        >
                          {markingId === pg.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted shrink-0" />
                          ) : (
                            <MapPin className="h-4 w-4 text-muted shrink-0" />
                          )}
                          <div>
                            <p className="text-sm font-semibold text-ink">{pg.title}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>)}
          </div>

          {markError && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700 font-medium">
              {markError}
            </div>
          )}

          {residenceLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[0,1,2].map((i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-linen" />)}
            </div>
          ) : residence ? (
            <>
              <div className="mb-3 flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">You are registered as a tenant</span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted">PG Name</p>
                  <p className="font-bold text-lg text-ink">{residence.propertyTitle}</p>
                  <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{residence.location}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted">Occupied Beds</p>
                  <p className="font-bold text-lg text-ink">{residence.occupiedBeds}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Available Beds</p>
                  <p className="font-bold text-lg text-ink">{residence.availableBeds}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted">PG Name</p>
                <p className="font-bold text-lg text-ink text-muted">Not assigned</p>
              </div>
              <div>
                <p className="text-sm text-muted">Occupied Beds</p>
                <p className="font-bold text-lg text-ink">—</p>
              </div>
              <div>
                <p className="text-sm text-muted">Available Beds</p>
                <p className="font-bold text-lg text-ink">—</p>
              </div>
            </div>
          )}
        </section>

        {/* ── My Bookings (token payments) ─────────────────────────────── */}
        <MyBookings />

        {/* ── Shortlisted Properties ────────────────────────────────────── */}
        <section className="bg-white rounded-3xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-ink flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shortlisted Properties
            </h2>
            <button className="text-sm text-muted hover:text-ink">View All</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { name: "Modern PG Near Campus", distance: "200m from Hansraj College", single: "₹14k", double: "₹9k" },
              { name: "Shared Accommodation", distance: "150m from Miranda House", single: "₹12k", double: "₹8k" },
            ].map((p) => (
              <div key={p.name} className="bg-linen rounded-xl p-4 border border-black/5">
                <div className="flex items-start gap-3 mb-3">
                  <MapPin className="h-4 w-4 text-muted mt-0.5" />
                  <div>
                    <p className="font-medium text-ink">{p.name}</p>
                    <p className="text-xs text-muted">{p.distance}</p>
                    {/* Placeholder rating */}
                    <div className="mt-1">
                      <StarRating value={4.0} count={12} size="sm" />
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-black/5">
                  <Button variant="ghost" size="sm" className="w-full">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Quick Actions ─────────────────────────────────────────────── */}
        <section className="bg-white rounded-3xl shadow-soft p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-xl font-bold text-ink mb-3 flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full flex items-center justify-start gap-3">
                  <Activity className="h-4 w-4" />
                  Download Platform Guidelines
                </Button>
                <Button variant="outline" className="w-full flex items-center justify-start gap-3">
                  <MapPin className="h-4 w-4" />
                  Generate Moving Checklist
                </Button>
                <Button variant="outline" className="w-full flex items-center justify-start gap-3">
                  <Activity className="h-4 w-4" />
                  Schedule Property Visit
                </Button>
              </div>
            </div>
            <div className="bg-linen rounded-xl p-4 border border-black/5">
              <h3 className="text-xl font-bold text-ink mb-3 flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Virtual Bank Account
              </h3>
              <p className="text-sm text-muted">Your secure platform wallet for transactions</p>
              <div className="mt-4">
                <div className="h-8 w-full bg-white rounded-lg border border-black/5 flex items-center justify-center">
                  <span className="text-xs font-medium text-muted">Pending Setup</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">Setup Account</Button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </StudentShell>
  );
}