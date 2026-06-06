import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white pb-24 md:pb-0">
      
      {/* Main Footer Area */}
      <div className="border-t border-black/5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 text-sm text-muted sm:px-6 md:flex-row md:justify-between md:text-left lg:px-8">
          
          <p className="font-semibold text-ink">LivingGo.in</p>
          <p className="text-sm text-ink md:hidden">wrapped with warmth</p>
          
          <div className="flex flex-row gap-6 md:gap-8">
            <Link 
              href="/legal/privacy-policy" 
              className="hover:text-ink hover:underline transition-colors"
            >
              Privacy Policy
            </Link>
            
            <Link 
              href="/legal/terms-of-use" 
              className="hover:text-ink hover:underline transition-colors"
            >
              Terms of Use
            </Link>
          </div>

          {/* Enquiry Section */}
          <div className="flex flex-col items-center gap-1 md:items-end">
            <p className="font-semibold text-ink">For Enquiry, Contact</p>
            <a href="mailto:help@livinggo.in" className="hover:text-ink hover:underline transition-colors">
              help@livinggo.in
            </a>
          </div>

          <p className="hidden text-sm text-ink md:block">wrapped with warmth</p>
        </div>
      </div>

      {/* Separate Ownership & Copyright Bottom Bar */}
      <div className="border-t border-black/5 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center text-xs text-muted sm:px-6 md:flex-row md:justify-between md:text-left lg:px-8">
          <p>
            LivingGo™ is a brand owned and operated by RCT Accommodations and Infrastructure Private Limited.
          </p>
          <p>
            © 2026 RCT Accommodations and Infrastructure Private Limited. All Rights Reserved.
          </p>
        </div>
      </div>
      
    </footer>
  );
}