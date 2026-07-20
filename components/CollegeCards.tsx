"use client";

import Image from "next/image";
import Link from "next/link";

interface College {
  id: string;
  name: string;
  image: string;
  logo: string;
}

const colleges: College[] = [
  {
    id: "stephens",
    name: "St. Stephen's College",
    image: "/assets/college_pics/stephens_pic.jpg",
    logo: "/assets/college_pics/stephens_logo.jpg",
  },
  {
    id: "hindu",
    name: "Hindu College",
    image: "/assets/college_pics/hindu_pic.jpg",
    logo: "/assets/college_pics/hindu_logo.jpg",
  },
  {
    id: "hansraj",
    name: "Hansraj College",
    image: "/assets/college_pics/hansraj_pic.jpg",
    logo: "/assets/college_pics/hansraj_logo.jpg",
  },
  {
    id: "srcc",
    name: "SRCC",
    image: "/assets/college_pics/srcc_pic.jpg",
    logo: "/assets/college_pics/srcc_logo.jpg",
  },
  {
    id: "drc",
    name: "Daulat Ram College",
    image: "/assets/college_pics/drc_pic.jpg",
    logo: "/assets/college_pics/drc_logo.jpg",
  },
  {
    id: "ipcw",
    name: "IPCW",
    image: "/assets/college_pics/ipcw_pic.jpg",
    logo: "/assets/college_pics/ipcw_logo.jpg",
  },
  {
    id: "khalsa",
    name: "Khalsa College",
    image: "/assets/college_pics/khalsa_pic.jpg",
    logo: "/assets/college_pics/khalsa_logo.jpg",
  },
  {
    id: "kmc",
    name: "Kirori Mal College",
    image: "/assets/college_pics/kmc_pic.jpg",
    logo: "/assets/college_pics/kmc_logo.jpg",
  },
  {
    id: "miranda",
    name: "Miranda House",
    image: "/assets/college_pics/miranda.jpg",
    logo: "/assets/college_pics/miranda_logo.jpg",
  },
  {
    id: "ramjas",
    name: "Ramjas College",
    image: "/assets/college_pics/ramjas_pic.png",
    logo: "/assets/college_pics/ramjas_logo.jpg",
  },
];

export function CollegeCards() {
  const marqueeStyle = `
    @keyframes college-marquee {
      0% { transform: translateX(0%); }
      100% { transform: translateX(-30%); }
    }
    .animate-college-marquee {
      display: flex;
      width: max-content;
      animation: college-marquee 35s linear infinite;
    }
    .animate-college-marquee:hover {
      animation-play-state: paused;
    }
  `;

  return (
    <section className="px-4 py-10 bg-brand-bg mt-[-10px]" aria-label="Colleges">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-brand-dark font-display">
            Find PGs Near Your Colleges
          </h2>
          <Link
            href="/colleges"
            className="flex items-center gap-1 text-brand-green text-sm font-semibold hover:underline transition-colors"
            aria-label="View all colleges"
          >
            View all
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Infinite Scroll Marquee Container */}
        <div className="relative flex w-full overflow-hidden -mx-4 px-4 pb-4">
          <style dangerouslySetInnerHTML={{ __html: marqueeStyle }} />
          {/* Changed gap to gap-4 for a clean visual separation without large empty zones */}
          <div className="animate-college-marquee gap-4">
            {[...colleges, ...colleges].map((college, idx) => (
              <Link
                key={`${college.id}-${idx}`}
                href={`/colleges/${college.id}`}
                className="w-[200px] shrink-0 group block"
                aria-label={`View PGs near ${college.name}`}
              >
                {/* College Card - Layout Width now matches parent wrapper exactly */}
                <div className="relative aspect-[4/3] w-full rounded-4xl overflow-hidden bg-brand-dark/5 group-hover:shadow-xl group-hover:border-brand-green/30 transition-all duration-300 border border-brand-dark/10">
                  {/* College Image */}
                  <Image
                    src={college.image}
                    alt={college.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="200px"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/20 to-transparent" />

                  {/* College Logo - Bottom Left */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="w-14 h-14 rounded-xl bg-white/90 backdrop-blur-sm p-1.5 shadow-card drop-shadow-xl relative">
                      <Image
                        src={college.logo}
                        alt={`${college.name} logo`}
                        fill
                        className="object-contain rounded-lg p-1"
                        sizes="56px"
                      />
                    </div>
                  </div>

                  {/* College Name - Bottom */}
                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <h3 className="text-white font-black text-lg leading-tight truncate drop-shadow-lg">
                      {college.name}
                    </h3>
                    <p className="text-white/80 text-sm mt-0.5 truncate">Find verified PGs nearby</p>
                  </div>

                  {/* Arrow Indicator - Bottom Right */}
                  <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-card text-brand-dark group-hover:bg-white group-hover:scale-110 transition-all duration-200">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}