import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Exclusive Inventory Management & Revenue Sharing Agreement | LivingGo",
};

const sections = [
  {
    title: "1. Parties",
    content: `This Exclusive Inventory Management and Revenue Sharing Agreement ("Agreement") is entered into between RCT ACCOMMODATIONS AND INFRASTRUCTURE PRIVATE LIMITED, CIN U68100BR2026PTC084883, having its registered office at BE.NO.005.1012, Shivpuri Colony, Bettiah, West Champaran – 845438, Bihar, India, operating under the brand name "LivingGo" ("LivingGo", "Company", "Platform") AND the Property Owner completing onboarding and accepting this Agreement ("Owner").`,
  },
  {
    title: "2. Appointment",
    content: `The Owner hereby appoints LivingGo on an exclusive basis to: market accommodation inventory; generate leads; manage bookings; manage pricing; collect payments; administer occupancy; undertake inventory management; and provide related services.`,
  },
  {
    title: "3. Exclusive Inventory Rights",
    content: `During the Term, the Owner grants LivingGo exclusive commercial rights to market, allocate, promote and monetize the inventory designated under this Agreement. The Owner shall not directly or indirectly appoint competing intermediaries for such designated inventory unless expressly approved by LivingGo in writing.`,
  },
  {
    title: "4. Term",
    content: `Initial Term: Twelve (12) Months commencing from onboarding. The Agreement shall continue unless terminated in accordance with its provisions.`,
  },
  {
    title: "5. Designated Inventory",
    content: `Owner shall specify: total beds; room inventory; accommodation categories; occupancy capacities. Such inventory shall constitute the Exclusive Inventory.`,
  },
  {
    title: "6. Base Owner Rate",
    content: `For each designated inventory category, the parties shall mutually determine a Base Owner Rate. The Base Owner Rate shall represent the minimum amount payable to the Owner for occupied inventory.`,
  },
  {
    title: "7. Pricing Authority",
    content: `The Owner irrevocably authorizes LivingGo to determine: marketed rent; occupancy pricing; promotional pricing; discount structures; bundled offers; occupancy incentives. The Owner acknowledges that LivingGo may market inventory above the Base Owner Rate.`,
  },
  {
    title: "8. LivingGo Margin",
    content: `The difference between the Occupancy Price collected from the Student and the Base Owner Rate payable to the Owner shall constitute LivingGo Revenue. Such revenue shall belong exclusively to LivingGo. The Owner shall have no right, title or claim over such revenue.`,
  },
  {
    title: "9. Commission",
    content: `In addition to recurring LivingGo Revenue, Owner shall pay Brokerage Equal To Fifteen (15) Days Of First Month's Rent for each Student admitted through LivingGo. The parties may agree otherwise in writing for specific inventory.`,
  },
  {
    title: "10. Exclusive Lead Ownership",
    content: `All Students introduced through LivingGo shall constitute LivingGo Leads. LivingGo shall retain exclusive commercial rights in relation to such Leads during the Term and for twenty-four (24) months thereafter.`,
  },
  {
    title: "11. Non-Circumvention",
    content: `Owner shall not: bypass LivingGo; divert LivingGo Leads; collect undisclosed payments; negotiate off-platform arrangements; conceal admissions — whether directly or indirectly.`,
  },
  {
    title: "12. Mandatory Payment Collection",
    content: `All payments relating to Exclusive Inventory shall be collected exclusively through LivingGo unless LivingGo expressly approves otherwise. This includes: booking amounts; deposits; rent; maintenance charges; occupancy charges.`,
  },
  {
    title: "13. Payment Collection Authority",
    content: `The Owner irrevocably authorizes LivingGo to: collect payments; receive payments; process payments; settle payments; issue payment instructions for inventory covered by this Agreement.`,
  },
  {
    title: "14. Settlement Waterfall",
    content: `LivingGo may deduct: brokerage; revenue share; platform charges; taxes; chargebacks; refunds; penalties; adjustments — before remitting any balance.`,
  },
  {
    title: "15. Owner Settlements",
    content: `Settlements may be processed periodically in accordance with LivingGo's settlement policies. Settlement schedules may be modified by LivingGo upon reasonable notice.`,
  },
  {
    title: "16. Occupancy Management",
    content: `LivingGo may: maintain booking records; maintain occupancy records; track admissions; verify departures; monitor vacancies.`,
  },
  {
    title: "17. Owner Obligations",
    content: `Owner shall: honour confirmed bookings; maintain standards; provide accurate information; cooperate with audits; provide records when requested.`,
  },
  {
    title: "18. Record Maintenance",
    content: `Owner shall maintain: occupancy registers; rent agreements; KYC records; admission records; payment records; visitor registers — for at least five (5) years.`,
  },
  {
    title: "19. Audit Rights",
    content: `LivingGo may inspect and verify records reasonably required to verify compliance. Owner shall provide full cooperation.`,
  },
  {
    title: "20. Field Verification",
    content: `LivingGo may conduct: occupancy verification; quality audits; lead verification; compliance inspections. Such inspections may be announced or unannounced.`,
  },
  {
    title: "21. Monthly Reporting",
    content: `Owner shall provide reports reasonably requested by LivingGo relating to: admissions; vacancies; occupancy; departures; complaints.`,
  },
  {
    title: "22. Lead Presumption",
    content: `Where a LivingGo Lead is introduced and such person is subsequently found residing in Owner's property within twenty-four (24) months, a rebuttable presumption shall arise that the occupancy resulted from LivingGo's efforts. The burden shall lie upon Owner to demonstrate otherwise.`,
  },
  {
    title: "23. Booking Cancellations",
    content: `Owner shall not refuse occupancy to confirmed Students without reasonable cause. LivingGo may suspend listings and recover resulting losses.`,
  },
  {
    title: "24. Confidentiality",
    content: `Owner shall maintain confidentiality regarding: pricing models; lead information; commission structures; settlement mechanisms; operational processes.`,
  },
  {
    title: "25. Liquidated Damages",
    content: `The parties acknowledge that circumvention may cause substantial commercial losses difficult to precisely quantify. Accordingly, subject to applicable law, LivingGo may claim liquidated damages equal to the greater of ₹50,000 OR Three (3) Times The Revenue Avoided, together with costs and expenses reasonably incurred.`,
  },
  {
    title: "26. Suspension",
    content: `LivingGo may immediately suspend: listings; settlements; lead allocation; payment processing — where breach is reasonably suspected.`,
  },
  {
    title: "27. Termination",
    content: `LivingGo may terminate immediately upon: fraud; concealment; diversion of leads; material breach; non-cooperation.`,
  },
  {
    title: "28. Post-Termination Protection",
    content: `The following shall survive termination: lead ownership; commission rights; audit rights; payment rights; confidentiality; non-circumvention — for twenty-four (24) months.`,
  },
  {
    title: "29. Electronic Acceptance",
    content: `The Owner agrees that OTP verification; dashboard acceptance; click-wrap acceptance; electronic signatures; email confirmations — shall constitute legally binding acceptance.`,
  },
  {
    title: "30. Electronic Evidence",
    content: `Owner agrees that LivingGo may rely upon: IP logs; dashboard logs; call records; WhatsApp records; booking records; payment records; settlement records; audit records; lead assignment records; communication records — as evidence.`,
  },
  {
    title: "31. Dispute Resolution",
    content: `Parties shall first attempt amicable resolution. If unresolved within thirty (30) days, disputes shall be referred to arbitration.`,
  },
  {
    title: "32. Arbitration",
    content: `Seat: Delhi. Language: English. Governing Law: Laws of India. Arbitration and Conciliation Act, 1996.`,
  },
  {
    title: "33. Entire Agreement",
    content: `This Agreement constitutes the complete understanding between the parties relating to Exclusive Inventory and Revenue Sharing arrangements.`,
  },
];

export default function RetainerAgreementPage() {
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
              <h1 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Exclusive Inventory Management & Revenue Sharing Agreement</h1>
              <p className="mt-2 text-sm text-muted">RCT Accommodations and Infrastructure Private Limited — operating as LivingGo</p>
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
