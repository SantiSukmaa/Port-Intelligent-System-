import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { 
  Ship, 
  Navigation, 
  Compass, 
  Radio, 
  Play, 
  Pause, 
  Layers, 
  Info,
  Clock,
  Waves,
  Eye,
  Sliders,
  Search,
  Maximize2,
  Minimize2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Wind,
  Anchor,
  Activity,
  CheckCircle2,
  MapPin,
  Crosshair,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Users,
  Truck,
  Gauge
} from 'lucide-react';

export interface AisVessel {
  mmsi: string;
  name: string;
  callSign: string;
  imo: string;
  type: string;
  vesselCategory: 'passenger_ferry' | 'cargo' | 'tanker' | 'tug';
  owner: 'ASDP' | 'Jembatan Nusantara' | 'Swasta';
  flag: string;
  builtYear: number;
  lengthM: number;
  beamM: number;
  draughtM: number;
  grt: number;
  passengerCapacity: number;
  vehicleCapacity: number;
  sogKnots: number; // Speed Over Ground
  cogDeg: number;  // Course Over Ground
  headingDeg: number;
  navStatus: 'Underway Using Engine' | 'Moored' | 'At Anchor' | 'Restricted Maneuverability';
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  departureTime: string;
  eta: string;
  etaMinutesRemaining: number;
  distanceTravelledNm: number;
  distanceRemainingNm: number;
  routeProgressPercent: number;
  lat: number;
  lng: number;
  cpaNm: number;
  tcpaMin: number;
  lastUpdate: string;
  region: 'Sumatera' | 'Jawa & Bali' | 'Kalimantan & Sulawesi' | 'Maluku & Papua & NTT';
  pastTrack: [number, number][]; // [lat, lng]
}

