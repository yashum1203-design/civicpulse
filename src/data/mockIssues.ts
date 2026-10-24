import { CivicIssue, CivicCategory } from '../types';
import { calculateUrgencyScore, encodeTextEmbedding, getSeverityTier } from '../utils/civicPulseAlgorithms';

export const INITIAL_ISSUES: CivicIssue[] = [
  {
    id: 'TICKET_001',
    category: 'road_damage',
    title: 'Massive Crater Road Damage in Arterial Center',
    description: 'Massive crater on the center of the main road causing cars to swerve.',
    location: [13.0285, 77.5450],
    latitude: 13.0285,
    longitude: 77.5450,
    locationName: 'Yeshwanthpur / Peenya Express Corridor',
    baseline_data: {
      distance_to_nearest_hospital_meters: 150.0,
      distance_to_nearest_school_meters: 60.0,
      population_density_tier: 'high',
      is_peak_traffic_zone: true
    },
    // road_damage (35) + hospital 150m (10) + school 60m (10) + high (20) + peak (10) = 85 (CRITICAL)
    priority_score: calculateUrgencyScore('road_damage', [13.0285, 77.5450], {
      distance_to_nearest_hospital_meters: 150.0,
      distance_to_nearest_school_meters: 60.0,
      population_density_tier: 'high',
      is_peak_traffic_zone: true
    }),
    severity_tier: 'CRITICAL',
    impact_count: 8,
    status: 'Pending',
    timestamp: '25 mins ago',
    assignedDepartment: 'Road Infrastructure Authority',
    clusterId: 'CLUSTER-PEENYA-01',
    embedding: encodeTextEmbedding('Massive crater on the center of the main road causing cars to swerve.'),
    imageTag: 'Subsurface Pavement Crater'
  },
  {
    id: 'TICKET_002',
    category: 'waste_management',
    title: 'Commercial Garbage Bin Overflow on Footpath',
    description: 'Garbage bin is overflowing and plastic waste is spilling onto the footpath.',
    location: [12.9716, 77.5946],
    latitude: 12.9716,
    longitude: 77.5946,
    locationName: 'MG Road Commercial Promenade',
    baseline_data: {
      distance_to_nearest_hospital_meters: 450.0,
      distance_to_nearest_school_meters: 180.0,
      population_density_tier: 'medium',
      is_peak_traffic_zone: false
    },
    // waste_management (15) + hospital >300 (0) + school >100 (0) + medium (10) + off-peak (0) = 25 (ROUTINE)
    priority_score: calculateUrgencyScore('waste_management', [12.9716, 77.5946], {
      distance_to_nearest_hospital_meters: 450.0,
      distance_to_nearest_school_meters: 180.0,
      population_density_tier: 'medium',
      is_peak_traffic_zone: false
    }),
    severity_tier: 'ROUTINE',
    impact_count: 3,
    status: 'Pending',
    timestamp: '1.2 hours ago',
    assignedDepartment: 'Municipal Solid Waste Operations',
    clusterId: 'CLUSTER-CBD-02',
    embedding: encodeTextEmbedding('Garbage bin is overflowing and plastic waste is spilling onto the footpath.'),
    imageTag: 'Municipal Waste Accumulation'
  },
  {
    id: 'TICKET_003',
    category: 'open_drainage',
    title: 'High-Volume Raw Sewage Overflow Near Emergency Wing',
    description: 'Sewage line broken and overflowing outside the main emergency wing with pungent odor and biohazard contagion risk.',
    location: [12.9240, 77.5120],
    latitude: 12.9240,
    longitude: 77.5120,
    locationName: 'Jayanagar Medical Corridor & 11th Main',
    baseline_data: {
      distance_to_nearest_hospital_meters: 35.0,
      distance_to_nearest_school_meters: 450.0,
      population_density_tier: 'high',
      is_peak_traffic_zone: true
    },
    // open_drainage (40) + hospital <= 100 (20) + school > 100 (0) + high (20) + peak (10) = 90 (CRITICAL)
    priority_score: calculateUrgencyScore('open_drainage', [12.9240, 77.5120], {
      distance_to_nearest_hospital_meters: 35.0,
      distance_to_nearest_school_meters: 450.0,
      population_density_tier: 'high',
      is_peak_traffic_zone: true
    }),
    severity_tier: 'CRITICAL',
    impact_count: 14,
    status: 'Pending',
    timestamp: '10 mins ago',
    assignedDepartment: 'Sanitation & Drainage Board',
    clusterId: 'CLUSTER-MED-03',
    embedding: encodeTextEmbedding('Sewage line broken and overflowing outside the main emergency wing with pungent odor and biohazard contagion risk.'),
    imageTag: 'Biohazard Effluent Outflow'
  },
  {
    id: 'TICKET_004',
    category: 'street_light_malfunction',
    title: 'Total Illumination Grid Failure on School Crossing',
    description: 'Five consecutive streetlights completely blackout leaving pedestrian transit in total dark.',
    location: [12.9352, 77.6245],
    latitude: 12.9352,
    longitude: 77.6245,
    locationName: 'Koramangala 4th Block School Transit',
    baseline_data: {
      distance_to_nearest_hospital_meters: 250.0,
      distance_to_nearest_school_meters: 45.0,
      population_density_tier: 'high',
      is_peak_traffic_zone: false
    },
    // street_light_malfunction (20) + hospital <=300 (10) + school <=100 (10) + high (20) + off-peak (0) = 60 (HIGH)
    priority_score: calculateUrgencyScore('street_light_malfunction', [12.9352, 77.6245], {
      distance_to_nearest_hospital_meters: 250.0,
      distance_to_nearest_school_meters: 45.0,
      population_density_tier: 'high',
      is_peak_traffic_zone: false
    }),
    severity_tier: 'HIGH',
    impact_count: 4,
    status: 'Dispatched',
    timestamp: '2 hours ago',
    assignedDepartment: 'Public Lighting & Grid Ops',
    dispatchedUnit: 'Unit Delta-2 (On Site)',
    dispatchedAt: '20 mins ago',
    clusterId: 'CLUSTER-KOR-04',
    embedding: encodeTextEmbedding('Five consecutive streetlights completely blackout leaving pedestrian transit in total dark.'),
    imageTag: 'Circuit Feed Offline'
  },
  {
    id: 'TICKET_005',
    category: 'open_drainage',
    title: 'Stormwater Culvert Breach Flooding Market Sidewalk',
    description: 'Underground conduit blockage causing stormwater and stagnant drainage to pool 40cm deep on commercial walkway.',
    location: [12.9784, 77.6408],
    latitude: 12.9784,
    longitude: 77.6408,
    locationName: 'Indiranagar 100ft Road Shopping Zone',
    baseline_data: {
      distance_to_nearest_hospital_meters: 280.0,
      distance_to_nearest_school_meters: 150.0,
      population_density_tier: 'high',
      is_peak_traffic_zone: true
    },
    // open_drainage (40) + hospital <=300 (10) + school >100 (0) + high (20) + peak (10) = 80 (CRITICAL)
    priority_score: calculateUrgencyScore('open_drainage', [12.9784, 77.6408], {
      distance_to_nearest_hospital_meters: 280.0,
      distance_to_nearest_school_meters: 150.0,
      population_density_tier: 'high',
      is_peak_traffic_zone: true
    }),
    severity_tier: 'CRITICAL',
    impact_count: 9,
    status: 'Pending',
    timestamp: '45 mins ago',
    assignedDepartment: 'Sanitation & Drainage Board',
    clusterId: 'CLUSTER-IND-05',
    embedding: encodeTextEmbedding('Underground conduit blockage causing stormwater and stagnant drainage to pool 40cm deep on commercial walkway.'),
    imageTag: 'Drainage Flood Inundation'
  },
  {
    id: 'TICKET_006',
    category: 'road_damage',
    title: 'Secondary Lane Pavement Settlement',
    description: 'Minor road depressions and small cracks along residential access lane.',
    location: [13.0012, 77.5684],
    latitude: 13.0012,
    longitude: 77.5684,
    locationName: 'Malleswaram 8th Cross Residential',
    baseline_data: {
      distance_to_nearest_hospital_meters: 800.0,
      distance_to_nearest_school_meters: 350.0,
      population_density_tier: 'medium',
      is_peak_traffic_zone: false
    },
    // road_damage (35) + hospital >300 (0) + school >100 (0) + medium (10) + off-peak (0) = 45 (ROUTINE)
    priority_score: calculateUrgencyScore('road_damage', [13.0012, 77.5684], {
      distance_to_nearest_hospital_meters: 800.0,
      distance_to_nearest_school_meters: 350.0,
      population_density_tier: 'medium',
      is_peak_traffic_zone: false
    }),
    severity_tier: 'ROUTINE',
    impact_count: 2,
    status: 'Resolved',
    timestamp: 'Yesterday',
    assignedDepartment: 'Road Infrastructure Authority',
    dispatchedUnit: 'Crew Alpha-Patch Complete',
    dispatchedAt: 'Yesterday 17:00',
    clusterId: 'CLUSTER-MAL-06',
    embedding: encodeTextEmbedding('Minor road depressions and small cracks along residential access lane.'),
    imageTag: 'Asphalt Slurry Applied'
  }
];

