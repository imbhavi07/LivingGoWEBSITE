import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Terms of Use | LivingGo",
};

const sections = [
  { 
    title: "Article 1: Parties", 
    content: `These Terms of Use constitute a legally binding agreement between RCT ACCOMMODATIONS AND INFRASTRUCTURE PRIVATE LIMITED (operating as "LivingGo") [cite: 5, 6] and the individual accessing, registering on, making enquiries through, booking through, making payments through or otherwise using the Platform (the "Student" or "User")[cite: 8].` 
  },
  { 
    title: "Article 2: Acceptance of Terms", 
    content: `By creating an account, submitting information, clicking "I Agree", verifying an OTP, making a booking, making payment, or using any LivingGo service [cite: 11, 12, 13, 14, 15, 16, 17, 18], you acknowledge and agree that you have read, understand, voluntarily accept, and intend to be legally bound by these Terms[cite: 19, 20, 21, 22, 23]. Electronic acceptance shall constitute valid and binding acceptance[cite: 24].` 
  },
  { 
    title: "Article 3: Definitions", 
    content: `Defines key terms across the Platform, including Accommodation, Booking Amount, Confirmed Booking, Property Owner, Check-In, and LivingGo Lead[cite: 27, 29, 31, 33, 35, 37].` 
  },
  { 
    title: "Article 4: Eligibility", 
    content: `You represent and warrant that information submitted is true, documents submitted are genuine, you are legally competent to contract, and you possess authority to make bookings[cite: 41, 42, 43, 44, 45]. Providing false information constitutes material breach[cite: 47].` 
  },
  { 
    title: "Article 5: Platform Role", 
    content: `LivingGo operates a technology-enabled accommodation marketplace[cite: 50]. LivingGo does not own listed properties, act as landlord, or guarantee occupancy, suitability, or admission[cite: 52, 53, 54, 55, 56, 57]. LivingGo facilitates accommodation discovery, communication, booking, reservation, and payment processing[cite: 58, 59, 60, 61, 62, 63].` 
  },
  { 
    title: "Article 6: Account Registration", 
    content: `To access certain services, Users may be required to provide name, mobile number, email address, educational details, identity documents, emergency contact details, and payment information[cite: 67, 68, 69, 70, 71, 72, 73, 74]. Users shall maintain accuracy of information[cite: 75].` 
  },
  { 
    title: "Article 7: Booking Process", 
    content: `A booking shall become confirmed only upon submission of required information, successful verification, payment of applicable Booking Amount, and issuance of confirmation by LivingGo[cite: 78, 79, 80, 81, 82]. LivingGo reserves the right to decline bookings[cite: 83].` 
  },
  { 
    title: "Article 8: Nature of Booking Amount", 
    content: `The Student expressly acknowledges that the Booking Amount constitutes earnest money and reservation consideration[cite: 86, 87]. The Accommodation may be removed from availability upon booking, and LivingGo and the Property Owner may incur commercial commitments and opportunity costs in reliance upon the booking[cite: 88, 89, 90].` 
  },
  { 
    title: "Article 9: Non-Refundable Booking Policy", 
    content: `Except where expressly provided, all Booking Amounts shall be final and non-refundable[cite: 93]. No refund shall ordinarily be available on account of change of preference, relocation, admission elsewhere, financial constraints, personal circumstances, parental objections, travel changes, failure to occupy, or voluntary cancellation[cite: 94, 95, 96, 97, 98, 99, 100, 101, 102, 103].` 
  },
  { 
    title: "Article 10: Limited Transfer Facility", 
    content: `LivingGo may, in exceptional circumstances and entirely at its operational and commercial discretion, consider transfer of a Booking Amount to another accommodation[cite: 107]. Transfer is not a right and is not guaranteed[cite: 108, 109, 110]. Transfer requests shall only be considered where the request is submitted before Check-In, the Booking Amount has not yet been remitted to the Property Owner, alternative inventory is available, only one transfer request is made, and LivingGo approves the request[cite: 112, 114, 116, 118, 120, 122].` 
  },
  { 
    title: "Article 11: Owner Cancellation", 
    content: `Where a Property Owner cancels a Confirmed Booking without valid justification, LivingGo may endeavour to resolve the issue, facilitate occupancy, or identify alternative accommodation[cite: 126, 127, 128, 129]. Where no suitable alternative accommodation can reasonably be arranged, LivingGo may facilitate refund of recoverable amounts, but no compensation shall be payable by LivingGo[cite: 131, 132].` 
  },
  { 
    title: "Article 12: Check-In Issues", 
    content: `Where a Property Owner refuses occupancy despite a Confirmed Booking, LivingGo may communicate with the Property Owner, investigate circumstances, attempt resolution, or identify alternative accommodation[cite: 135, 136, 137, 138, 139]. The Student acknowledges that LivingGo's role is facilitative in nature[cite: 140].` 
  },
  { 
    title: "Article 13: Property Information", 
    content: `Property information displayed on the Platform may be supplied by Property Owners[cite: 143]. LivingGo does not warrant that all information is complete, accurate or continuously updated; Students are encouraged to independently evaluate accommodation suitability[cite: 144, 145].` 
  },
  { 
    title: "Article 14: User Conduct", 
    content: `Users shall not provide false information, engage in unlawful conduct, damage property, harass occupants, misuse Platform services, interfere with operations, or attempt unauthorized access[cite: 148, 149, 150, 151, 152, 153, 154, 155]. Violation may result in suspension or termination[cite: 156].` 
  },
  { 
    title: "Article 15: Communication Consent", 
    content: `The Student expressly consents to receive calls, SMS, emails, WhatsApp communications, push notifications, and platform messages relating to bookings and operations[cite: 159, 160, 161, 162, 163, 164, 165, 166]. The Student consents to electronic communications being relied upon as evidence[cite: 167].` 
  },
  { 
    title: "Article 16: Electronic Records & Digital Consent", 
    content: `All electronic actions performed on the Platform shall be legally binding, and clicking acceptance prompts or OTP verifications shall constitute valid consent[cite: 187, 188, 189]. The Student consents to LivingGo maintaining electronic records of registrations, bookings, payments, and activity logs as evidence[cite: 190, 191, 192, 193, 194, 199].` 
  },
  { 
    title: "Article 17: OTP Authentication", 
    content: `Successful OTP verification shall constitute proof of authorization and shall be treated as equivalent to electronic acknowledgement[cite: 202, 203, 204]. The Student shall be responsible for maintaining security of devices and notify LivingGo of unauthorized access[cite: 205, 206].` 
  },
  { 
    title: "Article 18: Electronic Evidence", 
    content: `Records including account activity logs, OTP records, emails, SMS, booking records, IP logs, and device logs may be relied upon as evidence and shall be presumed accurate unless demonstrated otherwise[cite: 209, 210, 211, 212, 213, 216, 218, 219, 223].` 
  },
  { 
    title: "Article 19: Data Collection and Processing", 
    content: `The Student authorizes LivingGo to collect, process, store and utilize information reasonably necessary for operation, which is governed by the Privacy Policy[cite: 226, 236].` 
  },
  { 
    title: "Article 20: Communication Recording", 
    content: `The Student acknowledges that communications may be monitored, recorded, retained and reviewed for service quality, dispute resolution, fraud prevention, compliance, and legal purposes[cite: 239, 240, 241, 242, 243].` 
  },
  { 
    title: "Article 21: Property Visits", 
    content: `Property visits are undertaken at the Student's discretion[cite: 247]. LivingGo does not guarantee admission, availability, occupancy, future pricing, or continued availability of inventory[cite: 248, 249, 250, 251, 252, 253].` 
  },
  { 
    title: "Article 22: Student Representations", 
    content: `The Student represents that all information provided is true, documents are genuine, information is not misleading, and bookings are not for unlawful purposes[cite: 257, 258, 259, 260, 261].` 
  },
  { 
    title: "Article 23: Non-Circumvention", 
    content: `Property Owners introduced through LivingGo constitute LivingGo-introduced contacts[cite: 265]. The Student shall not knowingly participate in arrangements specifically intended to circumvent valid commissions lawfully due to LivingGo[cite: 266].` 
  },
  { 
    title: "Article 24: Third-Party Relationships", 
    content: `Accommodation is provided by independent Property Owners[cite: 270]. LivingGo shall not be responsible for property management, housekeeping, roommate conduct, owner conduct, utility failures, or local disputes[cite: 271, 272, 273, 274, 275].` 
  },
  { 
    title: "Article 25: Limitation of Liability", 
    content: `LivingGo shall not be liable for indirect, consequential, special, or incidental damages, loss of opportunity, academic losses, relocation costs, or emotional distress claims[cite: 279, 280, 282, 283, 284, 285, 286, 287]. LivingGo's liability shall not exceed the amount directly received by LivingGo in connection with the relevant booking[cite: 288].` 
  },
  { 
    title: "Article 26: Indemnity", 
    content: `The Student agrees to indemnify LivingGo, its directors, employees, and affiliates against losses arising from a breach of these Terms, false information, unlawful conduct, or misuse of the Platform[cite: 291, 292, 293, 295, 296, 297, 298, 299, 300, 301].` 
  },
  { 
    title: "Article 27: Fraud Prevention", 
    content: `LivingGo reserves the right to verify identities, request documents, suspend transactions, reject bookings, and freeze accounts where fraud or suspicious activity is reasonably suspected[cite: 304, 305, 306, 307, 308, 309, 310].` 
  },
  { 
    title: "Article 28: Force Majeure", 
    content: `LivingGo shall not be liable for delay or failure arising from events beyond reasonable control, including natural disasters, pandemics, internet outages, strikes, or governmental actions[cite: 313, 314, 318, 319, 321, 322].` 
  },
  { 
    title: "Article 29: Suspension and Termination", 
    content: `LivingGo may suspend, restrict or terminate access where Terms are breached, fraudulent/unlawful conduct is suspected, or risk management concerns arise[cite: 326, 327, 328, 329].` 
  },
  { 
    title: "Article 30: Dispute Resolution", 
    content: `Parties shall first attempt to resolve disputes amicably within thirty (30) days following a written notice describing the dispute[cite: 333, 334, 335].` 
  },
  { 
    title: "Article 31: Arbitration", 
    content: `Any dispute shall be referred to arbitration in accordance with the Arbitration and Conciliation Act, 1996[cite: 338]. It shall be conducted by a sole arbitrator with the seat of arbitration in Delhi, and the award shall be final and binding[cite: 339, 340, 342].` 
  },
  { 
    title: "Article 32: Governing Law", 
    content: `These Terms shall be governed by the laws of India, and courts at Delhi shall have jurisdiction subject to arbitration provisions[cite: 345, 346].` 
  },
  { 
    title: "Article 33: Intellectual Property", 
    content: `All rights relating to the Platform, software, branding, trademarks, content, and databases remain the exclusive property of LivingGo or its licensors[cite: 349, 350, 351, 352, 353, 354, 355, 356].` 
  },
  { 
    title: "Article 34: Privacy Policy Incorporation", 
    content: `The Privacy Policy forms an integral part of these Terms, and acceptance of these Terms constitutes acceptance of the Privacy Policy[cite: 360, 361].` 
  },
  { 
    title: "Article 35: Modifications", 
    content: `LivingGo may modify these Terms, and continued use of the Platform after publication of updated versions shall constitute acceptance[cite: 364, 365, 366].` 
  },
  { 
    title: "Article 36: Severability", 
    content: `If any provision is determined to be invalid, the remaining provisions shall continue in full force and effect[cite: 369].` 
  },
  { 
    title: "Article 37: Entire Agreement", 
    content: `These Terms, the Privacy Policy, and booking-specific documents constitute the entire agreement between the Student and LivingGo[cite: 372].` 
  },
  { 
    title: "Article 38: Survival", 
    content: `Provisions regarding payments, indemnities, dispute resolution, arbitration, evidence, liability limitations, and intellectual property shall survive termination[cite: 375, 376, 377, 378, 379, 380, 382, 383].` 
  },
  { 
    title: "Schedule A: Digital Acceptance Framework", 
    content: `For evidentiary purposes, LivingGo may maintain IP logs, OTP logs, payment records, device records, and audit trails to establish acceptance, authorization, and consent[cite: 386, 387, 388, 391, 394, 395, 396, 397, 398, 399].` 
  },
  { 
    title: "Schedule B: Booking Policy Summary", 
    content: `Transfer requests are exceptional accommodations, not rights[cite: 404]. Booking Amounts are generally non-refundable[cite: 406]. Only one transfer request may be considered [cite: 409], before check-in [cite: 410], if funds have not been remitted to the Property Owner [cite: 411, 412], and remains subject to LivingGo's operational determination[cite: 413].` 
  }
];

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-linen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to home
        </Link>
        <div className="rounded-3xl bg-white p-6 shadow-soft sm:p-10">
          <div className="mb-8 flex items-start gap-4">
            <div className="rounded-2xl bg-linen p-3">
              <ShieldCheck className="h-7 w-7 text-clay" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-black uppercase text-clay">LivingGo Legal</p>
              <h1 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Terms of Use</h1>
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
            By using the LivingGo platform, you acknowledge having read, understood, and voluntarily accepted these Terms of Use.
          </div>
        </div>
      </div>
    </main>
  );
}