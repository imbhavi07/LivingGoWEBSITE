'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { apiClient } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { RefreshCw, Copy, Check } from 'lucide-react';
import { Button } from "@/components/Button";
interface HistoryItem {
  id: string;
  referredName: string | null;
  date: string;
  reward: number | null;
  status: string;
}

interface ReferralData {
  code: string | null;
  status: string;
  invites: number;
  successful: number;
  earnings: number;
  upiId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalInvites: number;
  successfulConversions: number;
  totalEarnings: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  // add other fields as needed
}

export default function PartnerDashboardPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [referral, setReferral] = useState<ReferralData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  // Fetch partner dashboard data
  useEffect(() => {
    if (!isLoaded) {
      setLoading(true);
      return;
    }

    if (!isSignedIn) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Get user profile
        const userResponse = await apiClient.get('/user/profile');
        if (userResponse.data.success && userResponse.data.data) {
          setUserData(userResponse.data.data as UserData);

          // Verify user is a partner
          if (userResponse.data.data.role !== 'PARTNER') {
            // Redirect to appropriate dashboard based on actual role
            if (userResponse.data.data.role === 'student') {
              router.push('/student/profile');
            } else if (['admin', 'SUPER_ADMIN'].includes(userResponse.data.data.role)) {
              router.push('/admin/dashboard');
            } else {
              router.push('/');
            }
            return;
          }

          // Get partner dashboard data
          const dashboardResponse = await apiClient.get('/earn/dashboard');
          if (dashboardResponse.data) {
            setReferral(dashboardResponse.data.referralData as ReferralData);
            setStats(dashboardResponse.data.metrics as Stats);
            setHistory(dashboardResponse.data.history as HistoryItem[]);
          }
        }
      } catch (error) {
        console.error('Failed to load partner dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoaded, isSignedIn, router]);

  // Copy referral link
  const copyReferralLink = async (code: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${code}`);
      setCopied(code);
      setTimeout(() => {
        setCopied(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const userResponse = await apiClient.get('/user/profile');
      if (userResponse.data.success && userResponse.data.data) {
        setUserData(userResponse.data.data as UserData);

        const dashboardResponse = await apiClient.get('/earn/dashboard');
        if (dashboardResponse.data) {
          setReferral(dashboardResponse.data.referralData as ReferralData);
          setHistory(dashboardResponse.data.history as HistoryItem[]);
        }
      }
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not authenticated or not a partner
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linen p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full border-4 border-ink border-t-transparent h-10 w-10 mb-4 mx-auto"></div>
          <p className="text-ink/70">Loading...</p>
        </div>
      </div>
    );
  }

  // If not a partner, redirect to appropriate dashboard
  if (userData && userData.role !== 'PARTNER') {
    if (userData.role === 'student') {
      router.push('/student/profile');
    } else if (userData.role === 'admin' || userData.role === 'SUPER_ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/');
    }
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-linen text-ink flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full border-4 border-ink border-t-transparent h-12 w-12 mb-6 mx-auto"></div>
          <p className="text-lg font-medium text-ink/70">Loading your partner dashboard...</p>
        </div>
      </div>
    );
  }

  // If user data loaded but no referral yet
  if (userData && !referral) {
    return (
      <div className="min-h-screen bg-linen text-ink flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full border-4 border-ink border-t-transparent h-12 w-12 mb-6 mx-auto"></div>
          <p className="text-lg font-medium text-ink/70">Setting up your partner account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linen">
      <div className="bg-white rounded-3xl shadow-sm border border-ink/10 mx-4 md:mx-0 my-8">
        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-ink mb-2 text-center">
              Partner Dashboard
            </h1>
            <p className="text-lg text-ink/60 text-center max-w-xl mx-auto">
              Manage your partner referral program and track your earnings.
            </p>
          </div>

          {/* Partner Status */}
          {referral && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-ink">Your Partnership Status</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  referral.status === 'APPROVED'
                    ? 'bg-moss/10 text-moss'
                    : referral.status === 'PENDING'
                      ? 'bg-clay/10 text-clay'
                      : 'bg-rose/10 text-rose'
                }`}>
                  {referral.status === 'APPROVED' ? 'Active Partner' :
                   referral.status === 'PENDING' ? 'Pending Approval' :
                   'Application Rejected'}
                </span>
              </div>

              {referral.status === 'PENDING' && (
                <div className="mt-4 p-4 bg-clay/5 rounded-lg border border-clay/20">
                  <p className="text-sm text-clay/70">
                    Your application is currently under review. Our team will contact you within 24-48 hours regarding your partnership status.
                  </p>
                </div>
              )}

              {referral.status === 'REJECTED' && (
                <div className="mt-4 p-4 bg-rose/5 rounded-lg border border-rose/20">
                  <p className="text-sm text-rose/70">
                    Unfortunately, your partnership application was not approved. Please review our partnership guidelines and consider reapplying.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Referral Info (only show if approved) */}
          {referral && referral.status === 'APPROVED' && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-ink mb-4">Your Referral Information</h2>

              {/* Referral Code */}
              <div className="bg-white rounded-xl p-6 border border-ink/5 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-ink">Referral Code</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyReferralLink(referral.code || '')}
                      disabled={!referral.code}
                      className={`
                        flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
                        ${copied === referral.code ? 'bg-moss/10 text-moss' : 'bg-ink/10 text-ink hover:bg-ink/20'}
                        transition-colors
                      `}
                    >
                      {copied === referral.code ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span>{copied === referral.code ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                    <button
                      onClick={handleRefresh}
                      disabled={loading}
                      className={`ml-2 p-1 rounded-full border border-ink/20 hover:bg-linen/30 transition-colors ${
                        loading ? 'opacity-50' : ''
                      }`}
                    >
                      <RefreshCw className="h-4 w-4 text-ink/60" />
                    </button>
                  </div>
                </div>

                {referral.code && (
                  <div className="mt-4 p-4 bg-ink/5 rounded-lg">
                    <p className="text-sm text-ink/60">
                      Share this link with friends to earn rewards when they book through your referral:
                    </p>
                    <div className="mt-2 flex items-center justify-between bg-white p-3 rounded-lg font-mono text-sm text-ink">
                      <span>{`https://livinggo.in/signup?ref=${referral.code}`}</span>
                    </div>
                    <p className="mt-2 text-xs text-ink/50">
                      Your friends will get a special discount when they use your code!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
            <div className="bg-white rounded-xl p-6 border border-ink/5">
              <p className="text-sm font-medium text-ink/50 uppercase tracking-wider mb-2">Total Referrals</p>
              <p className="text-2xl font-bold text-ink">{referral?.invites ?? 0}</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-ink/5">
              <p className="text-sm font-medium text-ink/50 uppercase tracking-wider mb-2">Successful Conversions</p>
              <p className="text-2xl font-bold text-moss">{referral?.successful ?? 0}</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-ink/5">
              <p className="text-sm font-medium text-ink/50 uppercase tracking-wider mb-2">Earnings</p>
              <p className="text-2xl font-bold text-ink">₹{referral?.earnings?.toFixed(0) ?? 0}</p>
            </div>
          </div>

          {/* Recent Activity */}
          {history.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-ink mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {history.map((activity: HistoryItem) => (
                  <div key={activity.id} className="p-4 bg-linen/50 rounded-xl border border-ink/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-ink/10 rounded-full flex items-center justify-center text-ink font-medium">
                          {activity.referredName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-ink">{activity.referredName || 'Anonymous Referral'}</p>
                          <p className="text-sm text-ink/50">{new Date(activity.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-ink">₹{activity.reward || 0}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.status === 'PENDING'
                            ? 'bg-clay/10 text-clay'
                            : 'bg-moss/10 text-moss'
                        }`}>
                          {activity.status === 'PENDING' ? 'Pending' : 'Completed'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message for non-approved partners */}
          {referral && referral.status !== 'APPROVED' && (
            <div className="text-center py-8">
              <p className="text-ink/60">
                Your referral benefits will be available once your partnership application is approved.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}