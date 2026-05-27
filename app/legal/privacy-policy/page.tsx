import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | LivingGo",
};

const sections = [
  { title: "1. Introduction", content: `By using the LivingGo platform, you consent to the collection, processing and use of information in accordance with this Policy.` },
  { title: "2. Identity Information", content: `LivingGo may collect: full name; photograph; date of birth; gender; Aadhaar details (where voluntarily provided and legally permissible); PAN details; passport details; driving licence details; student identification details; institutional information.` },
  { title: "3. Contact Information", content: `Including: mobile number; alternate mobile number; email address; emergency contact details; guardian details.` },
  { title: "4. Accommodation Information", content: `Including: booking preferences; accommodation preferences; room preferences; occupancy requirements; check-in details; tenancy-related information.` },
  { title: "5. Property Information", content: `For Property Owners: ownership details; property details; bank details; KYC records; GST details; lease documents; authorization records; occupancy records.` },
  { title: "6. Payment Information", content: `LivingGo may collect or receive information relating to: booking amounts; security deposits; rent payments; maintenance charges; refunds; settlements; commissions; revenue-sharing arrangements. LivingGo generally does not store complete card information where payments are processed by regulated payment service providers.` },
  { title: "7. Technical Information", content: `LivingGo may automatically collect: IP addresses; browser information; operating system information; device identifiers; device fingerprints; network information; application logs; session logs; access logs.` },
  { title: "8. Location Information", content: `LivingGo may collect: GPS data; approximate location data; device location data; property visit location information — where permitted and available.` },
  { title: "9. Communication Data", content: `LivingGo may collect and retain: emails; SMS communications; WhatsApp communications; support conversations; platform messages; call records; call metadata; complaint records; feedback submissions.` },
  { title: "10. Verification Data", content: `LivingGo may collect and retain: OTP records; KYC records; identity verification records; onboarding records; agreement acceptance records; consent records.` },
  { title: "11. Lead Management Data", content: `LivingGo may maintain records relating to: lead assignments; lead generation; property visits; lead status updates; lead conversion records; occupancy verification records; referral records.` },
  { title: "12. Audit and Compliance Data", content: `LivingGo may maintain: audit logs; administrator activity records; settlement records; occupancy records; verification records; investigation records; compliance records.` },
  { title: "13. Purposes of Collection", content: `Information may be collected and processed for purposes including: account creation; booking management; payment processing; rent collection; customer support; fraud prevention; dispute resolution; property verification; lead verification; occupancy verification; legal compliance; security monitoring; service improvement.` },
  { title: "14. Legal Basis of Processing", content: `Information may be processed on the basis of: consent; contractual necessity; legal obligations; legitimate business interests; fraud prevention requirements; dispute resolution requirements.` },
  { title: "15. Information Sharing", content: `LivingGo may share information with: Property Owners; Students; payment gateways; banking partners; technology providers; KYC service providers; verification providers; professional advisors; auditors; insurers; government authorities; courts; arbitrators; law enforcement agencies. Sharing shall be limited to what is reasonably necessary.` },
  { title: "16. Disclosure for Legal Purposes", content: `LivingGo may disclose information where reasonably necessary to: comply with law; respond to legal notices; investigate fraud; enforce agreements; protect rights; defend legal claims.` },
  { title: "17. Recording of Communications", content: `Communications may be monitored, recorded, retained and reviewed for: training; quality assurance; dispute resolution; fraud prevention; legal compliance.` },
  { title: "18. Data Retention", content: `LivingGo may retain information for as long as reasonably necessary for: operational purposes; contractual purposes; legal purposes; evidentiary purposes; audit purposes; dispute resolution purposes. Certain records may be retained beyond account closure where required or reasonably necessary.` },
  { title: "19. Evidence Preservation", content: `The User expressly acknowledges that LivingGo may preserve: agreement records; booking records; payment records; settlement records; communication records; OTP records; IP records; audit logs; occupancy records; lead records. Such records may be relied upon in legal proceedings.` },
  { title: "20. Security Measures", content: `LivingGo may implement reasonable administrative, technical and organizational measures designed to protect information from unauthorized access, disclosure, alteration or destruction. No method of storage or transmission is completely secure.` },
  { title: "21. User Rights", content: `Subject to applicable law, Users may request: access to information; correction of inaccurate information; updating of information; withdrawal of certain consents where legally permissible. Certain information may continue to be retained where necessary.` },
  { title: "22. Account Closure", content: `Closure of an account shall not automatically result in deletion of records. LivingGo may retain information necessary for: legal compliance; audits; fraud prevention; dispute resolution; contractual enforcement.` },
  { title: "23. Third-Party Services", content: `The Platform may integrate with third-party services. LivingGo is not responsible for privacy practices of independent third parties. Users are encouraged to review third-party policies.` },
  { title: "24. Children", content: `The Platform is not intended for children lacking legal capacity to contract. Where applicable, parental or guardian involvement may be required.` },
  { title: "25. International Transfers", content: `Information may be processed, stored or transferred through service providers operating in multiple jurisdictions, subject to applicable legal requirements.` },
  { title: "26. Changes to this Policy", content: `LivingGo may revise this Policy from time to time. Updated versions may be published on the Platform. Continued use of the Platform shall constitute acceptance of revised versions.` },
  { title: "27. Grievance Redressal", content: `For privacy-related concerns, Users may contact: Grievance Officer, RCT Accommodations and Infrastructure Private Limited. Email: privacy@livinggo.in` },
  { title: "28. Governing Law", content: `This Policy shall be governed by the laws of India. Disputes shall be subject to the dispute resolution mechanisms specified in applicable LivingGo agreements.` },
  { title: "29. Acknowledgement", content: `By using the Platform, the User acknowledges having read, understood and accepted this Privacy Policy.` },
];

export default function PrivacyPolicyPage() {
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
              <h1 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Privacy Policy</h1>
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
            By using the LivingGo platform, you acknowledge having read and accepted this Privacy Policy.
          </div>
        </div>
      </div>
    </main>
  );
}
