import { PrismaClient } from '@prisma/client'
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { CheckCircle, Clock, XCircle, MapPin, ReceiptText, Home, Building2, Navigation, ExternalLink, Calendar } from "lucide-react";
import { format } from "date-fns";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const { userId } = await auth();

  // Protect the route
  if (!userId) {
    redirect("/login");
  }

  // Find the internal User record using the Clerk ID
  const user = await (prisma as any).user.findUnique({
    where: { clerkId: userId }
  });

  // Fetch the student's visits
  let visits: any[] = [];
  if (user) {
    visits = await (prisma as any).visit.findMany({
      where: { studentId: user.id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            propertyCode: true,
          },
        },
      },
      orderBy: { visitDate: 'desc' },
    });
  }

  // Fetch the student's token payments using INTERNAL User ID (cuid)
  let payments: any[] = [];
  if (user) {
    payments = await (prisma as any).tokenPayment.findMany({
      where: { studentId: user.id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            images: true,
            lat: true,
            lng: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-ink sm:text-4xl">My Dashboard</h1>
        <p className="mt-2 text-sm text-muted">Track your property bookings and token payments.</p>
      </div>

      {/* Quick Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-4">
        <Link
          href="/listings"
          className="flex-1 md:flex-none px-5 py-3 bg-ink text-white rounded-xl font-bold text-md hover:bg-ink/90 transition-colors flex items-center justify-center gap-2"
        >
          <MapPin className="h-4 w-4" />
          Explore Other Properties
        </Link>
        <Link
          href="/earn"
          className="flex-1 md:flex-none px-5 py-3 bg-moss text-white rounded-xl font-bold text-md hover:bg-moss/90 transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          Refer & Earn
        </Link>
      </div>

      {/* My Scheduled Visits */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-ink mb-4">My Scheduled Visits</h2>
        {visits.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white px-6 py-12 text-center shadow-soft border border-black/5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linen mb-4">
              <Calendar className="h-8 w-8 text-clay" />
            </div>
            <h3 className="text-xl font-black text-ink">No scheduled visits</h3>
            <p className="mt-2 max-w-md text-sm text-muted">
              You haven&apos;t scheduled any visits yet. Book a visit to a property to see it here.
            </p>
            <Link
              href="/listings"
              className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-ink/90 transition-colors"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {visits.map((visit) => (
              <div key={visit.id} className="border border-black/5 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-ink">{visit.property?.propertyCode ?? 'Unknown Property'}</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      {visit.leadStatus}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-muted">
                    <div>
                      <p className="font-bold">Property ID</p>
                      <p>{visit.property?.propertyCode ?? 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-bold">Date</p>
                      <p>{format(new Date(visit.visitDate), 'PPP')}</p>
                    </div>
                    <div>
                      <p className="font-bold">Time Slot</p>
                      <p>{visit.timeSlot}</p>
                    </div>
                    <div>
                      <p className="font-bold">Token ID</p>
                      <p className="font-mono">{visit.tokenId}</p>
                    </div>
                    <div>
                      <p className="font-bold">Visit OTP</p>
                      <p className="font-mono text-lg font-black text-green-700">
                        {visit.visitOtp}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {payments.length === 0 ? (
        /* ── EMPTY STATE ── */
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white px-6 py-20 text-center shadow-soft border border-black/5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linen mb-6">
            <Home className="h-10 w-10 text-clay" />
          </div>
          <h2 className="text-2xl font-black text-ink">No bookings yet</h2>
          <p className="mt-2 max-w-md text-sm text-muted">
            You haven&apos;t paid a token for any properties yet. Browse our verified listings to find your perfect student home.
          </p>
          <Link 
            href="/listings" 
            className="mt-8 rounded-full bg-ink px-8 py-3.5 text-sm font-bold text-white hover:bg-ink/90 transition-transform hover:scale-105 shadow-lg"
          >
            Explore Properties
          </Link>
        </div>
      ) : (
        /* ── BOOKINGS LIST ── */
        <div className="grid gap-6">
          {payments.map((payment: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
            // 👇 THIS IS THE FIX FOR THE IMAGES 👇
            // Force TypeScript to treat the Prisma JSON field as an array of objects
            const images = payment.property.images as Array<{ url: string }> | null;
            let imageUrl = images?.[0]?.url || null;

            // Optimize Cloudinary URLs if they exist
            if (imageUrl && imageUrl.includes("res.cloudinary.com") && !imageUrl.includes("f_auto")) {
              imageUrl = imageUrl.replace("/upload/", "/upload/f_auto,q_auto/").replace(/\.heic$/i, ".webp");
            }

            const locationName = payment.property.location.split(',')[0] || "Location restricted";

            return (
              <Link
                key={payment.id}
                href={`/properties/${payment.property.id}`}
                className="block group"
              >
                <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-soft transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:border-clay/30 cursor-pointer">
                <div className="flex flex-col sm:flex-row">
                  
                  {/* Property Image with Fallback */}
                  <div className="relative h-48 sm:h-auto sm:w-64 shrink-0 bg-linen">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={`${payment.property.title} PG in ${payment.property.location} - Student booking confirmation`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-black/5">
                        <Building2 className="h-12 w-12 text-black/20" />
                      </div>
                    )}
                  </div>

                  {/* Booking Details */}
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-black text-ink line-clamp-1">{payment.property.title}</h3>
                          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-muted">
                            <MapPin className="h-4 w-4 shrink-0" />
                            {locationName}
                          </p>
                        </div>
                        
                        {/* Dynamic Status Badge */}
                        <div className="shrink-0">
                          {payment.status === 'pending' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">
                              <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
                              Pending Verification
                            </span>
                          )}
                          {payment.status === 'approved' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-800">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              Confirmed
                            </span>
                          )}
                          {payment.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-800">
                              <XCircle className="h-4 w-4 text-red-600" />
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
                        <div>
                          <p className="text-xs font-bold uppercase text-muted">Token Paid</p>
                          <p className="mt-1 text-lg font-black text-ink">₹{payment.amount.toLocaleString("en-IN")}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-muted">Transaction UTR</p>
                          <p className="mt-1 flex items-center gap-1.5 text-sm font-mono font-bold text-ink">
                            <ReceiptText className="h-4 w-4 text-muted" />
                            {payment.utrNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-muted">Date Requested</p>
                          <p className="mt-1 text-sm font-bold text-ink">
                            {format(new Date(payment.createdAt), "dd MMM yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Status Messages (Proper React Conditional Rendering) */}
                    <div className="mt-6 pt-5 border-t border-black/5">
                      {payment.status === 'pending' && (
                        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 border border-amber-100">
                          <Clock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                          <div>
                            <h4 className="text-sm font-bold text-amber-900">Verification in progress</h4>
                            <p className="text-xs text-amber-700 mt-1">
                              We are verifying your UTR with our bank records. This usually takes 2-4 hours. The owner will contact you once approved.
                            </p>
                          </div>
                        </div>
                      )}

                      {payment.status === 'approved' && (
                        <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
                          <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                          <div>
                            <h4 className="text-sm font-bold text-emerald-900">
                              {!payment.visitVerified ? 'Visit Verification Required' : 'Booking Confirmed!'}
                            </h4>
                            <p className="text-xs text-emerald-700 mt-1">
                              {!payment.visitVerified
                                ? `Your Visit OTP: ${payment.visitOtp}. Please share this with the property owner upon arrival.`
                                : 'Visit Verified! Welcome to your new home.'}
                            </p>
                            {payment.property.lat && payment.property.lng && (
                              <div className="mt-4 grid gap-2">
                              
                                <a
                                  href={`https://www.google.com/maps?q=${payment.property.lat},${payment.property.lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  View Property on Google Maps
                                </a>
                                                        
                                <a
                                  href={`https://www.google.com/maps/dir/?api=1&destination=${payment.property.lat},${payment.property.lng}&travelmode=driving`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                                >
                                  <Navigation className="h-4 w-4" />
                                  Get Directions
                                </a>
                                                        
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {payment.status === 'rejected' && (
                        <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 border border-red-100">
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                          <div>
                            <h4 className="text-sm font-bold text-red-900">Payment Rejected</h4>
                            <p className="text-xs text-red-700 mt-1">
                              We couldn&apos;t verify this UTR number. Please check the details and try again, or contact our support team.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                  </div>
                </div>
              </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
