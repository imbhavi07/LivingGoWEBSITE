// ── HAVERSINE FORMULA ──────────────────────────────────────────────────────
export function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

// ── DU NORTH CAMPUS DATABASE ───────────────────────────────────────────────
export type College = {
  name: string;
  lat: number;
  lng: number;
  type: "co-ed" | "girls";
};

export const NORTH_CAMPUS_COLLEGES: College[] = [
  // Co-Ed Colleges
  { name: "SRCC", lat: 28.6883, lng: 77.2029, type: "co-ed" },
  { name: "Hindu College", lat: 28.6830, lng: 77.2104, type: "co-ed" },
  { name: "Hansraj College", lat: 28.6806, lng: 77.2064, type: "co-ed" },
  { name: "Ramjas College", lat: 28.6854, lng: 77.2058, type: "co-ed" },
  { name: "St. Stephen's", lat: 28.6846, lng: 77.2117, type: "co-ed" },
  { name: "KMC", lat: 28.6833, lng: 77.2046, type: "co-ed" },
  { name: "SGTB Khalsa", lat: 28.6917, lng: 77.2056, type: "co-ed" },
  // Girls Colleges
  { name: "Miranda House", lat: 28.6865, lng: 77.2035, type: "girls" },
  { name: "Daulat Ram (DRC)", lat: 28.6881, lng: 77.2075, type: "girls" },
  { name: "IP College for Women", lat: 28.6669, lng: 77.2268, type: "girls" }
];

// ── THE FILTERING LOGIC ────────────────────────────────────────────────────
export function getTailoredColleges(pgLat: number, pgLng: number, pgPreference: string) {
  // 1. Calculate distance from PG to ALL colleges
  const collegesWithDistance = NORTH_CAMPUS_COLLEGES.map(college => ({
    ...college,
    distance: getDistanceInKm(pgLat, pgLng, college.lat, college.lng)
  }));

  // 2. Separate and sort Co-Ed colleges by closest distance
  const sortedCoEd = collegesWithDistance
    .filter(c => c.type === "co-ed")
    .sort((a, b) => a.distance - b.distance);

  // LOGIC BRANCH: BOYS PG
  if (pgPreference.toLowerCase() === "boys") {
    // Return Top 3 closest Co-Ed colleges
    return sortedCoEd.slice(0, 3);
  } 
  
  // LOGIC BRANCH: GIRLS PG
  if (pgPreference.toLowerCase() === "girls") {
    const sortedGirls = collegesWithDistance
      .filter(c => c.type === "girls")
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3); // Get 3 Girls colleges
    
    const topCoEd = sortedCoEd.slice(0, 2); // Get 2 closest Co-Ed colleges

    // Combine them and sort the final list from closest to farthest
    return [...sortedGirls, ...topCoEd].sort((a, b) => a.distance - b.distance);
  }

  // Fallback for Co-Ed PGs (Just top 3 closest overall)
  return collegesWithDistance.sort((a, b) => a.distance - b.distance).slice(0, 3);
}