import Image from 'next/image';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6">
        <Image
          src="/maintenance-h.png"
          alt="Maintenance - Desktop View"
          className="hidden md:block max-w-2xl"
        />
        <Image
          src="/maintenance-v.png"
          alt="Maintenance - Mobile View"
          className="md:hidden max-w-sm"
        />
        <p className="text-lg text-gray-600">
          We're currently undergoing maintenance to improve your experience.
          Please check back soon.
        </p>
      </div>
    </div>
  );
}