const INDONESIA_ASDP_FLEET: AisVessel[] = [
  // 1. Selat Sunda (Merak - Bakauheni)
  {
    mmsi: '525015382',
    name: 'KMP. PORTLINK III',
    callSign: 'YDB521',
    imo: '9384729',
    type: 'Ro-Ro Passenger Ferry Eksekutif',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2012,
    lengthM: 122,
    beamM: 20,
    draughtM: 4.8,
    grt: 12464,
    passengerCapacity: 1200,
    vehicleCapacity: 260,
    sogKnots: 14.2,
    cogDeg: 285,
    headingDeg: 286,
    navStatus: 'Underway Using Engine',
    origin: 'Pelabuhan Merak',
    originCode: 'IDMRK',
    destination: 'Pelabuhan Bakauheni',
    destinationCode: 'IDBKH',
    departureTime: '12:30 WIB',
    eta: '14:00 WIB',
    etaMinutesRemaining: 24,
    distanceTravelledNm: 9.8,
    distanceRemainingNm: 4.2,
    routeProgressPercent: 70,
    lat: -5.9082,
    lng: 105.8854,
    cpaNm: 1.8,
    tcpaMin: 18.2,
    lastUpdate: '2 dtk lalu',
    region: 'Jawa & Bali',
    pastTrack: [[-5.9322, 105.9984], [-5.9220, 105.9400], [-5.9082, 105.8854]]
  },
  {
    mmsi: '525005822',
    name: 'KMP. SEBUKU',
    callSign: 'POCC88',
    imo: '9781203',
    type: 'Ro-Ro Passenger Ferry Standar',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2015,
    lengthM: 88,
    beamM: 16,
    draughtM: 3.9,
    grt: 5038,
    passengerCapacity: 800,
    vehicleCapacity: 140,
    sogKnots: 11.8,
    cogDeg: 108,
    headingDeg: 105,
    navStatus: 'Underway Using Engine',
    origin: 'Pelabuhan Bakauheni',
    originCode: 'IDBKH',
    destination: 'Pelabuhan Merak',
    destinationCode: 'IDMRK',
    departureTime: '12:15 WIB',
    eta: '13:45 WIB',
    etaMinutesRemaining: 15,
    distanceTravelledNm: 10.4,
    distanceRemainingNm: 3.6,
    routeProgressPercent: 74,
    lat: -5.8940,
    lng: 105.8450,
    cpaNm: 2.1,
    tcpaMin: 22.4,
    lastUpdate: '4 dtk lalu',
    region: 'Jawa & Bali',
    pastTrack: [[-5.8672, 105.7530], [-5.8850, 105.8050], [-5.8940, 105.8450]]
  },
  {
    mmsi: '525005823',
    name: 'KMP. BATUMANDI',
    callSign: 'YDA312',
    imo: '9781215',
    type: 'Ro-Ro Passenger Ferry Standar',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2015,
    lengthM: 88,
    beamM: 16,
    draughtM: 4.0,
    grt: 5038,
    passengerCapacity: 800,
    vehicleCapacity: 140,
    sogKnots: 12.1,
    cogDeg: 280,
    headingDeg: 280,
    navStatus: 'Underway Using Engine',
    origin: 'Pelabuhan Merak',
    originCode: 'IDMRK',
    destination: 'Pelabuhan Bakauheni',
    destinationCode: 'IDBKH',
    departureTime: '13:00 WIB',
    eta: '14:30 WIB',
    etaMinutesRemaining: 42,
    distanceTravelledNm: 5.2,
    distanceRemainingNm: 8.8,
    routeProgressPercent: 37,
    lat: -5.9180,
    lng: 105.9420,
    cpaNm: 3.4,
    tcpaMin: 34.0,
    lastUpdate: '6 dtk lalu',
    region: 'Jawa & Bali',
    pastTrack: [[-5.9322, 105.9984], [-5.9240, 105.9720], [-5.9180, 105.9420]]
  },
  {
    mmsi: '525003441',
    name: 'KMP. FERRINDO V',
    callSign: 'YDF891',
    imo: '9081290',
    type: 'Ro-Ro Standby Fleet',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2008,
    lengthM: 110,
    beamM: 18,
    draughtM: 4.2,
    grt: 6850,
    passengerCapacity: 950,
    vehicleCapacity: 180,
    sogKnots: 0.1,
    cogDeg: 0,
    headingDeg: 45,
    navStatus: 'Moored',
    origin: 'Merak MB-3',
    originCode: 'IDMRK',
    destination: 'STANDBY READY',
    destinationCode: 'IDMRK',
    departureTime: '-',
    eta: 'SIAP DILUNCURKAN',
    etaMinutesRemaining: 0,
    distanceTravelledNm: 0,
    distanceRemainingNm: 0,
    routeProgressPercent: 0,
    lat: -5.9310,
    lng: 105.9960,
    cpaNm: 0,
    tcpaMin: 0,
    lastUpdate: '1 dtk lalu',
    region: 'Jawa & Bali',
    pastTrack: [[-5.9310, 105.9960]]
  },
  {
    mmsi: '525002911',
    name: 'KMP. LEGUNDI',
    callSign: 'YDL442',
    imo: '9651820',
    type: 'Ro-Ro Long Distance Ferry',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2014,
    lengthM: 109,
    beamM: 19,
    draughtM: 4.5,
    grt: 14500,
    passengerCapacity: 1000,
    vehicleCapacity: 220,
    sogKnots: 13.6,
    cogDeg: 112,
    headingDeg: 110,
    navStatus: 'Underway Using Engine',
    origin: 'Pelabuhan Bakauheni',
    originCode: 'IDBKH',
    destination: 'Pelabuhan Merak',
    destinationCode: 'IDMRK',
    departureTime: '12:00 WIB',
    eta: '13:30 WIB',
    etaMinutesRemaining: 12,
    distanceTravelledNm: 11.2,
    distanceRemainingNm: 2.8,
    routeProgressPercent: 80,
    lat: -5.8820,
    lng: 105.8050,
    cpaNm: 2.8,
    tcpaMin: 28.5,
    lastUpdate: '3 dtk lalu',
    region: 'Jawa & Bali',
    pastTrack: [[-5.8672, 105.7530], [-5.8750, 105.7800], [-5.8820, 105.8050]]
  },
  {
    mmsi: '525006120',
    name: 'KMP. JATRA III',
    callSign: 'YDJ901',
    imo: '9421890',
    type: 'Ro-Ro Eksekutif Fast Transit',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2016,
    lengthM: 105,
    beamM: 18,
    draughtM: 4.1,
    grt: 8900,
    passengerCapacity: 900,
    vehicleCapacity: 190,
    sogKnots: 15.2,
    cogDeg: 288,
    headingDeg: 290,
    navStatus: 'Underway Using Engine',
    origin: 'Merak Eksekutif',
    originCode: 'IDMRK',
    destination: 'Bakauheni Eksekutif',
    destinationCode: 'IDBKH',
    departureTime: '12:45 WIB',
    eta: '14:00 WIB',
    etaMinutesRemaining: 20,
    distanceTravelledNm: 8.5,
    distanceRemainingNm: 4.5,
    routeProgressPercent: 65,
    lat: -5.8980,
    lng: 105.8200,
    cpaNm: 1.5,
    tcpaMin: 14.1,
    lastUpdate: '2 dtk lalu',
    region: 'Jawa & Bali',
    pastTrack: [[-5.9322, 105.9984], [-5.9100, 105.8800], [-5.8980, 105.8200]]
  },
  {
    mmsi: '525009844',
    name: 'KMP. DHARMA RUCITRA VII',
    callSign: 'DLU007',
    imo: '9512301',
    type: 'Ro-Ro Logistik Swasta Mitra',
    vesselCategory: 'cargo',
    owner: 'Swasta',
    flag: '🇮🇩 Indonesia',
    builtYear: 2017,
    lengthM: 95,
    beamM: 17,
    draughtM: 4.0,
    grt: 6200,
    passengerCapacity: 650,
    vehicleCapacity: 150,
    sogKnots: 12.4,
    cogDeg: 106,
    headingDeg: 105,
    navStatus: 'Underway Using Engine',
    origin: 'Pelabuhan Bakauheni',
    originCode: 'IDBKH',
    destination: 'Pelabuhan Merak',
    destinationCode: 'IDMRK',
    departureTime: '12:35 WIB',
    eta: '14:05 WIB',
    etaMinutesRemaining: 25,
    distanceTravelledNm: 7.2,
    distanceRemainingNm: 6.8,
    routeProgressPercent: 51,
    lat: -5.9120,
    lng: 105.8650,
    cpaNm: 1.9,
    tcpaMin: 19.0,
    lastUpdate: '5 dtk lalu',
    region: 'Jawa & Bali',
    pastTrack: [[-5.8672, 105.7530], [-5.8900, 105.8100], [-5.9120, 105.8650]]
  },

  // 2. Selat Bali (Ketapang - Gilimanuk)
  {
    mmsi: '525021990',
    name: 'KMP. TRISILA BHAKTI II',
    callSign: 'YDT722',
    imo: '9345210',
    type: 'Ro-Ro Passenger Ferry',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2010,
    lengthM: 58,
    beamM: 12,
    draughtM: 2.8,
    grt: 1250,
    passengerCapacity: 450,
    vehicleCapacity: 60,
    sogKnots: 8.6,
    cogDeg: 98,
    headingDeg: 95,
    navStatus: 'Underway Using Engine',
    origin: 'Pelabuhan Ketapang',
    originCode: 'IDKTP',
    destination: 'Pelabuhan Gilimanuk',
    destinationCode: 'IDGLM',
    departureTime: '13:15 WIB',
    eta: '13:55 WIB',
    etaMinutesRemaining: 18,
    distanceTravelledNm: 1.8,
    distanceRemainingNm: 1.2,
    routeProgressPercent: 60,
    lat: -8.1460,
    lng: 114.4120,
    cpaNm: 1.2,
    tcpaMin: 8.0,
    lastUpdate: '3 dtk lalu',
    region: 'Jawa & Bali',
    pastTrack: [[-8.1480, 114.3980], [-8.1460, 114.4120]]
  },
  {
    mmsi: '525021884',
    name: 'KMP. PRATITHA IV',
    callSign: 'YDP412',
    imo: '9312890',
    type: 'Ro-Ro Passenger Ferry',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2009,
    lengthM: 52,
    beamM: 11.5,
    draughtM: 2.6,
    grt: 980,
    passengerCapacity: 400,
    vehicleCapacity: 50,
    sogKnots: 7.9,
    cogDeg: 275,
    headingDeg: 275,
    navStatus: 'Underway Using Engine',
    origin: 'Pelabuhan Gilimanuk',
    originCode: 'IDGLM',
    destination: 'Pelabuhan Ketapang',
    destinationCode: 'IDKTP',
    departureTime: '13:20 WITA',
    eta: '13:58 WIB',
    etaMinutesRemaining: 14,
    distanceTravelledNm: 1.9,
    distanceRemainingNm: 1.1,
    routeProgressPercent: 63,
    lat: -8.1520,
    lng: 114.4220,
    cpaNm: 1.4,
    tcpaMin: 11.0,
    lastUpdate: '4 dtk lalu',
    region: 'Jawa & Bali',
    pastTrack: [[-8.1633, 114.4372], [-8.1520, 114.4220]]
  },

  // 3. Selat Lombok (Padangbai - Lembar)
  {
    mmsi: '525032110',
    name: 'KMP. RODITHA',
    callSign: 'YDR891',
    imo: '9456102',
    type: 'Ro-Ro Passenger Ferry',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2013,
    lengthM: 94,
    beamM: 16,
    draughtM: 3.8,
    grt: 4650,
    passengerCapacity: 750,
    vehicleCapacity: 130,
    sogKnots: 11.4,
    cogDeg: 118,
    headingDeg: 120,
    navStatus: 'Underway Using Engine',
    origin: 'Pelabuhan Padangbai (Bali)',
    originCode: 'IDPDB',
    destination: 'Pelabuhan Lembar (Lombok)',
    destinationCode: 'IDLBR',
    departureTime: '11:30 WITA',
    eta: '15:45 WITA',
    etaMinutesRemaining: 85,
    distanceTravelledNm: 22.4,
    distanceRemainingNm: 15.6,
    routeProgressPercent: 59,
    lat: -8.6200,
    lng: 115.7500,
    cpaNm: 3.8,
    tcpaMin: 42.0,
    lastUpdate: '5 dtk lalu',
    region: 'Jawa & Bali',
    pastTrack: [[-8.5300, 115.5100], [-8.5800, 115.6300], [-8.6200, 115.7500]]
  },
  {
    mmsi: '525032440',
    name: 'KMP. PORTLINK VII',
    callSign: 'YDP770',
    imo: '9581203',
    type: 'Ro-Ro Passenger Ferry',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2014,
    lengthM: 92,
    beamM: 16,
    draughtM: 3.7,
    grt: 4500,
    passengerCapacity: 700,
    vehicleCapacity: 120,
    sogKnots: 11.2,
    cogDeg: 298,
    headingDeg: 300,
    navStatus: 'Underway Using Engine',
    origin: 'Pelabuhan Lembar',
    originCode: 'IDLBR',
    destination: 'Pelabuhan Padangbai',
    destinationCode: 'IDPDB',
    departureTime: '12:00 WITA',
    eta: '16:15 WITA',
    etaMinutesRemaining: 110,
    distanceTravelledNm: 18.2,
    distanceRemainingNm: 19.8,
    routeProgressPercent: 48,
    lat: -8.6800,
    lng: 115.8800,
    cpaNm: 3.2,
    tcpaMin: 36.0,
    lastUpdate: '3 dtk lalu',
    region: 'Jawa & Bali',
    pastTrack: [[-8.7289, 116.0711], [-8.7000, 115.9500], [-8.6800, 115.8800]]
  },

  // 4. Jawa & Madura
  {
    mmsi: '525008910',
    name: 'KMP. GILI IYANG',
    callSign: 'YDG811',
    imo: '9421880',
    type: 'Ro-Ro Passenger Ferry',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2011,
    lengthM: 54,
    beamM: 12,
    draughtM: 2.8,
    grt: 1150,
    passengerCapacity: 380,
    vehicleCapacity: 45,
    sogKnots: 11.0,
    cogDeg: 5,
    headingDeg: 5,
    navStatus: 'Underway Using Engine',
    origin: 'Gresik',
    originCode: 'IDGSK',
    destination: 'Bawean',
    destinationCode: 'IDBWN',
    departureTime: '10:00 WIB',
    eta: '14:30 WIB',
    etaMinutesRemaining: 40,
    distanceTravelledNm: 52.0,
    distanceRemainingNm: 18.0,
    routeProgressPercent: 74,
    lat: -6.4500,
    lng: 112.6500,
    cpaNm: 5.0,
    tcpaMin: 60.0,
    lastUpdate: '4 dtk lalu',
    region: 'Jawa & Bali',
    pastTrack: [[-7.1500, 112.6500], [-6.8000, 112.6500], [-6.4500, 112.6500]]
  },
  {
    mmsi: '525008922',
    name: 'KMP. DRAJAT PACIRAN',
    callSign: 'YDD921',
    imo: '9581100',
    type: 'Ro-Ro Angkutan Logistik',
    vesselCategory: 'cargo',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2016,
    lengthM: 78,
    beamM: 14,
    draughtM: 3.4,
    grt: 2950,
    passengerCapacity: 350,
    vehicleCapacity: 65,
    sogKnots: 12.2,
    cogDeg: 355,
    headingDeg: 355,
    navStatus: 'Underway Using Engine',
    origin: 'Paciran Lamongan',
    originCode: 'IDPCR',
    destination: 'Bahaur Kalteng',
    destinationCode: 'IDBHR',
    departureTime: '08:00 WIB',
    eta: '22:00 WIB',
    etaMinutesRemaining: 480,
    distanceTravelledNm: 85.0,
    distanceRemainingNm: 120.0,
    routeProgressPercent: 41,
    lat: -5.2000,
    lng: 113.1000,
    cpaNm: 6.5,
    tcpaMin: 80.0,
    lastUpdate: '7 dtk lalu',
    region: 'Jawa & Bali',
    pastTrack: [[-6.8500, 113.1000], [-5.9000, 113.1000], [-5.2000, 113.1000]]
  },
  {
    mmsi: '525008933',
    name: 'KMP. TONGKOL',
    callSign: 'YDT331',
    imo: '9081220',
    type: 'Ro-Ro Ferry Lintas Selat',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2005,
    lengthM: 48,
    beamM: 11,
    draughtM: 2.4,
    grt: 850,
    passengerCapacity: 300,
    vehicleCapacity: 40,
    sogKnots: 7.5,
    cogDeg: 40,
    headingDeg: 40,
    navStatus: 'Underway Using Engine',
    origin: 'Surabaya Ujung',
    originCode: 'IDUJG',
    destination: 'Kamal Madura',
    destinationCode: 'IDKML',
    departureTime: '13:30 WIB',
    eta: '13:55 WIB',
    etaMinutesRemaining: 10,
    distanceTravelledNm: 2.1,
    distanceRemainingNm: 0.9,
    routeProgressPercent: 70,
    lat: -7.1800,
    lng: 112.7400,
    cpaNm: 0.8,
    tcpaMin: 6.0,
    lastUpdate: '2 dtk lalu',
    region: 'Jawa & Bali',
    pastTrack: [[-7.2000, 112.7200], [-7.1800, 112.7400]]
  },

  // 5. Sumatera & Bangka Belitung
  {
    mmsi: '525041005',
    name: 'KMP. MENUMBING RAYA',
    callSign: 'YDM512',
    imo: '9512801',
    type: 'Ro-Ro Ferry Angkutan Logistik',
    vesselCategory: 'cargo',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2011,
    lengthM: 74,
    beamM: 14,
    draughtM: 3.2,
    grt: 2890,
    passengerCapacity: 400,
    vehicleCapacity: 75,
    sogKnots: 10.2,
    cogDeg: 242,
    headingDeg: 240,
    navStatus: 'Underway Using Engine',
    origin: 'Tanjung Kelian (Bangka)',
    originCode: 'IDTKL',
    destination: 'Tanjung Api-Api (Sumsel)',
    destinationCode: 'IDTAA',
    departureTime: '12:00 WIB',
    eta: '14:30 WIB',
    etaMinutesRemaining: 48,
    distanceTravelledNm: 14.8,
    distanceRemainingNm: 9.2,
    routeProgressPercent: 61,
    lat: -2.0850,
    lng: 105.0200,
    cpaNm: 4.2,
    tcpaMin: 55.0,
    lastUpdate: '8 dtk lalu',
    region: 'Sumatera',
    pastTrack: [[-2.0200, 105.1500], [-2.0500, 105.0800], [-2.0850, 105.0200]]
  },
  {
    mmsi: '525041011',
    name: 'KMP. KUALA BATE II',
    callSign: 'YDK812',
    imo: '9512822',
    type: 'Ro-Ro Passenger Ferry',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2012,
    lengthM: 68,
    beamM: 13.5,
    draughtM: 3.0,
    grt: 2400,
    passengerCapacity: 380,
    vehicleCapacity: 60,
    sogKnots: 9.8,
    cogDeg: 62,
    headingDeg: 60,
    navStatus: 'Underway Using Engine',
    origin: 'Tanjung Api-Api (Sumsel)',
    originCode: 'IDTAA',
    destination: 'Tanjung Kelian (Bangka)',
    destinationCode: 'IDTKL',
    departureTime: '12:15 WIB',
    eta: '14:45 WIB',
    etaMinutesRemaining: 55,
    distanceTravelledNm: 12.0,
    distanceRemainingNm: 12.0,
    routeProgressPercent: 50,
    lat: -2.1800,
    lng: 104.9000,
    cpaNm: 3.8,
    tcpaMin: 45.0,
    lastUpdate: '5 dtk lalu',
    region: 'Sumatera',
    pastTrack: [[-2.2400, 104.8200], [-2.1800, 104.9000]]
  },
  {
    mmsi: '525041022',
    name: 'KMP. IHAN BATAK',
    callSign: 'YDI221',
    imo: '9845110',
    type: 'Ro-Ro Ferry Danau Toba',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2018,
    lengthM: 45,
    beamM: 11,
    draughtM: 2.2,
    grt: 580,
    passengerCapacity: 280,
    vehicleCapacity: 35,
    sogKnots: 9.2,
    cogDeg: 310,
    headingDeg: 310,
    navStatus: 'Underway Using Engine',
    origin: 'Pelabuhan Ajibata',
    originCode: 'IDAJB',
    destination: 'Pelabuhan Ambarita',
    destinationCode: 'IDAMB',
    departureTime: '13:00 WIB',
    eta: '13:45 WIB',
    etaMinutesRemaining: 15,
    distanceTravelledNm: 4.8,
    distanceRemainingNm: 2.2,
    routeProgressPercent: 68,
    lat: 2.6500,
    lng: 98.9200,
    cpaNm: 1.2,
    tcpaMin: 12.0,
    lastUpdate: '3 dtk lalu',
    region: 'Sumatera',
    pastTrack: [[2.6000, 98.9500], [2.6500, 98.9200]]
  },
  {
    mmsi: '525041033',
    name: 'KMP. BRR',
    callSign: 'YDB331',
    imo: '9421900',
    type: 'Ro-Ro Passenger Ferry Aceh',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2007,
    lengthM: 65,
    beamM: 13,
    draughtM: 3.1,
    grt: 2150,
    passengerCapacity: 450,
    vehicleCapacity: 55,
    sogKnots: 12.5,
    cogDeg: 330,
    headingDeg: 330,
    navStatus: 'Underway Using Engine',
    origin: 'Ulee Lheue (Banda Aceh)',
    originCode: 'IDULH',
    destination: 'Balohan (Sabang)',
    destinationCode: 'IDSBG',
    departureTime: '13:00 WIB',
    eta: '14:45 WIB',
    etaMinutesRemaining: 35,
    distanceTravelledNm: 12.4,
    distanceRemainingNm: 6.6,
    routeProgressPercent: 65,
    lat: 5.7200,
    lng: 95.3000,
    cpaNm: 3.1,
    tcpaMin: 30.0,
    lastUpdate: '4 dtk lalu',
    region: 'Sumatera',
    pastTrack: [[5.5800, 95.3200], [5.6500, 95.3100], [5.7200, 95.3000]]
  },
  {
    mmsi: '525041044',
    name: 'KMP. BELANAK',
    callSign: 'YDB441',
    imo: '9421911',
    type: 'Ro-Ro Lintas Barat Sumatera',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2011,
    lengthM: 72,
    beamM: 14,
    draughtM: 3.3,
    grt: 2600,
    passengerCapacity: 420,
    vehicleCapacity: 60,
    sogKnots: 10.5,
    cogDeg: 220,
    headingDeg: 220,
    navStatus: 'Underway Using Engine',
    origin: 'Pelabuhan Sibolga',
    originCode: 'IDSBG',
    destination: 'Teluk Dalam (Nias)',
    destinationCode: 'IDTLK',
    departureTime: '10:00 WIB',
    eta: '18:00 WIB',
    etaMinutesRemaining: 240,
    distanceTravelledNm: 35.0,
    distanceRemainingNm: 45.0,
    routeProgressPercent: 44,
    lat: 1.5000,
    lng: 98.5000,
    cpaNm: 4.5,
    tcpaMin: 50.0,
    lastUpdate: '5 dtk lalu',
    region: 'Sumatera',
    pastTrack: [[1.7400, 98.7800], [1.6200, 98.6400], [1.5000, 98.5000]]
  },

  // 6. Kalimantan & Sulawesi
  {
    mmsi: '525051011',
    name: 'KMP. SWARNA CAKRA',
    callSign: 'YDS112',
    imo: '9512900',
    type: 'Ro-Ro Teluk Balikpapan',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2012,
    lengthM: 58,
    beamM: 12,
    draughtM: 2.8,
    grt: 1350,
    passengerCapacity: 350,
    vehicleCapacity: 50,
    sogKnots: 8.2,
    cogDeg: 230,
    headingDeg: 230,
    navStatus: 'Underway Using Engine',
    origin: 'Kariangau Balikpapan',
    originCode: 'IDKRG',
    destination: 'Penajam Paser Utara',
    destinationCode: 'IDPNJ',
    departureTime: '13:20 WITA',
    eta: '13:55 WITA',
    etaMinutesRemaining: 15,
    distanceTravelledNm: 3.2,
    distanceRemainingNm: 1.8,
    routeProgressPercent: 64,
    lat: -1.2400,
    lng: 116.7800,
    cpaNm: 0.9,
    tcpaMin: 7.0,
    lastUpdate: '2 dtk lalu',
    region: 'Kalimantan & Sulawesi',
    pastTrack: [[-1.2200, 116.8000], [-1.2400, 116.7800]]
  },
  {
    mmsi: '525051022',
    name: 'KMP. BAMEGA',
    callSign: 'YDB221',
    imo: '9421922',
    type: 'Ro-Ro Selat Laut Kalsel',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2010,
    lengthM: 52,
    beamM: 11.5,
    draughtM: 2.7,
    grt: 1100,
    passengerCapacity: 320,
    vehicleCapacity: 45,
    sogKnots: 8.0,
    cogDeg: 120,
    headingDeg: 120,
    navStatus: 'Underway Using Engine',
    origin: 'Batulicin',
    originCode: 'IDBTC',
    destination: 'Tanjung Serdang (Kotabaru)',
    destinationCode: 'IDTSD',
    departureTime: '13:10 WITA',
    eta: '13:45 WITA',
    etaMinutesRemaining: 10,
    distanceTravelledNm: 2.8,
    distanceRemainingNm: 1.2,
    routeProgressPercent: 70,
    lat: -3.4200,
    lng: 116.0200,
    cpaNm: 1.1,
    tcpaMin: 8.0,
    lastUpdate: '3 dtk lalu',
    region: 'Kalimantan & Sulawesi',
    pastTrack: [[-3.4000, 115.9800], [-3.4200, 116.0200]]
  },
  {
    mmsi: '525051033',
    name: 'KMP. BAHTERAMAS',
    callSign: 'YDB332',
    imo: '9651900',
    type: 'Ro-Ro Passenger Ferry Teluk Bone',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2015,
    lengthM: 82,
    beamM: 15,
    draughtM: 3.6,
    grt: 3800,
    passengerCapacity: 600,
    vehicleCapacity: 95,
    sogKnots: 11.5,
    cogDeg: 82,
    headingDeg: 82,
    navStatus: 'Underway Using Engine',
    origin: 'Pelabuhan Bajoe (Bone)',
    originCode: 'IDBJO',
    destination: 'Pelabuhan Kolaka (Sultra)',
    destinationCode: 'IDKLK',
    departureTime: '11:00 WITA',
    eta: '18:30 WITA',
    etaMinutesRemaining: 180,
    distanceTravelledNm: 38.0,
    distanceRemainingNm: 36.0,
    routeProgressPercent: 51,
    lat: -4.5000,
    lng: 120.9000,
    cpaNm: 3.5,
    tcpaMin: 40.0,
    lastUpdate: '4 dtk lalu',
    region: 'Kalimantan & Sulawesi',
    pastTrack: [[-4.5200, 120.4000], [-4.5100, 120.6500], [-4.5000, 120.9000]]
  },
  {
    mmsi: '525051044',
    name: 'KMP. KOTA MUNA',
    callSign: 'YDK441',
    imo: '9512911',
    type: 'Ro-Ro Passenger Ferry Teluk Bone',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2013,
    lengthM: 78,
    beamM: 14.5,
    draughtM: 3.5,
    grt: 3400,
    passengerCapacity: 550,
    vehicleCapacity: 85,
    sogKnots: 11.0,
    cogDeg: 262,
    headingDeg: 262,
    navStatus: 'Underway Using Engine',
    origin: 'Pelabuhan Kolaka (Sultra)',
    originCode: 'IDKLK',
    destination: 'Pelabuhan Bajoe (Bone)',
    destinationCode: 'IDBJO',
    departureTime: '11:30 WITA',
    eta: '19:00 WITA',
    etaMinutesRemaining: 210,
    distanceTravelledNm: 32.0,
    distanceRemainingNm: 42.0,
    routeProgressPercent: 43,
    lat: -4.4200,
    lng: 121.2000,
    cpaNm: 3.8,
    tcpaMin: 45.0,
    lastUpdate: '6 dtk lalu',
    region: 'Kalimantan & Sulawesi',
    pastTrack: [[-4.4000, 121.6000], [-4.4100, 121.4000], [-4.4200, 121.2000]]
  },
  {
    mmsi: '525051055',
    name: 'KMP. MERPATI',
    callSign: 'YDM551',
    imo: '9421933',
    type: 'Ro-Ro Ferry Lintas Siwa - Tobaku',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2011,
    lengthM: 64,
    beamM: 13,
    draughtM: 3.0,
    grt: 2100,
    passengerCapacity: 380,
    vehicleCapacity: 55,
    sogKnots: 10.2,
    cogDeg: 75,
    headingDeg: 75,
    navStatus: 'Underway Using Engine',
    origin: 'Pelabuhan Siwa',
    originCode: 'IDSWA',
    destination: 'Pelabuhan Tobaku',
    destinationCode: 'IDTBK',
    departureTime: '12:30 WITA',
    eta: '15:45 WITA',
    etaMinutesRemaining: 95,
    distanceTravelledNm: 16.0,
    distanceRemainingNm: 14.0,
    routeProgressPercent: 53,
    lat: -3.8500,
    lng: 120.8500,
    cpaNm: 2.2,
    tcpaMin: 25.0,
    lastUpdate: '5 dtk lalu',
    region: 'Kalimantan & Sulawesi',
    pastTrack: [[-3.9000, 120.6000], [-3.8700, 120.7200], [-3.8500, 120.8500]]
  },

  // 7. NTT, Maluku & Papua
  {
    mmsi: '525061011',
    name: 'KMP. LAKAAN',
    callSign: 'YDL112',
    imo: '9651911',
    type: 'Ro-Ro Passenger Ferry Kepulauan NTT',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2014,
    lengthM: 68,
    beamM: 14,
    draughtM: 3.2,
    grt: 2650,
    passengerCapacity: 450,
    vehicleCapacity: 60,
    sogKnots: 10.4,
    cogDeg: 215,
    headingDeg: 215,
    navStatus: 'Underway Using Engine',
    origin: 'Kupang (Bolok)',
    originCode: 'IDBLK',
    destination: 'Rote (Pantai Baru)',
    destinationCode: 'IDRTE',
    departureTime: '12:00 WITA',
    eta: '15:30 WITA',
    etaMinutesRemaining: 80,
    distanceTravelledNm: 18.0,
    distanceRemainingNm: 12.0,
    routeProgressPercent: 60,
    lat: -10.4500,
    lng: 123.3000,
    cpaNm: 2.8,
    tcpaMin: 32.0,
    lastUpdate: '3 dtk lalu',
    region: 'Maluku & Papua & NTT',
    pastTrack: [[-10.2200, 123.5000], [-10.3500, 123.4000], [-10.4500, 123.3000]]
  },
  {
    mmsi: '525061022',
    name: 'KMP. CAKALANG',
    callSign: 'YDC221',
    imo: '9421944',
    type: 'Ro-Ro Passenger Ferry Flores',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2011,
    lengthM: 58,
    beamM: 12.5,
    draughtM: 2.9,
    grt: 1450,
    passengerCapacity: 360,
    vehicleCapacity: 45,
    sogKnots: 10.1,
    cogDeg: 85,
    headingDeg: 85,
    navStatus: 'Underway Using Engine',
    origin: 'Pelabuhan Sape (Sumbawa)',
    originCode: 'IDSPE',
    destination: 'Labuan Bajo (Flores)',
    destinationCode: 'IDLBJ',
    departureTime: '11:00 WITA',
    eta: '17:30 WITA',
    etaMinutesRemaining: 140,
    distanceTravelledNm: 28.0,
    distanceRemainingNm: 18.0,
    routeProgressPercent: 61,
    lat: -8.5000,
    lng: 119.5000,
    cpaNm: 3.1,
    tcpaMin: 35.0,
    lastUpdate: '4 dtk lalu',
    region: 'Maluku & Papua & NTT',
    pastTrack: [[-8.5800, 119.0500], [-8.5400, 119.2800], [-8.5000, 119.5000]]
  },
  {
    mmsi: '525061033',
    name: 'KMP. ROKATENDA',
    callSign: 'YDR331',
    imo: '9312900',
    type: 'Ro-Ro Passenger Ferry Maluku',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2008,
    lengthM: 56,
    beamM: 12,
    draughtM: 2.8,
    grt: 1280,
    passengerCapacity: 340,
    vehicleCapacity: 40,
    sogKnots: 9.4,
    cogDeg: 60,
    headingDeg: 60,
    navStatus: 'Underway Using Engine',
    origin: 'Hunimua (Ambon)',
    originCode: 'IDHNM',
    destination: 'Waipirit (Seram)',
    destinationCode: 'IDWPR',
    departureTime: '13:00 WIT',
    eta: '14:30 WIT',
    etaMinutesRemaining: 30,
    distanceTravelledNm: 8.5,
    distanceRemainingNm: 4.5,
    routeProgressPercent: 65,
    lat: -3.5500,
    lng: 128.4500,
    cpaNm: 1.5,
    tcpaMin: 18.0,
    lastUpdate: '2 dtk lalu',
    region: 'Maluku & Papua & NTT',
    pastTrack: [[-3.6000, 128.3200], [-3.5500, 128.4500]]
  },
  {
    mmsi: '525061044',
    name: 'KMP. PORTLINK VIII',
    callSign: 'YDP881',
    imo: '9651922',
    type: 'Ro-Ro Passenger Ferry Maluku Utara',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2015,
    lengthM: 88,
    beamM: 16,
    draughtM: 3.8,
    grt: 4800,
    passengerCapacity: 750,
    vehicleCapacity: 120,
    sogKnots: 12.8,
    cogDeg: 100,
    headingDeg: 100,
    navStatus: 'Underway Using Engine',
    origin: 'Bitung (Sulut)',
    originCode: 'IDBTG',
    destination: 'Ternate (Bastiong)',
    destinationCode: 'IDBST',
    departureTime: '08:00 WITA',
    eta: '18:00 WIT',
    etaMinutesRemaining: 240,
    distanceTravelledNm: 75.0,
    distanceRemainingNm: 65.0,
    routeProgressPercent: 54,
    lat: 1.2000,
    lng: 126.2000,
    cpaNm: 5.2,
    tcpaMin: 70.0,
    lastUpdate: '6 dtk lalu',
    region: 'Maluku & Papua & NTT',
    pastTrack: [[1.4400, 125.1800], [1.3200, 125.7000], [1.2000, 126.2000]]
  },
  {
    mmsi: '525061055',
    name: 'KMP. KALABIA',
    callSign: 'YDK551',
    imo: '9512922',
    type: 'Ro-Ro Ferry Raja Ampat',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2013,
    lengthM: 52,
    beamM: 11.5,
    draughtM: 2.7,
    grt: 980,
    passengerCapacity: 300,
    vehicleCapacity: 35,
    sogKnots: 11.2,
    cogDeg: 320,
    headingDeg: 320,
    navStatus: 'Underway Using Engine',
    origin: 'Pelabuhan Sorong',
    originCode: 'IDSRG',
    destination: 'Waisai (Raja Ampat)',
    destinationCode: 'IDWSA',
    departureTime: '13:00 WIT',
    eta: '15:15 WIT',
    etaMinutesRemaining: 65,
    distanceTravelledNm: 22.0,
    distanceRemainingNm: 16.0,
    routeProgressPercent: 58,
    lat: -0.6500,
    lng: 131.0500,
    cpaNm: 2.1,
    tcpaMin: 22.0,
    lastUpdate: '3 dtk lalu',
    region: 'Maluku & Papua & NTT',
    pastTrack: [[-0.8700, 131.2500], [-0.7600, 131.1500], [-0.6500, 131.0500]]
  },
  {
    mmsi: '525061066',
    name: 'KMP. NAPAN',
    callSign: 'YDN661',
    imo: '9421955',
    type: 'Ro-Ro Ferry Teluk Cenderawasih',
    vesselCategory: 'passenger_ferry',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2010,
    lengthM: 58,
    beamM: 12,
    draughtM: 2.8,
    grt: 1250,
    passengerCapacity: 350,
    vehicleCapacity: 40,
    sogKnots: 9.6,
    cogDeg: 160,
    headingDeg: 160,
    navStatus: 'Underway Using Engine',
    origin: 'Pelabuhan Biak',
    originCode: 'IDBIK',
    destination: 'Serui (Yapen)',
    destinationCode: 'IDSRI',
    departureTime: '11:00 WIT',
    eta: '17:00 WIT',
    etaMinutesRemaining: 150,
    distanceTravelledNm: 32.0,
    distanceRemainingNm: 28.0,
    routeProgressPercent: 53,
    lat: -1.4000,
    lng: 136.1000,
    cpaNm: 4.0,
    tcpaMin: 45.0,
    lastUpdate: '5 dtk lalu',
    region: 'Maluku & Papua & NTT',
    pastTrack: [[-1.1800, 136.0800], [-1.2900, 136.0900], [-1.4000, 136.1000]]
  },
  {
    mmsi: '525061077',
    name: 'KMP. ERANA',
    callSign: 'YDE771',
    imo: '9312911',
    type: 'Ro-Ro Perintis Papua Selatan',
    vesselCategory: 'cargo',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2009,
    lengthM: 64,
    beamM: 13,
    draughtM: 3.0,
    grt: 2100,
    passengerCapacity: 280,
    vehicleCapacity: 35,
    sogKnots: 8.8,
    cogDeg: 315,
    headingDeg: 315,
    navStatus: 'Underway Using Engine',
    origin: 'Pelabuhan Merauke',
    originCode: 'IDMRK-P',
    destination: 'Pelabuhan Bade',
    destinationCode: 'IDBDE',
    departureTime: '09:00 WIT',
    eta: '20:00 WIT',
    etaMinutesRemaining: 320,
    distanceTravelledNm: 45.0,
    distanceRemainingNm: 55.0,
    routeProgressPercent: 45,
    lat: -7.8000,
    lng: 139.6000,
    cpaNm: 6.0,
    tcpaMin: 75.0,
    lastUpdate: '7 dtk lalu',
    region: 'Maluku & Papua & NTT',
    pastTrack: [[-8.4900, 140.3800], [-8.1500, 140.0000], [-7.8000, 139.6000]]
  },

  // 8. Special Craft & Bunkering
  {
    mmsi: '525008772',
    name: 'KMT. PATRA 08',
    callSign: 'YDP882',
    imo: '9211044',
    type: 'Bunkering Fuel Tanker ASDP',
    vesselCategory: 'tanker',
    owner: 'Swasta',
    flag: '🇮🇩 Indonesia',
    builtYear: 2011,
    lengthM: 85,
    beamM: 14,
    draughtM: 4.6,
    grt: 3400,
    passengerCapacity: 0,
    vehicleCapacity: 0,
    sogKnots: 8.5,
    cogDeg: 195,
    headingDeg: 195,
    navStatus: 'Underway Using Engine',
    origin: 'Ciwandan Banten',
    originCode: 'IDCWD',
    destination: 'Merak Bunkering Area',
    destinationCode: 'IDMRK',
    departureTime: '11:00 WIB',
    eta: '14:15 WIB',
    etaMinutesRemaining: 40,
    distanceTravelledNm: 14.0,
    distanceRemainingNm: 3.0,
    routeProgressPercent: 82,
    lat: -5.9800,
    lng: 106.0200,
    cpaNm: 2.4,
    tcpaMin: 26.0,
    lastUpdate: '7 dtk lalu',
    region: 'Jawa & Bali',
    pastTrack: [[-6.0200, 105.9600], [-5.9800, 106.0200]]
  },
  {
    mmsi: '525004112',
    name: 'TB. KRESNA VI',
    callSign: 'YDK611',
    imo: '9678120',
    type: 'Harbour Tug & Assist Vessel',
    vesselCategory: 'tug',
    owner: 'ASDP',
    flag: '🇮🇩 Indonesia',
    builtYear: 2018,
    lengthM: 32,
    beamM: 9.5,
    draughtM: 3.2,
    grt: 280,
    passengerCapacity: 0,
    vehicleCapacity: 0,
    sogKnots: 5.2,
    cogDeg: 340,
    headingDeg: 340,
    navStatus: 'Underway Using Engine',
    origin: 'Merak Basin',
    originCode: 'IDMRK',
    destination: 'Dermaga 6 Berthing Assist',
    destinationCode: 'IDMRK',
    departureTime: '13:10 WIB',
    eta: '13:35 WIB',
    etaMinutesRemaining: 8,
    distanceTravelledNm: 1.2,
    distanceRemainingNm: 0.6,
    routeProgressPercent: 66,
    lat: -5.9200,
    lng: 105.9800,
    cpaNm: 1.1,
    tcpaMin: 10.0,
    lastUpdate: '1 dtk lalu',
    region: 'Jawa & Bali',
    pastTrack: [[-5.9322, 105.9984], [-5.9200, 105.9800]]
  }
];

