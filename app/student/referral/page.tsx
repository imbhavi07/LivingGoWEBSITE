'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { apiClient } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from "@/components/Button";
// Define basic interfaces to satisfy TypeScript
interface UserData {
  role: string;
}

interface ReferralData {
  code: string | null;
  invites: number;
  successful: number;
  earnings: number;
  upiId: string | null;
}

export default function StudentReferralPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [referral, setReferral] = useState<ReferralData | null>(null);
  const [upiId, setUpiId] = useState('');
  const [updatingUpi, setUpdatingUpi] = useState(false);
  const [upiError, setUpiError] = useState<string | null>(null);
  const [upiSuccess, setUpiSuccess] = useState<boolean>(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Fetch user profile and referral data
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
          setUserData(userResponse.data.data);

          // Get or create referral
          const dashboardResponse = await apiClient.get('/earn/dashboard');
          if (dashboardResponse.data) {
            setReferral(dashboardResponse.data.referralData);
            if (dashboardResponse.data.referralData?.upiId) {
              setUpiId(dashboardResponse.data.referralData.upiId);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load referral data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoaded, isSignedIn, router]);

  // Update UPI ID
  const updateUpiId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId.trim()) {
      setUpiError('Please enter your UPI ID');
      return;
    }

    // Basic UPI validation
    if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) {
      setUpiError('Please enter a valid UPI ID (e.g., name@bank)');
      return;
    }

    setUpdatingUpi(true);
    setUpiError(null);
    setUpiSuccess(false);

    try {
      const response = await apiClient.put('/user/profile', {
        upiId: upiId.trim()
      });

      if (response.data.success) {
        setUpiSuccess(true);
        // Update referral data safely
        setReferral((prev: ReferralData | null) => ({
          ...(prev as ReferralData),
          upiId: upiId.trim()
        }));

        // Reset success after 3 seconds
        setTimeout(() => {
          setUpiSuccess(false);
        }, 3000);
      } else {
        setUpiError(response.data.message || 'Failed to update UPI ID');
      }
    } catch (error: unknown) {
      console.error('UPI update error:', error);
      setUpiError(
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
          (error as { message?: string }).message ||
          'An error occurred. Please try again.'
      );
    } finally {
      setUpdatingUpi(false);
    }
  };

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

  // Refresh referral data
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/earn/dashboard');
      if (response.data) {
        setReferral(response.data.referralData);
        if (response.data.referralData?.upiId) {
          setUpiId(response.data.referralData.upiId);
        }
      }
    } catch (error) {
      console.error('Failed to refresh referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not authenticated or not a student
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

  // If not a student, redirect to appropriate dashboard
  if (userData && userData.role !== 'student') {
    if (userData.role === 'PARTNER') {
      router.push('/earn/dashboard');
    } else {
      router.push('/admin/dashboard');
    }
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-linen text-ink flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full border-4 border-ink border-t-transparent h-12 w-12 mb-6 mx-auto"></div>
          <p className="text-lg font-medium text-ink/70">Loading your referral information...</p>
        </div>
      </div>
    );
  }

  // If user data loaded but no referral yet, create one
  if (userData && !referral) {
    return (
      <div className="min-h-screen bg-linen text-ink flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full border-4 border-ink border-t-transparent h-12 w-12 mb-6 mx-auto"></div>
          <p className="text-lg font-medium text-ink/70">Setting up your referral account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linen text-ink">
      <div className="bg-white rounded-3xl shadow-sm border border-ink/10 mx-4 md:mx-0 my-8">
        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-ink mb-2">Refer & Earn</h1>
            <p className="text-ink/60">Share your referral code and earn rewards when friends book through your link.</p>
          </div>

          {/* Referral Card */}
          <div className="bg-white rounded-xl p-6 border border-ink/5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-ink">Your Referral Code</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyReferralLink(referral?.code || '')}
                  disabled={!referral?.code}
                  className={`
                    flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
                    ${copied === (referral?.code || '') ? 'bg-moss/10 text-moss' : 'bg-linen text-ink/60 hover:bg-linen/30'}
                    transition-colors
                  `}
                >
                  {copied === (referral?.code || '') ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span>{copied === (referral?.code || '') ? 'Copied!' : 'Copy Link'}</span>
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

            {referral?.code ? (
              <div className="bg-linen/50 rounded-xl p-4 text-center mb-4">
                <p className="text-xs font-medium text-ink/50 mb-1">Your referral link:</p>
                <div className="flex items-center justify-center bg-white px-4 py-2 rounded-lg font-mono text-sm text-ink">
                  <span>https://livinggo.in/signup?ref={referral.code}</span>
                </div>
                <p className="mt-2 text-xs text-ink/50">
                  Share this link with friends to earn rewards when they book through your referral.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-ink/50">Your referral code will be generated once your account is set up.</p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 text-center">
              <div className="bg-linen/50 rounded-xl p-4">
                <p className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-1">Total Invites</p>
                <p className="text-2xl font-black text-ink">{referral?.invites || 0}</p>
              </div>
              <div className="bg-linen/50 rounded-xl p-4">
                <p className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-1">Successful</p>
                <p className="text-2xl font-black text-moss">{referral?.successful || 0}</p>
              </div>
              <div className="bg-linen/50 rounded-xl p-4">
                <p className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-1">Earnings</p>
                <p className="text-2xl font-black text-ink">₹{referral?.earnings?.toFixed(0) || 0}</p>
              </div>
            </div>
          </div>

          {/* UPI Update Form */}
          <div className="bg-white rounded-xl p-6 border border-ink/5">
            <h2 className="text-xl font-bold text-ink mb-4">Update UPI ID for Payments</h2>
            <p className="text-ink/60 mb-6">
              Enter your UPI ID to receive your referral earnings directly to your bank account.
            </p>

            {upiError && (
              <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-200 text-red-700">
                {upiError}
              </div>
            )}

            {upiSuccess && (
              <div className="mb-4 p-3 bg-moss/10 text-moss rounded-xl border border-moss/20 font-medium">
                UPI ID updated successfully!
              </div>
            )}

            <form onSubmit={updateUpiId} className="space-y-4">
              <div>
                <label htmlFor="upi-input" className="block text-sm font-bold text-ink mb-2">
                  UPI ID
                </label>
                <input
                  type="text"
                  id="upi-input"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g., john@upi"
                  disabled={updatingUpi}
                  className={`w-full px-4 py-3 bg-linen/50 border border-ink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-ink focus:bg-white transition-all duration-200 ${
                    updatingUpi ? 'opacity-80' : ''
                  } ${upiError ? 'border-red-300' : ''}`}
                  required
                />
                {upiError && (
                  <p className="mt-1 text-sm text-red-600">{upiError}</p>
                )}
              </div>

              <p className="text-xs text-ink/50">
                Your UPI ID should be in the format: <code className="bg-linen/20 px-1 py-0.5 rounded">name@bank</code>
              </p>

              <button
                type="submit"
                disabled={updatingUpi || !upiId.trim()}
                className={`w-full bg-ink text-linen px-5 py-3 rounded-xl font-bold text-md hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  updatingUpi ? 'bg-ink/70' : ''
                }`}
              >
                {updatingUpi ? 'Updating...' : 'Update UPI ID'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}