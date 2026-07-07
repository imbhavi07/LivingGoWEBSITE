import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Property Listing & Platform Services Agreement | LivingGo",
};

type AgreementSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  subsections?: {
    title: string;
    paragraphs?: string[];
    bullets?: string[];
  }[];
  note?: string;
};

const sections: AgreementSection[] = [
{
  title: "1. PARTIES",
  paragraphs: [
    `This Property Listing and Platform Services Agreement ("Agreement") is entered into on the Effective Date between RCT ACCOMMODATIONS AND INFRASTRUCTURE PRIVATE LIMITED, a company incorporated under the Companies Act, 2013 bearing CIN U68100BR2026PTC084883, having its registered office at BE.NO.005.1012, Shivpuri Colony, Bettiah, West Champaran – 845438, Bihar, India, operating under the brand name "LivingGo" ("LivingGo", "Company", or "Platform"), and the Property Owner completing registration, onboarding, KYC verification, listing, or acceptance of this Agreement through the Platform ("Owner").`,
    `LivingGo and the Owner shall individually be referred to as a "Party" and collectively as the "Parties".`
  ]
},
{
  title: "2. NATURE OF RELATIONSHIP",
  paragraphs: [
    `LivingGo operates a technology platform that aggregates, markets and lists paying guest, hostel and co-living accommodation inventory on behalf of independent property owners.`,
    `LivingGo facilitates property discovery, enquiries, bookings, onboarding documentation and, where enabled, payment collection between Owners and Students.`,
    `LivingGo acts solely as an intermediary technology platform and is not a tenant, sub-tenant, lessee, landlord or co-landlord of the listed property.`,
    `Nothing contained in this Agreement creates a tenancy, partnership, joint venture or employer-employee relationship between LivingGo and the Owner.`,
    `This Agreement is strictly non-exclusive and Owners remain free to list their inventory elsewhere except where Lead Ownership and Non-Circumvention provisions apply.`
  ]
},
{
  title: "3. APPOINTMENT",
  paragraphs: [
    `The Owner hereby appoints LivingGo on a non-exclusive basis to provide accommodation listing and platform services.`
  ],
  bullets: [
    "List accommodation inventory on the LivingGo platform.",
    "Market inventory across LivingGo channels.",
    "Generate prospective student leads.",
    "Facilitate bookings and admissions.",
    "Facilitate onboarding documentation.",
    "Collect payments where enabled.",
    "Provide platform support services introduced from time to time."
  ],
  note:
    "LivingGo's acceptance of this appointment is conditional upon successful KYC verification and property verification."
},
{
  title: "4. OWNER REPRESENTATIONS & WARRANTIES",
  paragraphs: [
    `The Owner represents and warrants throughout the duration of this Agreement that all information supplied to LivingGo is true, accurate and complete.`
  ],
  bullets: [
    "Property information is accurate.",
    "Pricing is accurate.",
    "Property is structurally safe.",
    "Property is habitable.",
    "Property complies with applicable laws.",
    "Owner shall promptly notify LivingGo of any material changes."
  ],
  subsections: [
    {
      title: "4.1 Title and Authority to Lease",
      paragraphs: [
        `The Owner warrants that they possess valid ownership, lease rights or written authorization permitting operation of the accommodation and admission of residents. LivingGo's onboarding shall never be treated as verification of title.`
      ]
    },
    {
      title: "4.2 Government Approvals",
      paragraphs: [
        `The Owner confirms that all required licenses, permissions, registrations and government approvals required for lawful operation have been obtained and shall remain valid throughout the Agreement.`
      ],
      bullets: [
        "LivingGo is not a licensing authority.",
        "LivingGo does not certify regulatory compliance.",
        "Regulatory compliance remains solely the Owner's responsibility."
      ]
    },
    {
      title: "4.3 Sole Liability of Owner",
      paragraphs: [
        `Any loss arising from false representations, title disputes, regulatory violations or lack of approvals shall remain solely the responsibility of the Owner.`
      ]
    }
  ]
},
{
  title: "5. INVENTORY DECLARATION",
  paragraphs: [
    `The Owner shall accurately disclose complete inventory information for every listed property.`
  ],
  bullets: [
    "Total number of beds.",
    "Room configurations.",
    "Occupancy categories.",
    "Monthly rent.",
    "Security deposit policy.",
    "Amenities.",
    "House rules.",
    "Occupancy restrictions."
  ],
  note:
    "Material misrepresentation constitutes a material breach of this Agreement."
},
{
  title: "6. LIVINGGO LEADS",
  paragraphs: [
    `Any prospective Student introduced through the LivingGo website, mobile application, WhatsApp Business, call centre, referral system, social media, sales representative or any official LivingGo channel shall constitute a LivingGo Lead regardless of whether a booking is ultimately completed.`
  ]
},
{
  title: "7. LEAD OWNERSHIP & PROTECTION PERIOD",
  paragraphs: [
    `LivingGo invests substantial resources into marketing, lead generation and customer acquisition.`
  ],
  bullets: [
    "Every LivingGo Lead remains commercially protected for twenty-four (24) months.",
    "Protection continues even after termination of this Agreement.",
    "Bookings involving protected leads must occur through LivingGo unless expressly approved in writing."
  ]
},
{
  title: "8. LEAD PRESUMPTION",
  paragraphs: [
    `Where a LivingGo Lead is later found residing or paying rent in the Owner's property within the Protection Period, it shall be presumed that the occupancy resulted from LivingGo's introduction unless the Owner proves otherwise through documentary evidence.`
  ]
},
{
  title: "9. NON-CIRCUMVENTION",
  paragraphs: [
    `The Owner shall not directly or indirectly circumvent LivingGo.`
  ],
  bullets: [
    "Bypass LivingGo.",
    "Redirect LivingGo Leads.",
    "Collect undisclosed payments.",
    "Conceal admissions.",
    "Conceal occupancy.",
    "Structure transactions to avoid commission."
  ]
},
{
  title: "10. COMMISSION / BROKERAGE",
  paragraphs: [
    `For every Student admitted through a LivingGo Lead, the Owner shall pay brokerage in accordance with the Commission Model selected by LivingGo.`,
    `Where no alternative model has been agreed, the Standard Flat Commission Model shall apply.`,
    `Brokerage becomes due immediately upon the earlier of payment collection or confirmed occupancy.`,
    `Brokerage is a one-time charge per admitted Student.`,
    `Brokerage once earned shall remain non-refundable.`
  ]
},
{
  title: "11. PAYMENT COLLECTION AUTHORITY",
  paragraphs: [
    "Where the Owner opts to route payments through LivingGo, the Owner appoints LivingGo as a limited collection agent solely for collecting payments from Students on behalf of the Owner."
  ],
  bullets: [
    "First month's rent.",
    "Security deposit according to the Owner's disclosed policy.",
    "Token or pre-booking amounts.",
    "Other agreed recurring occupancy charges."
  ],
  note:
    "This appointment does not constitute a Power of Attorney and is limited solely to payment collection."
},
{
  title: "12. TOKEN / PRE-BOOKING MONEY",
  paragraphs: [
    "LivingGo may collect a token amount from Students to reserve accommodation before admission.",
    "If the Owner does not reject the booking within twenty-four (24) hours, the booking shall be deemed accepted.",
    "The Owner must hold the allocated bed for the notified holding period."
  ],
  bullets: [
    "LivingGo may remit part of the token as Token Advance.",
    "Failure to honour an accepted booking constitutes breach.",
    "LivingGo may recover damages caused by cancellation."
  ]
},
{
  title: "13. SETTLEMENT WATERFALL",
  paragraphs: [
    "Before remitting money to the Owner, LivingGo may deduct applicable charges."
  ],
  bullets: [
    "Brokerage.",
    "Platform fees.",
    "Applicable taxes.",
    "Refunds and chargebacks.",
    "Liquidated damages.",
    "Other lawful adjustments."
  ],
  note:
    "Remaining balance shall ordinarily be settled within seven business days."
},
{
  title: "14. MANDATORY DOCUMENTATION",
  paragraphs: [
    "The Owner shall maintain complete records relating to admissions and occupancy."
  ],
  bullets: [
    "Admission records.",
    "Occupancy register.",
    "Tenant KYC.",
    "Rent agreements.",
    "Payment records.",
    "Visitor register."
  ],
  note:
    "Records must be retained for at least five years."
},
{
  title: "15. AUDIT RIGHTS",
  paragraphs: [
    "LivingGo may inspect relevant records to verify compliance with this Agreement."
  ],
  bullets: [
    "Occupancy records.",
    "Admission records.",
    "KYC records.",
    "Payment records.",
    "Booking records."
  ]
},
{
  title: "16. FIELD VERIFICATION",
  paragraphs: [
    "LivingGo may conduct announced or unannounced inspections at reasonable hours."
  ],
  bullets: [
    "Quality inspection.",
    "Occupancy audit.",
    "Lead verification.",
    "Compliance review."
  ]
},
{
  title: "17. REPORTING",
  paragraphs: [
    "The Owner shall provide information reasonably requested by LivingGo relating to occupancy and inventory."
  ],
  bullets: [
    "Admissions.",
    "Vacancies.",
    "Departures.",
    "Complaints.",
    "LivingGo Leads."
  ]
},
{
  title: "18. OWNER OBLIGATIONS",
  paragraphs: [
    "The Owner shall perform all obligations required under this Agreement."
  ],
  bullets: [
    "Honour confirmed bookings.",
    "Provide accurate information.",
    "Maintain property standards.",
    "Comply with applicable laws.",
    "Cooperate with LivingGo."
  ]
},
{
  title: "19. BOOKING CANCELLATION BY OWNER",
  paragraphs: [
    "The Owner shall not refuse confirmed LivingGo bookings without reasonable written cause."
  ],
  bullets: [
    "LivingGo may relocate the Student.",
    "LivingGo may recover resulting losses.",
    "LivingGo may suspend listings."
  ]
},
{
  title: "20. CONFIDENTIALITY",
  paragraphs: [
    "The Owner shall keep confidential all LivingGo pricing models, lead information, settlement mechanisms, commission structures and internal operational information."
  ],
  note:
    "Confidentiality obligations survive for twenty-four months after termination."
},
{
  title: "21. LIQUIDATED DAMAGES",
  paragraphs: [
    "Circumvention of LivingGo causes substantial commercial loss."
  ],
  bullets: [
    "₹50,000 minimum damages; OR",
    "Two times the brokerage avoided;",
    "Whichever amount is greater.",
    "Reasonable legal expenses may also be recovered."
  ]
},
{
  title: "22. FRAUD & SUSPENSION",
  paragraphs: [
    "LivingGo may immediately suspend listings, settlements and payment processing where fraud or misrepresentation is reasonably suspected."
  ],
  bullets: [
    "Fraud.",
    "Concealment.",
    "Lead diversion.",
    "Misrepresentation."
  ]
},
{
  title: "23. TERM & TERMINATION",
  paragraphs: [
    "This Agreement continues until terminated by either Party.",
    "Either Party may terminate with thirty days' notice.",
    "LivingGo may terminate immediately for material breach."
  ],
  bullets: [
    "Fraud.",
    "Lead diversion.",
    "Repeated complaints.",
    "Non-payment.",
    "Material breach."
  ]
},
{
  title: "24. SURVIVAL",
  paragraphs: [
    "Certain provisions continue even after termination."
  ],
  bullets: [
    "Lead Ownership.",
    "Commission obligations.",
    "Audit rights.",
    "Confidentiality.",
    "Liquidated damages.",
    "Limitation of liability.",
    "Indemnity.",
    "Arbitration."
  ]
},
{
  title: "25. LIMITATION OF LIABILITY(A)",
  paragraphs: [
    "LivingGo acts solely as an intermediary technology platform and booking facilitator.",
    "LivingGo is not responsible for disputes between Owners and Students after bookings are completed.",
    "Except where prohibited by law, LivingGo's aggregate liability shall not exceed the brokerage retained during the preceding twelve months."
  ]
},
{
  title: "26. LIMITATION OF LIABILITY (B)",
  paragraphs: [
    "The Owner expressly acknowledges that LivingGo is an intermediary booking agent and technology platform whose role is limited to marketing the Owner's inventory, introducing prospective Students, and facilitating the booking process.",
    "LivingGo is not a party to the underlying tenancy, leave-and-licence, or occupancy arrangement between the Owner and any Student.",
    "Once a booking has been facilitated and Brokerage has become due, all subsequent acts, omissions, disputes, obligations and liabilities between the Owner and the Student remain solely between those parties."
  ],
  bullets: [
    "LivingGo is not liable for fraud, negligence or misconduct committed by either the Owner or Student.",
    "LivingGo is not liable for disputes arising from tenancy or occupancy arrangements.",
    "LivingGo is not liable for property damage, financial loss or personal injury caused by either party.",
    "LivingGo is not liable for early vacation, abandonment or eviction of Students.",
    "Nothing in this clause excludes liability arising from LivingGo's own fraud, gross negligence or wilful misconduct where liability cannot legally be excluded."
  ],
  note:
    "Subject to applicable law, LivingGo's aggregate liability shall never exceed the total Brokerage retained from the Owner during the preceding twelve (12) months."
},
{
  title: "27. INDEMNITY",
  paragraphs: [
    "The Owner agrees to indemnify, defend and hold harmless LivingGo, its directors, officers, employees and representatives from any loss, claim, penalty, prosecution, expense or legal cost arising from the Owner's conduct."
  ],
  bullets: [
    "Breach of representations or warranties.",
    "False ownership claims.",
    "Lack of authority to lease.",
    "Missing or invalid Government approvals.",
    "Fraud or misconduct by the Owner.",
    "Claims by Students.",
    "Claims by Government authorities.",
    "Violation of applicable laws."
  ],
  note:
    "This indemnity survives termination of this Agreement."
},
{
  title: "28. FORCE MAJEURE",
  paragraphs: [
    "Neither Party shall be liable for any failure or delay in performing its obligations caused by events beyond its reasonable control."
  ],
  bullets: [
    "Natural disasters.",
    "Fire.",
    "Flood.",
    "Pandemic.",
    "Government action.",
    "Civil unrest.",
    "Internet infrastructure failure.",
    "Banking system failure."
  ],
  note:
    "The affected Party shall notify the other Party as soon as reasonably practicable and resume performance once the event has ended."
},
{
  title: "29. DATA PROTECTION",
  paragraphs: [
    "Both Parties shall process all personal information collected under this Agreement in accordance with applicable Indian data protection laws, including the Digital Personal Data Protection Act, 2023.",
    "Personal data shall only be used for purposes connected with this Agreement, platform operations, booking management, payment processing and lawful regulatory compliance."
  ]
},
{
  title: "30. NO TENANCY; NO DEEMED OWNERSHIP",
  paragraphs: [
    "Nothing contained in this Agreement shall be interpreted as creating a tenancy, lease, licence or ownership interest in favour of LivingGo.",
    "Collection of rent, token amount or security deposit by LivingGo shall not make LivingGo a landlord, deemed landlord or person responsible for the property under any applicable Rent Control legislation.",
    "LivingGo acts solely as the Owner's limited technology platform and payment collection agent where applicable."
  ]
},
{
  title: "31. STAMP DUTY",
  paragraphs: [
    "This Agreement shall be stamped in accordance with the Indian Stamp Act, 1899 and any applicable State stamp duty legislation.",
    "Unless otherwise agreed in writing, the Owner shall be responsible for ensuring that adequate stamp duty has been paid.",
    "The Parties acknowledge that an inadequately stamped Agreement may become inadmissible as evidence until the applicable duty and penalties have been paid."
  ]
},
{
  title: "32. ELECTRONIC EXECUTION",
  paragraphs: [
    "This Agreement may be executed electronically.",
    "Electronic records and electronic signatures complying with the Information Technology Act, 2000, including Section 10A, shall have the same legal validity and enforceability as physical signatures.",
    "A counterpart executed and exchanged electronically shall be deemed an original and shall be binding upon both Parties."
  ]
},
{
  title: "33. NOTICES",
  paragraphs: [
    "Any notice required under this Agreement may be served through the registered email address, WhatsApp, SMS, or registered post/courier provided by either Party.",
    "Electronic notices sent before 6:00 PM IST on a business day shall be deemed received on the same day. Notices sent thereafter shall be deemed received on the next business day.",
    "Postal or courier notices shall be deemed received on the date shown in the official delivery record."
  ]
},
{
  title: "34. SEVERABILITY",
  paragraphs: [
    "If any provision of this Agreement is held to be invalid, illegal or unenforceable by a competent court or arbitral tribunal, that provision shall be severed without affecting the validity or enforceability of the remaining provisions.",
    "The Parties shall make reasonable efforts to replace the invalid provision with another valid provision that most closely reflects the original commercial intention."
  ]
},
{
  title: "35. ENTIRE AGREEMENT & AMENDMENT",
  paragraphs: [
    "This Agreement, together with LivingGo's published platform policies and any written commercial terms, constitutes the complete agreement between the Parties.",
    "It supersedes all previous oral or written discussions, negotiations and understandings concerning the subject matter.",
    "No amendment shall be effective unless made in writing or notified through the Platform where permitted under this Agreement."
  ]
},
{
  title: "36. ELECTRONIC ACCEPTANCE",
  paragraphs: [
    "The Owner agrees that OTP verification, click-wrap acceptance, dashboard acceptance, electronic signatures and email confirmations shall each independently constitute legally valid acceptance of this Agreement.",
    "Such acceptance shall have the same legal effect as a handwritten signature in accordance with the Information Technology Act, 2000."
  ]
},
{
  title: "37. ELECTRONIC EVIDENCE",
  paragraphs: [
    "The Owner agrees that LivingGo may rely upon electronic business records maintained in the ordinary course of operations as evidence in any judicial or arbitral proceeding."
  ],
  bullets: [
    "IP logs",
    "Dashboard activity logs",
    "Call recordings",
    "WhatsApp communications",
    "Lead assignment records",
    "Email logs",
    "Booking records",
    "Payment records",
    "Settlement records",
    "Audit logs"
  ]
},
{
  title: "38. DISPUTE RESOLUTION",
  paragraphs: [
    "The Parties shall first attempt to resolve every dispute amicably through good-faith negotiations.",
    "Where the dispute remains unresolved within thirty (30) days after written notice, either Party may refer the matter to arbitration under Clause 39."
  ]
},
{
  title: "39. ARBITRATION",
  paragraphs: [
    "Any unresolved dispute shall be finally settled under the Arbitration and Conciliation Act, 1996, as amended from time to time.",
    "The seat and venue of arbitration shall be Delhi.",
    "The arbitration shall be conducted by a sole arbitrator selected in accordance with the procedure specified under this Agreement.",
    "The language of arbitration shall be English.",
    "This Agreement shall be governed by the laws of India.",
    "Nothing in this clause prevents either Party from seeking interim relief before a competent court where permitted by law."
  ]
},
{
  title: "40. EXECUTION OF AGREEMENT",
  paragraphs: [
    "The Parties confirm that they have read, understood and voluntarily entered into this Agreement.",
    "Where executed electronically, acceptance through LivingGo's Platform shall constitute valid execution of this Agreement.",
    "Where executed physically, this Agreement shall be signed by authorized representatives of both Parties in the presence of witnesses."
  ],
  bullets: [
    "LivingGo Authorized Signatory",
    "Owner Signature",
    "Witness 1",
    "Witness 2",
    "Date",
    "Place"
  ]
},
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
    <h2 className="mb-4 text-lg font-black text-ink">
      {section.title}
    </h2>

    {section.paragraphs?.map((paragraph, index) => (
      <p
        key={index}
        className="mb-4 text-sm leading-7 text-muted"
      >
        {paragraph}
      </p>
    ))}

    {section.bullets && (
      <ul className="mb-4 list-disc space-y-2 pl-6 text-sm leading-7 text-muted">
        {section.bullets.map((bullet, index) => (
          <li key={index}>{bullet}</li>
        ))}
      </ul>
    )}

    {section.subsections?.map((sub) => (
      <div key={sub.title} className="mt-5">
        <h3 className="mb-2 font-bold text-ink">
          {sub.title}
        </h3>

        {sub.paragraphs?.map((paragraph, i) => (
          <p
            key={i}
            className="mb-3 text-sm leading-7 text-muted"
          >
            {paragraph}
          </p>
        ))}

        {sub.bullets && (
          <ul className="list-disc space-y-2 pl-6 text-sm leading-7 text-muted">
            {sub.bullets.map((bullet, i) => (
              <li key={i}>{bullet}</li>
            ))}
          </ul>
        )}
      </div>
    ))}

    {section.note && (
      <div className="mt-4 rounded-xl border border-clay/20 bg-white p-4 text-sm italic text-muted">
        {section.note}
      </div>
    )}
  </div>
))}
          </div>
          <div className="mt-10 rounded-3xl bg-linen p-6">

  <h2 className="mb-6 text-2xl font-black text-ink">
    ANNEXURE A — COMMERCIAL TERM SHEET & COMMISSION MODEL SELECTOR
  </h2>

  <p className="mb-6 text-sm leading-7 text-muted">
    This Annexure records the commercial terms applicable between LivingGo and
    the Property Owner. Where no Commission Model is expressly selected,
    <strong> Model A (Flat Commission)</strong> shall apply by default.
  </p>

  <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
    <table className="min-w-full border-collapse text-sm">

      <thead className="bg-oat">
        <tr>
          <th className="border border-black/10 px-4 py-3 text-left font-black">
            Commercial Term
          </th>

          <th className="border border-black/10 px-4 py-3 text-left font-black">
            Value
          </th>
        </tr>
      </thead>

      <tbody>

        <tr>
          <td className="border border-black/10 px-4 py-3">
            Security Deposit
          </td>

          <td className="border border-black/10 px-4 py-3">
            As per Owner declared policy
          </td>
        </tr>

        <tr>
          <td className="border border-black/10 px-4 py-3">
            Settlement Mode
          </td>

          <td className="border border-black/10 px-4 py-3">
            Standard Settlement (Brokerage deducted at source)
          </td>
        </tr>

        <tr>
          <td className="border border-black/10 px-4 py-3">
            Token Holding Period
          </td>

          <td className="border border-black/10 px-4 py-3">
            7 Days (Default)
          </td>
        </tr>

        <tr>
          <td className="border border-black/10 px-4 py-3">
            Token Advance
          </td>

          <td className="border border-black/10 px-4 py-3">
            25%–40% of Token Amount
          </td>
        </tr>

        <tr>
          <td className="border border-black/10 px-4 py-3">
            Settlement Cycle
          </td>

          <td className="border border-black/10 px-4 py-3">
            Within 7 Business Days
          </td>
        </tr>

      </tbody>

    </table>
  </div>

