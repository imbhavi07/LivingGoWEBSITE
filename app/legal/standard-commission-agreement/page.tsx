import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Property Listing & Platform Services Agreement | LivingGo",
};

const sections = [
  { title: "1. Parties", content: `This Property Listing and Platform Services Agreement ("Agreement") is entered into between RCT ACCOMMODATIONS AND INFRASTRUCTURE PRIVATE LIMITED, CIN U68100BR2026PTC084883, having its registered office at BE.NO.005.1012, Shivpuri Colony, Bettiah, West Champaran – 845438, Bihar, India, operating under the brand name "LivingGo" ("LivingGo", "Company", "Platform") AND the Property Owner completing registration, onboarding, verification, listing or acceptance through the Platform ("Owner").` },
  { title: "2. Appointment", content: `The Owner hereby appoints LivingGo on a non-exclusive basis to: list accommodation inventory; market accommodation inventory; generate leads; facilitate bookings; facilitate documentation; facilitate payment collection (if opted); provide platform services.` },
  { title: "3. Owner Representations", content: `The Owner represents and warrants that: Owner has lawful authority to list the property; Property complies with applicable laws; All information supplied is accurate; Property is safe and habitable; Owner shall promptly notify LivingGo regarding material changes.` },
  { title: "4. Inventory Declaration", content: `Owner shall accurately disclose: total beds; room types; pricing; occupancy capacity; amenities; restrictions. Misrepresentation shall constitute material breach.` },
  { title: "5. LivingGo Leads", content: `Any Student introduced through: website; application; WhatsApp; call centre; social media; referral systems; sales representatives — shall constitute a LivingGo Lead.` },
  { title: "6. Lead Ownership", content: `The Owner acknowledges that LivingGo invests substantial resources in: marketing; sales; lead generation; customer acquisition. Accordingly, all LivingGo Leads shall remain protected for twenty-four (24) months from first introduction.` },
  { title: "7. Commission", content: `For every Student who books accommodation through LivingGo, Owner shall pay commission equal to Fifteen (15) Days of the First Month's Agreed Rent or such other amount specifically recorded by LivingGo. Commission becomes due immediately upon occupancy.` },
  { title: "8. Non-Circumvention", content: `The Owner shall not: bypass LivingGo; divert LivingGo Leads; conceal admissions; structure transactions to avoid commission — whether directly or indirectly.` },
  { title: "9. Lead Presumption", content: `Where LivingGo introduced a Student and such Student is subsequently found residing at, occupying or paying rent in Owner's property within twenty-four (24) months, a rebuttable presumption shall arise that such occupancy resulted from LivingGo's introduction. The burden shall lie upon the Owner to prove otherwise.` },
  { title: "10. Mandatory Documentation", content: `Owner shall maintain: admission records; occupancy records; tenant registers; KYC records; rent agreements; occupancy agreements; payment records — for minimum five (5) years.` },
  { title: "11. Rent Agreements", content: `Owner acknowledges that LivingGo may require: standardized documentation; booking confirmations; occupancy records; tenancy records. Where requested by LivingGo, an authorized LivingGo representative may witness such documentation. Failure to cooperate shall constitute breach.` },
  { title: "12. Audit Rights", content: `LivingGo may verify compliance by inspecting: occupancy registers; admission records; KYC records; booking records; rent agreements; payment records. Owner shall reasonably cooperate.` },
  { title: "13. Field Verification", content: `LivingGo may conduct periodic: quality inspections; occupancy audits; lead verification visits; compliance reviews. Such visits may be announced or unannounced.` },
  { title: "14. Monthly Reporting", content: `Owner shall provide information reasonably requested by LivingGo relating to: occupancy; vacancies; admissions; departures; LivingGo Leads.` },
  { title: "15. Owner Obligations", content: `Owner shall: honour confirmed bookings; provide accurate information; cooperate with verification; comply with laws; maintain property standards.` },
  { title: "16. Booking Cancellation by Owner", content: `Owner shall not refuse occupancy to a confirmed LivingGo booking without reasonable cause. Where Owner causes loss, LivingGo may: relocate Student; recover losses; suspend listings.` },
  { title: "17. Payment Collection Services (Optional)", content: `Owner may authorize LivingGo to collect: booking amounts; security deposits; rent payments. Where enabled, Owner authorizes LivingGo to receive payments as collection agent.` },
  { title: "18. Settlements", content: `LivingGo may deduct: commissions; refunds; chargebacks; penalties; taxes where applicable — before remitting balances.` },
  { title: "19. Record Retention", content: `Owner shall preserve records for minimum five years. Destruction of records during disputes shall constitute material breach.` },
  { title: "20. Fraud", content: `LivingGo may suspend listings upon reasonable suspicion of: fraud; concealment; misrepresentation; lead diversion.` },
  { title: "21. Damages", content: `Owner acknowledges that circumvention causes substantial commercial loss. Damages shall be the greater of ₹50,000 OR Three (3) Times the Revenue Avoided, plus legal costs.` },
  { title: "22. Termination", content: `LivingGo may terminate immediately for: fraud; concealment; lead diversion; non-payment; repeated complaints.` },
  { title: "23. Survival", content: `The following survive termination: commissions; audit rights; lead ownership; non-circumvention; damages; arbitration.` },
  { title: "24. Arbitration", content: `Seat: Delhi. Language: English. Governed by Arbitration and Conciliation Act, 1996.` },
  { title: "25. Electronic Acceptance", content: `Owner agrees that: OTP acceptance; click-wrap acceptance; electronic signatures; dashboard confirmations; email confirmations — shall constitute legally binding acceptance.` },
  { title: "26. Electronic Evidence", content: `Owner agrees that LivingGo may rely upon: IP logs; dashboard logs; call records; WhatsApp records; lead assignment logs; email logs; booking records; payment records; audit logs — as evidence.` },
];

export default function StandardCommissionAgreementPage() {
  return (
    <main className="min-h-screen bg-linen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/owner/properties/new" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to listing form
        </Link>
        <div className="rounded-3xl bg-white p-6 shadow-soft sm:p-10">
          <div className="mb-8 flex items-start gap-4">
            <div className="rounded-2xl bg-linen p-3">
              <ShieldCheck className="h-7 w-7 text-clay" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-black uppercase text-clay">LivingGo Legal</p>
              <h1 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Property Listing & Platform Services Agreement</h1>
              <p className="mt-2 text-sm text-muted">Standard Commission Model — RCT Accommodations and Infrastructure Private Limited</p>
            </div>
          </div>
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.title} className="rounded-2xl bg-linen p-5">
                <h2 className="mb-2 text-sm font-black text-ink">{section.title}</h2>
                <p className="text-sm leading-7 text-muted">{section.content}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-black/10 p-4 text-center text-xs text-muted">
            By checking the acceptance box on the listing form, you confirm you have read and agree to this Agreement.
          </div>
        </div>
      </div>
    </main>
  );
}
