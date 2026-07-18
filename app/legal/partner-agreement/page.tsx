import Link from "next/link";
import { Handshake, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Partner Payout Agreement | LivingGo",
};

const sections = [
  {
    title: "1. Parties",
    content: `This Partner Coupon Creation and Payout Agreement ("Agreement") is entered into between RCT Accommodations and Infrastructure Private Limited, CIN U68100BR2026PTC084883, having its registered office at BE.NO.005.1012, Shivpuri Colony, Bettiah, West Champaran – 845438, Bihar, India, operating under the brand name "LivingGo" ("LivingGo", "Company", "Platform") AND the individual or entity completing partner registration and coupon-creation onboarding through the Platform ("Partner").`,
  },
  {
    title: "2. Definitions",
    content: `"Partner" includes, without limitation, Students, Creators and Affiliates who are approved by LivingGo to generate a Coupon Code under this Agreement. "Coupon Code" or "Referral Code" means the unique alphanumeric code generated for or by the Partner through the Platform. "Discount" means the reduction in booking-related charges made available to a Student upon valid redemption of a Coupon Code. "Payout" means the amount payable by LivingGo to the Partner in consideration of Eligible Bookings resulting from redemption of the Partner's Coupon Code. "UPI ID" means the Unified Payments Interface identifier nominated by the Partner for receipt of Payouts. "Eligible Booking" means a booking that satisfies the redemption, verification and anti-fraud conditions set out in this Agreement and in LivingGo's Student Discount and Referral Code Redemption Terms. "Payout Ledger" means the record maintained by LivingGo reflecting accrued, pending, released, withheld and reversed Payouts attributable to a Partner.`,
  },
  {
    title: "3. Appointment",
    content: `LivingGo appoints the Partner, on a non-exclusive, revocable, non-transferable basis, to generate and promote Coupon Codes for the purpose of introducing Students to the Platform. This appointment does not create any employment, agency, partnership or joint venture relationship between LivingGo and the Partner.`,
  },
  {
    title: "4. Coupon Creation Authority",
    content: `Coupon parameters — including discount type, discount value, usage cap, validity window and eligible categories — shall be determined or approved by LivingGo. No Coupon Code shall be treated as active unless and until it has cleared LivingGo's approval workflow, including Super Admin authorisation where applicable. A Coupon Code generated, edited or applied outside LivingGo-approved parameters shall be void and shall not give rise to any Payout entitlement. LivingGo may modify, pause, cap, re-parameterise or deactivate any Coupon Code at its sole discretion, including after issuance, without liability for redemptions that would otherwise have accrued after such action.`,
  },
  {
    title: "5. Partner Representations and Warranties",
    content: `The Partner represents and warrants that: all identity, contact and payment information supplied to LivingGo, including the nominated UPI ID, is accurate and belongs to the Partner; the Partner has lawful authority to receive Payouts against the UPI ID nominated; the Partner shall not create, promote or distribute a Coupon Code through misleading, deceptive, spam-like or unauthorised bulk-messaging means; the Partner shall not redeem, or arrange directly or indirectly for the redemption of, their own Coupon Code; the Partner shall not publish a Coupon Code on public coupon-aggregation or deal-listing websites without LivingGo's prior written consent; the Partner shall promptly notify LivingGo of any change to their contact details or UPI ID.`,
  },
  {
    title: "6. Payment and Payout Terms",
    content: `The Partner shall nominate a valid UPI ID through the Platform dashboard for receipt of Payouts. Payouts shall be processed through LivingGo's payment infrastructure, including collection and split-settlement arrangements operated through LivingGo's payment gateway and banking partners. A Payout shall become due only after: (a) an Eligible Booking is confirmed; (b) any applicable occupancy, first-month-rent or verification condition specified for that Coupon Code is satisfied; and (c) any holding or verification period applied by LivingGo has lapsed. LivingGo may withhold, adjust, reverse or claw back a Payout, whether pending or already disbursed, where the underlying booking is cancelled, reversed, disputed, or reasonably suspected to be fraudulent or collusive. LivingGo may set a minimum Payout threshold and may consolidate multiple accrued amounts into a single settlement cycle. Payouts shall be subject to deduction of applicable taxes, including tax deducted at source, to the extent required under applicable law. The Partner remains solely responsible for their own tax filings and disclosures in respect of Payouts received. LivingGo's Payout Ledger, as reflected on the Partner dashboard, shall be the authoritative record of amounts accrued, released or withheld, absent manifest error.`,
  },
  {
    title: "7. Use of Partner Data and UPI ID",
    content: `LivingGo shall collect the Partner's name, contact details, UPI ID and related payment identifiers solely for coupon administration, Payout processing, verification and fraud prevention. The UPI ID and associated payment details may be shared with LivingGo's payment gateway partners, banking partners, and KYC or verification service providers strictly to the extent necessary to process Payouts. LivingGo shall not sell or license the Partner's payment information to unrelated third parties. Partner data shall otherwise be collected, used, retained and disclosed in accordance with LivingGo's Privacy Policy, which is incorporated into this Agreement by reference.`,
  },
  {
    title: "8. Commission and Incentive Structure",
    content: `LivingGo shall determine, and may revise from time to time, the Payout amount or rate applicable to a given Coupon Code, campaign or Partner category. Incentive structures may be flat, tiered, volume-based or category-based, at LivingGo's discretion, and shall be communicated to the Partner through the Platform dashboard prior to becoming effective. Revisions to Payout rates shall apply prospectively to redemptions occurring after the effective date of the revision, unless LivingGo states otherwise.`,
  },
  {
    title: "9. Ownership of Coupon Codes",
    content: `All Coupon Codes, associated tracking identifiers, campaign assets and related data remain the property of LivingGo. The Partner is granted a limited, revocable, non-transferable right to use and promote their assigned Coupon Code strictly in accordance with this Agreement, and acquires no ownership, licence or other proprietary interest in the Coupon Code beyond such limited right of use.`,
  },
  {
    title: "10. Prohibited Conduct",
    content: `The Partner shall not, whether directly or indirectly: create or operate multiple Partner accounts to generate duplicate or overlapping Coupon Codes; fabricate referrals, fictitious Student accounts, or simulated bookings; collude with a Student or another Partner to manufacture an Eligible Booking; circumvent LivingGo's booking, verification or payment flows; misrepresent LivingGo's services, pricing or discount terms while promoting a Coupon Code.`,
  },
  {
    title: "11. Fraud Detection and Verification",
    content: `LivingGo may employ automated and manual verification measures, including statistical and pattern-based anomaly detection, to assess the validity of a redemption before releasing a Payout. Subject to genuine and demonstrable error, LivingGo's determination as to the validity of a redemption shall be final for the purpose of Payout release.`,
  },
  {
    title: "12. Audit Rights",
    content: `LivingGo may audit the Partner's coupon-related activity, including promotional communications, referral records and associated Student information reasonably required to verify compliance with this Agreement. The Partner shall reasonably cooperate with any such audit.`,
  },
  {
    title: "13. Suspension and Clawback",
    content: `LivingGo may, upon reasonable suspicion of fraud, misuse or breach of this Agreement: suspend the Partner's coupon-creation privileges; withhold any pending Payout; and reclaim any Payout already disbursed in respect of the affected redemption(s).`,
  },
  {
    title: "14. Record Retention",
    content: `The Partner shall retain records of promotional activity and referral communications relating to their Coupon Code for a minimum of two (2) years and shall furnish such records to LivingGo upon reasonable request.`,
  },
  {
    title: "15. Term and Termination",
    content: `This Agreement is effective from the date the Partner completes coupon-creation onboarding and continues until terminated in accordance with this clause. Either party may terminate this Agreement upon reasonable notice through the Platform. LivingGo may terminate this Agreement immediately, without notice, upon fraud, misuse, repeated breach, or reasonable suspicion of circumvention. Termination shall not affect Payout obligations that had already accrued and been verified as of the date of termination, subject to LivingGo's clawback rights under Clause 13.`,
  },
  {
    title: "16. Survival",
    content: `The following shall survive termination of this Agreement: verified and accrued Payout obligations (subject to Clause 13); ownership of Coupon Codes under Clause 9; confidentiality obligations; audit rights under Clause 12; record retention under Clause 14; and dispute resolution under Clause 19.`,
  },
  {
    title: "17. Electronic Acceptance",
    content: `The Partner agrees that OTP acceptance, click-wrap acceptance, dashboard confirmation, electronic signatures and email confirmations shall constitute legally binding acceptance of this Agreement.`,
  },
  {
    title: "18. Electronic Evidence",
    content: `The Partner agrees that LivingGo may rely upon dashboard logs, IP logs, coupon-generation logs, Payout Ledger entries, communication records and audit logs as evidence in relation to any matter arising under this Agreement.`,
  },
  {
    title: "19. Governing Law and Arbitration",
    content: `Governing Law: Laws of India. Seat of Arbitration: Delhi. Language: English. Disputes shall be referred to arbitration under the Arbitration and Conciliation Act, 1996, following a good-faith attempt at amicable resolution within thirty (30) days of a dispute arising.`,
  },
  {
    title: "20. Grievance Redressal",
    content: `For concerns relating to coupon creation, Payouts, or this Agreement, the Partner may contact: Partner Support / Grievance Officer, RCT Accommodations and Infrastructure Private Limited, Email: partners@livinggo.in`,
  },
];

export default function PartnerAgreementPage() {
  return (
    <main className="min-h-screen bg-linen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/admin/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to dashboard
        </Link>
        <div className="rounded-3xl bg-white p-6 shadow-soft sm:p-10">
          <div className="mb-8 flex items-start gap-4">
            <div className="rounded-2xl bg-linen p-3">
              <Handshake className="h-7 w-7 text-clay" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-black uppercase text-clay">LivingGo Legal</p>
              <h1 className="mt-1 text-3xl font-black text-ink sm:text-4xl">
                Partner Coupon & Payout Agreement
              </h1>
              <p className="mt-2 text-sm text-muted">
                RCT Accommodations and Infrastructure Private Limited — operating as LivingGo
              </p>
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
            By creating a coupon code on the LivingGo platform, you acknowledge having read and accepted this Partner Coupon & Payout Agreement.
          </div>
        </div>
      </div>
    </main>
  );
}