export const AisFleetMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<{ [mmsi: string]: L.Marker }>({});
  const pastTrackPolylineRef = useRef<L.Polyline | null>(null);

  const [vessels, setVessels] = useState<AisVessel[]>(INDONESIA_ASDP_FLEET);
  const [selectedVessel, setSelectedVessel] = useState<AisVessel | null>(INDONESIA_ASDP_FLEET[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 5>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'passenger_ferry' | 'cargo' | 'tanker' | 'tug'>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [layerMode, setLayerMode] = useState<'hibrida' | 'satelit' | 'medan' | 'peta'>('hibrida');
  const [showPastTrack, setShowPastTrack] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Google Maps Tile server URLs (Identical to GoogleMapsView on Page 1)
  const getGoogleTileUrl = (mode: 'hibrida' | 'satelit' | 'medan' | 'peta') => {
    switch (mode) {
      case 'peta':
        // Google Maps Standard Roadmap (Street, Maritime & Shoreline)
        return 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
      case 'satelit':
        // Pure Google Satellite imagery
        return 'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';
      case 'medan':
        // Google Maps Terrain / Physical
        return 'https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';
      case 'hibrida':
      default:
        // Google Satellite with roads, maritime labels, and city borders
        return 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
    }
  };

  // MarineTraffic signature vessel color code
  const getVesselColor = (vessel: AisVessel) => {
    if (vessel.navStatus === 'Moored') return '#38bdf8'; // Blue for Moored
    switch (vessel.vesselCategory) {
      case 'passenger_ferry':
        return '#d946ef'; // Magenta / Fuchsia for Passenger Ro-Ro Ferries
      case 'cargo':
        return '#22c55e'; // Emerald Green for Cargo / Ro-Pax
      case 'tanker':
        return '#ef4444'; // Red for Tankers
      case 'tug':
        return '#06b6d4'; // Cyan for Tugs / Port Assistance
      default:
        return '#d946ef';
    }
  };

  // Regional Shortcut Coordinates
  const regionalJumps = {
    all: { center: [-2.2, 118.0] as [number, number], zoom: 5, name: 'Seluruh Nusantara' },
    sunda: { center: [-5.91, 105.88] as [number, number], zoom: 11, name: 'Selat Sunda' },
    bali: { center: [-8.15, 114.41] as [number, number], zoom: 12, name: 'Selat Bali' },
    lombok: { center: [-8.65, 115.80] as [number, number], zoom: 10, name: 'Selat Lombok' },
    bangka: { center: [-2.08, 105.02] as [number, number], zoom: 11, name: 'Selat Bangka' },
  };

  // 1. Initialize Leaflet Map with Google Maps Base Layout
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-2.2, 118.0],
      zoom: 5,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
      maxBounds: [
        [-15.0, 92.0],
        [10.0, 144.0],
      ],
      maxBoundsViscosity: 0.8,
    });

    mapInstanceRef.current = map;

    // Add Google Maps Tile Layer
    const tileLayer = L.tileLayer(getGoogleTileUrl('hibrida'), {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Responsive container resize observer
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Update Google Maps Tile Layer when layerMode changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const newLayer = L.tileLayer(getGoogleTileUrl(layerMode), {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  }, [layerMode]);

  // 3. Render Selected Vessel Past Track Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pastTrackPolylineRef.current) {
      pastTrackPolylineRef.current.remove();
      pastTrackPolylineRef.current = null;
    }

    if (!showPastTrack || !selectedVessel || selectedVessel.pastTrack.length < 2) return;

    const polyline = L.polyline(selectedVessel.pastTrack, {
      color: '#38bdf8',
      weight: 3,
      dashArray: '5, 5',
      opacity: 0.9,
    }).addTo(map);

    pastTrackPolylineRef.current = polyline;
  }, [selectedVessel, showPastTrack]);

  // 4. Continuous live simulation of vessel movement
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setVessels((prevVessels) =>
        prevVessels.map((v) => {
          if (v.navStatus === 'Moored') return v;

          const rad = (v.cogDeg * Math.PI) / 180;
          const factor = 0.00032 * playbackSpeed;
          const dLng = Math.sin(rad) * factor;
          const dLat = Math.cos(rad) * factor;

          let newLng = v.lng + dLng;
          let newLat = v.lat + dLat;

          // Boundary bouncing in major corridors
          if (v.originCode === 'IDMRK' && newLng < 105.78) {
            newLng = 105.98;
            newLat = -5.92;
          } else if (v.originCode === 'IDBKH' && newLng > 105.98) {
            newLng = 105.78;
            newLat = -5.87;
          }

          const updatedTrack: [number, number][] = [...v.pastTrack, [newLat, newLng] as [number, number]].slice(-10);

          return {
            ...v,
            lat: newLat,
            lng: newLng,
            pastTrack: updatedTrack,
            lastUpdate: 'Baru saja',
          };
        })
      );
    }, 1200);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // 5. Filtered Vessels
  const filteredVessels = useMemo(() => {
    return vessels.filter((v) => {
      if (filterCategory !== 'all' && v.vesselCategory !== filterCategory) return false;
      if (selectedRegion !== 'all' && v.region !== selectedRegion) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = v.name.toLowerCase().includes(q);
        const matchesMmsi = v.mmsi.includes(q);
        const matchesCallSign = v.callSign.toLowerCase().includes(q);
        const matchesDest = v.destination.toLowerCase().includes(q);
        const matchesOrig = v.origin.toLowerCase().includes(q);
        if (!matchesName && !matchesMmsi && !matchesCallSign && !matchesDest && !matchesOrig) return false;
      }
      return true;
    });
  }, [vessels, filterCategory, selectedRegion, searchQuery]);

  // 6. Render MarineTraffic Chevron Vessels on Google Maps
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear removed markers
    const currentMmsis = new Set(filteredVessels.map((v) => v.mmsi));
    Object.keys(markersRef.current).forEach((mmsi) => {
      if (!currentMmsis.has(mmsi)) {
        markersRef.current[mmsi].remove();
        delete markersRef.current[mmsi];
      }
    });

    filteredVessels.forEach((v) => {
      const isSelected = selectedVessel?.mmsi === v.mmsi;
      const color = getVesselColor(v);
      const isMoored = v.navStatus === 'Moored';

      // MarineTraffic Chevron Icon
      const iconHtml = `
        <div class="relative cursor-pointer group select-none flex items-center justify-center" style="width: 36px; height: 36px;">
          <!-- Selected Halo Ring -->
          ${isSelected ? `
            <div class="absolute -inset-1 rounded-full border-2 border-cyan-400 border-dashed animate-spin -z-10" style="animation-duration: 5s;"></div>
            <div class="absolute -inset-2.5 rounded-full bg-cyan-400/20 animate-pulse -z-20"></div>
          ` : ''}

          <!-- Speed Vector Heading Line -->
          ${!isMoored && v.sogKnots > 0.5 ? `
            <div class="absolute origin-bottom pointer-events-none" 
                 style="transform: rotate(${v.headingDeg}deg); bottom: 18px; width: 2px; height: ${Math.min(28, v.sogKnots * 1.8)}px; background: linear-gradient(to top, ${color}, transparent);"></div>
          ` : ''}

          <!-- Oriented Chevron Hull -->
          <div style="transform: rotate(${v.headingDeg}deg);" class="transition-transform duration-300">
            ${isMoored ? `
              <svg width="20" height="20" viewBox="0 0 24 24" class="drop-shadow-md">
                <circle cx="12" cy="12" r="8" fill="#0f172a" stroke="${color}" stroke-width="2.5" />
                <circle cx="12" cy="12" r="3.5" fill="${color}" />
              </svg>
            ` : `
              <svg width="22" height="22" viewBox="0 0 24 24" class="drop-shadow-lg">
                <path d="M 12 2 L 19 19 L 12 16 L 5 19 Z" fill="${color}" stroke="#0b1320" stroke-width="1.8" stroke-linejoin="round" />
                <line x1="12" y1="5" x2="12" y2="14" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.8" />
              </svg>
            `}
          </div>

          <!-- Vessel Label Tag -->
          <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-[#09121f]/95 border border-slate-700/80 rounded text-[9px] font-mono font-bold text-white whitespace-nowrap shadow-md pointer-events-none ${isSelected ? 'border-cyan-400 text-cyan-300' : 'hidden group-hover:block'}">
            ${v.name.replace('KMP. ', '')} (${v.sogKnots}k)
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'marinetraffic-vessel-marker',
        html: iconHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      if (markersRef.current[v.mmsi]) {
        const marker = markersRef.current[v.mmsi];
        marker.setLatLng([v.lat, v.lng]);
        marker.setIcon(customIcon);
        marker.setZIndexOffset(isSelected ? 2000 : 500);
      } else {
        const marker = L.marker([v.lat, v.lng], {
          icon: customIcon,
          zIndexOffset: isSelected ? 2000 : 500,
        }).addTo(map);

        marker.bindTooltip(
          `<div class="p-1 font-sans text-xs min-w-[190px]">
            <div class="flex items-center justify-between font-bold text-slate-900 border-b pb-1 mb-1">
              <span>${v.flag} ${v.name}</span>
              <span class="text-[10px] text-cyan-700 font-mono">${v.callSign}</span>
            </div>
            <div class="text-[11px] text-slate-600 mb-0.5">Tipe: <strong>${v.type}</strong></div>
            <div class="text-[11px] text-slate-700 font-mono">
              SOG: <strong class="text-emerald-700 font-bold">${v.sogKnots} kn</strong> · COG: <strong>${v.cogDeg}°</strong>
            </div>
            <div class="text-[10px] text-slate-500 mt-1 pt-1 border-t flex justify-between">
              <span>${v.originCode} ➔ ${v.destinationCode}</span>
              <span class="font-bold text-slate-700">ETA ${v.eta}</span>
            </div>
          </div>`,
          { direction: 'top', offset: [0, -18], opacity: 0.98 }
        );

        marker.on('click', () => {
          setSelectedVessel(v);
          setDrawerOpen(true);
        });

        markersRef.current[v.mmsi] = marker;
      }
    });
  }, [filteredVessels, selectedVessel?.mmsi]);

  // Jump camera to selected corridor / region
  const handleCorridorJump = (corridorKey: 'all' | 'sunda' | 'bali' | 'lombok' | 'bangka') => {
    const target = regionalJumps[corridorKey];
    if (mapInstanceRef.current && target) {
      mapInstanceRef.current.flyTo(target.center, target.zoom, { duration: 1.2 });
    }
  };

  // Focus on Selected Vessel
  const handleFocusVessel = (v: AisVessel) => {
    setSelectedVessel(v);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([v.lat, v.lng], 12, { duration: 1 });
    }
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetView = () => {
    mapInstanceRef.current?.flyTo([-2.2, 118.0], 5, { duration: 1 });
  };

  return (
    <div
      className={`relative bg-[#071322] border border-slate-800 rounded-xl overflow-hidden flex flex-col text-slate-100 select-none shadow-2xl transition-all duration-300 ${
        isFullscreen ? 'fixed inset-3 z-50 shadow-2xl h-[calc(100vh-24px)]' : 'h-[640px]'
      }`}
    >
      {/* 1. TOP MARINETRAFFIC CONTROL BAR WITH GOOGLE MAPS LAYERS */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#091629]/95 backdrop-blur-md border-b border-slate-800 text-xs z-[1000]">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-blue-600 to-fuchsia-600 p-0.5 flex items-center justify-center shadow-lg">
              <div className="w-full h-full bg-[#091629] rounded-[6px] flex items-center justify-center">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-[13px] tracking-wide">
                  GOOGLE MAPS AIS · ARMADA KAPAL ASDP NUSANTARA
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  GOOGLE MAPS LIVE
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400">
                Peta Google Satelit &amp; Hibrida · Posisi Real-time Kapal Ro-Ro Penyeberangan ASDP
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search MarineTraffic Input */}
        <div className="relative flex-1 max-w-sm mx-2">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search MarineTraffic (Nama Kapal, MMSI, Rute)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0c1e36] border border-cyan-700/60 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Right: Google Maps Layer Switcher & Controls */}
        <div className="flex items-center gap-2">
          {/* Layer Selector */}
          <div className="flex items-center gap-1 bg-slate-900/95 p-0.5 rounded-lg border border-slate-700/80">
            <button
              onClick={() => setLayerMode('hibrida')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                layerMode === 'hibrida' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hibrida
            </button>
            <button
              onClick={() => setLayerMode('satelit')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                layerMode === 'satelit' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Satelit
            </button>
            <button
              onClick={() => setLayerMode('medan')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                layerMode === 'medan' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Medan
            </button>
            <button
              onClick={() => setLayerMode('peta')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                layerMode === 'peta' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Peta
            </button>
          </div>

          {/* Play/Pause & Speed */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-700/80">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 rounded hover:bg-slate-800 text-slate-200 transition-colors"
              title={isPlaying ? 'Jeda Simulasi AIS' : 'Mulai Simulasi AIS'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd as any)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                  playbackSpeed === spd ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-700/80">
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
              title="Perbesar Peta"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
              title="Perkecil Peta"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
              title="Reset Tampilan ke Seluruh RI"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUB-BAR: VESSEL FILTERS & CORRIDOR SHORTCUTS */}
      <div className="px-4 py-1.5 bg-[#081323]/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs z-20">
        {/* Category Pills matching MarineTraffic */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 mr-1">Tipe Armada:</span>
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
              filterCategory === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Semua Kapal ({vessels.length})
          </button>
          <button
            onClick={() => setFilterCategory('passenger_ferry')}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
              filterCategory === 'passenger_ferry' ? 'bg-fuchsia-600 text-white font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400" />
            <span>Ro-Ro Ferry ASDP ({vessels.filter((v) => v.vesselCategory === 'passenger_ferry').length})</span>
          </button>
          <button
            onClick={() => setFilterCategory('cargo')}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
              filterCategory === 'cargo' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Kargo/Logistik ({vessels.filter((v) => v.vesselCategory === 'cargo').length})</span>
          </button>
          <button
            onClick={() => setFilterCategory('tanker')}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
              filterCategory === 'tanker' ? 'bg-red-600 text-white font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span>Bunker BBM</span>
          </button>
          <button
            onClick={() => setFilterCategory('tug')}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
              filterCategory === 'tug' ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Tug Assist</span>
          </button>
        </div>

        {/* Corridor Shortcuts */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-700/80">
          <span className="text-[10.5px] font-semibold text-slate-400 px-1.5">Lompat Koridor:</span>
          <button
            onClick={() => handleCorridorJump('all')}
            className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-600 text-white hover:bg-blue-500"
          >
            Seluruh RI
          </button>
          <button
            onClick={() => handleCorridorJump('sunda')}
            className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 hover:text-white"
          >
            Selat Sunda
          </button>
          <button
            onClick={() => handleCorridorJump('bali')}
            className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 hover:text-white"
          >
            Selat Bali
          </button>
          <button
            onClick={() => handleCorridorJump('lombok')}
            className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 hover:text-white"
          >
            Selat Lombok
          </button>
          <button
            onClick={() => handleCorridorJump('bangka')}
            className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 hover:text-white"
          >
            Selat Bangka
          </button>
        </div>
      </div>

      {/* 3. REAL GOOGLE MAPS LEAFLET CONTAINER */}
      <div className="relative flex-1 w-full h-full bg-[#0a1424] overflow-hidden">
        {/* Leaflet Mount Point */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* 4. MARINETRAFFIC POPUP DRAWER (Matching Screenshot image_5b97d7c3.png) */}
        {selectedVessel && drawerOpen && (
          <div className="absolute top-3 right-3 w-80 sm:w-96 bg-[#0a182d]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-xs z-[1000] space-y-3 pointer-events-auto transition-all animate-in fade-in slide-in-from-right-4 max-h-[calc(100%-24px)] overflow-y-auto scrollbar-thin">
            {/* Header: Ship Silhouette, Name & Close button */}
            <div className="relative border-b border-slate-800 pb-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 font-bold">
                    <span>MMSI: {selectedVessel.mmsi}</span>
                    <span className="text-slate-500">•</span>
                    <span>IMO: {selectedVessel.imo}</span>
                  </div>
                  <h4 className="text-base font-black text-white flex items-center gap-1.5 mt-0.5">
                    <span>{selectedVessel.flag}</span>
                    <span>{selectedVessel.name}</span>
                  </h4>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Call Sign: <strong className="text-slate-200 font-mono">{selectedVessel.callSign}</strong> · {selectedVessel.type}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedVessel.owner === 'ASDP'
                      ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-700'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  }`}>
                    {selectedVessel.owner}
                  </span>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Tutup Panel"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/80">
                <span className={`w-2.5 h-2.5 rounded-full ${selectedVessel.navStatus === 'Moored' ? 'bg-blue-400' : 'bg-emerald-400 animate-pulse'}`} />
                <span className="font-semibold text-white text-[11px]">{selectedVessel.navStatus}</span>
                <span className="text-slate-500 text-[10px] ml-auto font-mono">Diterima: {selectedVessel.lastUpdate}</span>
              </div>
            </div>

            {/* Voyage Progress Bar (Origin ➔ Destination) */}
            <div className="p-3 rounded-xl bg-[#071322] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Asal Keberangkatan</div>
                  <div className="font-bold text-white font-mono mt-0.5">{selectedVessel.originCode} ({selectedVessel.origin.replace('Pelabuhan ', '')})</div>
                  <div className="text-[10px] text-slate-400 font-mono">{selectedVessel.departureTime}</div>
                </div>
                <div className="text-center px-2">
                  <Ship className="w-4 h-4 text-cyan-400 mx-auto" />
                  <div className="text-[9px] text-cyan-300 font-mono font-bold mt-0.5">{selectedVessel.routeProgressPercent}%</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-medium">Tujuan Sandar</div>
                  <div className="font-bold text-white font-mono mt-0.5">{selectedVessel.destinationCode} ({selectedVessel.destination.replace('Pelabuhan ', '')})</div>
                  <div className="text-[10px] text-emerald-400 font-mono font-bold">ETA {selectedVessel.eta}</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden relative">
                <div
                  className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${selectedVessel.routeProgressPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-[10.5px] text-slate-400 font-mono pt-1">
                <span>Tempuh: <strong className="text-white">{selectedVessel.distanceTravelledNm} NM</strong></span>
                <span>Sisa: <strong className="text-cyan-300">{selectedVessel.distanceRemainingNm} NM</strong> (~{selectedVessel.etaMinutesRemaining} m)</span>
              </div>
            </div>

            {/* Navigation Telemetry Matrix */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#071322] border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span>Speed Over Ground (SOG)</span>
                </div>
                <div className="text-xl font-black text-emerald-400 mt-1 tabular-nums">
                  {selectedVessel.sogKnots} <span className="text-xs font-normal text-slate-300">knots</span>
                </div>
                <div className="text-[9.5px] text-slate-500 font-sans mt-0.5">Kecepatan laju kapal</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#071322] border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                  <Compass className="w-3 h-3 text-cyan-400" />
                  <span>Course / Haluan (COG)</span>
                </div>
                <div className="text-xl font-black text-white mt-1 tabular-nums">
                  {selectedVessel.cogDeg}° <span className="text-xs font-normal text-slate-400">/ {selectedVessel.headingDeg}°</span>
                </div>
                <div className="text-[9.5px] text-slate-500 font-sans mt-0.5">Arah kompas haluan</div>
              </div>

              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-400" />
                  <span>Kapasitas Penumpang</span>
                </div>
                <div className="text-sm font-bold text-white mt-0.5">{selectedVessel.passengerCapacity.toLocaleString()} Orang</div>
              </div>

              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                  <Truck className="w-3 h-3 text-amber-400" />
                  <span>Kapasitas Kendaraan</span>
                </div>
                <div className="text-sm font-bold text-white mt-0.5">{selectedVessel.vehicleCapacity} Unit (Gol I-IX)</div>
              </div>
            </div>

            {/* Technical Particulars */}
            <div className="grid grid-cols-3 gap-1.5 text-center p-2 rounded-xl bg-[#071322] border border-slate-800 text-[10px] font-mono">
              <div>
                <div className="text-slate-400 font-sans">Tonase (GRT)</div>
                <div className="font-bold text-white mt-0.5">{selectedVessel.grt.toLocaleString()} GT</div>
              </div>
              <div>
                <div className="text-slate-400 font-sans">Panjang x Lebar</div>
                <div className="font-bold text-white mt-0.5">{selectedVessel.lengthM}m × {selectedVessel.beamM}m</div>
              </div>
              <div>
                <div className="text-slate-400 font-sans">Draft Air</div>
                <div className="font-bold text-white mt-0.5">{selectedVessel.draughtM} meter</div>
              </div>
            </div>

            {/* Collision Avoidance Safety Matrix (CPA / TCPA) */}
            <div className="p-2.5 rounded-xl bg-[#071322] border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sistem Keamanan Papasan (CPA)</span>
                </span>
                <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
                  Status Aman
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Closest Point of Approach:</span>
                <span className="text-white font-bold">{selectedVessel.cpaNm} NM</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Time to CPA (TCPA):</span>
                <span className="text-white font-bold">{selectedVessel.tcpaMin} Menit</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleFocusVessel(selectedVessel)}
                className="py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Pusatkan Kapal</span>
              </button>
              <button
                onClick={() => setShowPastTrack(!showPastTrack)}
                className={`py-1.5 px-2.5 rounded-lg border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  showPastTrack ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                <span>{showPastTrack ? 'Sembunyikan Jalur' : 'Lihat Lintasan'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 5. RE-OPEN BUTTON IF DRAWER CLOSED */}
        {selectedVessel && !drawerOpen && (
          <button
            onClick={() => setDrawerOpen(true)}
            className="absolute top-3 right-3 bg-[#0a182d]/95 border border-cyan-500 text-cyan-300 px-3 py-1.5 rounded-xl shadow-2xl z-[1000] text-xs font-bold flex items-center gap-2 hover:bg-slate-900 transition-all"
          >
            <Ship className="w-4 h-4 text-cyan-400" />
            <span>Detail {selectedVessel.name.replace('KMP. ', '')}</span>
          </button>
        )}

        {/* 6. GOOGLE MAPS BOTTOM STATUS BAR */}
        <div className="absolute bottom-3 left-3 bg-[#0a182d]/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 flex items-center gap-3 z-[1000] text-xs shadow-xl">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] text-slate-400">Pusat Kendali ASDP:</span>
            <span className="text-[11px] font-bold text-white font-mono">POCC ASDP Merak, Ketapang &amp; Kupang</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Transponder:</span>
            <span className="text-cyan-300 font-mono font-bold">AIS Kelas A Terintegrasi</span>
          </div>
        </div>

        {/* 7. ACTIVE FLEET COUNTER (Bottom-Right) */}
        <div className="absolute bottom-9 right-3 bg-[#0a182d]/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 flex items-center gap-3 z-[1000] text-xs shadow-xl">
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '30s' }} />
            <span>KURS UTARA 000°</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{filteredVessels.length} Kapal ASDP Aktif</span>
          </div>
        </div>

        {/* 8. GOOGLE MAPS BRANDING & LEGAL FOOTER */}
        <div className="absolute bottom-1 right-2 bg-white/90 text-slate-800 dark:bg-[#071322]/85 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-sans flex items-center gap-1.5 shadow z-[999] pointer-events-none border border-slate-700/40">
          <span className="font-bold text-slate-900 dark:text-white">Google</span>
          <span className="text-slate-400">· Data peta ©2026 Google</span>
          <span className="text-slate-500 hidden sm:inline">· Pintasan keyboard</span>
          <span className="text-slate-500 hidden sm:inline">· Persyaratan</span>
        </div>
      </div>
    </div>
  );
};
