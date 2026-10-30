import React, { useState } from 'react';
import { 
  PortData, 
  KPIItem, 
  OperationalAlert, 
  PortStatus 
} from '../types/dashboard.ts';
import { IndonesiaMap } from './IndonesiaMap.tsx';
import { GoogleMapsView } from './GoogleMapsView.tsx';
import { PortDetailPanel } from './PortDetailPanel.tsx';
import { 
  Ship, 
  Compass, 
  Users, 
  Truck, 
  Clock, 
  Anchor, 
  HelpCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  ChevronRight, 
  AlertTriangle,
  Flame,
  TrendingUp,
  BarChart3,
  Waves,
  ShieldCheck
} from 'lucide-react';

interface PageExecutiveSummaryProps {
  ports: PortData[];
  kpis: KPIItem[];
  alerts: OperationalAlert[];
  selectedPort: PortData;
  onSelectPort: (port: PortData) => void;
  onNavigatePage: (page: string) => void;
  nationalTrend: {
    penumpang: { day: string; value: number; label: string }[];
    kendaraan: { day: string; value: number; label: string }[];
    kapal: { day: string; value: number; label: string }[];
    onTime: { day: string; value: number; label: string }[];
  };
  hourlyPrediction: { hour: string; arrivals: number; capacity: number; queue: number; ferizyReservations: number }[];
}

