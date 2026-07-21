import Image from 'next/image';

export default function MaintenancePage() {
  return (
    <div className="fixed inset-0 z-[99999] w-screen h-screen bg-[#f9e4d3] flex items-center justify-center">
      {/* Desktop View - Horizontal Banner */}
      <div className="hidden md:block relative w-full h-full">
        <Image
          src="/maintenance-h.png"
          alt="LivingGo student housing platform temporarily under maintenance - verified PGs and rooms coming back soon"
          fill
          priority
          className="object-cover object-center"
        />
      </div>

      {/* Mobile View - Vertical Banner */}
      <div className="block md:hidden relative w-full h-full">
        <Image
          src="/maintenance-v.png"
          alt="LivingGo student housing platform temporarily under maintenance - verified PGs and rooms coming back soon"
          fill
          priority
          className="object-cover object-center"
        />
      </div>
    </div>
  );
}