export const CATEGORY_METADATA: Record<CivicCategory, {
  label: string;
  shortLabel: string;
  baseWeight: number;
  department: string;
  tag: string;
  color: string;
  icon: string;
}> = {
  open_drainage: {
    label: 'Open Drainage & Sewage Overflow',
    shortLabel: 'Open Drainage',
    baseWeight: 40,
    department: 'Sanitation & Drainage Board',
    tag: 'Biohazard & Water Contamination',
    color: '#EF4444',
    icon: 'Biohazard'
  },
  road_damage: {
    label: 'Road Damage & Severe Craters',
    shortLabel: 'Road Damage',
    baseWeight: 35,
    department: 'Road Infrastructure Authority',
    tag: 'Transit & Vehicular Hazard',
    color: '#F59E0B',
    icon: 'AlertOctagon'
  },
  street_light_malfunction: {
    label: 'Street Light Malfunction & Dark Zone',
    shortLabel: 'Streetlight Dark Zone',
    baseWeight: 20,
    department: 'Public Lighting & Grid Ops',
    tag: 'Pedestrian & Night Safety',
    color: '#3B82F6',
    icon: 'LightbulbOff'
  },
  waste_management: {
    label: 'Waste Management & Garbage Spill',
    shortLabel: 'Waste Overflow',
    baseWeight: 15,
    department: 'Municipal Solid Waste Operations',
    tag: 'Footpath Obstruction & Sanitation',
    color: '#10B981',
    icon: 'Trash2'
  }
};