export const PageExecutiveSummary: React.FC<PageExecutiveSummaryProps> = ({
  ports,
  kpis,
  alerts,
  selectedPort,
  onSelectPort,
  onNavigatePage,
  nationalTrend,
  hourlyPrediction,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [onlyPriorityRoutes, setOnlyPriorityRoutes] = useState<boolean>(false);
  const [mapMode, setMapMode] = useState<'antrean' | 'otp' | 'armada'>('antrean');
  const [activeTrendTab, setActiveTrendTab] = useState<'penumpang' | 'kendaraan' | 'kapal' | 'onTime'>('penumpang');
  const [activePredTab, setActivePredTab] = useState<'antrian' | 'penumpang' | 'kapasitas'>('antrian');
  const [hoveredKpi, setHoveredKpi] = useState<KPIItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<PortStatus | 'all'>('all');
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);
  const [hoveredPredHour, setHoveredPredHour] = useState<string | null>(null);

  // Count port statuses
  const countKritis = ports.filter((p) => p.status === 'kritis').length;
  const countPadat = ports.filter((p) => p.status === 'padat').length;
  const countWaspada = ports.filter((p) => p.status === 'waspada').length;
  const countNormal = ports.filter((p) => p.status === 'normal').length;

  const displayedPorts = statusFilter === 'all' ? ports : ports.filter((p) => p.status === statusFilter);

  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-4 w-full text-slate-100">
      {/* 1. TOP METRICS RIBBON (Matching Image 1) */}
      <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-10 gap-2.5 items-stretch">
        {/* Metric 1: 37 Pelabuhan Nasional */}
        <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-950/80 text-blue-400 border border-blue-800/60 shrink-0">
            <Anchor className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-white font-mono tabular-nums">37</span>
              <span className="text-[11px] font-semibold text-emerald-400 font-mono">+2 vs kmrn</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium leading-tight">Pelabuhan Nasional</div>
          </div>
        </div>

        {/* Metric 2: 230+ Rute Penyeberangan */}
        <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-white font-mono tabular-nums">230+</span>
              <span className="text-[11px] font-semibold text-emerald-400 font-mono">+3 aktif</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium leading-tight">Rute Penyeberangan</div>
          </div>
        </div>

        {/* Metric 3: 102 Kapal Operasi */}
        <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-950/80 text-indigo-400 border border-indigo-800/60 shrink-0">
            <Ship className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-white font-mono tabular-nums">102</span>
              <span className="text-[11px] font-semibold text-emerald-400 font-mono">96% Siap</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium leading-tight">Kapal Operasi</div>
          </div>
        </div>

        {/* Metric 4: 189.421 Penumpang Hari Ini */}
        <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-950/80 text-blue-400 border border-blue-800/60 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-white font-mono tabular-nums">189.421</span>
              <span className="text-[11px] font-semibold text-emerald-400 font-mono">+12%</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium leading-tight">Penumpang Hari Ini</div>
          </div>
        </div>

        {/* Metric 5: 45.230 Kendaraan Hari Ini */}
        <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-white font-mono tabular-nums">45.230</span>
              <span className="text-[11px] font-semibold text-emerald-400 font-mono">+8%</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium leading-tight">Kendaraan (Gol I–IX)</div>
          </div>
        </div>

        {/* Metric 6: 87% On-Time Departure */}
        <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-800/60 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-white font-mono tabular-nums">87%</span>
              <span className="text-[10px] text-slate-400 font-mono">Target 90%</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium leading-tight">On-Time Departure</div>
          </div>
        </div>

        {/* Right Status Summary Boxes (Matching exact styling in image 1) */}
        {/* Total Kritis */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'kritis' ? 'all' : 'kritis')}
          className={`p-2.5 rounded-xl border text-center transition-all ${
            statusFilter === 'kritis' ? 'ring-2 ring-red-400 bg-red-950/90' : 'bg-red-950/40 hover:bg-red-950/70'
          } border-red-700/80 flex flex-col justify-center`}
        >
          <div className="text-[11px] font-bold text-red-300 uppercase tracking-wider">Total Kritis</div>
          <div className="text-2xl font-black font-mono text-red-400 tabular-nums my-0.5">{countKritis}</div>
          <div className="text-[9px] text-red-300/80 leading-tight">&gt; 100% / buffer overflow</div>
        </button>

        {/* Total Padat */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'padat' ? 'all' : 'padat')}
          className={`p-2.5 rounded-xl border text-center transition-all ${
            statusFilter === 'padat' ? 'ring-2 ring-orange-400 bg-orange-950/90' : 'bg-orange-950/40 hover:bg-orange-950/70'
          } border-orange-700/80 flex flex-col justify-center`}
        >
          <div className="text-[11px] font-bold text-orange-300 uppercase tracking-wider">Total Padat</div>
          <div className="text-2xl font-black font-mono text-orange-400 tabular-nums my-0.5">{countPadat}</div>
          <div className="text-[9px] text-orange-300/80 leading-tight">80%–100% / tunggu &gt;2j</div>
        </button>

        {/* Total Waspada */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'waspada' ? 'all' : 'waspada')}
          className={`p-2.5 rounded-xl border text-center transition-all ${
            statusFilter === 'waspada' ? 'ring-2 ring-yellow-400 bg-yellow-950/90' : 'bg-yellow-950/40 hover:bg-yellow-950/70'
          } border-yellow-700/80 flex flex-col justify-center`}
        >
          <div className="text-[11px] font-bold text-yellow-300 uppercase tracking-wider">Total Waspada</div>
          <div className="text-2xl font-black font-mono text-yellow-400 tabular-nums my-0.5">{countWaspada}</div>
          <div className="text-[9px] text-yellow-300/80 leading-tight">60%–80% / tunggu &gt;1j</div>
        </button>

        {/* Total Normal */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'normal' ? 'all' : 'normal')}
          className={`p-2.5 rounded-xl border text-center transition-all ${
            statusFilter === 'normal' ? 'ring-2 ring-emerald-400 bg-emerald-950/90' : 'bg-emerald-950/40 hover:bg-emerald-950/70'
          } border-emerald-700/80 flex flex-col justify-center`}
        >
          <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Total Normal</div>
          <div className="text-2xl font-black font-mono text-emerald-400 tabular-nums my-0.5">{countNormal}</div>
          <div className="text-[9px] text-emerald-300/80 leading-tight">&lt; 60% / lancar aman</div>
        </button>
      </div>

      {/* 2. MAIN 3-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* COLUMN 1: LEFT SIDE (KPI Cards & Indikasi Analitik Operasional) - Span 3 cols */}
        <div className="lg:col-span-3 space-y-3 flex flex-col">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {kpis.map((kpi) => (
              <div
                key={kpi.id}
                onMouseEnter={() => setHoveredKpi(kpi)}
                onMouseLeave={() => setHoveredKpi(null)}
                className="bg-[#0e1726] border border-slate-800 rounded-xl p-3 hover:border-blue-500/60 transition-colors relative group"
              >
                <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                  <span className="font-mono text-blue-400 font-semibold">{kpi.code}</span>
                  <HelpCircle className="w-3 h-3 text-slate-500 group-hover:text-blue-400 transition-colors cursor-pointer" />
                </div>
                <div className="text-xs font-semibold text-slate-200 line-clamp-1">{kpi.title}</div>
                <div className="text-lg font-bold font-mono text-white mt-1 tabular-nums">
                  {kpi.value} <span className="text-[11px] font-normal text-slate-400">{kpi.unit}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1.5 border-t border-slate-800/80">
                  <span>Target: {kpi.target}</span>
                  <span className={`font-semibold ${kpi.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {kpi.achievement}
                  </span>
                </div>
                <div className="text-[9px] font-mono text-slate-500 mt-0.5">
                  {kpi.yoyDelta}
                </div>

                {/* AC-19 Hover Tooltip for KPI definition & formula */}
                {hoveredKpi?.id === kpi.id && (
                  <div className="absolute left-0 bottom-full mb-1 w-64 bg-slate-900 text-slate-200 p-2.5 rounded-lg border border-blue-500/80 text-[11px] shadow-2xl z-30 pointer-events-none">
                    <div className="font-bold text-white mb-1">{kpi.title} ({kpi.code})</div>
                    <div className="text-slate-400 text-[10px] mb-1"><strong className="text-slate-300">Rumus:</strong> {kpi.formula}</div>
                    <div className="text-slate-400 text-[10px]"><strong className="text-slate-300">Sumber:</strong> {kpi.source}</div>
                    <div className="text-slate-400 text-[10px]"><strong className="text-slate-300">Pemilik Bisnis:</strong> {kpi.owner}</div>
                    <div className="text-slate-400 text-[10px]"><strong className="text-slate-300">Granularitas:</strong> {kpi.granularity}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Indikasi Analitik Operasional (Holding Level) */}
          <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-3.5 space-y-3 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-300 tracking-wide uppercase">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Indikasi Analitik Operasional (Holding Level)</span>
              </div>

              <div className="space-y-2.5">
                {/* Card 1: Selat Bali */}
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/70 text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-red-300 flex items-center justify-between">
                    <span>1. Potensi Bottleneck Kritis di Selat Bali</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-900/60 text-red-200">Kritis</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Suspensi sementara dermaga LCM oleh KSOP akibat gelombang 2,8m menurunkan kapasitas angkut 35%. Disarankan segera mengaktifkan koordinasi dengan BPTD untuk percepatan port time kapal Moveable Bridge menjadi 35 menit.
                  </p>
                  <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-red-900/40 flex justify-between">
                    <span>Rujukan: BMKG Maritim Selat Bali</span>
                    <span className="text-blue-400 font-semibold cursor-pointer hover:underline" onClick={() => onNavigatePage('page_cases')}>Kasus #088</span>
                  </div>
                </div>

                {/* Card 2: Merak Kapasitas Defisit */}
                <div className="p-2.5 rounded-lg bg-orange-950/40 border border-orange-800/70 text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-orange-300 flex items-center justify-between">
                    <span>2. Defisit Kapasitas Merak Jam 18.00–24.00</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-orange-900/60 text-orange-200">Padat</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Berdasarkan pemesanan tiket Ferizy (+280 kend/jam di atas kapasitas standar), antrean berpotensi meluber ke akses tol jika kapal cadangan KMP Ferrindo V tidak disiagakan sejak pukul 15.00 WIB.
                  </p>
                  <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-orange-900/40 flex justify-between">
                    <span>Rujukan: Ferizy Booking Data Mart</span>
                    <span className="text-blue-400 font-semibold cursor-pointer hover:underline" onClick={() => onNavigatePage('page_cases')}>Kasus #089</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action CTA Button directly to DSS simulation */}
            <button
              onClick={() => onNavigatePage('page_simulation')}
              className="w-full mt-2 py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <span>Buka Mesin Simulasi &amp; Rekomendasi (DSS)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-3.5">
          {/* Main Google Maps Satellite View matching Image 1 */}
          <GoogleMapsView
            ports={displayedPorts}
            selectedPort={selectedPort}
            onSelectPort={onSelectPort}
          />

          {/* 3 Bottom Intelligence Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. TREND NASIONAL (7 Hari Terakhir) */}
            <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="font-bold text-slate-200 uppercase tracking-wider">TREND NASIONAL</span>
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
                    7 Hari Terakhir
                  </span>
                </div>

                {/* Segmented control tabs */}
                <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-[10px] mb-2">
                  {(['penumpang', 'kendaraan', 'kapal', 'onTime'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTrendTab(tab)}
                      className={`flex-1 py-1 rounded capitalize font-medium transition-all ${
                        activeTrendTab === tab ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Metric Summary */}
                <div className="flex items-baseline justify-between mb-1.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold font-mono text-white tabular-nums">
                      {activeTrendTab === 'penumpang' ? '1.25 Juta' :
                       activeTrendTab === 'kendaraan' ? '360 Ribu' :
                       activeTrendTab === 'kapal' ? '220 Unit' : '87.0%'}
                    </span>
                    <span className={`text-xs font-semibold font-mono ${
                      activeTrendTab === 'onTime' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {activeTrendTab === 'penumpang' ? '+8%' :
                       activeTrendTab === 'kendaraan' ? '+12%' :
                       activeTrendTab === 'kapal' ? '+4%' : '-3%'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 truncate max-w-[130px]">
                    {activeTrendTab === 'penumpang' ? 'Puncak 1.55M di H-2' :
                     activeTrendTab === 'kendaraan' ? 'Puncak 415K di H-2' :
                     activeTrendTab === 'kapal' ? '96.5% Kesiapan' : 'Target OTP: 90%'}
                  </span>
                </div>
              </div>

              {/* Sparkline & Bar Visual */}
              {(() => {
                const currentTrendList = nationalTrend[activeTrendTab];
                const maxTrendVal = Math.max(...currentTrendList.map((v) => v.value)) * 1.18;
                return (
                  <div className="flex-1 min-h-[110px] flex flex-col justify-end pt-1 border-t border-slate-800/80">
                    <div className="h-20 w-full flex items-end gap-1.5 px-0.5 relative">
                      {/* Dotted Average Reference Line */}
                      <div
                        className="absolute left-1 right-1 border-b border-dashed border-slate-700/80 pointer-events-none z-10"
                        style={{ bottom: '52%' }}
                      >
                        <span className="absolute -top-3 right-0 text-[7.5px] font-mono text-slate-500 bg-[#0e1726]/90 px-1 rounded">
                          {activeTrendTab === 'onTime' ? 'Target 90%' : 'Rata-rata 7H'}
                        </span>
                      </div>

                      {currentTrendList.map((d, i) => {
                        const isToday = i === currentTrendList.length - 1;
                        const heightPercent = Math.max(18, Math.min(95, Math.round((d.value / maxTrendVal) * 100)));
                        const isHovered = hoveredTrendIndex === i;

                        return (
                          <div
                            key={i}
                            onMouseEnter={() => setHoveredTrendIndex(i)}
                            onMouseLeave={() => setHoveredTrendIndex(null)}
                            className="flex-1 h-full flex flex-col justify-end items-center relative group cursor-pointer"
                          >
                            {/* Floating tooltip */}
                            {isHovered && (
                              <div className="absolute bottom-full mb-1 bg-slate-900 border border-cyan-400 px-2 py-0.5 rounded shadow-2xl z-30 pointer-events-none whitespace-nowrap text-center">
                                <div className="text-[9px] text-slate-300 font-medium">{d.day}</div>
                                <div className="text-xs font-bold text-cyan-300 font-mono">{d.label}</div>
                              </div>
                            )}

                            {/* Top Value Label */}
                            <span
                              className={`text-[8px] font-mono leading-none mb-1 transition-opacity ${
                                isToday ? 'text-cyan-300 font-bold opacity-100' : isHovered ? 'text-white font-semibold opacity-100' : 'text-slate-400 group-hover:text-cyan-200 opacity-90'
                              }`}
                            >
                              {activeTrendTab === 'penumpang'
                                ? `${d.value}M`
                                : activeTrendTab === 'kendaraan'
                                ? `${d.value}K`
                                : activeTrendTab === 'kapal'
                                ? `${d.value}`
                                : `${d.value}%`}
                            </span>

                            {/* Bar Column with explicit inner height */}
                            <div className="w-full flex-1 flex items-end justify-center rounded-t bg-slate-900/40 p-0.5">
                              <div
                                className={`w-full rounded-t transition-all duration-300 ${
                                  isToday
                                    ? 'bg-gradient-to-t from-cyan-600 via-cyan-400 to-teal-200 border-t-2 border-white shadow-[0_0_12px_rgba(34,211,238,0.6)]'
                                    : isHovered
                                    ? 'bg-gradient-to-t from-blue-700 via-cyan-500 to-cyan-300 border-t border-cyan-300'
                                    : 'bg-gradient-to-t from-blue-950 via-blue-800 to-blue-600 border-t border-blue-400/50 group-hover:from-blue-800 group-hover:to-cyan-500'
                                }`}
                                style={{ height: `${heightPercent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Day Labels at bottom */}
                    <div className="flex gap-1.5 mt-1 border-t border-slate-800/80 pt-1 px-0.5">
                      {currentTrendList.map((d, i) => {
                        const isToday = i === currentTrendList.length - 1;
                        return (
                          <div key={i} className="flex-1 text-center">
                            <span
                              className={`text-[9px] font-mono block truncate ${
                                isToday ? 'text-cyan-400 font-bold' : 'text-slate-400 font-medium'
                              }`}
                            >
                              {isToday ? 'Rab (Ini)' : d.day.split(' ')[0].substring(0, 3)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 2. PREDIKSI 6 JAM KE DEPAN */}
            <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
              {(() => {
                // 6-hour prediction horizon (18:00 - 24:00)
                const horizonData = hourlyPrediction.filter((p) => {
                  const h = parseInt(p.hour.split(':')[0], 10);
                  return h >= 18 && h <= 24;
                });

                let predValues: number[] = [];
                let predThreshVal = 2000;
                let predThreshLabel = '';
                let predHeadline = '';
                let predSubline = '';
                let predPeakLabel = '';
                let predPeakIndex = 3; // default 21:00
                let predUnit = '';

                if (activePredTab === 'antrian') {
                  predValues = horizonData.map((d) => d.queue);
                  predThreshVal = 2000;
                  predThreshLabel = 'Batas Buffer Tol KM 43 (2.000 Unit)';
                  predHeadline = '2.720 Unit';
                  predSubline = 'Puncak 21.00 WIB (+36% over buffer)';
                  predPeakIndex = predValues.indexOf(Math.max(...predValues));
                  predPeakLabel = `Peak: ${horizonData[predPeakIndex]?.hour || '21:00'} (2.720 Unit)`;
                  predUnit = 'Unit';
                } else if (activePredTab === 'penumpang') {
                  predValues = horizonData.map((d) => d.arrivals);
                  predThreshVal = 800;
                  predThreshLabel = 'Standar Layanan Gate (800/Jam)';
                  predHeadline = '980 Pax/Jam';
                  predSubline = 'Puncak arus malam jam 19.00 (Ferizy 910)';
                  predPeakIndex = predValues.indexOf(Math.max(...predValues));
                  predPeakLabel = `Peak: ${horizonData[predPeakIndex]?.hour || '19:00'} (980 Pax)`;
                  predUnit = 'Pax/J';
                } else {
                  // Okupansi Kapasitas (%)
                  predValues = horizonData.map((d) => Math.round((d.arrivals / d.capacity) * 100));
                  predThreshVal = 100;
                  predThreshLabel = 'Kapasitas Normal Moveable Bridge (100%)';
                  predHeadline = '158% Okupansi';
                  predSubline = 'Defisit -280 Unit · Perlu Kapal Tambahan';
                  predPeakIndex = predValues.indexOf(Math.max(...predValues));
                  predPeakLabel = `Peak: ${horizonData[predPeakIndex]?.hour || '19:00'} (158%)`;
                  predUnit = '%';
                }

                const predMinVal = Math.min(...predValues) * 0.85;
                const predMaxVal = Math.max(...predValues, predThreshVal) * 1.15;
                const predValRange = predMaxVal - predMinVal || 1;

                const svgW = 320;
                const padX = 22;
                const chartW = svgW - padX * 2;
                const topY = 16;
                const botY = 64;

                const predPts = predValues.map((v, i) => {
                  const x = padX + (i / Math.max(1, predValues.length - 1)) * chartW;
                  const y = botY - ((v - predMinVal) / predValRange) * (botY - topY);
                  return { x, y, val: v, hour: horizonData[i]?.hour || '' };
                });

                // Build smooth Bezier path
                let predPathD = '';
                if (predPts.length > 0) {
                  predPathD = `M ${predPts[0].x} ${predPts[0].y}`;
                  for (let i = 0; i < predPts.length - 1; i++) {
                    const p0 = predPts[i];
                    const p1 = predPts[i + 1];
                    const mx = (p0.x + p1.x) / 2;
                    predPathD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
                  }
                }
                const predAreaD = predPts.length > 0 ? `${predPathD} L ${predPts[predPts.length - 1].x} ${botY + 6} L ${predPts[0].x} ${botY + 6} Z` : '';
                const threshY = botY - ((predThreshVal - predMinVal) / predValRange) * (botY - topY);

                return (
                  <div>
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                        <span className="font-bold text-slate-200 uppercase tracking-wider">PREDIKSI 6 JAM KE DEPAN</span>
                        <span className="text-[10px] text-amber-400 font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/60">
                          Horizon 18–24
                        </span>
                      </div>

                      {/* Tabs */}
                      <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-[10px] mb-2">
                        {(['antrian', 'penumpang', 'kapasitas'] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActivePredTab(tab)}
                            className={`flex-1 py-1 rounded capitalize font-medium transition-all ${
                              activePredTab === tab ? 'bg-cyan-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>

                      {/* Metric Headline */}
                      <div className="flex items-baseline justify-between mb-1.5">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-extrabold font-mono text-white tabular-nums">
                            {predHeadline}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {activePredTab === 'antrian' ? 'Puncak Antrean' : activePredTab === 'penumpang' ? 'Kedatangan Pax' : 'Demand vs MB'}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-amber-400 font-medium truncate max-w-[150px]">
                          {predSubline}
                        </span>
                      </div>
                    </div>

                    {/* Area Wave Chart Visual */}
                    <div className="h-28 flex flex-col justify-end pt-1 border-t border-slate-800/80 relative">
                      <div className="h-20 w-full relative">
                        <svg viewBox="0 0 320 80" className="w-full h-full overflow-visible">
                          <defs>
                            <linearGradient id="predGlowCyan" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
                            </linearGradient>
                            <linearGradient id="predGlowRed" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
                              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
                            </linearGradient>
                          </defs>

                          {/* Threshold capacity dashed line */}
                          <line
                            x1={padX - 8}
                            y1={threshY}
                            x2={svgW - padX + 8}
                            y2={threshY}
                            stroke="#f59e0b"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                            opacity="0.85"
                          />
                          <text
                            x={padX}
                            y={Math.max(10, threshY - 3)}
                            fill="#fbbf24"
                            fontSize="7"
                            fontFamily="monospace"
                            fontWeight="600"
                          >
                            {predThreshLabel}
                          </text>

                          {/* Gradient Area Fill */}
                          {predAreaD && (
                            <path
                              d={predAreaD}
                              fill={activePredTab === 'antrian' ? 'url(#predGlowRed)' : 'url(#predGlowCyan)'}
                            />
                          )}

                          {/* Prediction Spline Line */}
                          {predPathD && (
                            <path
                              d={predPathD}
                              fill="none"
                              stroke={activePredTab === 'antrian' ? '#f43f5e' : '#22d3ee'}
                              strokeWidth="2.2"
                              strokeLinecap="round"
                            />
                          )}

                          {/* Data points for each hour */}
                          {predPts.map((pt, i) => {
                            const isPeak = i === predPeakIndex;
                            const isHovered = hoveredPredHour === pt.hour;
                            return (
                              <g
                                key={i}
                                className="cursor-pointer group"
                                onMouseEnter={() => setHoveredPredHour(pt.hour)}
                                onMouseLeave={() => setHoveredPredHour(null)}
                              >
                                {/* Invisible larger hover hit area */}
                                <circle cx={pt.x} cy={pt.y} r="12" fill="transparent" />

                                {/* Peak ping animation */}
                                {isPeak && (
                                  <circle
                                    cx={pt.x}
                                    cy={pt.y}
                                    r="7"
                                    fill="#ef4444"
                                    opacity="0.4"
                                    className="animate-ping"
                                  />
                                )}

                                {/* Point Node */}
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r={isPeak ? 4.5 : isHovered ? 4 : 2.5}
                                  fill={isPeak ? '#ef4444' : isHovered ? '#38bdf8' : '#22d3ee'}
                                  stroke="#0f172a"
                                  strokeWidth="1.5"
                                />
                              </g>
                            );
                          })}

                          {/* Peak Callout Badge */}
                          {predPts[predPeakIndex] && (
                            <g transform={`translate(${predPts[predPeakIndex].x}, ${Math.max(14, predPts[predPeakIndex].y - 9)})`}>
                              <rect
                                x="-48"
                                y="-13"
                                width="96"
                                height="15"
                                rx="4"
                                fill="#1e1b4b"
                                stroke={activePredTab === 'antrian' ? '#ef4444' : '#06b6d4'}
                                strokeWidth="1"
                              />
                              <text
                                x="0"
                                y="-2.5"
                                textAnchor="middle"
                                fill={activePredTab === 'antrian' ? '#fca5a5' : '#a5f3fc'}
                                fontSize="7.5"
                                fontWeight="bold"
                                fontFamily="monospace"
                              >
                                {predPeakLabel}
                              </text>
                            </g>
                          )}

                          {/* Tooltip on Node Hover (if not peak or when hovered) */}
                          {hoveredPredHour && (
                            (() => {
                              const hPt = predPts.find((p) => p.hour === hoveredPredHour);
                              if (!hPt) return null;
                              return (
                                <g transform={`translate(${hPt.x}, ${Math.max(14, hPt.y - 12)})`}>
                                  <rect x="-35" y="-12" width="70" height="14" rx="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.8" />
                                  <text x="0" y="-2.5" textAnchor="middle" fill="#e2e8f0" fontSize="7.5" fontFamily="monospace">
                                    {hPt.hour}: {hPt.val} {predUnit}
                                  </text>
                                </g>
                              );
                            })()
                          )}
                        </svg>
                      </div>

                      {/* X-axis Tick Labels matching the points */}
                      <div className="flex justify-between px-2 pt-1 border-t border-slate-800/80 text-[9px] font-mono text-slate-400">
                        {horizonData.map((p, i) => {
                          const isPeak = i === predPeakIndex;
                          return (
                            <div
                              key={i}
                              className={`text-center ${isPeak ? 'text-red-400 font-bold' : 'hover:text-cyan-300'}`}
                            >
                              {p.hour}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 3. TINDAKAN YANG DISARANKAN (DSS Action Cards) */}
            <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-3 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-bold text-slate-200 uppercase tracking-wider">TINDAKAN YANG DISARANKAN</span>
                <span className="text-[10px] text-cyan-400 font-mono">DSS Recommender</span>
              </div>

              <div className="space-y-1.5 text-xs">
                {/* Prioritas Tinggi */}
                <div className="p-2 rounded bg-red-950/40 border border-red-800/70 text-slate-200 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    Prioritas Tinggi:
                  </div>
                  <div className="font-semibold text-[11px]">Tambah Kapal Cadangan (Standby Fleet)</div>
                  <div className="text-[10px] text-slate-400">KMP Ferrindo V disiagakan ke Dermaga 3</div>
                </div>

                {/* Prioritas Sedang */}
                <div className="p-2 rounded bg-amber-950/40 border border-amber-800/70 text-slate-200 space-y-0.5">
                  <div className="text-[10px] font-bold text-amber-400">Prioritas Sedang:</div>
                  <div className="font-semibold text-[11px]">Optimalisasi Alokasi Dermaga (Berth Re-allocation)</div>
                  <div className="text-[10px] text-slate-400">Alihkan trip LCM ke Moveable Bridge</div>
                </div>

                {/* Buffer Zone */}
                <div className="p-1.5 rounded bg-blue-950/60 border border-blue-800/60 text-slate-300 text-[10px] flex items-center justify-between">
                  <span className="font-medium text-cyan-300">Aktivasi Buffer Zone Tol KM 43</span>
                  <span className="text-slate-400">Mencegah bottleneck gerbang</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 3: RIGHT SIDE (Port Detail Panel matching Merak - Kritis) - Span 3 cols */}
        <div className="lg:col-span-3">
          <PortDetailPanel
            port={selectedPort}
            allPorts={ports}
            onSelectPort={onSelectPort}
            onNavigatePage={onNavigatePage}
          />
        </div>
      </div>
    </div>
  );
};
