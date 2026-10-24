import { BaselineGisData, CivicCategory, CivicIssue } from '../types';
import { calculateUrgencyScore, encodeTextEmbedding, getSeverityTier } from './civicPulseAlgorithms';

export interface LocalGisInfo {
  address: string;
  roadName: string;
  suburb: string;
  city: string;
  nearestHospitalName: string;
  hospitalDistanceMeters: number;
  nearestSchoolName: string;
  schoolDistanceMeters: number;
}

/**
 * Reverse-geocodes GPS coordinates using OpenStreetMap Nominatim with fast timeout and fallback
 */
export async function reverseGeocodeGps(lat: number, lon: number): Promise<LocalGisInfo> {
  const fallback: LocalGisInfo = {
    address: `GPS Coordinate [${lat.toFixed(4)}, ${lon.toFixed(4)}]`,
    roadName: 'Main Arterial Road',
    suburb: 'Metro District',
    city: 'Metro Urban Zone',
    nearestHospitalName: 'City General Hospital',
    hospitalDistanceMeters: 140,
    nearestSchoolName: 'Public Community Academy',
    schoolDistanceMeters: 75
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en'
        },
        signal: controller.signal
      }
    );
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};
      const road = addr.road || addr.street || addr.pedestrian || addr.suburb || 'Primary Road';
      const suburb = addr.suburb || addr.neighbourhood || addr.district || 'Metro Sector';
      const city = addr.city || addr.town || addr.municipality || 'Urban Zone';
      const displayName = data.display_name
        ? data.display_name.split(',').slice(0, 3).join(', ')
        : `${road}, ${suburb}`;

      return {
        address: displayName,
        roadName: road,
        suburb,
        city,
        nearestHospitalName: `${suburb} Health Clinic`,
        hospitalDistanceMeters: Math.floor(60 + Math.random() * 200),
        nearestSchoolName: `${suburb} Model School`,
        schoolDistanceMeters: Math.floor(40 + Math.random() * 150)
      };
    }
  } catch (err) {
    // Ignore network/timeout errors and safely return fallback
  }

  return fallback;
}

/**
 * Forward-geocodes a city/locality search query
 */
export async function searchLocationGps(query: string): Promise<{ lat: number; lon: number; displayName: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: {
          'Accept-Language': 'en'
        },
        signal: controller.signal
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const results = await res.json();
      if (results && results.length > 0) {
        return {
          lat: parseFloat(results[0].lat),
          lon: parseFloat(results[0].lon),
          displayName: results[0].display_name.split(',').slice(0, 3).join(', ')
        };
      }
    }
  } catch (e) {
    // Graceful fallback
  }
  return null;
}

/**
 * Generates realistic civic problems in the user's immediate GPS surroundings
 */
