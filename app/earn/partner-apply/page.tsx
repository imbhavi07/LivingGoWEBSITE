'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';

export default function PartnerApplyPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    upiId: '',
    couponCode: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Basic validation
      if (!formData.fullName.trim()) {
        setError('Please enter your full name');
        return;
      }

      if (!formData.phoneNumber.trim()) {
        setError('Please enter your phone number');
        return;
      }

      if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }

      if (!formData.upiId.trim()) {
        setError('Please enter your UPI ID');
        return;
      }

      if (!formData.couponCode.trim()) {
        setError('Please enter your desired coupon code');
        return;
      }

      // Validate UPI ID format (basic check)
      if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(formData.upiId)) {
        setError('Please enter a valid UPI ID (e.g., name@bank)');
        return;
      }

      // Validate coupon code
      const couponCode = formData.couponCode.trim().toUpperCase();
      if (couponCode.length < 4 || couponCode.length > 20) {
        setError('Coupon code must be between 4 and 20 characters');
        return;
      }

      const validPattern = /^[A-Z0-9]+$/;
      if (!validPattern.test(couponCode)) {
        setError('Coupon code can only contain letters and numbers');
        return;
      }

      // Call API to register partner and create referral
      const response = await apiClient.post('/api/earn/apply', {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim().toLowerCase(),
        upiId: formData.upiId.trim(),
        code: couponCode
      });

      if (response.data.success) {
        setSuccess(true);
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/earn/dashboard');
        }, 1500);
      } else {
        setError(response.data.message || 'Application failed. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Partner application error:', err);
      setError(
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
          (err as { message?: string }).message ||
          'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-linen text-ink flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-sm border border-ink/10 p-10 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-moss/10 text-moss rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-ink mb-4">Application Submitted!</h2>
          <p className="text-ink/70 mb-6">
            Thank you for applying to be a Partner. Our team will review your application and get back to you within 24-48 hours.
          </p>
          <p className="text-sm text-ink/50">
            Once approved, you&rquo;ll receive your unique referral code and can start earning rewards.
          </p>
          <div className="mt-8">
            <button
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full sm:w-auto px-6 py-3"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linen text-ink">
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-sm border border-ink/10 max-w-md w-full p-8 sm:p-12">
          <h1 className="text-2xl sm:text-3xl font-black text-ink mb-6 text-center">
            Apply to be a Partner
          </h1>
          <p className="text-lg text-ink/60 mb-10 text-center max-w-xl mx-auto">
            Join our partner program and earn rewards by sharing your unique referral code.
            Please provide your details below to get started.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-bold text-ink mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                disabled={loading}
                className={`w-full px-5 py-4 bg-linen/50 border border-ink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-ink focus:bg-white transition-all duration-200 text-lg font-mono placeholder:font-sans ${error && 'border-red-300'}`}
                required
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-bold text-ink mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                placeholder="+91 XXXXXXXXXX"
                disabled={loading}
                className={`w-full px-5 py-4 bg-linen/50 border border-ink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-ink focus:bg-white transition-all duration-200 text-lg font-mono placeholder:font-sans ${error && 'border-red-300'}`}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-ink mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                className={`w-full px-5 py-4 bg-linen/50 border border-ink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-ink focus:bg-white transition-all duration-200 text-lg font-mono placeholder:font-sans ${error && 'border-red-300'}`}
                required
              />
            </div>

            <div>
              <label htmlFor="upiId" className="block text-sm font-bold text-ink mb-2">
                UPI ID
              </label>
              <input
                type="text"
                id="upiId"
                value={formData.upiId}
                onChange={(e) => handleChange('upiId', e.target.value)}
                placeholder="e.g., john@upi"
                disabled={loading}
                className={`w-full px-5 py-4 bg-linen/50 border border-ink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-ink focus:bg-white transition-all duration-200 text-lg font-mono placeholder:font-sans ${error && 'border-red-300'}`}
                required
              />
              {error && error.includes('UPI') && (
                <p className="mt-2 text-sm font-medium text-clay">{error}</p>
              )}
            </div>

            <div>
              <label htmlFor="couponCode" className="block text-sm font-bold text-ink mb-2">
                Desired Coupon Code
              </label>
              <input
                type="text"
                id="couponCode"
                value={formData.couponCode}
                onChange={(e) => handleChange('couponCode', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="e.g., LIVINGGO-JOHN"
                disabled={loading}
                className={`w-full px-5 py-4 bg-linen/50 border border-ink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-ink focus:bg-white transition-all duration-200 text-lg font-mono placeholder:font-sans ${error && 'border-red-300'}`}
                maxLength={20}
                required
              />
              {error && error.includes('Coupon') && (
                <p className="mt-2 text-sm font-medium text-clay">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-ink text-linen px-6 py-4 rounded-xl font-bold text-lg hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                loading ? 'bg-ink/70' : ''
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-ink/5 text-center text-sm text-ink/50">
            <p>
              By applying, you agree to our <a href="/terms-of-use" className="text-ink underline hover:no-underline">Terms of Service</a> and{' '}
              <a href="/privacy-policy" className="text-ink underline hover:no-underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}