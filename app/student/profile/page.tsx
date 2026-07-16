"use client";

import { useState, useEffect, useCallback } from "react";
import { StudentShell } from "@/components/student/StudentShell";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/Button";
import { useToast } from "@/contexts/ToastContext";
import { Calendar, GraduationCap, Instagram, Smartphone} from "lucide-react";
import { useAuth } from "@clerk/nextjs";


export default function StudentProfilePage() {
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    mobileNumber: "",
    instagramHandle: "",
    xHandle: "",
    university: "",
    courseYear: "",
    gender: "",
    emergencyContact: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const { isLoaded, isSignedIn } = useAuth();

  // 1. First, define fetchProfile wrapped in useCallback (add useCallback to your 'react' imports if needed)
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("/user/profile");

      if (data.success && data.data) {
        const userData = data.data;
        setProfileData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          dob: userData.dob ? userData.dob.split("T")[0] : "",
          mobileNumber: userData.mobileNumber || "",
          instagramHandle: userData.instagramHandle || "",
          xHandle: userData.xHandle || "",
          university: userData.university || "",
          courseYear: userData.courseYear || "",
          gender: userData.gender || "",
          emergencyContact: userData.emergencyContact || ""
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      showToast("Failed to load profile data", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]); // Removed getToken from dependencies

  // 2. Then, run the useEffect using fetchProfile as a dependency
  // Re-run when isLoaded or isSignedIn changes (but we already return early if not ready)
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchProfile();
    }
  }, [fetchProfile, isLoaded, isSignedIn]);

  // If Clerk is not loaded, user is not signed in, or profile data is loading, show loading spinner
  if (!isLoaded || !isSignedIn || loading) {
    return (
      <StudentShell>
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ink"></div>
        </div>
      </StudentShell>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Explicitly type updateData as a record of strings
      const updateData: Record<string, string> = {};

      // 2. Safely cast the value as a string during the loop
      Object.entries(profileData).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          updateData[key] = String(value);
        }
      });
      if (profileData.name) updateData.name = profileData.name;
      if (profileData.phone) updateData.phone = profileData.phone;
      if (profileData.dob) updateData.dob = new Date(profileData.dob).toISOString();
      if (profileData.mobileNumber) updateData.mobileNumber = profileData.mobileNumber;
      if (profileData.instagramHandle) updateData.instagramHandle = profileData.instagramHandle;
      if (profileData.xHandle) updateData.xHandle = profileData.xHandle;
      if (profileData.university) updateData.university = profileData.university;
      if (profileData.courseYear) updateData.courseYear = profileData.courseYear;
      if (profileData.gender) updateData.gender = profileData.gender;
      if (profileData.emergencyContact) updateData.emergencyContact = profileData.emergencyContact;

      await apiClient.put("/user/profile", updateData);

      showToast("Profile updated successfully!", "success");

      // Refetch data to ensure consistency
      await fetchProfile();
    } catch (error) {
      console.error("Failed to update profile:", error);
      showToast("Failed to update profile. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <StudentShell>
      <div className="space-y-8 py-8">
        <div className="bg-white rounded-3xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-ink flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Profile Settings
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-ink flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Personal Information
              </h3>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Name */}
                <div>
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-ink">Full Name</span>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="input"
                    />
                  </label>
                </div>

                {/* Phone */}
                <div>
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-ink">Phone Number</span>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="+91 XXXXXXXXXX"
                      className="input"
                    />
                  </label>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-ink">Date of Birth</span>
                    <input
                      type="date"
                      value={profileData.dob}
                      onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                      className="input"
                    />
                  </label>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-ink">Mobile Number (WhatsApp)</span>
                    <input
                      type="tel"
                      value={profileData.mobileNumber}
                      onChange={(e) => setProfileData({ ...profileData, mobileNumber: e.target.value })}
                      placeholder="+91 XXXXXXXXXX"
                      className="input"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-ink flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Social Links
              </h3>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Instagram */}
                <div>
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-ink">Instagram Handle</span>
                    <input
                      type="text"
                      value={profileData.instagramHandle}
                      onChange={(e) => setProfileData({ ...profileData, instagramHandle: e.target.value })}
                      placeholder="e.g., @username"
                      className="input"
                    />
                  </label>
                </div>

                {/* X (Twitter) */}
                <div>
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-ink">X Handle</span>
                    <input
                      type="text"
                      value={profileData.xHandle}
                      onChange={(e) => setProfileData({ ...profileData, xHandle: e.target.value })}
                      placeholder="e.g., @username"
                      className="input"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Academic Details */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-ink flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Academic Details
              </h3>

              <div className="grid gap-6 md:grid-cols-2">
                {/* University */}
                <div>
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-ink">University/College</span>
                    <input
                      type="text"
                      value={profileData.university}
                      onChange={(e) => setProfileData({ ...profileData, university: e.target.value })}
                      placeholder="Enter your university name"
                      className="input"
                    />
                  </label>
                </div>

                {/* Course Year */}
                <div>
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-ink">Course Year</span>
                    <select
                      value={profileData.courseYear}
                      onChange={(e) => setProfileData({ ...profileData, courseYear: e.target.value })}
                      className="input"
                    >
                      <option value="">Select course year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="5th Year+">5th Year+</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                </div>

                {/* Gender */}
                <div>
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-ink">Gender</span>
                    <select
                      value={profileData.gender}
                      onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                      className="input"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-ink">Emergency Contact</span>
                    <input
                      type="tel"
                      value={profileData.emergencyContact}
                      onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                      placeholder="+91 XXXXXXXXXX"
                      className="input"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                variant="primary"
                className="w-full py-3"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </StudentShell>
  );
}