export function generateSurroundingsIssues(
  centerLat: number,
  centerLon: number,
  gisInfo: LocalGisInfo
): CivicIssue[] {
  const templates: Array<{
    category: CivicCategory;
    titleTemplate: (road: string, suburb: string) => string;
    descTemplate: (road: string, suburb: string) => string;
    offsetLat: number;
    offsetLon: number;
    gis: BaselineGisData;
    impact: number;
    status: 'Pending' | 'Dispatched' | 'Resolved';
    department: string;
    dispatchedUnit?: string;
  }> = [
    {
      category: 'road_damage',
      titleTemplate: (road) => `Severe Asphalt Crater on ${road}`,
      descTemplate: (road) => `Deep road crater on the center of ${road} causing vehicle rims to buckle and two-wheelers to swerve into oncoming traffic.`,
      offsetLat: 0.00018, // ~20m away from user
      offsetLon: 0.00014,
      gis: {
        distance_to_nearest_hospital_meters: 150.0,
        distance_to_nearest_school_meters: 60.0,
        population_density_tier: 'high',
        is_peak_traffic_zone: true
      },
      impact: 7,
      status: 'Pending',
      department: 'Road Infrastructure Authority'
    },
    {
      category: 'open_drainage',
      titleTemplate: (_, suburb) => `Pressurized Sewage Spill Near ${suburb} Medical Wing`,
      descTemplate: (_, suburb) => `Sewage line broken and overflowing outside ${suburb} clinic entrance with pungent odor and biohazard contagion risk.`,
      offsetLat: -0.0018, // ~200m away
      offsetLon: 0.0012,
      gis: {
        distance_to_nearest_hospital_meters: 45.0, // <= 100m -> +20
        distance_to_nearest_school_meters: 350.0,
        population_density_tier: 'high', // +20
        is_peak_traffic_zone: true // +10 -> Total 90 (CRITICAL)
      },
      impact: 16,
      status: 'Pending',
      department: 'Sanitation & Drainage Board'
    },
    {
      category: 'street_light_malfunction',
      titleTemplate: (road) => `Series of 4 Unlit Streetlamps on ${road}`,
      descTemplate: (road) => `Complete illumination failure leaving the crosswalk and pedestrian sidewalk in pitch black darkness along ${road}.`,
      offsetLat: 0.0025, // ~280m away
      offsetLon: -0.0019,
      gis: {
        distance_to_nearest_hospital_meters: 220.0,
        distance_to_nearest_school_meters: 40.0, // <= 100m -> +10
        population_density_tier: 'high',
        is_peak_traffic_zone: false
      },
      impact: 5,
      status: 'Dispatched',
      department: 'Public Lighting & Grid Ops',
      dispatchedUnit: 'Unit Delta-4 (En Route)'
    },
    {
      category: 'waste_management',
      titleTemplate: (_, suburb) => `Overflowing Municipal Garbage Container in ${suburb}`,
      descTemplate: (_, suburb) => `Public waste bin is overflowing and plastic garbage is spilling across the sidewalk, blocking pedestrian access.`,
      offsetLat: -0.0031, // ~350m away
      offsetLon: -0.0024,
      gis: {
        distance_to_nearest_hospital_meters: 380.0,
        distance_to_nearest_school_meters: 190.0,
        population_density_tier: 'medium',
        is_peak_traffic_zone: false
      },
      impact: 4,
      status: 'Pending',
      department: 'Municipal Solid Waste Operations'
    },
    {
      category: 'road_damage',
      titleTemplate: (road) => `Resurfaced Cold-Mix Patch on ${road}`,
      descTemplate: (road) => `Previous trench excavation filled with temporary cold-mix asphalt, now completed and restored to safe driving grade.`,
      offsetLat: 0.0042, // ~480m away
      offsetLon: 0.0035,
      gis: {
        distance_to_nearest_hospital_meters: 550.0,
        distance_to_nearest_school_meters: 300.0,
        population_density_tier: 'medium',
        is_peak_traffic_zone: false
      },
      impact: 2,
      status: 'Resolved',
      department: 'Road Infrastructure Authority',
      dispatchedUnit: 'Maintenance Crew Completed'
    }
  ];

  return templates.map((tmpl, idx) => {
    const lat = Math.round((centerLat + tmpl.offsetLat) * 10000) / 10000;
    const lon = Math.round((centerLon + tmpl.offsetLon) * 10000) / 10000;
    const desc = tmpl.descTemplate(gisInfo.roadName, gisInfo.suburb);
    const urgencyScore = calculateUrgencyScore(tmpl.category, [lat, lon], tmpl.gis);
    const tier = getSeverityTier(urgencyScore);

    return {
      id: `TICKET_${String(idx + 1).padStart(3, '0')}`,
      category: tmpl.category,
      title: tmpl.titleTemplate(gisInfo.roadName, gisInfo.suburb),
      description: desc,
      location: [lat, lon],
      latitude: lat,
      longitude: lon,
      locationName: `${gisInfo.roadName}, ${gisInfo.suburb}`,
      baseline_data: tmpl.gis,
      priority_score: urgencyScore,
      severity_tier: tier,
      impact_count: tmpl.impact,
      status: tmpl.status,
      timestamp: `${(idx + 1) * 15} mins ago`,
      assignedDepartment: tmpl.department,
      dispatchedUnit: tmpl.dispatchedUnit,
      clusterId: `CLUSTER-GPS-${String(idx + 1).padStart(2, '0')}`,
      embedding: encodeTextEmbedding(desc),
      imageTag: `Sensor Scan Sector 0${idx + 1}`
    };
  });
}
