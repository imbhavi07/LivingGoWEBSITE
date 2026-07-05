import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
// 👇 Notice I added Building2 to the lucide-react imports 👇
import { CheckCircle, Clock, XCircle, MapPin, ReceiptText, Home, Building2 } from "lucide-react";
import { format } from "date-fns";

const prisma = new PrismaClient();

// Force dynamic rendering so the dashboard is always fresh
export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const { userId } = await auth();

  // Protect the route
  if (!userId) {
    redirect("/login");
  }

  // Find the internal User record using the Clerk ID
  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  });

  // Fetch the student's token payments using INTERNAL User ID (cuid)
  let payments = [] as any;
  if (user) {
    payments = await prisma.tokenPayment.findMany({
      where: { studentId: user.id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            images: true,
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
              <div key={payment.id} className="overflow-hidden rounded-3xl bg-white shadow-soft border border-black/5">
                <div className="flex flex-col sm:flex-row">
                  
                  {/* Property Image with Fallback */}
                  <div className="relative h-48 sm:h-auto sm:w-64 shrink-0 bg-linen">
                    {imageUrl ? (
                      <Image 
                        src={imageUrl} 
                        alt={payment.property.title}
                        fill
                        className="object-cover"
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
            );
          })}
        </div>
      )}
    </main>
  );
}
