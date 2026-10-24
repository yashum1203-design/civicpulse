export type CivicCategory = 
  | 'open_drainage'
  | 'road_damage'
  | 'street_light_malfunction'
  | 'waste_management';

export type DispatchTier = 'CRITICAL' | 'HIGH' | 'ROUTINE';

export type IssueStatus = 'Pending' | 'Dispatched' | 'Resolved';

export interface BaselineGisData {
  distance_to_nearest_hospital_meters: number;
  distance_to_nearest_school_meters: number;
  population_density_tier: 'high' | 'medium' | 'low';
  is_peak_traffic_zone: boolean;
}

export interface CivicIssue {
  id: string;
  category: CivicCategory;
  title: string;
  description: string;
  location: [number, number]; // [latitude, longitude]
  latitude: number;
  longitude: number;
  locationName: string;
  baseline_data: BaselineGisData;
  priority_score: number; // 0 - 100
  severity_tier: DispatchTier;
  impact_count: number;
  status: IssueStatus;
  timestamp: string;
  assignedDepartment: string;
  dispatchedUnit?: string;
  dispatchedAt?: string;
  clusterId?: string;
  embedding?: number[];
  imageTag?: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateTicketId: string | null;
  similarityScore: number; // 0 to 1 (cosine similarity)
  distanceMeters: number;
  matchedIssue?: CivicIssue;
  matchReason?: string;
}

export interface SystemStats {
  activeCount: number;
  resolvedCount: number;
  avgResponseLatencyHours: number;
  criticalHazardsCount: number;
  totalReportsMerged: number;
}
