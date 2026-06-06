import { CreditCard, Activity, MapPin, TrendingUp, Timer, Check, Loader2, Banknote } from "lucide-react";
import { StudentShell } from "@/components/student/StudentShell";
import { Button } from "@/components/Button";

export default function StudentDashboardPage() {
  return (
    <StudentShell>
      <div className="space-y-8">
        {/* LivingGo Wallet */}
        <section className="bg-white rounded-3xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-ink flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              LivingGo Wallet
            </h2>
            <p className="text-sm text-muted">Last updated: Today</p>
          </div>

          <div className="space-y-4">
            {/* Balance */}
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-3">
                <div className="bg-linen p-3 rounded-xl">
                  <Banknote className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted">Available Balance</p>
                  <p className="text-2xl font-black text-ink">₹7,000</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-50 text-xs font-medium rounded-full text-green-800">
                Live Credits
              </span>
            </div>

            {/* Recent Activity */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-ink mb-1">Recent Activity</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-muted" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">Token locked for Property #1042</p>
                    <p className="text-xs text-muted">Today • 2:30 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-muted" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">Account Funded</p>
                    <p className="text-xs text-muted">Yesterday • 10:15 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 text-muted animate-spin" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">Pending verification</p>
                    <p className="text-xs text-muted">In progress</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Application & Visit Tracker */}
        <section className="bg-white rounded-3xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-ink flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Application & Visit Tracker
            </h2>
          </div>

          <div className="space-y-4">
            {/* Timeline/Stepper */}
            <div className="space-y-4">
              {/* Step 1: Token Paid */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 flex items-center justify-center bg-green-50 text-green-600 rounded-full">
                    <Check className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-ink">Step 1: Token Paid</h3>
                  <p className="text-sm text-muted">Security deposit submitted and verified</p>
                </div>
              </div>

              {/* Step 2: Visit Verification (Active) */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 flex items-center justify-center border-2 border-dashed border-amber-500 rounded-full">
                    <div className="w-6 h-6 flex items-center justify-center bg-amber-500 text-white rounded-full">
                      8492
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-ink">Step 2: Visit Verification</h3>
                  <p className="text-sm text-muted">Owner verification required</p>
                  <div className="mt-2">
                    <p className="text-xs font-medium text-amber-600">Show this OTP to the owner: <span className="font-bold text-amber-800">8492</span></p>
                  </div>
                </div>
              </div>

              {/* Step 3: Rent Settled */}
              <div className="flex items-start gap-4 opacity-50">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 flex items-center justify-center bg-linen text-muted rounded-full">
                    <Timer className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-muted">Step 3: Rent Settled</h3>
                  <p className="text-sm text-muted">Monthly rent payment completed</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Shortlisted Properties */}
        <section className="bg-white rounded-3xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-ink flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shortlisted Properties
            </h2>
            <button className="text-sm text-muted hover:text-ink">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {/* Property Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Property Card 1 */}
              <div className="bg-linen rounded-xl p-4 border border-black/5">
                <div className="flex items-start gap-3 mb-3">
                  <MapPin className="h-4 w-4 text-muted mt-0.5" />
                  <div>
                    <p className="font-medium text-ink">Modern PG Near Campus</p>
                    <p className="text-xs text-muted">200m from Hansraj College</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-ink">Available Rooms</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-ink">Single: ₹14k</span>
                    <span className="text-xs text-muted">|</span>
                    <span className="text-lg font-bold text-ink">Double: ₹9k</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-black/5">
                  <Button variant="ghost" size="sm" className="w-full">
                    View Details
                  </Button>
                </div>
              </div>

              {/* Property Card 2 */}
              <div className="bg-linen rounded-xl p-4 border border-black/5">
                <div className="flex items-start gap-3 mb-3">
                  <MapPin className="h-4 w-4 text-muted mt-0.5" />
                  <div>
                    <p className="font-medium text-ink">Shared Accommodation</p>
                    <p className="text-xs text-muted">150m from Miranda House</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-ink">Available Rooms</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-ink">Single: ₹12k</span>
                    <span className="text-xs text-muted">|</span>
                    <span className="text-lg font-bold text-ink">Double: ₹8k</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-black/5">
                  <Button variant="ghost" size="sm" className="w-full">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions & Move-In */}
        <section className="bg-white rounded-3xl shadow-soft p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Quick Actions */}
            <div>
              <h3 className="text-xl font-bold text-ink mb-3 flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full flex items-center justify-start gap-3">
                  <Activity className="h-4 w-4" />
                  <span>Download Platform Guidelines</span>
                </Button>
                <Button variant="outline" className="w-full flex items-center justify-start gap-3">
                  <MapPin className="h-4 w-4" />
                  <span>Generate Moving Checklist</span>
                </Button>
                <Button variant="outline" className="w-full flex items-center justify-start gap-3">
                  <Activity className="h-4 w-4" />
                  <span>Schedule Property Visit</span>
                </Button>
              </div>
            </div>

            {/* Virtual Bank Account */}
            <div className="bg-linen rounded-xl p-4 border border-black/5">
              <h3 className="text-xl font-bold text-ink mb-3 flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Virtual Bank Account
              </h3>
              <div className="space-y-3">
                <p className="text-sm text-muted">
                  Your secure platform wallet for transactions
                </p>
                <div className="mt-4">
                  <div className="h-8 w-full bg-white rounded-lg overflow-hidden border border-black/5">
                    <div className="h-full w-full bg-gradient-to-r from-linen to-white/50">
                      <div className="flex h-full items-center justify-center text-xs font-medium text-muted">
                        Pending Setup
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    Setup Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </StudentShell>
  );
}