</div>

<div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6">

<h3 className="text-xl font-black text-green-900">
MODEL A — FLAT COMMISSION
</h3>

<div className="mt-8 overflow-x-auto rounded-2xl border border-black/10 bg-white">

<table className="min-w-full border-collapse text-sm">

<thead className="bg-oat">

<tr>

<th className="border border-black/10 px-4 py-3">
Slab
</th>

<th className="border border-black/10 px-4 py-3">
Leads
</th>

<th className="border border-black/10 px-4 py-3">
Brokerage
</th>

</tr>

</thead>

<tbody>

<tr>
<td className="border p-3">I</td>
<td className="border p-3">1–10</td>
<td className="border p-3">50%</td>
</tr>

<tr>
<td className="border p-3">II</td>
<td className="border p-3">11–20</td>
<td className="border p-3">60%</td>
</tr>

<tr>
<td className="border p-3">III</td>
<td className="border p-3">21–30</td>
<td className="border p-3">70%</td>
</tr>

<tr>
<td className="border p-3">IV</td>
<td className="border p-3">31–40</td>
<td className="border p-3">80%</td>
</tr>

<tr>
<td className="border p-3">V</td>
<td className="border p-3">41–50</td>
<td className="border p-3">90%</td>
</tr>

<tr>
<td className="border p-3">VI</td>
<td className="border p-3">51+</td>
<td className="border p-3">100%</td>
</tr>

