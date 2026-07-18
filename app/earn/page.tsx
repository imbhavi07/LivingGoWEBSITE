'use client';

import { useState } from 'react';
import Link from "next/link";
import confetti from 'canvas-confetti';
import { Button } from "@/components/Button";
// Define the shape of our tracking records to satisfy TypeScript/ESLint
interface TrackRecord {
  date: string;
  referrerName?: string;
  amount: number;
  status: string;
}

// Define the shape of the tracking API response
interface TrackResponse {
  earnings: number;
  successful: number;
  upiId: string;
  ledger: TrackRecord[];
}

// Confetti celebration function
function triggerConfetti() {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#22c55e', '#eab308', '#ffffff'],
  });
}

export default function EarnPage() {
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateSuccess, setGenerateSuccess] = useState<string | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackResults, setTrackResults] = useState<TrackResponse | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    setGenerateLoading(true);
    setGenerateError(null);
    setGenerateSuccess(null);

    const formData = new FormData(e.currentTarget);
    const prefix = formData.get('prefix') as string;
    const name = formData.get('name') as string;
    const college = formData.get('college') as string | null;
    const upiId = formData.get('upiId') as string;
    const confirmUpiId = formData.get('confirmUpiId') as string;

    // Validate UPI IDs match
    if (upiId !== confirmUpiId) {
      setGenerateError('UPI IDs do not match. Please check for typos.');
      setGenerateLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/earn/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix, name, college: college || '', upiId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate referral code');
      }

      setGeneratedCode(data.referralCode);
      setGenerateSuccess('Referral code generated successfully!');
      setShowSuccessPopup(true);
      triggerConfetti();
      form.reset();
    } catch (err: unknown) {
      setGenerateError((err as Error).message || 'An error occurred');
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTrackLoading(true);
    setTrackError(null);
    setTrackResults(null);

    const formData = new FormData(e.currentTarget);
    const code = formData.get('code') as string;

    try {
      const response = await fetch(`/api/earn/track?code=${encodeURIComponent(code)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tracking data');
      }

      setTrackResults(data);
    } catch (err: unknown) {
      setTrackError((err as Error).message || 'An error occurred');
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linen text-ink p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-ink mb-8 text-center">
          Refer & Earn with LivingGo
        </h1>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Generate Your Code */}
          <div className="bg-white rounded-3xl shadow-sm border border-ink/10 p-6">
            <h2 className="text-xl font-bold text-ink mb-4">Generate Your Code</h2>
            <p className="text-ink/60 mb-6">
              Create your unique referral code to share with friends and earn rewards.
            </p>

            {generateError && (
              <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-200 text-red-700">
                {generateError}
              </div>
            )}

            {generateSuccess && (
              <div className="mb-4 p-3 bg-moss/10 text-moss rounded-xl border border-moss/20">
                {generateSuccess}
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-ink mb-2">
                  Name (As per PAN/Aadhaar/Bank)
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 bg-linen/50 border border-ink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-ink focus:bg-white transition-all duration-200 text-lg font-mono"
                />
              </div>

              <div>
                <label htmlFor="college" className="block text-sm font-bold text-ink mb-2">
                  College (Optional)
                </label>
                <input
                  type="text"
                  id="college"
                  name="college"
                  placeholder="Enter your college name"
                  className="w-full px-4 py-3 bg-linen/50 border border-ink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-ink focus:bg-white transition-all duration-200 text-lg font-mono"
                />
              </div>

              <div>
                <label htmlFor="upiId" className="block text-sm font-bold text-ink mb-2">
                  UPI ID
                </label>
                <input
                  type="text"
                  id="upiId"
                  name="upiId"
                  placeholder="e.g., name@upi"
                  required
                  className="w-full px-4 py-3 bg-linen/50 border border-ink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-ink focus:bg-white transition-all duration-200 text-lg font-mono"
                />
              </div>

              <div>
                <label htmlFor="confirmUpiId" className="block text-sm font-bold text-ink mb-2">
                  Confirm UPI ID
                </label>
                <input
                  type="text"
                  id="confirmUpiId"
                  name="confirmUpiId"
                  placeholder="Re-enter your UPI ID"
                  required
                  className="w-full px-4 py-3 bg-linen/50 border border-ink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-ink focus:bg-white transition-all duration-200 text-lg font-mono"
                />
              </div>
              <div>
                <label htmlFor="prefix" className="block text-sm font-bold text-ink mb-2">
                  Desired Code Prefix (Letters only)
                </label>
                <input
                  type="text"
                  id="prefix"
                  name="prefix"
                  maxLength={10}
                  required
                  className="w-full px-4 py-3 bg-linen/50 border border-ink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-ink focus:bg-white transition-all duration-200 text-lg font-mono uppercase"
                  onChange={(e) => {
                    // Convert to uppercase and remove non-letters
                    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                  }}
                />
                <p className="mt-1 text-xs text-ink/50">
                  Your final code will be: <span className="font-mono">{generatedCode ? generatedCode + '500' : 'XXXXXX500'}</span>
                </p>
              </div>

              {/* Legal disclaimer */}
              <div className="pt-2 pb-1 text-center">
                <p className="text-xs text-muted">
                  By generating a code, you agree to our{" "}
                  <Link
                    href="/legal/partner-agreement"
                    className="font-bold underline hover:text-ink transition-colors"
                  >
                    Terms of use
                  </Link>
                  .
                </p>
              </div>

              <button
                type="submit"
                disabled={generateLoading}
                className={`w-full bg-ink text-linen px-5 py-3 rounded-xl font-bold text-md hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  generateLoading ? 'bg-ink/70' : ''
                }`}
              >
                {generateLoading ? (
                  <div className="flex items-center gap-2">
                    <span>Processing</span>
                    <span className="h-2 w-2 bg-ink/50 rounded-full animate-bounce delay-75"></span>
                    <span className="h-2 w-2 bg-ink/50 rounded-full animate-bounce delay-150"></span>
                    <span className="h-2 w-2 bg-ink/50 rounded-full animate-bounce delay-225"></span>
                  </div>
                ) : (
                  'Generate Code'
                )}
              </button>
            </form>
            {generatedCode && (
  <div className="mt-6 rounded-2xl border border-green-300 bg-green-50 p-5">
    <p className="text-sm text-gray-600">
      Your Referral Code
    </p>

    <p className="mt-2 text-2xl font-black tracking-widest text-green-700">
      {generatedCode}
    </p>

    <button
      className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-white"
      onClick={() => navigator.clipboard.writeText(generatedCode)}
    >
      Copy Code
    </button>
  </div>
)}
          </div>

          {/* Track Earnings */}
          <div className="bg-white rounded-3xl shadow-sm border border-ink/10 p-6">
            <h2 className="text-xl font-bold text-ink mb-4">Track Earnings</h2>
            <p className="text-ink/60 mb-6">
              Enter a referral code to see its usage history and earnings.
            </p>

            {trackError && (
              <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-200 text-red-700">
                {trackError}
              </div>
            )}

            {trackResults && (
              <div className="mb-6 p-4 bg-linen/50 rounded-xl border border-ink/10">
                <div className="grid gap-4 md:grid-cols-3 text-center">
                  <div>
                    <p className="text-xs text-ink/50">Amount Receivable</p>
                    <p className="text-2xl font-bold text-ink">₹{trackResults.earnings}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink/50">Total Uses</p>
                    <p className="text-2xl font-bold text-ink">{trackResults.successful}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink/50">Linked UPI</p>
                    <p className="text-lg font-mono text-ink break-all">{trackResults.upiId || 'Not set'}</p>
                  </div>
                </div>
              </div>
            )}

            {trackResults && trackResults.ledger.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-bold text-ink mb-2">Usage History</h3>
                <div className="space-y-3">
                  {trackResults.ledger.map((record: TrackRecord, index: number) => (
                    <div key={index} className="p-3 bg-linen/50 rounded-xl border border-ink/5">
                      <div className="flex justify-between text-sm">
                        <span>{new Date(record.date).toLocaleDateString()}</span>
                        <span>{record.referrerName || 'Anonymous'}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>₹{record.amount}</span>
                        <span className={`
                          px-2 py-0.5 rounded-full text-xs font-medium
                          ${record.status === 'Completed' ? 'bg-moss/10 text-moss' : 'bg-clay/10 text-clay'}
                        `}>
                          {record.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {trackResults && trackResults.ledger.length === 0 && (
              <div className="text-center py-6 text-ink/50">
                No usage data found for this code.
              </div>
            )}

            <form onSubmit={handleTrack} className="space-y-4">
              <div>
                <label htmlFor="trackCode" className="block text-sm font-bold text-ink mb-2">
                  Referral Code
                </label>
                <input
                  type="text"
                  id="trackCode"
                  name="code"
                  placeholder="Enter referral code (e.g., RAHUL500)"
                  required
                  className="w-full px-4 py-3 bg-linen/50 border border-ink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-ink focus:bg-white transition-all duration-200 text-lg font-mono uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={trackLoading}
                className={`w-full bg-ink text-linen px-5 py-3 rounded-xl font-bold text-md hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  trackLoading ? 'bg-ink/70' : ''
                }`}
              >
                {trackLoading ? (
                  <div className="flex items-center gap-2">
                    <span>Processing</span>
                    <span className="h-2 w-2 bg-ink/50 rounded-full animate-bounce delay-75"></span>
                    <span className="h-2 w-2 bg-ink/50 rounded-full animate-bounce delay-150"></span>
                    <span className="h-2 w-2 bg-ink/50 rounded-full animate-bounce delay-225"></span>
                  </div>
                ) : (
                  'Track Code'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      {showSuccessPopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="w-[90%] max-w-md rounded-2xl bg-white p-6 shadow-2xl">
      <h2 className="text-2xl font-bold text-green-600 text-center">
        🎉 Referral Code Created Successfully!
      </h2>

      <p className="mt-4 text-center text-gray-600">
        Your referral code is
      </p>

      <div className="mt-4 rounded-xl border-2 border-dashed border-green-500 bg-green-50 p-4 text-center">
        <p className="text-3xl font-black tracking-widest">
          {generatedCode}
        </p>
      </div>
<div className="mt-6 flex gap-3">
       <button
    className="flex-1 rounded-xl bg-green-600 py-3 font-bold text-white"
    onClick={() => navigator.clipboard.writeText(generatedCode ?? "")}
  >
    Copy Code
  </button>

  <button
    className="flex-1 rounded-xl bg-black py-3 font-bold text-white"
    onClick={() => setShowSuccessPopup(false)}
  >
    OK
  </button>
  </div>
    </div>
  </div>
)}
    </div>
  );
}