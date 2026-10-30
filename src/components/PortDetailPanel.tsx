import React, { useState } from 'react';
import { PortData } from '../types/dashboard.ts';
import { 
  AlertOctagon, 
  ArrowDownRight, 
  ArrowUpRight, 
  Camera, 
  Clock, 
  ExternalLink, 
  Flame, 
  Play, 
  ShieldAlert, 
  Ship, 
  Sliders, 
  Video, 
  Waves, 
  Wind,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface PortDetailPanelProps {
  port: PortData;
  allPorts: PortData[];
  onSelectPort: (port: PortData) => void;
  onNavigatePage: (page: string) => void;
}

export const PortDetailPanel: React.FC<PortDetailPanelProps> = ({
  port,
  allPorts,
  onSelectPort,
  onNavigatePage,
}) => {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'operasi' | 'antrian' | 'cuaca' | 'kamera'>('ringkasan');
  const [cctvActive, setCctvActive] = useState(false);

  // Top ports by queue size for the bottom list
  const topQueuePorts = [...allPorts]
    .sort((a, b) => b.totalQueueVehicles - a.totalQueueVehicles)
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'kritis':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-red-600 text-white animate-pulse">● KRITIS</span>;
      case 'padat':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-orange-600 text-white">● PADAT</span>;
      case 'waspada':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-yellow-500 text-slate-950">● WASPADA</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-emerald-600 text-white">● NORMAL</span>;
    }
  };

  return (
    <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-4 flex flex-col gap-3.5 shadow-lg">
      {/* Header with Port Name & Status */}
      <div className="flex items-start justify-between border-b border-slate-800/80 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-wide">{port.name.toUpperCase()}</h2>
            {getStatusBadge(port.status)}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {port.city}, {port.province} · {port.timezone}
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs">
        {(['ringkasan', 'operasi', 'antrian', 'cuaca', 'kamera'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1 rounded capitalize font-medium transition-colors text-center ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab 1: Ringkasan Content */}
      {activeTab === 'ringkasan' && (
        <div className="space-y-3.5">
          {/* Visual Port Banner / Terminal Snapshot */}
          <div className="relative h-28 rounded-lg overflow-hidden border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/70 p-3 flex flex-col justify-between">
            {/* Background maritime art */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px]" />
            <div className="flex items-center justify-between z-10">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Ship className="w-4 h-4 text-cyan-400" />
                {port.name} - Koridor Maritim
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                {port.code}
              </span>
            </div>

            <div className="z-10 flex items-end justify-between">
              <div className="text-[11px] text-slate-300">
                <div>Lintasan Utama: <strong className="text-cyan-300">{port.mainRoute.origin} ➔ {port.mainRoute.destination}</strong></div>
                <div className="text-slate-400 text-[10px]">Waktu Layar Standar: {port.mainRoute.standardSailingHours} jam ({port.mainRoute.distanceMiles} mil)</div>
              </div>
              <div className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                POCC Real-Time
              </div>
            </div>
          </div>

          {/* Port Performance Index & Circular Meter */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Port Performance Index (PPI)
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-extrabold font-mono text-white tabular-nums">
                  {port.portPerformanceIndex.toFixed(1)}
                </span>
                <span className={`flex items-center text-xs font-semibold ${
                  port.indexDeltaYesterday < 0 ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {port.indexDeltaYesterday < 0 ? (
                    <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                  ) : (
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  )}
                  {port.indexDeltaYesterday > 0 ? `+${port.indexDeltaYesterday}%` : `${port.indexDeltaYesterday}%`} vs kemarin
                </span>
              </div>
            </div>

            {/* Circular Gauge Display */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  stroke="#1e293b"
                  strokeWidth="5"
                  fill="none"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  stroke={port.portPerformanceIndex < 50 ? '#ef4444' : port.portPerformanceIndex < 75 ? '#eab308' : '#22c55e'}
                  strokeWidth="5"
                  strokeDasharray="138"
                  strokeDashoffset={138 - (138 * port.portPerformanceIndex) / 100}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <span className="absolute font-mono text-xs font-bold text-slate-200">
                {Math.round(port.portPerformanceIndex)}
              </span>
            </div>
          </div>

          {/* Metrics Bars List */}
          <div className="space-y-2.5 text-xs">
            {/* Kapasitas Dermaga */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="text-slate-400">Kapasitas Dermaga</span>
                <span className="font-mono font-bold text-white tabular-nums">{port.berthCapacityPercent}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    port.berthCapacityPercent > 90 ? 'bg-red-500' : port.berthCapacityPercent > 75 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${port.berthCapacityPercent}%` }}
                />
              </div>
            </div>

            {/* Antrian Kendaraan */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="text-slate-400">Antrian Kendaraan</span>
                <span className="font-mono font-bold text-white tabular-nums">{port.totalQueueVehicles.toLocaleString('id-ID')} unit</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, (port.totalQueueVehicles / 1500) * 100)}%` }}
                />
              </div>
            </div>

            {/* Waktu Tunggu */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="text-slate-400">Waktu Tunggu Rata-Rata</span>
                <span className="font-mono font-bold text-white tabular-nums">{port.waitingTimeMinutes} menit</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    port.waitingTimeMinutes > 120 ? 'bg-red-500' : port.waitingTimeMinutes > 60 ? 'bg-yellow-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (port.waitingTimeMinutes / 240) * 100)}%` }}
                />
              </div>
            </div>

            {/* Kapal Beroperasi */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="text-slate-400">Kapal Beroperasi</span>
                <span className="font-mono font-bold text-cyan-400 tabular-nums">
                  {port.operatingVessels} / {port.scheduledVessels} Armada
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-500 rounded-full"
                  style={{ width: `${(port.operatingVessels / Math.max(1, port.scheduledVessels)) * 100}%` }}
                />
              </div>
            </div>

            {/* OTP Keberangkatan */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="text-slate-400">Keberangkatan Tepat Waktu (OTP)</span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums">{port.onTimeDepartureRate}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                  style={{ width: `${port.onTimeDepartureRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Opportunity Loss Banner */}
          <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-red-300">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>Potensi Opportunity Loss:</span>
            </div>
            <span className="font-mono font-bold text-red-200">
              Rp {(port.opportunityLossMillionRp / 1000).toFixed(2)} Miliar
            </span>
          </div>

          {/* Interactive Navigation Action Buttons (FR-14) */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800">
            <button
              onClick={() => onNavigatePage('page_port_detail')}
              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Detail
            </button>
            <button
              onClick={() => onNavigatePage('page_simulation')}
              className="px-2 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center justify-center gap-1 transition-colors shadow-sm"
            >
              <Sliders className="w-3.5 h-3.5" />
              Simulasi
            </button>
            <button
              onClick={() => onNavigatePage('page_cases')}
              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Kasus
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Operasi Berths & Vessels */}
      {activeTab === 'operasi' && (
        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>Status Dermaga ({port.activeBerths}/{port.totalBerths} Siap)</span>
            <span className="text-[10px] text-blue-400">POCC Live Feed</span>
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {port.berths.map((berth) => (
              <div key={berth.id} className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">{berth.name}</div>
                  <div className="text-[11px] text-slate-400">{berth.type} · {berth.dockedShip || 'Kosong / Antre Sandar'}</div>
                </div>
                <div className="text-right">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    berth.status === 'Sandar & Muat' ? 'bg-blue-900/80 text-blue-200' :
                    berth.status === 'Tersedia' ? 'bg-emerald-900/80 text-emerald-200' :
                    berth.status === 'Perbaikan' ? 'bg-slate-800 text-slate-400' :
                    'bg-red-900/80 text-red-200'
                  }`}>
                    {berth.status}
                  </span>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">{berth.utilization}% Okupansi</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Antrian 6 Zona (FR-21) */}
      {activeTab === 'antrian' && (
        <div className="space-y-2.5 text-xs">
          <div className="text-slate-400 flex items-center justify-between">
            <span>Alur Antrean 6 Zona (Total {port.totalQueueVehicles} unit)</span>
            <span className="text-[10px] text-yellow-400 font-mono">15-min snapshot</span>
          </div>
          <div className="space-y-1.5">
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-semibold text-slate-200">1. Akses Jalan Luar</span>
                <span className="text-[10px] ml-1.5 text-slate-500 font-mono">[Sumber Eksternal]</span>
              </div>
              <span className="font-mono font-bold text-red-400">{port.queueZones.roadAccess} unit</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-semibold text-slate-200">2. Buffer Zone / Tol</span>
                <span className="text-[10px] ml-1.5 text-slate-500 font-mono">[Kantong Parkir]</span>
              </div>
              <span className="font-mono font-bold text-orange-400">{port.queueZones.bufferZone} unit</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
              <span className="font-semibold text-slate-200">3. Gerbang Masuk (Toll Gate)</span>
              <span className="font-mono font-bold text-yellow-400">{port.queueZones.tollGate} unit</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
              <span className="font-semibold text-slate-200">4. Area Siap Muat (Waiting)</span>
              <span className="font-mono font-bold text-blue-400">{port.queueZones.waitingArea} unit</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
              <span className="font-semibold text-slate-200">5. Zona Boarding / Anjungan</span>
              <span className="font-mono font-bold text-cyan-400">{port.queueZones.boardingZone} unit</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
              <span className="font-semibold text-slate-200">6. Dermaga Keberangkatan</span>
              <span className="font-mono font-bold text-emerald-400">{port.queueZones.berthDeparture} unit</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Cuaca & BMKG */}
      {activeTab === 'cuaca' && (
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Prakiraan BMKG Maritim:</span>
              <span className="font-bold text-white">{port.weather} ({port.temperatureC}°C)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Wind className="w-4 h-4 text-cyan-400" />
                <span>Angin: <strong className="font-mono">{port.windSpeedKnots} knots</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Waves className="w-4 h-4 text-blue-400" />
                <span>Gelombang: <strong className="font-mono">{port.waveHeightM} m</strong></span>
              </div>
            </div>
          </div>
          {port.weatherWarning && (
            <div className="p-2.5 rounded bg-red-950/60 border border-red-700/80 text-red-200 text-[11px] flex items-start gap-2">
              <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{port.weatherWarning}</span>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Live CCTV Simulator */}
      {activeTab === 'kamera' && (
        <div className="space-y-2 text-xs">
          <div className="relative h-44 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
            {/* Live Camera Grid overlay */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/80 px-2 py-0.5 rounded text-[10px] text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              LIVE CCTV: CAM-03 DERMAGA MB
            </div>
            <div className="absolute bottom-2 right-2 text-[10px] text-slate-400 font-mono bg-black/80 px-2 py-0.5 rounded">
              POCC FEED 25 FPS
            </div>
            {/* Camera Visualizer graphic */}
            <div className="text-center p-4">
              <Camera className="w-10 h-10 text-slate-600 mx-auto mb-2 animate-pulse" />
              <div className="text-slate-300 font-semibold">{port.name} - Gerbang & Dermaga 1</div>
              <div className="text-[11px] text-slate-500 mt-1">Streaming terenkripsi dari server POCC Pelabuhan</div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom List: TOP PELABUHAN (ANTREAN) • Live CCTV */}
      <div className="border-t border-slate-800/80 pt-3">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-slate-200 tracking-wide uppercase text-[11px]">
            TOP PELABUHAN (ANTREAN)
          </span>
          <span className="text-[10px] text-red-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Live CCTV
          </span>
        </div>

        <div className="space-y-1.5">
          {topQueuePorts.map((p, idx) => (
            <div
              key={p.id}
              onClick={() => onSelectPort(p)}
              className={`p-2 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors border ${
                port.id === p.id
                  ? 'bg-blue-950/80 border-blue-500/80 shadow-sm'
                  : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-400 text-[11px] w-4">{idx + 1}.</span>
                <div>
                  <div className="font-semibold text-slate-200">{p.name.replace('Pelabuhan ', '')}</div>
                  <div className="text-[10px] text-slate-400">{p.branch}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-white tabular-nums">
                  {p.totalQueueVehicles.toLocaleString('id-ID')} unit
                </span>
                {getStatusBadge(p.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
