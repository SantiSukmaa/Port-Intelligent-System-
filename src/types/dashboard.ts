export type PortStatus = 'normal' | 'waspada' | 'padat' | 'kritis';

export type Timezone = 'WIB' | 'WITA' | 'WIT';

export type Region = 
  | 'Regional I (Sumatera)' 
  | 'Regional II (Jawa & Bali)' 
  | 'Regional III (Kalimantan & Sulawesi)' 
  | 'Regional IV (Maluku, Papua & Nusa Tenggara)';

export type SegmentType = 'pantauan_nasional' | 'komersial' | 'perintis' | 'tol_laut';

export type FleetOwner = 'ASDP' | 'Jembatan Nusantara' | 'Swasta';

export type AuthorityType = 
  | 'Diputuskan ASDP' 
  | 'Perlu persetujuan regulator' 
  | 'Perlu kesepakatan operator' 
  | 'Perlu koordinasi eksternal';

export type CaseStatus = 
  | 'Baru' 
  | 'Diverifikasi' 
  | 'Diusulkan' 
  | 'Menunggu pihak eksternal' 
  | 'Disetujui' 
  | 'Dilaksanakan' 
  | 'Dievaluasi' 
  | 'Ditutup' 
  | 'Ditolak';

export type UserRole = 
  | 'EXEC' 
  | 'OPS_HQ' 
  | 'POCC' 
  | 'BRANCH' 
  | 'POSKO' 
  | 'FIN' 
  | 'CX' 
  | 'ANALYST' 
  | 'ADMIN';

export interface PortData {
  id: string;
  code: string;
  name: string;
  city: string;
  province: string;
  region: Region;
  branch: string;
  timezone: Timezone;
  lat: number;
  lng: number;
  status: PortStatus;
  isNationalPriority: boolean;
  segment: SegmentType;
  managementStatus: 'Operasional Penuh ASDP' | 'Kerjasama Operasi (KSO)' | 'Aset Pihak Ketiga' | 'Rencana Pengembangan';
  
  // Real-time metrics
  berthCapacityPercent: number; // 0 - 100
  totalQueueVehicles: number;
  waitingTimeMinutes: number;
  activeBerths: number;
  totalBerths: number;
  operatingVessels: number;
  scheduledVessels: number;
  onTimeDepartureRate: number; // percentage
  portPerformanceIndex: number; // e.g. 31.7 or 85.4
  indexDeltaYesterday: number; // e.g. -12.4
  opportunityLossMillionRp: number; // e.g. 8400 (Rp 8.4 M)
  
  // Weather & Sea condition
  weather: string;
  temperatureC: number;
  windSpeedKnots: number;
  waveHeightM: number;
  weatherWarning?: string;
  
  // 6 Zones Queue Breakdown (FR-21)
  queueZones: {
    roadAccess: number; // Sumber eksternal
    bufferZone: number; // Tol KM 43 / Buffer Area
    tollGate: number;
    waitingArea: number; // Area siap muat
    boardingZone: number;
    berthDeparture: number;
  };
  
  // Berths detail
  berths: {
    id: string;
    name: string;
    type: 'Moveable Bridge' | 'Plengsengan' | 'Ponton';
    status: 'Sandar & Muat' | 'Tersedia' | 'Perbaikan' | 'Ditutup Cuaca';
    dockedShip?: string;
    utilization: number;
  }[];
  
  // Main linked route
  mainRoute: {
    origin: string;
    destination: string;
    distanceMiles: number;
    standardSailingHours: number;
  };
}

export interface KPIItem {
  id: string;
  code: string;
  title: string;
  value: string;
  unit: string;
  target: string;
  achievement: string;
  yoyDelta: string;
  isPositive: boolean;
  statusNote?: string;
  formula: string;
  source: string;
  owner: string;
  granularity: string;
}

export interface VesselData {
  id: string;
  name: string;
  owner: FleetOwner;
  type: 'Ro-Ro Komersial' | 'Ro-Ro Perintis' | 'KSO Swasta' | 'Ternak' | 'Bus Air';
  grt: number;
  capacityPassengers: number;
  capacityVehicles: number;
  status: 'Beroperasi' | 'Siap Belum Beroperasi' | 'Cadangan Siap' | 'Perawatan / Dok' | 'Tidak Tersedia';
  currentPort: string;
  destinationPort?: string;
  assignedRoute: string;
  speedKnots: number;
  berthTimeMinutes: number;
  sailingTimeHours: number;
}

export interface OperationalAlert {
  id: string;
  type: 'Kepadatan' | 'Defisit Kapasitas' | 'Cuaca' | 'Izin Operasi' | 'Armada' | 'Data';
  urgency: 'Kritis' | 'Tinggi' | 'Sedang' | 'Informasi';
  title: string;
  description: string;
  portId: string;
  portName: string;
  route: string;
  timestamp: string;
  verified: boolean;
  referenceSource: string;
  recommendedAction: string;
  authority: AuthorityType;
}

export interface OperationalCase {
  id: string;
  caseNumber: string;
  title: string;
  portId: string;
  portName: string;
  route: string;
  urgency: 'Kritis' | 'Tinggi' | 'Sedang';
  status: CaseStatus;
  responsibleOfficer: string;
  role: string;
  createdAt: string;
  responseDeadline: string;
  internalApprover: string;
  externalApprover?: string;
  officialLetterNo?: string;
  authority: AuthorityType;
  proposedAction: string;
  expectedOutcome: string;
  actualOutcome?: string;
}

export interface SimulationScenario {
  id: string;
  name: string;
  portId: string;
  route: string;
  timeHorizon: string; // "18:00 - 24:00 (6 Jam)"
  
  // Baseline vs adjustments
  baselineTrips: number;
  addedTrips: number;
  standbyVesselActivated: boolean;
  standbyVesselName?: string;
  berthTurnaroundSpeedupMin: number;
  bufferZoneActivated: boolean;
  ksopRestriction: boolean;
  
  // Model Output
  initialQueue: number;
  estimatedArrivals: number;
  effectiveCapacity: number;
  finalQueue: number;
  avgWaitTimeHours: number;
  vesselUtilization: number;
  addedCostMillionRp: number;
  additionalRevenueMillionRp: number;
  netBenefitMillionRp: number;
  riskLevel: 'Rendah' | 'Sedang' | 'Tinggi';
}
