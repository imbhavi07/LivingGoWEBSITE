"use client";

import { 
  CalendarCheck, ShieldCheck, BadgeIndianRupee, Lock, 
  ReceiptText, FileDigit, View, Tags, PhoneCall, 
  MapPin, Smartphone, Utensils, MessageSquareWarning 
} from "lucide-react";

const features = [
  {
    title: "Instant Pre-Booking",
    description: "Secure your ideal room months in advance. Skip the last-minute scramble and move in stress-free on your own schedule.",
    icon: <CalendarCheck className="h-6 w-6 text-amber-700" />,
    bgColor: "bg-amber-100"
  },
  {
    title: "Zero Brokerage",
    description: "Keep your money where it belongs. We connect you directly with properties so you never pay a single rupee in broker fees.",
    icon: <BadgeIndianRupee className="h-6 w-6 text-emerald-700" />,
    bgColor: "bg-emerald-100"
  },
  {
    title: "DigiLocker Verified",
    description: "100% authenticated properties and tenants. We utilize official government ID verification to guarantee a perfectly safe living environment.",
    icon: <FileDigit className="h-6 w-6 text-blue-700" />,
    bgColor: "bg-blue-100"
  },
  {
    title: "360° Virtual Tours",
    description: "Walk through your future home directly from your screen. Inspect every corner, room, and amenity before you ever step foot inside.",
    icon: <View className="h-6 w-6 text-purple-700" />,
    bgColor: "bg-purple-100"
  },
  {
    title: "5000+ Campus Seats",
    description: "Massive inventory strategically located across all major North and South Campus hubs. You will never be far from your daily classes.",
    icon: <MapPin className="h-6 w-6 text-red-700" />,
    bgColor: "bg-red-100"
  },
  {
    title: "Automated Rent Tracking",
    description: "View previous receipts, track upcoming electricity bills, and manage all your monthly housing expenses through one seamless digital dashboard.",
    icon: <ReceiptText className="h-6 w-6 text-indigo-700" />,
    bgColor: "bg-indigo-100"
  },
  {
    title: "24/7 Support & Complaints",
    description: "Dedicated helplines and an instant digital complaint window. If something breaks or goes wrong, our rapid response team is on it.",
    icon: <MessageSquareWarning className="h-6 w-6 text-orange-700" />,
    bgColor: "bg-orange-100"
  },
  {
    title: "Curated Lunch Menus",
    description: "Say goodbye to terrible PG food. View daily updated menus and nutritional details right from our dedicated student mobile app.",
    icon: <Utensils className="h-6 w-6 text-teal-700" />,
    bgColor: "bg-teal-100"
  }
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-white px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-ink mb-4">Everything You Need, Built Right In</h2>
          <p className="text-muted text-sm md:text-base max-w-2xl mx-auto">
            We stripped away the chaos of house hunting. No hidden fees, no shady landlords—just a seamless, modern living experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="rounded-3xl bg-linen p-6 border border-black/5 hover:shadow-lg transition-shadow duration-300">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-5 ${feature.bgColor}`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-ink mb-2">{feature.title}</h3>
              <p className="text-sm text-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}