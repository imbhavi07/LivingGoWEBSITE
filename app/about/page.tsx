import Image from "next/image";
import Link from "next/link";
import { teamMembers } from "@/lib/team";

export default function AboutPage() {
  const executive = teamMembers.filter(
    (member) => member.category === "executive"
  );

  const department = teamMembers.filter(
    (member) => member.category === "department"
  );

  return (
    <main className="min-h-screen bg-linen text-ink">

      {/* Hero Section */}
      <section className="relative overflow-hidden py-28">

        <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-oat via-linen to-moss/20" />

        <div className="relative mx-auto max-w-7xl px-6">

          <div className="max-w-3xl">

            <span className="rounded-full bg-oat px-4 py-2 text-sm font-semibold text-clay">
              About LivingGo
            </span>

            <h1 className="mt-8 text-5xl font-black leading-tight md:text-7xl">
              Building the Future of Student Accommodation.
            </h1>

            <p className="mt-8 text-lg leading-8 text-muted md:text-xl">
              LivingGo is transforming how students discover, compare, and
              book verified PGs, hostels, and rental accommodations. We
              believe finding a home should be simple, transparent,
              affordable, and completely stress-free.
            </p>

            <div className="mt-12 flex flex-wrap gap-4">

              <Link
                href="/properties"
                className="rounded-xl bg-clay px-8 py-4 font-semibold text-white transition hover:scale-105"
              >
                Explore Properties
              </Link>

              <Link
                href="/contact"
                className="rounded-xl border border-clay px-8 py-4 font-semibold text-clay transition hover:bg-oat"
              >
                Contact Us
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* Leadership */}

      <section className="py-24">

        <div className="mx-auto max-w-7xl px-6">

          <div className="mx-auto max-w-3xl text-center">

            <h2 className="text-4xl font-black">
              Meet Our Leadership
            </h2>

            <p className="mt-6 text-lg text-muted">
              LivingGo is powered by a passionate team committed to
              reshaping student housing through innovation,
              transparency, and technology.
            </p>

          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">

            {executive.map((member) => (

              <div
                key={member.name}
                className="rounded-3xl bg-white border border-oat p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >

                <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-full border-4 border-oat">

                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />

                </div>

                <div className="mt-6 text-center">

                  <h3 className="text-2xl font-bold">
                    {member.name}
                  </h3>

                  <p className="mt-2 font-semibold text-clay">
                    {member.role}
                  </p>

                  <p className="mt-2 text-sm text-muted">
                    {member.designation}
                  </p>

                </div>

              </div>

            ))}

          </div>

          <h3 className="mt-7 text-center text-3xl font-bold">
            Department Heads
          </h3>

          <div className="mt-7 grid gap-8 md:grid-cols-2 lg:grid-cols-4">

            {department.map((member) => (

              <div
                key={member.name}
                className="rounded-3xl bg-white border border-oat p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
              >

                <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full border-4 border-oat">

                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />

                </div>

                <div className="mt-5 text-center">

                  <h3 className="text-xl font-bold">
                    {member.name}
                  </h3>

                  <p className="mt-2 font-medium text-clay">
                    {member.role}
                  </p>

                  <p className="mt-2 text-sm text-muted">
                    {member.designation}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* About LivingGo */}

      <section className="bg-white py-28">

        <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2">

          <div>

            <span className="font-semibold text-clay">
              OUR STORY
            </span>

            <h2 className="mt-4 text-5xl font-black">
              Making Student Housing Simpler.
            </h2>

            <p className="mt-8 text-lg leading-8 text-muted">
              LivingGo was founded with one simple goal—to eliminate the
              uncertainty students face when searching for accommodation.
              Instead of relying on scattered listings and unreliable
              information, we built a platform that connects students with
              verified properties, trusted owners, and a seamless digital
              booking experience.
            </p>

            <p className="mt-6 text-lg leading-8 text-muted">
              Our platform empowers students to confidently choose their
              next home while helping property owners reach genuine tenants
              through modern technology.
            </p>

          </div>

          <div className="grid gap-6">
            <div className="rounded-3xl bg-oat p-8">
              <h3 className="text-2xl font-bold">Our Mission</h3>

              <p className="mt-4 leading-8 text-muted">
                To simplify the student accommodation journey by providing
                verified listings, transparent information, secure digital
                experiences, and exceptional customer support for students
                and property owners alike.
              </p>
            </div>

            <div className="rounded-3xl bg-oat p-8">
              <h3 className="text-2xl font-bold">Our Vision</h3>

              <p className="mt-4 leading-8 text-muted">
                To become India most trusted student accommodation
                ecosystem where every student can confidently find a safe,
                affordable, and verified place to live.
              </p>
            </div>

            <div className="rounded-3xl bg-clay p-8 text-white">
              <h3 className="text-2xl font-bold">
                Student First.
              </h3>

              <p className="mt-4 leading-8 text-white/90">
                Every feature we build begins with one question:
                Will this make life easier for students?
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* Core Values */}

      <section className="py-28">

        <div className="mx-auto max-w-7xl px-6">

          <div className="mx-auto max-w-3xl text-center">

            <span className="font-semibold text-clay">
              OUR VALUES
            </span>

            <h2 className="mt-4 text-5xl font-black">
              What Drives LivingGo
            </h2>

            <p className="mt-6 text-lg text-muted">
              These values shape every decision we make and every feature we
              build.
            </p>

          </div>

          <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-3xl bg-white border border-oat p-8 shadow-sm">

              <div className="text-5xl">🛡️</div>

              <h3 className="mt-6 text-2xl font-bold">
                Trust
              </h3>

              <p className="mt-4 leading-8 text-muted">
                Every listing is reviewed to help students discover
                trustworthy accommodation with confidence.
              </p>

            </div>

            <div className="rounded-3xl bg-white border border-oat p-8 shadow-sm">

              <div className="text-5xl">💡</div>

              <h3 className="mt-6 text-2xl font-bold">
                Innovation
              </h3>

              <p className="mt-4 leading-8 text-muted">
                We continuously improve our technology to make finding
                student housing easier than ever.
              </p>

            </div>

            <div className="rounded-3xl bg-white border border-oat p-8 shadow-sm">

              <div className="text-5xl">🤝</div>

              <h3 className="mt-6 text-2xl font-bold">
                Transparency
              </h3>

              <p className="mt-4 leading-8 text-muted">
                Honest property information, clear pricing, and verified
                owners help students make informed decisions.
              </p>

            </div>

            <div className="rounded-3xl bg-white border border-oat p-8 shadow-sm">

              <div className="text-5xl">❤️</div>

              <h3 className="mt-6 text-2xl font-bold">
                Community
              </h3>

              <p className="mt-4 leading-8 text-muted">
                We strive to build meaningful relationships between
                students, property owners, and local communities.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* Statistics */}

      <section className="bg-ink py-24 text-white">

        <div className="mx-auto max-w-7xl px-6">

          <div className="grid gap-10 md:grid-cols-4">

            <div className="text-center">

              <h2 className="text-5xl font-black">
                500+
              </h2>

              <p className="mt-3 text-white/80">
                Verified Properties
              </p>

            </div>

            <div className="text-center">

              <h2 className="text-5xl font-black">
                1000+
              </h2>

              <p className="mt-3 text-white/80">
                Students Assisted
              </p>

            </div>

            <div className="text-center">

              <h2 className="text-5xl font-black">
                25+
              </h2>

              <p className="mt-3 text-white/80">
                Partner Owners
              </p>

            </div>

            <div className="text-center">

              <h2 className="text-5xl font-black">
                24/7
              </h2>

              <p className="mt-3 text-white/80">
                Support
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* Why Choose LivingGo */}

      <section className="py-28">

        <div className="mx-auto max-w-7xl px-6">

          <div className="text-center">

            <span className="font-semibold text-clay">
              WHY LIVINGGO
            </span>

            <h2 className="mt-4 text-5xl font-black">
              Why Thousands Choose LivingGo
            </h2>

          </div>

          <div className="mt-20 grid gap-8 lg:grid-cols-3">

            <div className="rounded-3xl bg-white border border-oat p-10">

              <h3 className="text-2xl font-bold">
                Verified Properties
              </h3>

              <p className="mt-4 leading-8 text-muted">
                Browse trusted PGs, hostels, and rental homes with verified
                owners and genuine information.
              </p>

            </div>

            <div className="rounded-3xl bg-white border border-oat p-10">

              <h3 className="text-2xl font-bold">
                Secure Booking
              </h3>

              <p className="mt-4 leading-8 text-muted">
                Reserve your accommodation through a safe and transparent
                booking experience.
              </p>

            </div>

            <div className="rounded-3xl bg-white border border-oat p-10">

              <h3 className="text-2xl font-bold">
                Student Focused
              </h3>

              <p className="mt-4 leading-8 text-muted">
                Every feature is designed specifically for students moving
                to a new city for education.
              </p>

            </div>

          </div>

        </div>

      </section>
      {/* Student Features */}

      <section className="bg-white py-28">

        <div className="mx-auto max-w-7xl px-6">

          <div className="text-center">

            <span className="font-semibold text-clay">
              FOR STUDENTS
            </span>

            <h2 className="mt-4 text-5xl font-black">
              Everything You Need In One Place
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg text-muted">
              LivingGo is built to remove the stress of finding
              accommodation so you can focus on what truly matters—
              your education and student life.
            </p>

          </div>

          <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

            <div className="rounded-3xl border border-oat bg-linen p-8">
              <div className="text-4xl">🏠</div>

              <h3 className="mt-6 text-2xl font-bold">
                Verified Properties
              </h3>

              <p className="mt-4 leading-8 text-muted">
                Browse genuine PGs, hostels and apartments verified by
                our team.
              </p>

            </div>

            <div className="rounded-3xl border border-oat bg-linen p-8">

              <div className="text-4xl">❤️</div>

              <h3 className="mt-6 text-2xl font-bold">
                Wishlist
              </h3>

              <p className="mt-4 leading-8 text-muted">
                Save your favourite properties and compare them later.
              </p>

            </div>

            <div className="rounded-3xl border border-oat bg-linen p-8">

              <div className="text-4xl">🗺️</div>

              <h3 className="mt-6 text-2xl font-bold">
                Maps & Directions
              </h3>

              <p className="mt-4 leading-8 text-muted">
                Easily navigate to your selected property using built-in
                map integration.
              </p>

            </div>

            <div className="rounded-3xl border border-oat bg-linen p-8">

              <div className="text-4xl">📷</div>

              <h3 className="mt-6 text-2xl font-bold">
                360° Property Tours
              </h3>

              <p className="mt-4 leading-8 text-muted">
                Explore rooms virtually before scheduling a visit.
              </p>

            </div>

            <div className="rounded-3xl border border-oat bg-linen p-8">

              <div className="text-4xl">💳</div>

              <h3 className="mt-6 text-2xl font-bold">
                Secure Booking
              </h3>

              <p className="mt-4 leading-8 text-muted">
                Reserve properties securely with a transparent token
                booking process.
              </p>

            </div>

            <div className="rounded-3xl border border-oat bg-linen p-8">

              <div className="text-4xl">⭐</div>

              <h3 className="mt-6 text-2xl font-bold">
                Honest Reviews
              </h3>

              <p className="mt-4 leading-8 text-muted">
                Read authentic reviews from students before making a
                decision.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* Owner Features */}

      <section className="py-28">

        <div className="mx-auto max-w-7xl px-6">

          <div className="grid items-center gap-16 lg:grid-cols-2">

            <div>

              <span className="font-semibold text-clay">
                FOR PROPERTY OWNERS
              </span>

              <h2 className="mt-4 text-5xl font-black">
                Grow Your Business With LivingGo
              </h2>

              <p className="mt-8 text-lg leading-8 text-muted">
                LivingGo provides property owners with powerful tools to
                manage listings, receive bookings, verify tenants and
                grow occupancy.
              </p>

              <ul className="mt-10 space-y-5">

                <li>✔ Easy Property Listing</li>

                <li>✔ Owner Dashboard</li>

                <li>✔ Booking Management</li>

                <li>✔ KYC Verification</li>

                <li>✔ Photo & Panorama Uploads</li>

                <li>✔ Payment Tracking</li>

                <li>✔ Tenant Management</li>

                <li>✔ Analytics Dashboard</li>

              </ul>

            </div>

            <div className="rounded-[40px] bg-oat p-12">

              <div className="space-y-8">

                <div className="rounded-2xl bg-white p-6 shadow">

                  <h3 className="font-bold">
                    Property Verification
                  </h3>

                  <p className="mt-2 text-muted">
                    Build trust with verified listings.
                  </p>

                </div>

                <div className="rounded-2xl bg-white p-6 shadow">

                  <h3 className="font-bold">
                    Better Visibility
                  </h3>

                  <p className="mt-2 text-muted">
                    Reach thousands of students actively searching for accommodation.
                  </p>

                </div>

                <div className="rounded-2xl bg-white p-6 shadow">

                  <h3 className="font-bold">
                    Easy Management
                  </h3>

                  <p className="mt-2 text-muted">
                    Manage properties from one dashboard.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>
      {/* Trust & Safety */}

      <section className="bg-ink py-28 text-white">

        <div className="mx-auto max-w-7xl px-6">

          <div className="text-center">

            <span className="font-semibold text-moss">
              TRUST & SAFETY
            </span>

            <h2 className="mt-4 text-5xl font-black">
              Your Safety Is Our Priority
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg text-white/80">
              LivingGo is built on transparency, verification, and
              accountability. We strive to create a safe ecosystem for
              students and property owners.
            </p>

          </div>

          <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-3xl bg-white/10 p-8 backdrop-blur">

              <h3 className="text-xl font-bold">
                Verified Owners
              </h3>

              <p className="mt-4 text-white/70 leading-7">
                Every owner undergoes a verification process before
                publishing listings.
              </p>

            </div>

            <div className="rounded-3xl bg-white/10 p-8 backdrop-blur">

              <h3 className="text-xl font-bold">
                Secure Payments
              </h3>

              <p className="mt-4 text-white/70 leading-7">
                Booking transactions are processed securely through trusted
                payment gateways.
              </p>

            </div>

            <div className="rounded-3xl bg-white/10 p-8 backdrop-blur">

              <h3 className="text-xl font-bold">
                Authentic Reviews
              </h3>

              <p className="mt-4 text-white/70 leading-7">
                Genuine reviews help students make informed decisions.
              </p>

            </div>

            <div className="rounded-3xl bg-white/10 p-8 backdrop-blur">

              <h3 className="text-xl font-bold">
                Data Protection
              </h3>

              <p className="mt-4 text-white/70 leading-7">
                Personal information is handled securely and responsibly.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* Policies */}

      <section className="py-28">

        <div className="mx-auto max-w-7xl px-6">

          <div className="text-center">

            <span className="font-semibold text-clay">
              OUR POLICIES
            </span>

            <h2 className="mt-4 text-5xl font-black">
              Transparency Matters
            </h2>

          </div>

          <div className="mt-20 grid gap-8 md:grid-cols-2">

            <div className="rounded-3xl bg-white border border-oat p-8">

              <h3 className="text-2xl font-bold">
                Privacy Policy
              </h3>

              <p className="mt-4 text-muted leading-8">
                We collect only the information necessary to provide our
                services. Your personal information is never sold to third
                parties.
              </p>

            </div>

            <div className="rounded-3xl bg-white border border-oat p-8">

              <h3 className="text-2xl font-bold">
                Property Verification
              </h3>

              <p className="mt-4 text-muted leading-8">
                Properties undergo verification before publication, but
                students should always inspect accommodation personally
                before finalizing rental agreements.
              </p>

            </div>

            <div className="rounded-3xl bg-white border border-oat p-8">

              <h3 className="text-2xl font-bold">
                Payments
              </h3>

              <p className="mt-4 text-muted leading-8">
                All online payments are processed securely. Refunds and
                cancellations are governed by our booking terms.
              </p>

            </div>

            <div className="rounded-3xl bg-white border border-oat p-8">

              <h3 className="text-2xl font-bold">
                User Conduct
              </h3>

              <p className="mt-4 text-muted leading-8">
                Users are expected to provide accurate information and use
                the platform respectfully and responsibly.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* FAQ */}

      <section className="bg-white py-28">

        <div className="mx-auto max-w-5xl px-6">

          <h2 className="text-center text-5xl font-black">
            Frequently Asked Questions
          </h2>

          <div className="mt-16 space-y-6">

            <div className="rounded-2xl border border-oat p-8">
              <h3 className="text-xl font-bold">
                Are all properties verified?
              </h3>
              <p className="mt-3 text-muted">
                We verify listings before publication, although students
                are encouraged to visit properties personally before
                making a final decision.
              </p>
            </div>

            <div className="rounded-2xl border border-oat p-8">
              <h3 className="text-xl font-bold">
                Can I contact owners directly?
              </h3>
              <p className="mt-3 text-muted">
                Yes. Once booking requirements are completed, students
                can communicate with property owners through the platform.
              </p>
            </div>
            
            <div className="rounded-2xl border border-oat p-8">
              <h3 className="text-xl font-bold">
                Does LivingGo own the listed properties?
              </h3>
              <p className="mt-3 text-muted">
                No. LivingGo is a technology platform connecting students
                with independent property owners.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Contact */}
      <section className="py-28">
        <div className="mx-auto max-w-5xl rounded-[40px] bg-clay px-10 py-20 text-center text-white">
          <h2 className="text-5xl font-black">
            Get In Touch
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90">
            Have questions, suggestions or need assistance? Our team is
            always ready to help you.
          </p>
          <div className="mt-10 space-y-3 text-lg">
            <p>📧 support@livinggo.in</p>
            <p>🌐 www.livinggo.in</p>
          </div>
          <div className="mt-12">
            <Link
              href="/listings"
              className="inline-block rounded-xl bg-white px-10 py-4 font-bold text-clay transition hover:scale-105"
            >
              Explore Listings
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}