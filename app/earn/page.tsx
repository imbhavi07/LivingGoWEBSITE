'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

// STEP 1: DEFINE EXACT TYPESCRIPT INTERFACES
interface EarnDashboardResponse {
  hasRequestedCode: boolean;
  referralData: {
    code: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    discountValue: number;
    discountType: 'FLAT' | 'PERCENTAGE';
  } | null;
  metrics: {
    totalInvites: number;
    pendingBookings: number;
    totalEarnings: number;
  };
  history: {
    id: string;
    referredName: string;
    status: 'PENDING' | 'COMPLETED';
    date: string;
    reward: number;
  }[];
}

export default function EarnPage() {
  const [data, setData] = useState<EarnDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [desiredCode, setDesiredCode] = useState<string>('');
  const [requestCodeLoading, setRequestCodeLoading] = useState<boolean>(false);
  const [requestCodeError, setRequestCodeError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // STEP 2: FETCHING INITIAL STATE
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/earn/dashboard');
        setData(response.data);
        setError(null);
      } catch (err: any) {
        setError('Failed to load dashboard data. Please try again.');
        console.error('Earn dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRequestCode = async () => {
    if (!desiredCode.trim()) {
      setRequestCodeError('Please enter a referral code');
      return;
    }

    setRequestCodeLoading(true);
    setRequestCodeError(null);
    try {
      await apiClient.post('/earn/request-code', { code: desiredCode.trim().toUpperCase() });
      const response = await apiClient.get('/earn/dashboard');
      setData(response.data);
      setDesiredCode('');
    } catch (err: any) {
      setRequestCodeError('Failed to request code. Please try again.');
      console.error('Request code error:', err);
    } finally {
      setRequestCodeLoading(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(`https://livinggo.in/signup?ref=${code}`);
      setCopiedCode(code);
      setTimeout(() => {
        setCopiedCode(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy invite link:', err);
    }
  };

  // LOADING STATE
  if (loading || !data) {
    return (
      <div className="min-h-screen bg-linen text-ink flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full border-4 border-ink border-t-transparent h-12 w-12 mb-6 mx-auto"></div>
          <p className="text-lg font-medium text-ink/70">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-linen text-ink flex items-center justify-center p-6">
        <div className="text-center bg-white rounded-2xl shadow-sm border border-ink/10 p-8 max-w-lg w-full">
          <h2 className="text-2xl font-black text-ink mb-4">Something went wrong</h2>
          <p className="text-ink/70 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-ink text-linen px-8 py-3 rounded-xl font-bold hover:bg-ink/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // STATE A: NO CODE REQUESTED YET
  if (!data.hasRequestedCode) {
    return (
      <div className="min-h-screen bg-linen text-ink">
        <section className="bg-white rounded-3xl shadow-sm border border-ink/10 max-w-3xl mx-auto mt-12 p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-black text-ink mb-4 text-center">Earn Cash by Inviting Friends</h1>
          <p className="text-lg text-ink/60 mb-10 text-center max-w-xl mx-auto">
            Share your unique referral code and earn rewards when friends book through your link.
          </p>

          <div className="max-w-md mx-auto space-y-6">
            <div>
              <label htmlFor="referral-code" className="block text-sm font-bold text-ink mb-2">
                Desired Referral Code
              </label>
              <input
                type="text"
                id="referral-code"
                value={desiredCode}
                onChange={(e) => setDesiredCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                disabled={requestCodeLoading}
                className="w-full px-5 py-4 bg-linen/50 border border-ink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-ink focus:bg-white transition-all duration-200 text-lg font-mono placeholder:font-sans"
                placeholder="e.g. LIVINGGO-JOHN"
                maxLength={20}
              />
              {requestCodeError && <p className="mt-2 text-sm font-medium text-clay">{requestCodeError}</p>}
            </div>

            <button
              onClick={handleRequestCode}
              disabled={requestCodeLoading || !desiredCode.trim()}
              className="w-full bg-ink text-linen px-6 py-4 rounded-xl font-bold text-lg hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {requestCodeLoading ? 'Requesting...' : 'Request Code'}
            </button>
          </div>
        </section>

        <section className="max-w-4xl mx-auto mt-12 p-6">
          <h2 className="text-2xl font-black text-ink mb-8 text-center">How it works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white rounded-2xl p-8 text-center border border-ink/5">
              <div className="w-12 h-12 bg-ink text-linen rounded-full flex items-center justify-center text-xl font-black mx-auto mb-6">1</div>
              <h3 className="text-lg font-bold text-ink mb-3">Request Code</h3>
              <p className="text-sm text-ink/60 leading-relaxed">Choose a unique referral code that represents you or your brand.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center border border-ink/5">
              <div className="w-12 h-12 bg-ink text-linen rounded-full flex items-center justify-center text-xl font-black mx-auto mb-6">2</div>
              <h3 className="text-lg font-bold text-ink mb-3">Get Approved</h3>
              <p className="text-sm text-ink/60 leading-relaxed">Our team reviews your request within 24 hours to ensure authenticity.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center border border-ink/5">
              <div className="w-12 h-12 bg-ink text-linen rounded-full flex items-center justify-center text-xl font-black mx-auto mb-6">3</div>
              <h3 className="text-lg font-bold text-ink mb-3">Share & Earn</h3>
              <p className="text-sm text-ink/60 leading-relaxed">Share your code. When friends book using your link, you earn cash rewards!</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // STATE B: CODE IS PENDING APPROVAL
  if (data.hasRequestedCode && data.referralData?.status === 'PENDING') {
    return (
      <div className="min-h-screen bg-linen text-ink flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-sm border border-ink/10 p-10 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-clay/10 text-clay rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-ink mb-4">Code Pending Approval</h2>
          <p className="text-ink/70 mb-6 leading-relaxed">
            Your code <span className="font-mono font-bold bg-ink/5 px-2 py-1 rounded">{data.referralData.code}</span> is currently being reviewed by our moderation team.
          </p>
          <p className="text-sm text-ink/50 bg-linen p-4 rounded-xl">
            Approval typically takes 24 hours. Check back here to see your active dashboard once approved.
          </p>
        </div>
      </div>
    );
  }

  // STATE C: CODE IS APPROVED (The Main Dashboard)
  if (data.hasRequestedCode && data.referralData?.status === 'APPROVED') {
    return (
      <div className="min-h-screen bg-linen text-ink py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <header className="bg-ink text-linen rounded-3xl p-8 sm:p-10 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black mb-2">Referral Dashboard</h1>
              <p className="text-linen/70 text-sm sm:text-base">Share your code to start earning rewards.</p>
            </div>
            
            <div className="bg-white/10 p-4 rounded-2xl flex items-center gap-4 w-full sm:w-auto">
              <span className="font-mono text-xl font-bold tracking-wider">{data.referralData.code}</span>
              <button
                onClick={() => handleCopyCode(data.referralData?.code || '')}
                className="bg-linen text-ink px-4 py-2 rounded-xl text-sm font-bold hover:bg-white transition-colors min-w-[120px]"
              >
                {copiedCode === data.referralData.code ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
          </header>

          <section className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
            <div className="bg-white rounded-3xl p-6 border border-ink/5 shadow-sm">
              <p className="text-sm font-bold text-ink/50 uppercase tracking-wider mb-2">Total Invites</p>
              <p className="text-4xl font-black text-ink">{data.metrics.totalInvites}</p>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-ink/5 shadow-sm">
              <p className="text-sm font-bold text-ink/50 uppercase tracking-wider mb-2">Pending Bookings</p>
              <p className="text-4xl font-black text-clay">{data.metrics.pendingBookings}</p>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-ink/5 shadow-sm">
              <p className="text-sm font-bold text-ink/50 uppercase tracking-wider mb-2">Total Earnings</p>
              <p className="text-4xl font-black text-moss">₹{data.metrics.totalEarnings}</p>
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-ink/5 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-ink/5">
              <h2 className="text-xl font-black text-ink">Rewards Queue</h2>
            </div>
            
            {data.history.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-ink/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌱</span>
                </div>
                <p className="text-ink/50 font-medium">No referral activity yet. Share your code to start growing!</p>
              </div>
            ) : (
              <div className="divide-y divide-ink/5">
                {data.history.map((item) => (
                  <div key={item.id} className="p-6 sm:p-8 flex items-center justify-between hover:bg-linen/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-ink/5 rounded-full flex items-center justify-center text-ink font-bold text-lg">
                        {item.referredName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-ink">{item.referredName}</h3>
                        <p className="text-sm text-ink/50">{new Date(item.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg text-ink">₹{item.reward}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                        item.status === 'PENDING' ? 'bg-clay/10 text-clay' : 'bg-moss/10 text-moss'
                      }`}>
                        {item.status === 'PENDING' ? 'Pending' : 'Completed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // FALLBACK (Rejected)
  return (
    <div className="min-h-screen bg-linen text-ink flex items-center justify-center p-6">
      <div className="text-center bg-white rounded-3xl shadow-sm border border-ink/10 p-10 max-w-lg w-full">
        <h2 className="text-2xl font-black text-ink mb-4">Request Rejected</h2>
        <p className="text-ink/70 mb-8 leading-relaxed">
          Your referral code request was rejected by the moderation team. It may have contained inappropriate language or closely matched an existing brand code.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-ink text-linen px-8 py-3 rounded-xl font-bold hover:bg-ink/90 transition-colors"
        >
          Try Another Code
        </button>
      </div>
    </div>
  );
}