</tbody>

</table>

</div>

<div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6">

<h3 className="text-xl font-black text-blue-900">
Worked Example
</h3>

<p className="mt-4 text-sm leading-7 text-blue-900">

Suppose the agreed monthly rent per Student is
<strong> ₹10,000 </strong>
and LivingGo converts
<strong> 35 admissions.</strong>

</p>

<ul className="mt-4 list-disc space-y-2 pl-6 text-sm leading-7 text-blue-900">

<li>Leads 1–10 → ₹50,000</li>

<li>Leads 11–20 → ₹60,000</li>

<li>Leads 21–30 → ₹70,000</li>

<li>Leads 31–35 → ₹40,000</li>

</ul>

<div className="mt-6 rounded-xl bg-white p-4 text-lg font-black text-blue-900">

Total Brokerage = ₹2,20,000

</div>

</div>

<p className="mt-4 text-sm leading-7 text-green-900">
Brokerage shall be equal to
<strong> 50% of the Students First Month Rent </strong>
for every successful admission unless another percentage has been agreed
in writing.
</p>

</div>
  <div className="mt-10 rounded-2xl border border-clay/20 bg-white p-6 text-center">

<p className="text-lg font-bold text-ink">

I acknowledge that I have carefully read, understood and agree to be legally
bound by the LivingGo Property Listing & Platform Services Agreement,
including Annexure A and the applicable Commission Model.

</p>

<p className="mt-3 text-sm text-muted">

Acceptance through OTP verification, dashboard confirmation, electronic
signature or the acceptance checkbox shall constitute legally binding
acceptance of this Agreement.

</p>

</div>
        </div>
      </div>
    </main>
  );
}
