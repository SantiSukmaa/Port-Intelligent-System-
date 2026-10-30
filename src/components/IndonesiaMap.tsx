import React, { useState } from 'react';
import { PortData } from '../types/dashboard.ts';
import { 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  ExternalLink
} from 'lucide-react';

interface IndonesiaMapProps {
  ports: PortData[];
  selectedPort: PortData;
  onSelectPort: (port: PortData) => void;
  selectedRegion?: string;
  onChangeRegion?: (region: string) => void;
  onlyPriorityRoutes?: boolean;
  onTogglePriorityRoutes?: (val: boolean) => void;
  mapMode?: 'antrean' | 'otp' | 'armada';
  onChangeMapMode?: (mode: 'antrean' | 'otp' | 'armada') => void;
}

export const IndonesiaMap: React.FC<IndonesiaMapProps> = ({
  ports,
  selectedPort,
  onSelectPort,
  selectedRegion = 'all',
  onChangeRegion,
  onlyPriorityRoutes = false,
  onTogglePriorityRoutes,
  mapMode = 'antrean',
  onChangeMapMode,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const svgWidth = 1000;
  const svgHeight = 520;

  // Calibrated geographic projection for authentic Indonesia archipelago matching image_d1e060bc.png
  const projectCoords = (lat: number, lng: number) => {
    const minLng = 94.2;
    const maxLng = 141.5;
    const minLat = -11.6;
    const maxLat = 7.2;

    const x = ((lng - minLng) / (maxLng - minLng)) * 900 + 45;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 430 + 40;
    return { x, y };
  };

  // Smart offset calibration to prevent badge overlapping in crowded straits (Java, Bali, Lombok, Sumbawa)
  const getPortOffset = (portId: string) => {
    switch (portId) {
      case 'merak': return { dx: -18, dy: -12 };
      case 'bakauheni': return { dx: -38, dy: -26 };
      case 'ketapang': return { dx: -15, dy: 14 };
      case 'gilimanuk': return { dx: 12, dy: 22 };
      case 'padangbai': return { dx: 18, dy: 34 };
      case 'lembar': return { dx: 38, dy: 24 };
      case 'kayangan': return { dx: 48, dy: 8 };
      case 'pototano': return { dx: 58, dy: -4 };
      case 'tanjung_kelian': return { dx: -10, dy: -16 };
      case 'tanjung_api_api': return { dx: -24, dy: 10 };
      case 'penajam': return { dx: -12, dy: -18 };
      case 'kariangau': return { dx: 16, dy: -26 };
      case 'bajoe': return { dx: -12, dy: 14 };
      case 'kolaka': return { dx: 16, dy: 8 };
      case 'siwa': return { dx: -8, dy: -12 };
      case 'tobaku': return { dx: 14, dy: -18 };
      case 'bolok': return { dx: 16, dy: 16 };
      case 'rote': return { dx: 0, dy: 30 };
      case 'sape': return { dx: 25, dy: 4 };
      case 'labuan_bajo': return { dx: 40, dy: 10 };
      default: return { dx: 0, dy: 0 };
    }
  };

  const getMarkerColor = (port: PortData) => {
    switch (port.status) {
      case 'kritis': return '#ef4444'; // Red
      case 'padat': return '#f97316'; // Orange
      case 'waspada': return '#f59e0b'; // Amber / Gold
      default: return '#10b981'; // Emerald Green
    }
  };

  const filteredPorts = ports.filter((port) => {
    if (selectedRegion !== 'all' && port.region !== selectedRegion) return false;
    if (onlyPriorityRoutes && !port.isNationalPriority) return false;
    return true;
  });

  const quickJumpPorts = [
    { id: 'merak', name: 'Merak' },
    { id: 'bakauheni', name: 'Bakauheni' },
    { id: 'ketapang', name: 'Ketapang' },
    { id: 'gilimanuk', name: 'Gilimanuk' },
    { id: 'lembar', name: 'Lembar' },
    { id: 'padangbai', name: 'Padangbai' },
    { id: 'ajibata', name: 'Ajibata' },
  ];

  return (
    <div
      className={`relative bg-[#0c1626] border border-slate-800 rounded-xl overflow-hidden flex flex-col transition-all duration-300 select-none shadow-xl ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'h-[500px]'
      }`}
    >
      {/* 1. TOP HEADER & FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2 bg-[#0a1220]/95 backdrop-blur border-b border-slate-800 text-xs z-20">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold text-slate-100">Google Maps Nusantara · 37 Pelabuhan ASDP</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-900/60 text-blue-300 border border-blue-700/50">
            Google Maps Platform
          </span>
          <span className="text-slate-400 hidden md:inline text-[11px]">
            | Real-Time Geospasial Holding Monitoring
          </span>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1.5">
          {onChangeMapMode && (
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-700">
              <button
                onClick={() => onChangeMapMode('antrean')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  mapMode === 'antrean' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Status Antrean (6 Zona)
              </button>
              <button
                onClick={() => onChangeMapMode('otp')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  mapMode === 'otp' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Ketepatan Keberangkatan (OTP)
              </button>
              <button
                onClick={() => onChangeMapMode('armada')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  mapMode === 'armada' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Rencana Armada &amp; Kesiapan
              </button>
            </div>
          )}

          {/* Zoom and Fullscreen controls */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Perbesar"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.8))}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Perkecil"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoomLevel(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Reset Tampilan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Sub Filter Ribbon */}
      {onChangeRegion && (
        <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px]">Filter Wilayah:</span>
              <select
                value={selectedRegion}
                onChange={(e) => onChangeRegion(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-0.5 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Semua Regional (4 Wilayah)</option>
                <option value="Regional I (Sumatera)">Regional I (Sumatera)</option>
                <option value="Regional II (Jawa & Bali)">Regional II (Jawa & Bali)</option>
                <option value="Regional III (Kalimantan & Sulawesi)">Regional III (Kalimantan & Sulawesi)</option>
                <option value="Regional IV (Maluku, Papua & Nusa Tenggara)">Regional IV (Maluku, Papua & Nusa Tenggara)</option>
              </select>
            </div>

            {onTogglePriorityRoutes && (
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200 text-[11px]">
                <input
                  type="checkbox"
                  checked={onlyPriorityRoutes}
                  onChange={(e) => onTogglePriorityRoutes(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0"
                />
                <span>15 Lintasan Utama (Prioritas Nasional)</span>
              </label>
            )}
          </div>
        </div>
      )}

      {/* 2. AUTHENTIC GOOGLE MAPS TERRAIN CANVAS MATCHING IMAGE 2 */}
      <div
        className="relative flex-1 bg-[#6fcadb] overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => {
          setIsDragging(true);
          setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
        }}
        onMouseMove={(e) => {
          if (!isDragging) return;
          setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full select-none"
          preserveAspectRatio="none"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          <defs>
            {/* Google Maps Ocean Gradient */}
            <linearGradient id="gmapOceanIna" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#72d3e5" />
              <stop offset="60%" stopColor="#6dc8dc" />
              <stop offset="100%" stopColor="#63bccc" />
            </linearGradient>

            {/* Google Terrain Island Fill (Soft natural pastel green) */}
            <linearGradient id="gmapLandIna" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b4e499" />
              <stop offset="50%" stopColor="#9ed984" />
              <stop offset="100%" stopColor="#8ccf72" />
            </linearGradient>
          </defs>

          {/* Ocean Canvas Background */}
          <rect width={svgWidth} height={svgHeight} fill="url(#gmapOceanIna)" />

          {/* Equator Line (Garis Khatulistiwa 0°) */}
          <line x1="0" y1="205" x2="1000" y2="205" stroke="#94a3b8" strokeWidth="1" strokeDasharray="8 6" opacity="0.75" />

          {/* Coastal Reef / Shallow water layers around all land */}
          <g fill="#93e1ee" opacity="0.6">
            {/* Sumatra shallow */}
            <path d="M 38 60 Q 75 35 125 70 L 190 160 L 265 255 Q 285 285 280 320 L 250 332 Q 200 270 125 160 Z" />
            {/* Java shallow */}
            <path d="M 255 338 L 335 330 L 415 338 L 525 350 L 515 372 L 405 368 L 325 362 L 250 355 Z" />
            {/* Kalimantan shallow */}
            <path d="M 310 130 Q 370 105 440 125 L 485 185 L 465 272 L 360 282 L 310 220 Z" />
            {/* Sulawesi shallow */}
            <path d="M 510 170 Q 550 145 595 150 L 595 195 L 565 210 L 590 248 L 565 305 L 530 300 L 530 220 Z" />
            {/* Papua shallow */}
            <path d="M 750 215 Q 810 195 860 220 L 965 235 L 965 390 L 870 390 L 830 315 L 780 275 Z" />
          </g>

          {/* REALISTIC INDONESIA ISLAND GEOMETRY (Google Maps Natural Terrain) */}
          {/* 1. Sumatera */}
          <path
            d="M 45 70 Q 80 48 120 78 L 180 165 L 255 260 Q 275 288 270 312 L 245 322 Q 205 270 135 170 Z"
            fill="url(#gmapLandIna)"
            stroke="#79b860"
            strokeWidth="1.5"
          />
          {/* Lake Toba (Danau Toba) */}
          <ellipse cx="108" cy="115" rx="7" ry="3" fill="#6fcadb" />
          {/* Bangka & Belitung */}
          <ellipse cx="265" cy="240" rx="14" ry="24" fill="#a4dc8c" stroke="#79b860" strokeWidth="1" />
          <ellipse cx="305" cy="250" rx="11" ry="12" fill="#a4dc8c" stroke="#79b860" strokeWidth="1" />
          {/* Riau Archipelago (Batam, Bintan) */}
          <ellipse cx="225" cy="150" rx="9" ry="8" fill="#a4dc8c" stroke="#79b860" strokeWidth="1" />
          <ellipse cx="240" cy="152" rx="8" ry="9" fill="#a4dc8c" stroke="#79b860" strokeWidth="1" />

          {/* 2. Jawa, Madura & Bali */}
          <path
            d="M 265 344 L 335 338 L 415 344 L 485 352 L 512 354 L 500 366 L 405 362 L 325 358 L 260 352 Z"
            fill="url(#gmapLandIna)"
            stroke="#79b860"
            strokeWidth="1.5"
          />
          {/* Madura */}
          <ellipse cx="475" cy="338" rx="26" ry="7" fill="#a4dc8c" stroke="#79b860" strokeWidth="1" />
          {/* Bali */}
          <path d="M 518 356 Q 530 352 538 358 L 534 368 Z" fill="#a4dc8c" stroke="#79b860" strokeWidth="1" />

          {/* 3. Nusa Tenggara (Lombok, Sumbawa, Flores, Sumba, Timor) */}
          <ellipse cx="550" cy="360" rx="9" ry="11" fill="#a4dc8c" stroke="#79b860" strokeWidth="1" />
          <path d="M 570 358 L 610 356 L 622 368 L 585 372 Z" fill="#a4dc8c" stroke="#79b860" strokeWidth="1" />
          <path d="M 635 362 L 710 360 L 700 372 L 640 370 Z" fill="#a4dc8c" stroke="#79b860" strokeWidth="1" />
          <ellipse cx="660" cy="390" rx="22" ry="11" fill="#a4dc8c" stroke="#79b860" strokeWidth="1" />
          <path d="M 715 402 L 755 392 L 768 412 L 725 422 Z" fill="#a4dc8c" stroke="#79b860" strokeWidth="1" />
          <ellipse cx="735" cy="432" rx="9" ry="6" fill="#a4dc8c" stroke="#79b860" strokeWidth="1" />

          {/* 4. Kalimantan (Borneo) */}
          <path
            d="M 320 145 Q 370 120 430 138 L 470 195 L 450 265 L 370 275 L 320 225 Z"
            fill="url(#gmapLandIna)"
            stroke="#79b860"
            strokeWidth="1.5"
          />

          {/* 5. Sulawesi */}
          <path
            d="M 520 185 Q 550 162 580 162 L 580 192 L 550 210 L 575 245 L 550 295 L 525 290 L 530 225 Z"
            fill="url(#gmapLandIna)"
            stroke="#79b860"
            strokeWidth="1.5"
          />

          {/* 6. Maluku Islands */}
          <path d="M 665 175 Q 685 145 690 195 L 670 230 Z" fill="#a4dc8c" stroke="#79b860" strokeWidth="1" />
          <ellipse cx="665" cy="270" rx="16" ry="12" fill="#a4dc8c" stroke="#79b860" strokeWidth="1" />
          <ellipse cx="710" cy="272" rx="26" ry="10" fill="#a4dc8c" stroke="#79b860" strokeWidth="1" />
          <ellipse cx="705" cy="286" rx="7" ry="5" fill="#a4dc8c" stroke="#79b860" strokeWidth="1" />

          {/* 7. Papua & Papua Barat */}
          <path
            d="M 760 225 Q 810 215 850 235 L 950 245 L 950 385 L 880 385 L 840 315 L 790 285 Z"
            fill="url(#gmapLandIna)"
            stroke="#79b860"
            strokeWidth="1.5"
          />

          {/* 8. Neighboring Countries (Philippines, Malaysia, PNG) */}
          <g fill="#c4ebb0" stroke="#79b860" strokeWidth="1">
            <ellipse cx="560" cy="50" rx="18" ry="12" />
            <ellipse cx="530" cy="30" rx="10" ry="16" />
            <ellipse cx="575" cy="85" rx="35" ry="24" />
            <ellipse cx="535" cy="100" rx="8" ry="6" />
          </g>
          <path d="M 110 0 L 190 0 L 220 80 L 190 130 L 140 100 Z" fill="#c4ebb0" stroke="#79b860" strokeWidth="1" />

          {/* GOOGLE MAPS GEOGRAPHIC LABELS (Matching Image 2) */}
          {/* Sea Labels */}
          <text x="320" y="315" fill="#1e3a5f" opacity="0.6" fontSize="13" fontWeight="600">Laut Jawa</text>
          <text x="510" y="160" fill="#1e3a5f" opacity="0.6" fontSize="12" fontWeight="600">Laut Sulawesi</text>
          <text x="660" y="275" fill="#1e3a5f" opacity="0.6" fontSize="12" fontWeight="600">Laut Maluku</text>
          <text x="580" y="375" fill="#1e3a5f" opacity="0.6" fontSize="13" fontWeight="600">Laut Banda</text>
          <text x="610" y="445" fill="#1e3a5f" opacity="0.6" fontSize="12" fontWeight="600">Laut Timor</text>
          <text x="760" y="460" fill="#1e3a5f" opacity="0.6" fontSize="13" fontWeight="600">Laut Arafura</text>
          <text x="890" y="275" fill="#1e3a5f" opacity="0.6" fontSize="12" fontWeight="600">Laut Bismarck</text>

          {/* Regional Country Labels */}
          <text x="545" y="15" fill="#334155" fontSize="11" fontWeight="bold">Filipina</text>
          <text x="525" y="40" fill="#475569" fontSize="9">Panay</text>
          <text x="520" y="60" fill="#475569" fontSize="9">Negros</text>
          <text x="565" y="80" fill="#475569" fontSize="10">Mindanao</text>
          <text x="520" y="105" fill="#475569" fontSize="9">Basilan</text>

          {/* City Labels */}
          <g transform="translate(320, 360)">
            <circle cx="0" cy="0" r="3" fill="#1e293b" />
            <text x="5" y="3" fill="#0f172a" fontSize="12" fontWeight="bold">Jakarta</text>
          </g>
          <text x="800" y="340" fill="#0f172a" fontSize="14" fontWeight="bold">Papua</text>
          <text x="830" y="358" fill="#0f172a" fontSize="13" fontWeight="bold">Nugini</text>
          <text x="770" y="400" fill="#1e293b" fontSize="10">Port Moresby</text>
          <text x="745" y="270" fill="#1e293b" fontSize="10">Jayapura</text>

          {/* Translucent Highlight Oval around Java-Bali-Lombok Corridor (Matching Image 2) */}
          <ellipse
            cx="370"
            cy="365"
            rx="75"
            ry="28"
            fill="rgba(244, 63, 94, 0.08)"
            stroke="rgba(244, 63, 94, 0.45)"
            strokeWidth="1.5"
            transform="rotate(-5, 370, 365)"
          />

          {/* AUTHENTIC GOOGLE MAPS PILL PIN MARKERS FOR ALL PORTS (Matching Image 2) */}
          {filteredPorts.map((port) => {
            const base = projectCoords(port.lat, port.lng);
            const offset = getPortOffset(port.id);
            const x = base.x + offset.dx;
            const y = base.y + offset.dy;
            const isSelected = selectedPort.id === port.id;
            const bgColor = getMarkerColor(port);
            const pillWidth = Math.max(38, port.code.length * 7 + 18);

            return (
              <g
                key={port.id}
                className="cursor-pointer transition-transform hover:scale-110 drop-shadow-md"
                onClick={() => onSelectPort(port)}
                transform={`translate(${x}, ${y})`}
              >
                {/* Selected Glow Ring */}
                {isSelected && (
                  <circle cx="0" cy="-10" r="18" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3 3" />
                )}

                {/* Drop Pointer Triangle under Pill */}
                <polygon points="-4,-2 4,-2 0,4" fill={bgColor} stroke="#ffffff" strokeWidth="0.8" />

                {/* Rounded Pill Badge */}
                <rect
                  x={-pillWidth / 2}
                  y="-22"
                  width={pillWidth}
                  height="20"
                  rx="10"
                  fill={bgColor}
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />

                {/* White Ship Silhouette Icon inside Pill */}
                <g transform={`translate(${-pillWidth / 2 + 5}, -17) scale(0.65)`}>
                  <path
                    d="M2 13L4 3L14 3L16 13L2 13Z M5 3L5 1L13 1L13 3 M9 5L9 9"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </g>

                {/* Port Code Text in White Bold Sans */}
                <text
                  x={3}
                  y="-8.5"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                  fontWeight="bold"
                  letterSpacing="0.3px"
                >
                  {port.code}
                </text>
              </g>
            );
          })}
        </svg>

        {/* 3. TOP-LEFT FLOATING STATUS ANTREAN LEGEND (Exact Match to Image 2) */}
        <div className="absolute top-4 left-4 bg-[#111e33]/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-xs z-30 pointer-events-none min-w-[240px] space-y-2">
          <div className="flex items-center gap-2.5 font-bold text-white text-sm">
            <span className="w-3 h-3 rounded-full bg-cyan-400" />
            <span>Status Antrean Pelabuhan</span>
          </div>
          <div className="space-y-1.5 pt-1 text-slate-200 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              <span>Normal (&lt; 60% okupansi)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
              <span>Waspada (60–80% okupansi)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
              <span>Padat (80–100% / tunggu &gt;2 jadwal)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
              <span>Kritis (&gt;100% / buffer overflow)</span>
            </div>
          </div>
        </div>

        {/* 4. BOTTOM-LEFT FLOATING PORT SUMMARY CARD (Matching Image 1 & 2) */}
        <div className="absolute bottom-10 left-3 bg-[#0a1424]/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs max-w-[280px] z-20 space-y-2 pointer-events-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-white text-sm">
              <span className={`w-2.5 h-2.5 rounded-full ${selectedPort.status === 'kritis' ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'}`} />
              <span>{selectedPort.name.replace('Pelabuhan ', '')}</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
              selectedPort.status === 'kritis' ? 'bg-red-950 text-red-400 border border-red-700' :
              selectedPort.status === 'padat' ? 'bg-orange-950 text-orange-400 border border-orange-700' :
              selectedPort.status === 'waspada' ? 'bg-yellow-950 text-yellow-400 border border-yellow-700' :
              'bg-emerald-950 text-emerald-400 border border-emerald-700'
            }`}>
              {selectedPort.code} • {selectedPort.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-800/80 font-mono">
            <div>
              <div className="text-[10px] text-slate-400 font-sans">PPI Score</div>
              <div className="font-extrabold text-white text-sm">{selectedPort.portPerformanceIndex.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-sans">Antrian</div>
              <div className="font-extrabold text-red-400 text-sm">{selectedPort.totalQueueVehicles} u</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-sans">Tunggu</div>
              <div className="font-extrabold text-amber-400 text-sm">{selectedPort.waitingTimeMinutes} m</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
            <span>{selectedPort.lat.toFixed(4)}°, {selectedPort.lng.toFixed(4)}°</span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${selectedPort.lat},${selectedPort.lng}`}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-sans font-semibold flex items-center gap-1"
            >
              <span>Buka di Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* 5. BOTTOM QUICK JUMP BUTTONS (Matching Image 1: Lompat [Merak] [Bakauheni]...) */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-[#09121f]/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-3 py-1 flex items-center gap-1.5 z-20 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Lompat:</span>
          {quickJumpPorts.map((qp) => {
            const isSelected = selectedPort.id === qp.id;
            return (
              <button
                key={qp.id}
                onClick={() => {
                  const target = ports.find((p) => p.id === qp.id);
                  if (target) onSelectPort(target);
                }}
                className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {qp.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
