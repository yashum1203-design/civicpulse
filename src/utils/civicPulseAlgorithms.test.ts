import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateHaversineDistance, 
  calculateUrgencyScore, 
  getSeverityTier, 
  checkForDuplicate,
  encodeTextEmbedding
} from './civicPulseAlgorithms';
import { CivicIssue } from '../types';

// Matching user's Python EXISTING_ISSUES array
const TEST_EXISTING_ISSUES: CivicIssue[] = [
  {
    id: 'TICKET_001',
    category: 'road_damage',
    title: 'Massive Crater Road Damage',
    description: 'Massive crater on the center of the main road causing cars to swerve.',
    location: [13.0285, 77.5450],
    latitude: 13.0285,
    longitude: 77.5450,
    locationName: 'Yeshwanthpur/Peenya Main Arterial',
    baseline_data: {
      distance_to_nearest_hospital_meters: 250.0,
      distance_to_nearest_school_meters: 80.0,
      population_density_tier: 'high',
      is_peak_traffic_zone: true
    },
    priority_score: 75,
    severity_tier: 'HIGH',
    impact_count: 5,
    status: 'Pending',
    timestamp: '1 hour ago',
    assignedDepartment: 'Road Infrastructure Dept',
    embedding: encodeTextEmbedding('Massive crater on the center of the main road causing cars to swerve.')
  },
  {
    id: 'TICKET_002',
    category: 'waste_management',
    title: 'Overflowing Plastic Waste Bin',
    description: 'Garbage bin is overflowing and plastic waste is spilling onto the footpath.',
    location: [12.9716, 77.5946],
    latitude: 12.9716,
    longitude: 77.5946,
    locationName: 'City Center Footpath',
    baseline_data: {
      distance_to_nearest_hospital_meters: 400.0,
      distance_to_nearest_school_meters: 200.0,
      population_density_tier: 'medium',
      is_peak_traffic_zone: false
    },
    priority_score: 25,
    severity_tier: 'ROUTINE',
    impact_count: 2,
    status: 'Pending',
    timestamp: '3 hours ago',
    assignedDepartment: 'Solid Waste Management',
    embedding: encodeTextEmbedding('Garbage bin is overflowing and plastic waste is spilling onto the footpath.')
  }
];

test('calculateHaversineDistance accurately computes ~15m between adjacent coordinates', () => {
  const coord1: [number, number] = [13.0286, 77.5451];
  const coord2: [number, number] = [13.0285, 77.5450];
  const dist = calculateHaversineDistance(coord1, coord2);
  // ~15.2 meters in physical distance
  assert.ok(dist >= 12 && dist <= 20, `Expected ~15m, got ${dist}`);
});

test('Case A: check_for_duplicate correctly flags semantic duplicate near TICKET_001', () => {
  const incoming_description = 'There is a deep pothole right in the middle of the street, highly dangerous for bikes.';
  const incoming_location: [number, number] = [13.0286, 77.5451]; // 15 meters away from TICKET_001

  const result = checkForDuplicate(
    incoming_description,
    incoming_location,
    TEST_EXISTING_ISSUES,
    50.0,
    0.75
  );

  assert.equal(result.isDuplicate, true, 'Must detect as duplicate');
  assert.equal(result.duplicateTicketId, 'TICKET_001', 'Must match TICKET_001');
  assert.ok(result.distanceMeters <= 50.0, `Distance should be <= 50m, got ${result.distanceMeters}`);
  assert.ok(result.similarityScore >= 0.75, `Cosine similarity should be >= 0.75, got ${result.similarityScore}`);
});

test('Case B: check_for_duplicate approves unique report and calculates urgency score of 90 (CRITICAL)', () => {
  const new_unique_description = 'Sewage line broken and overflowing outside the main emergency wing.';
  const new_unique_location: [number, number] = [12.9240, 77.5120];
  const new_unique_category = 'open_drainage';

  const mock_gis_layer = {
    distance_to_nearest_hospital_meters: 35.0,  // Extremely close to a medical center (<= 100m -> +20)
    distance_to_nearest_school_meters: 450.0,   // (> 100m -> +0)
    population_density_tier: 'high' as const,   // (+20)
    is_peak_traffic_zone: true                  // (+10)
  };

  const dupResult = checkForDuplicate(
    new_unique_description,
    new_unique_location,
    TEST_EXISTING_ISSUES,
    50.0,
    0.75
  );

  assert.equal(dupResult.isDuplicate, false, 'Case B must not be flagged as duplicate');
  assert.equal(dupResult.duplicateTicketId, null);

  // Calculate urgency score:
  // Base open_drainage: 40
  // Hospital <= 100: +20
  // School <= 100: +0
  // Density high: +20
  // Peak traffic: +10
  // Total = 90
  const priority_rating = calculateUrgencyScore(new_unique_category, new_unique_location, mock_gis_layer);
  assert.equal(priority_rating, 90, `Expected priority score 90, got ${priority_rating}`);

  const severity_tier = getSeverityTier(priority_rating);
  assert.equal(severity_tier, 'CRITICAL', 'Priority >= 80 must map to CRITICAL');
});

test('calculateUrgencyScore respects all category weights and clamps to 0-100', () => {
  // Road damage (35) with hospital 250m (+10), school 50m (+10), medium density (+10), off-peak (0) = 65 -> HIGH
  const score1 = calculateUrgencyScore('road_damage', [13.0, 77.5], {
    distance_to_nearest_hospital_meters: 250.0,
    distance_to_nearest_school_meters: 50.0,
    population_density_tier: 'medium',
    is_peak_traffic_zone: false
  });
  assert.equal(score1, 65);
  assert.equal(getSeverityTier(score1), 'HIGH');

  // Waste management (15) with low density, far from schools and hospitals = 15 -> ROUTINE
  const score2 = calculateUrgencyScore('waste_management', [13.0, 77.5], {
    distance_to_nearest_hospital_meters: 1000.0,
    distance_to_nearest_school_meters: 1000.0,
    population_density_tier: 'low',
    is_peak_traffic_zone: false
  });
  assert.equal(score2, 15);
  assert.equal(getSeverityTier(score2), 'ROUTINE');
});
