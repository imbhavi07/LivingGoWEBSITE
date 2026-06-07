"use strict";
/**
 * nearby.service.ts
 * Uses Overpass API (free, no key) to find nearby colleges/metro
 * Uses OpenRouteService (free tier) to calculate road distances
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.findNearbyPlaces = findNearbyPlaces;
const ORS_API_KEY = process.env.ORS_API_KEY;
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const ORS_URL = "https://api.openrouteservice.org/v2/matrix/foot-walking";
// Cities in India that have metro systems
const METRO_CITIES = [
    "delhi", "mumbai", "bangalore", "bengaluru", "chennai",
    "kolkata", "hyderabad", "pune", "ahmedabad", "kochi",
    "lucknow", "jaipur", "nagpur", "surat", "kanpur"
];
function hasCityMetro(location) {
    const lower = location.toLowerCase();
    return METRO_CITIES.some((city) => lower.includes(city));
}
async function queryOverpass(query) {
    const res = await fetch(OVERPASS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
    });
    if (!res.ok)
        throw new Error("Overpass API error");
    return res.json();
}
async function getDistances(origin, destinations) {
    if (!ORS_API_KEY)
        throw new Error("ORS_API_KEY missing");
    if (destinations.length === 0)
        return [];
    const locations = [
        [origin[1], origin[0]], // ORS uses [lng, lat]
        ...destinations.map(([lat, lng]) => [lng, lat]),
    ];
    const res = await fetch(ORS_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: ORS_API_KEY,
        },
        body: JSON.stringify({
            locations,
            metrics: ["distance"],
            sources: [0],
            destinations: destinations.map((_, i) => i + 1),
            units: "m",
        }),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`ORS error: ${err}`);
    }
    const data = await res.json();
    return data.distances[0] ?? [];
}
function formatDistance(meters) {
    if (meters < 1000)
        return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
}
async function findNearbyPlaces(lat, lng, preference, location) {
    const radius = 5000; // 5km radius
    // Build Overpass query for colleges
    const collegeQuery = `
    [out:json][timeout:25];
    (
      node["amenity"="university"](around:${radius},${lat},${lng});
      way["amenity"="university"](around:${radius},${lat},${lng});
      node["amenity"="college"](around:${radius},${lat},${lng});
      way["amenity"="college"](around:${radius},${lat},${lng});
    );
    out center 20;
  `;
    // Metro query
    const metroQuery = `
    [out:json][timeout:25];
    (
      node["railway"="station"]["station"="subway"](around:3000,${lat},${lng});
      node["railway"="station"]["network"~"Metro|metro|DMRC|BMRCL|CMRL|HMRL|NMRC|KMRL"](around:3000,${lat},${lng});
      node["public_transport"="stop_position"]["subway"="yes"](around:3000,${lat},${lng});
    );
    out body 5;
  `;
    const [collegeData, metroData] = await Promise.allSettled([
        queryOverpass(collegeQuery),
        hasCityMetro(location) ? queryOverpass(metroQuery) : Promise.resolve({ elements: [] }),
    ]);
    // Process colleges
    const colleges = [];
    if (collegeData.status === "fulfilled") {
        for (const el of collegeData.value.elements) {
            const name = el.tags?.name ?? el.tags?.["name:en"];
            if (!name)
                continue;
            const elLat = el.lat ?? el.center?.lat;
            const elLng = el.lon ?? el.center?.lon;
            if (!elLat || !elLng)
                continue;
            const nameLower = name.toLowerCase();
            const isGirls = nameLower.includes("girls") ||
                nameLower.includes("women") ||
                nameLower.includes("lady") ||
                nameLower.includes("ladies") ||
                el.tags?.["gender"] === "female";
            colleges.push({ name, lat: elLat, lng: elLng, isGirls });
        }
    }
    // Filter based on preference
    let selectedColleges = [];
    if (preference === "Girls") {
        const girlsColleges = colleges.filter((c) => c.isGirls).slice(0, 3);
        const coedColleges = colleges.filter((c) => !c.isGirls).slice(0, 2);
        selectedColleges = [...girlsColleges, ...coedColleges];
    }
    else {
        // Boys or Any — just co-ed
        selectedColleges = colleges.filter((c) => !c.isGirls).slice(0, 3);
    }
    // Process metro stations
    const metros = [];
    if (metroData.status === "fulfilled") {
        for (const el of metroData.value.elements) {
            const name = el.tags?.name ?? el.tags?.["name:en"];
            if (!name || !el.lat || !el.lon)
                continue;
            metros.push({ name, lat: el.lat, lng: el.lon });
        }
    }
    // Calculate distances via ORS
    const allDestinations = [
        ...selectedColleges.map((c) => [c.lat, c.lng]),
        ...metros.slice(0, 1).map((m) => [m.lat, m.lng]),
    ];
    let distances = [];
    try {
        distances = await getDistances([lat, lng], allDestinations);
    }
    catch {
        // Fallback to straight-line distance if ORS fails
        distances = allDestinations.map(([dLat, dLng]) => {
            const R = 6371000;
            const dLatRad = ((dLat - lat) * Math.PI) / 180;
            const dLngRad = ((dLng - lng) * Math.PI) / 180;
            const a = Math.sin(dLatRad / 2) ** 2 +
                Math.cos((lat * Math.PI) / 180) *
                    Math.cos((dLat * Math.PI) / 180) *
                    Math.sin(dLngRad / 2) ** 2;
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        });
    }
    // Build result
    const collegeResults = selectedColleges.map((college, i) => ({
        name: college.name,
        distance: formatDistance(distances[i] ?? 0),
        distanceMeters: distances[i] ?? 0,
        type: college.isGirls ? "girls_college" : "coed_college",
    }));
    // Sort by distance
    collegeResults.sort((a, b) => a.distanceMeters - b.distanceMeters);
    let metroResult = null;
    if (metros.length > 0) {
        const metroDistanceIndex = selectedColleges.length;
        const metroDistance = distances[metroDistanceIndex];
        if (metroDistance !== undefined) {
            metroResult = {
                name: metros[0].name,
                distance: formatDistance(metroDistance),
                distanceMeters: metroDistance,
                type: "metro",
            };
        }
    }
    return {
        colleges: collegeResults,
        metro: metroResult,
    };
}
