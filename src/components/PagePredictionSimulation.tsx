import React, { useState } from 'react';
import { PortData, SimulationScenario } from '../types/dashboard.ts';
import { 
  Sliders, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Ship, 
  TrendingUp, 
  Clock, 
  ShieldCheck,
  Check,
  HelpCircle,
  ArrowRight,
  Maximize2,
  X,
  Layers,
  BarChart3,
  Activity,
  Compass,
  Anchor,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface PagePredictionSimulationProps {
  ports: PortData[];
  selectedPort: PortData;
  onSelectPort: (port: PortData) => void;
  scenarios: SimulationScenario[];
  onAddCaseFromScenario: (scenario: SimulationScenario) => void;
}

export const PagePredictionSimulation: React.FC<PagePredictionSimulationProps> = ({
  ports,
  selectedPort,
  onSelectPort,
  scenarios,
  onAddCaseFromScenario,
}) => {
  // Main Page View Mode
  const [activeTab, setActiveTab] = useState<'usecase' | 'predictive' | 'simulation'>('usecase');

  // Modal for Viewing Full High-Res Infographic Image
  const [isPosterModalOpen, setIsPosterModalOpen] = useState<boolean>(false);

  // Selected scenario preset from the table (1 to 5)
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(2); // Default to Scenario 3 (Relokasi kapal terdekat)

  // Interactive Simulation Controls
  const [relocatedShips, setRelocatedShips] = useState<number>(1); // 1 ship from C-D to A-B (+200 cap)
  const [addedTrips, setAddedTrips] = useState<number>(0);
  const [portTimeSpeedup, setPortTimeSpeedup] = useState<number>(0); // minutes
  const [bufferZoneActive, setBufferZoneActive] = useState<boolean>(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  // Checklist states in usecase
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({
    kecocokan: true,
    waktu: true,
    dampak: true,
    siklus: true,
    kesiapan: true,
    biaya: true,
  });

  const toggleChecklist = (key: string) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 5 Scenarios matching the infographic image
  const scenarioMatrix = [
    {
      id: 1,
      name: 'Skenario 1: Jadwal saat ini',
      desc: 'Operasional normal tanpa penyesuaian jadwal atau perpindahan armada.',
      capAB: 720,
      capCD: 500,
      queueEst: '±180',
      queueNum: 180,
      relCost: '1,00x',
      costFactor: 1.00,
      resilienceLevel: 2, // 2 out of 5
      resilienceText: 'Rendah',
      relocated: 0,
      extraTrips: 0,
      status: 'Defisit Tinggi',
      color: 'red'
    },
    {
      id: 2,
      name: 'Skenario 2: Tambahan perjalanan (lokal)',
      desc: 'Maksimalkan trip kapal lokal pada lintasan A-B dengan kompresi port time.',
      capAB: 840,
      capCD: 500,
      queueEst: '±60',
      queueNum: 60,
      relCost: '1,10x',
      costFactor: 1.10,
      resilienceLevel: 3,
      resilienceText: 'Sedang',
      relocated: 0,
      extraTrips: 2,
      status: 'Defisit Menurun',
      color: 'amber'
    },
    {
      id: 3,
      name: 'Skenario 3: Relokasi kapal (terdekat)',
      desc: 'Relokasi 1 kapal kapasitas 200 dari lintasan C-D (surplus) ke A-B.',
      capAB: 920,
      capCD: 300,
      queueEst: '≈ 0',
      queueNum: 0,
      relCost: '1,15x',
      costFactor: 1.15,
      resilienceLevel: 5,
      resilienceText: 'Sangat Baik',
      relocated: 1,
      extraTrips: 0,
      status: 'Optimal Seimbang',
      color: 'emerald'
    },
    {
      id: 4,
      name: 'Skenario 4: Penyesuaian jadwal & slot demand',
      desc: 'Pengaturan slot waktu keberangkatan dan delaying system di rest area.',
      capAB: 780,
      capCD: 500,
      queueEst: '±80',
      queueNum: 80,
      relCost: '1,05x',
      costFactor: 1.05,
      resilienceLevel: 3,
      resilienceText: 'Sedang',
      relocated: 0,
      extraTrips: 1,
      status: 'Cukup Terkendali',
      color: 'blue'
    },
    {
      id: 5,
      name: 'Skenario 5: Kombinasi tindakan',
      desc: 'Relokasi 1 kapal + percepatan port time + delaying system tol.',
      capAB: 920,
      capCD: 300,
      queueEst: '≈ 0',
      queueNum: 0,
      relCost: '1,20x',
      costFactor: 1.20,
      resilienceLevel: 4,
      resilienceText: 'Tinggi',
      relocated: 1,
      extraTrips: 1,
      status: 'Paling Kokoh',
      color: 'cyan'
    },
  ];

  // Dynamic simulation outcome based on interactive controls:
  const baseCapAB = 720;
  const baseCapCD = 500;
  const demandAB = 900;
  const demandCD = 240;

  // Each relocated ship brings +200 capacity to A-B and removes -200 from C-D
  const capacityTransfer = relocatedShips * 200;
  const extraTripCap = addedTrips * 60;
  const speedupCap = portTimeSpeedup > 0 ? (portTimeSpeedup / 15) * 40 : 0;
  const bufferReduction = bufferZoneActive ? 80 : 0;

  const currentCapAB = Math.round(baseCapAB + capacityTransfer + extraTripCap + speedupCap);
  const currentCapCD = Math.max(100, Math.round(baseCapCD - capacityTransfer));
  const effectiveDemandAB = Math.max(0, demandAB - bufferReduction);
  const dynamicQueueAB = Math.max(0, effectiveDemandAB - currentCapAB);
  const dynamicQueueCD = Math.max(0, demandCD - currentCapCD);

  const dynamicCostFactor = (1.00 + (relocatedShips * 0.15) + (addedTrips * 0.05) + (portTimeSpeedup > 0 ? 0.02 : 0)).toFixed(2);
  const waitTimeHours = dynamicQueueAB > 100 ? 3.4 : dynamicQueueAB > 40 ? 1.8 : 0.6;
  const netBenefitMillion = Math.max(20, Math.round((effectiveDemandAB - dynamicQueueAB) * 0.28 - (parseFloat(dynamicCostFactor) - 1.0) * 120));

  const handleApplyScenarioToControls = (index: number) => {
    setSelectedScenarioIndex(index);
    const sc = scenarioMatrix[index];
    setRelocatedShips(sc.relocated);
    setAddedTrips(sc.extraTrips);
    if (sc.id === 5) {
      setPortTimeSpeedup(10);
      setBufferZoneActive(true);
    } else if (sc.id === 4) {
      setPortTimeSpeedup(5);
      setBufferZoneActive(true);
    } else {
      setPortTimeSpeedup(0);
      setBufferZoneActive(false);
    }
  };

  const handleApplyToCase = () => {
    const customScenario: SimulationScenario = {
      id: `sc_dss_${Date.now()}`,
      name: `DSS Optimasi: ${selectedPort.mainRoute.origin} - ${selectedPort.mainRoute.destination} (Relokasi ${relocatedShips} Kapal + ${addedTrips} Extra Trip)`,
      portId: selectedPort.id,
      route: `${selectedPort.mainRoute.origin} - ${selectedPort.mainRoute.destination}`,
      timeHorizon: 'Periode Puncak 18:00 - 24:00 WIB',
      baselineTrips: 24,
      addedTrips,
      standbyVesselActivated: relocatedShips > 0,
      standbyVesselName: relocatedShips > 0 ? 'KMP Ferrindo V (Relokasi C-D)' : 'Kapal Lokal',
      berthTurnaroundSpeedupMin: portTimeSpeedup,
      bufferZoneActivated: bufferZoneActive,
      ksopRestriction: false,
      initialQueue: selectedPort.totalQueueVehicles,
      estimatedArrivals: demandAB,
      effectiveCapacity: currentCapAB,
      finalQueue: dynamicQueueAB,
      avgWaitTimeHours: waitTimeHours,
      vesselUtilization: Math.min(100, Math.round((demandAB / currentCapAB) * 100)),
      addedCostMillionRp: (parseFloat(dynamicCostFactor) - 1.0) * 85,
      additionalRevenueMillionRp: netBenefitMillion + 60,
      netBenefitMillionRp: netBenefitMillion,
      riskLevel: dynamicQueueAB === 0 ? 'Rendah' : dynamicQueueAB < 80 ? 'Sedang' : 'Tinggi',
    };

    onAddCaseFromScenario(customScenario);
    setSubmittedMessage('Rekomendasi Skenario DSS berhasil diajukan ke Posko Pusat & Kasus Tindak Lanjut!');
    setTimeout(() => setSubmittedMessage(null), 4500);
  };

  return (
    <div className="p-3 sm:p-4 lg:p-5 w-full space-y-4 text-slate-100 max-w-[1720px] mx-auto">
      {/* Top Main Banner - Exactly matching the graphic header */}
      <div className="bg-gradient-to-r from-[#071328] via-[#0b1d3a] to-[#0a1a33] border border-cyan-900/60 rounded-xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-cyan-600/10 via-blue-600/5 to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-5 bg-cyan-400 rounded-sm"></span>
              <span className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
                DSS Penyeberangan Nasional
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900/70 text-blue-300 border border-blue-700/60">
                Holding ASDP Indonesia Ferry
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Optimasi Penggunaan Kapal <span className="text-cyan-400">Sesuai Demand</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Menempatkan kapal yang tepat pada lintasan dan waktu yang membutuhkan, sambil menjaga layanan minimum serta kesiapan cadangan.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-left sm:text-right border-l-2 sm:border-l-0 sm:border-r-2 border-cyan-500/50 pl-3 sm:pl-0 sm:pr-3">
              <div className="text-[11px] font-extrabold tracking-widest text-slate-200">
                MORE THAN A FERRY
              </div>
              <div className="text-[9px] text-cyan-300/80 font-mono">
                CONNECTING PEOPLE, OPPORTUNITIES, &amp; REGIONS INDONESIA
              </div>
            </div>

            <button
              onClick={() => setIsPosterModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 text-xs font-bold flex items-center gap-2 transition-all shadow-md group cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span>Lihat Gambar Asli (Infografis)</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('usecase')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'usecase'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Usecase &amp; Blueprint Optimasi</span>
            </button>

            <button
              onClick={() => setActiveTab('predictive')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'predictive'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analisis Prediksi Demand &amp; Kapasitas</span>
            </button>

            <button
              onClick={() => setActiveTab('simulation')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'simulation'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Simulasi Interaktif &amp; Skenario DSS</span>
            </button>
          </div>

          {/* Quick Context Indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Lintasan Utama Evaluasi:</span>
            <span className="text-white font-semibold">A-B (Merak - Bakauheni) vs C-D (Ketapang - Gilimanuk)</span>
          </div>
        </div>
      </div>

      {submittedMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{submittedMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: USECASE & BLUEPRINT OPTIMASI (Sesuai Ilustrasi image_cdd2828a.png) */}
      {/* ========================================================================= */}
      {activeTab === 'usecase' && (
        <div className="space-y-4">
          {/* Top 3-Panel Row: Seleksi Kapal | Ketidakseimbangan Kapasitas | Pemeriksaan Sebelum Relokasi */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Panel 1: Seleksi Kapal Siap Optimasi (3 Cols) */}
            <div className="lg:col-span-3 bg-[#0d1627] border border-cyan-900/40 rounded-xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                  <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400">
                    <Ship className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Seleksi Kapal Siap Optimasi</h3>
                    <p className="text-[10px] text-slate-400">Hanya kapal yang benar-benar siap dan sesuai yang menjadi kandidat relokasi.</p>
                  </div>
                </div>

                {/* Status Items List matching the graphic */}
                <div className="space-y-2">
                  <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">✓</div>
                      <span className="text-xs text-slate-200 font-medium">Menunggu jadwal / dermaga</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-900/60">Siaga</span>
                  </div>

                  <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">✓</div>
                      <span className="text-xs text-slate-200 font-medium">Kapasitas berlebih (idle)</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-900/60">Kandidat</span>
                  </div>

                  <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">✓</div>
                      <span className="text-xs text-slate-200 font-medium">Cadangan operasional</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-900/60">Terbatas</span>
                  </div>

                  <div className="p-2 rounded-lg bg-red-950/30 border border-red-800/40 flex items-center justify-between opacity-75">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">✕</div>
                      <span className="text-xs text-slate-400">Pemeliharaan / gangguan</span>
                    </div>
                    <span className="text-[10px] font-bold text-red-400 px-1.5 py-0.5 rounded bg-red-900/50">Tidak ada</span>
                  </div>

                  <div className="p-2 rounded-lg bg-red-950/30 border border-red-800/40 flex items-center justify-between opacity-75">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">✕</div>
                      <span className="text-xs text-slate-400">Menunggu awak / dokumen</span>
                    </div>
                    <span className="text-[10px] font-bold text-orange-400 px-1.5 py-0.5 rounded bg-orange-900/50">Tidak ada</span>
                  </div>
                </div>
              </div>

              {/* Ferry Visual Callout */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 bg-slate-900/70 rounded-lg p-2.5 flex items-center gap-3">
                <div className="w-12 h-10 rounded bg-blue-900/80 border border-blue-600/50 flex items-center justify-center text-cyan-300 font-bold text-[10px]">
                  FERIZY
                </div>
                <div>
                  <div className="text-xs font-bold text-white">KMP Ferrindo V</div>
                  <div className="text-[10px] text-cyan-300">Kapasitas 200 Kend. · Siap Relokasi</div>
                </div>
              </div>
            </div>

            {/* Panel 2: Ilustrasi Ketidakseimbangan Kapasitas (Periode Puncak) (5 Cols) */}
            <div className="lg:col-span-5 bg-[#0d1627] border border-cyan-900/40 rounded-xl p-4 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-950/80 border border-blue-800 text-blue-400">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">Ilustrasi Ketidakseimbangan Kapasitas</h3>
                      <p className="text-[10px] text-slate-400">Periode Puncak Libur / Mudik Nasional</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/80">
                    Defisit Terdeteksi
                  </span>
                </div>

                {/* Route A-B and C-D Comparison Badges */}
                <div className="space-y-3">
                  {/* Route A - B */}
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-red-900/50 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-700 flex items-center justify-center font-bold text-red-400 text-xs">
                        A-B
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Lintasan Merak - Bakauheni</div>
                        <span className="text-[10px] font-bold text-red-400 px-1.5 py-0.2 bg-red-950/80 rounded border border-red-800/60">
                          Demand Tinggi
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div>
                        <div className="text-[9px] text-slate-400">Demand</div>
                        <div className="text-sm font-extrabold text-white">900 kend.</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400">Kapasitas</div>
                        <div className="text-sm font-extrabold text-slate-300">720 kend.</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-red-400">Kurang</div>
                        <div className="text-sm font-extrabold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
                          -180
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Route C - D */}
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-emerald-900/50 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700 flex items-center justify-center font-bold text-emerald-400 text-xs">
                        C-D
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Lintasan Ketapang - Gilimanuk</div>
                        <span className="text-[10px] font-bold text-emerald-400 px-1.5 py-0.2 bg-emerald-950/80 rounded border border-emerald-800/60">
                          Kapasitas Berlebih
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div>
                        <div className="text-[9px] text-slate-400">Demand</div>
                        <div className="text-sm font-extrabold text-white">240 kend.</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400">Kapasitas</div>
                        <div className="text-sm font-extrabold text-slate-300">500 kend.</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-emerald-400">Lebih</div>
                        <div className="text-sm font-extrabold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                          +260
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spatial Graphic of Archipelago Route Map */}
                <div className="mt-3 p-3 rounded-lg bg-slate-950/80 border border-slate-800 relative">
                  <div className="text-[10px] text-slate-400 font-mono mb-1.5 flex items-center justify-between">
                    <span>Visualisasi Spasial Alur Relokasi</span>
                    <span className="text-cyan-400">Jarak Relokasi: ~14 Jam Pelayaran</span>
                  </div>
                  
                  {/* Stylized Archipelago SVG Map */}
                  <div className="h-28 w-full bg-[#050b14] rounded border border-slate-800/80 relative overflow-hidden flex items-center justify-center">
                    {/* Background Grid */}
                    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px]" />
                    
                    {/* Pulau Sumatera & Jawa (A - B) */}
                    <div className="absolute left-8 top-4 flex flex-col items-center">
                      <div className="px-2 py-0.5 rounded bg-red-900/80 border border-red-500 text-[9px] font-bold text-red-200 shadow-md">
                        A - B (Demand Tinggi)
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-500/30 border border-amber-400 text-amber-300 font-bold text-[10px] flex items-center justify-center">A</span>
                        <div className="w-16 h-1 bg-red-500 animate-pulse relative">
                          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[8px] text-red-300 font-mono">Selat Sunda</div>
                        </div>
                        <span className="w-5 h-5 rounded-full bg-amber-500/30 border border-amber-400 text-amber-300 font-bold text-[10px] flex items-center justify-center">B</span>
                      </div>
                    </div>

                    {/* Transfer dotted arrow */}
                    <div className="absolute inset-x-28 top-12 flex items-center justify-center">
                      <div className="flex items-center gap-1 text-cyan-400 text-[10px] font-mono bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                        <span>Relokasi 1 Kapal (+200 Cap)</span>
                        <ArrowRight className="w-3 h-3 animate-pulse" />
                      </div>
                    </div>

                    {/* Pulau Jawa & Bali (C - D) */}
                    <div className="absolute right-8 bottom-3 flex flex-col items-center">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-blue-500/30 border border-blue-400 text-blue-300 font-bold text-[10px] flex items-center justify-center">C</span>
                        <div className="w-16 h-1 bg-emerald-500 relative">
                          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[8px] text-emerald-300 font-mono">Selat Bali</div>
                        </div>
                        <span className="w-5 h-5 rounded-full bg-blue-500/30 border border-blue-400 text-blue-300 font-bold text-[10px] flex items-center justify-center">D</span>
                      </div>
                      <div className="px-2 py-0.5 rounded bg-blue-900/80 border border-blue-500 text-[9px] font-bold text-blue-200 shadow-md">
                        C - D (Kapasitas Berlebih)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Insight */}
              <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                <span>Rasio Ketidakseimbangan Demand vs Kapasitas: <strong className="text-amber-300">1.25x Defisit di A-B</strong></span>
                <span className="text-emerald-400 font-semibold">+260 Cadangan Tersedia di C-D</span>
              </div>
            </div>

            {/* Panel 3: Pemeriksaan Sebelum Relokasi (4 Cols) */}
            <div className="lg:col-span-4 bg-[#0d1627] border border-cyan-900/40 rounded-xl p-4 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">Pemeriksaan Sebelum Relokasi</h3>
                      <p className="text-[10px] text-slate-400">Verifikasi Keselamatan, Teknis &amp; Regulasi</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    6 / 6 Lolos
                  </span>
                </div>

                {/* Checklist 6 Items matching graphic */}
                <div className="space-y-2">
                  {[
                    {
                      id: 'kecocokan',
                      title: 'Kecocokan kapal',
                      desc: 'Ukuran, sarat air, tipe ramp door, dan kemampuan sandar dermaga MB.',
                      status: 'Kompatibel MB 1-6'
                    },
                    {
                      id: 'waktu',
                      title: 'Waktu relokasi',
                      desc: 'Tiba dan siap sebelum lonjakan puncak antrean malam berakhir.',
                      status: 'ETA Tiba H-1'
                    },
                    {
                      id: 'dampak',
                      title: 'Dampak rute asal',
                      desc: 'C-D tetap memenuhi demand minimum & cadangan keselamatan.',
                      status: 'Sisa Cap 300 (Aman)'
                    },
                    {
                      id: 'siklus',
                      title: 'Siklus perjalanan',
                      desc: 'Jumlah perjalanan tambahan yang realistis dan waktu istirahat kru.',
                      status: 'Siklus 8 Trip Layar'
                    },
                    {
                      id: 'kesiapan',
                      title: 'Kesiapan operasi',
                      desc: 'Awak kapal, bunker bahan bakar, kondisi teknis, dan persetujuan KSOP.',
                      status: 'SPB Disetujui'
                    },
                    {
                      id: 'biaya',
                      title: 'Manfaat & biaya',
                      desc: 'Pengurangan antrean pemudik vs biaya BBM pelayaran relokasi.',
                      status: 'ROI Positif (+Rp 84 Jt)'
                    },
                  ].map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => toggleChecklist(item.id)}
                      className={`p-2 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 ${
                        checkedItems[item.id]
                          ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                          : 'bg-red-950/30 border-red-900/40 opacity-70'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center font-bold text-xs shrink-0 ${
                        checkedItems[item.id] ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {checkedItems[item.id] ? '✓' : ''}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-white">{item.title}</span>
                          <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/80 px-1 rounded">{item.status}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 p-2 rounded-lg bg-blue-950/40 border border-blue-800/60 text-[10px] text-blue-200 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Seluruh pemeriksaan diverifikasi otomatis oleh modul DSS Pusat ASDP &amp; KSOP.</span>
              </div>
            </div>
          </div>

          {/* Middle 3-Panel Row: Tingkat Optimasi | Hasil Evaluasi Relokasi & Perbandingan Skenario | Catatan Kritis */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Panel 4: Tingkat Optimasi (3 Cols) */}
            <div className="lg:col-span-3 bg-[#0d1627] border border-cyan-900/40 rounded-xl p-4 flex flex-col justify-between shadow-lg">
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                  <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Tingkat Optimasi</h3>
                    <p className="text-[10px] text-slate-400">3 Level Manajemen Kapasitas Armada</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {/* Level 1 */}
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-blue-900/60">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                      <Ship className="w-3.5 h-3.5" />
                      <span>1. Dalam lintasan</span>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-1">
                      Penyesuaian jadwal keberangkatan, pergiliran kapal sandar, utilisasi kapasitas, dan percepatan waktu pelayanan dermaga.
                    </p>
                  </div>

                  {/* Level 2 */}
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-emerald-900/60">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>2. Antarlintasan (kawasan)</span>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-1">
                      Penugasan sementara kapal yang kompatibel dan cukup dekat (misal: Selat Bali C-D ke Selat Sunda A-B).
                    </p>
                  </div>

                  {/* Level 3 */}
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-purple-900/60">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                      <Anchor className="w-3.5 h-3.5" />
                      <span>3. Antarkawasan</span>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-1">
                      Penempatan armada jauh sebelum musim puncak (strategic fleet positioning), pertimbangkan waktu tempuh &amp; biaya pelayaran.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-[10px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800">
                Penerapan aktif saat ini: <strong className="text-cyan-300">Level 2 (Antarlintasan Kawasan Jawa-Bali ke Jawa-Sumatera)</strong>.
              </div>
            </div>

            {/* Panel 5: Hasil Evaluasi Relokasi & Perbandingan Skenario (Contoh) (6 Cols) */}
            <div className="lg:col-span-6 bg-[#0d1627] border border-cyan-900/40 rounded-xl p-4 flex flex-col justify-between shadow-lg">
              <div className="space-y-3">
                {/* Upper: Hasil Evaluasi Relokasi Kapal */}
                <div className="p-3 rounded-lg bg-gradient-to-r from-blue-950/60 to-cyan-950/60 border border-cyan-700/50">
                  <div className="flex items-center justify-between border-b border-cyan-800/40 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <h4 className="font-bold text-white text-xs sm:text-sm">Hasil Evaluasi Relokasi Kapal</h4>
                    </div>
                    <span className="text-[10px] font-bold text-cyan-300 font-mono">1 Kapal Dialihkan</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    {/* Bullets */}
                    <div className="md:col-span-7 space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Satu kapal dari <strong>C-D</strong> direlokasi ke <strong>A-B</strong>.</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Kapasitas C-D berkurang 200 → <strong>tersisa 300</strong> (demand 240).</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Kapasitas A-B bertambah 200 → <strong>menjadi 920</strong> (demand 900).</span>
                      </div>
                    </div>

                    {/* Sebelum vs Sesudah Visual Box matching graphic */}
                    <div className="md:col-span-5 bg-slate-900/90 rounded-lg p-2.5 border border-slate-700 text-xs font-mono">
                      <div className="grid grid-cols-3 text-[10px] text-slate-400 pb-1 border-b border-slate-800 text-center">
                        <span className="text-left">Lintasan</span>
                        <span>Sebelum</span>
                        <span>Sesudah</span>
                      </div>
                      
                      <div className="grid grid-cols-3 py-1.5 items-center text-center">
                        <span className="text-left font-bold text-white font-sans">A - B</span>
                        <span className="text-red-400">720</span>
                        <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                          920 <Check className="w-3 h-3" />
                        </span>
                      </div>

                      <div className="grid grid-cols-3 py-1.5 items-center text-center border-t border-slate-800">
                        <span className="text-left font-bold text-white font-sans">C - D</span>
                        <span className="text-blue-300">500</span>
                        <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                          300 <Check className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lower: Perbandingan Skenario (Contoh) Table */}
                <div>
                  <div className="flex items-center justify-between pb-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                      <h4 className="font-bold text-white text-xs sm:text-sm">Perbandingan Skenario (Contoh)</h4>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Klik baris untuk simulasi</span>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="bg-slate-900/90 text-slate-400 text-[10px] border-b border-slate-800">
                          <th className="py-2 px-2.5">Skenario</th>
                          <th className="py-2 px-2 text-center">Kapasitas A-B</th>
                          <th className="py-2 px-2 text-center">Kapasitas C-D</th>
                          <th className="py-2 px-2 text-center">Antrean (estimasi)</th>
                          <th className="py-2 px-2 text-center">Biaya (relatif)</th>
                          <th className="py-2 px-2.5 text-center">Ketahanan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70 text-[11px]">
                        {scenarioMatrix.map((sc, idx) => {
                          const isSelected = selectedScenarioIndex === idx;
                          return (
                            <tr
                              key={sc.id}
                              onClick={() => handleApplyScenarioToControls(idx)}
                              className={`cursor-pointer transition-colors ${
                                isSelected 
                                  ? 'bg-cyan-950/60 font-semibold' 
                                  : 'hover:bg-slate-900/60 bg-[#0a1220]/40'
                              }`}
                            >
                              <td className="py-2 px-2.5 font-sans">
                                <div className="flex items-center gap-1.5">
                                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                                  <span className={isSelected ? 'text-cyan-300 font-bold' : 'text-slate-200'}>
                                    {sc.name.replace(/Skenario \d+: /, '')}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2 px-2 text-center font-bold text-slate-200">
                                {sc.capAB}
                              </td>
                              <td className="py-2 px-2 text-center text-slate-300">
                                {sc.capCD}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  sc.queueEst === '≈ 0' 
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : sc.queueEst.includes('180')
                                    ? 'bg-red-950 text-red-300 border border-red-800'
                                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                                }`}>
                                  {sc.queueEst}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-center text-slate-300">
                                {sc.relCost}
                              </td>
                              <td className="py-2 px-2.5 text-center">
                                <div className="flex items-center justify-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((bar) => (
                                    <span 
                                      key={bar} 
                                      className={`w-1.5 h-3 rounded-xs ${
                                        bar <= sc.resilienceLevel
                                          ? sc.resilienceLevel >= 4 
                                            ? 'bg-emerald-400' 
                                            : sc.resilienceLevel === 3 
                                            ? 'bg-amber-400' 
                                            : 'bg-red-500'
                                          : 'bg-slate-800'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Action Banner to test in Simulation tab */}
              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400">
                  Skenario Terpilih: <strong className="text-cyan-300">{scenarioMatrix[selectedScenarioIndex].name}</strong>
                </span>
                <button
                  onClick={() => setActiveTab('simulation')}
                  className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all shadow cursor-pointer"
                >
                  <span>Buka di Simulator Interaktif</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Panel 6: Catatan Kritis & Kriteria Keputusan Pusat (3 Cols) */}
            <div className="lg:col-span-3 space-y-4">
              {/* Catatan Kritis Card */}
              <div className="bg-[#0d1627] border border-amber-900/50 rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 border-b border-amber-900/40 pb-2 mb-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-white text-xs sm:text-sm">Catatan Kritis</h4>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 text-slate-300">
                    <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✓</div>
                    <p className="text-[11px] leading-relaxed">
                      Uji terhadap ketidakpastian demand, kapasitas dermaga, dan kebutuhan cadangan.
                    </p>
                  </div>

                  <div className="flex items-start gap-2 text-slate-300">
                    <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✓</div>
                    <p className="text-[11px] leading-relaxed">
                      Sisa kapasitas yang tipis berisiko gagal jika terjadi keterlambatan atau gangguan kapal.
                    </p>
                  </div>

                  <div className="flex items-start gap-2 text-slate-300">
                    <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✓</div>
                    <p className="text-[11px] leading-relaxed">
                      Jika kapal tiba setelah puncak, tambahkan perjalanan lokal atau perbaiki siklus pelayanan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Kriteria Keputusan Pusat Card */}
              <div className="bg-[#0d1627] border border-cyan-900/40 rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <h4 className="font-bold text-white text-xs sm:text-sm">Kriteria Keputusan Pusat</h4>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300 text-[11px]">1. Layanan yang terpenuhi</span>
                    <span className="text-[10px] font-mono text-cyan-300 font-bold">Demand Terlayani</span>
                  </div>

                  <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300 text-[11px]">2. Waktu tunggu</span>
                    <span className="text-[10px] font-mono text-emerald-300 font-bold">&lt; 1.0 Jam</span>
                  </div>

                  <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300 text-[11px]">3. Biaya operasi</span>
                    <span className="text-[10px] font-mono text-amber-300 font-bold">1.15x Efisien</span>
                  </div>

                  <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300 text-[11px]">4. Ketahanan cadangan</span>
                    <span className="text-[10px] font-mono text-cyan-300 font-bold">Siaga Gangguan</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Pipeline: Alur DSS Pusat (Hubungan Use Case) */}
          <div className="bg-[#0a1220] border border-cyan-900/60 rounded-xl p-4 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-sm">
                Alur DSS Pusat <span className="text-cyan-400 text-xs font-normal">(Hubungan Use Case Terpadu)</span>
              </h3>
            </div>

            {/* 5-Step Pipeline Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
              {/* Step 1 */}
              <div className="p-3 rounded-lg bg-slate-900/90 border border-cyan-900/50 relative group">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">01</span>
                  <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <h5 className="font-bold text-white text-xs">Prediksi Demand</h5>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Perkiraan kedatangan per pelabuhan, lintasan-arah-waktu, dan golongan pengguna (Ferizy).
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3 rounded-lg bg-slate-900/90 border border-blue-900/50 relative group">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800">02</span>
                  <Ship className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <h5 className="font-bold text-white text-xs">Evaluasi Kapasitas</h5>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Kapasitas efektif kapal &amp; dermaga serta potensi antrean titik kritis operasional.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-3 rounded-lg bg-slate-900/90 border border-emerald-900/50 relative group">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">03</span>
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <h5 className="font-bold text-white text-xs">Evaluasi Alternatif</h5>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Tambahan perjalanan, relokasi kapal, perbaikan pelayanan, atau pengaturan kedatangan.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-3 rounded-lg bg-slate-900/90 border border-amber-900/50 relative group">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">04</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <h5 className="font-bold text-white text-xs">Keputusan</h5>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Rekomendasi dengan dampak, estimasi biaya, batasan KSOP, dan penanggung jawab pusat.
                </p>
              </div>

              {/* Step 5 */}
              <div className="p-3 rounded-lg bg-slate-900/90 border border-purple-900/50 relative group">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-950 px-1.5 py-0.5 rounded border border-purple-800">05</span>
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <h5 className="font-bold text-white text-xs">Pemantauan Hasil</h5>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Perbandingan prediksi dengan aktual serta evaluasi keberhasilan tindakan (closed loop).
                </p>
              </div>
            </div>

            {/* Bottom Metadata Badges Strip matching image footer */}
            <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">■ Unit Analisis Utama:</span>
                <span className="text-white font-semibold">Lintasan – Arah – Waktu</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">■ Tingkat Agregasi:</span>
                <span className="text-white font-semibold">Dirangkum per Pelabuhan dan Holding</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">■ Fokus Prioritas:</span>
                <span className="text-white font-semibold">Periode Kritis (Puncak Libur / Hari Raya)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ANALISIS PREDIKSI (Predictive Analytics View)                      */}
      {/* ========================================================================= */}
      {activeTab === 'predictive' && (
        <div className="space-y-4">
          {/* Header Summary for Predictive Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#0e1726] border border-slate-800">
              <div className="text-[11px] text-slate-400">Puncak Demand Lintasan A-B (Merak)</div>
              <div className="text-2xl font-black text-red-400 font-mono mt-1">900 <span className="text-xs text-slate-400 font-normal">kend./jam</span></div>
              <div className="text-[10px] text-red-300 mt-1 flex items-center gap-1">
                <span>Puncak terjadi pada: 20:00 - 22:00 WIB</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0e1726] border border-slate-800">
              <div className="text-[11px] text-slate-400">Kapasitas Terpasang A-B (Status Quo)</div>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">720 <span className="text-xs text-slate-400 font-normal">kend./jam</span></div>
              <div className="text-[10px] text-amber-300 mt-1">
                <span>Defisit murni: -180 kend./jam</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0e1726] border border-slate-800">
              <div className="text-[11px] text-slate-400">Kapasitas C-D (Ketapang) Surplus</div>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">+260 <span className="text-xs text-slate-400 font-normal">kend./jam</span></div>
              <div className="text-[10px] text-emerald-300 mt-1">
                <span>Kapasitas 500 vs Demand 240</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0e1726] border border-slate-800">
              <div className="text-[11px] text-slate-400">Kapasitas A-B Pasca Relokasi</div>
              <div className="text-2xl font-black text-cyan-400 font-mono mt-1">920 <span className="text-xs text-slate-400 font-normal">kend./jam</span></div>
              <div className="text-[10px] text-cyan-300 mt-1 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Demand 900 Terpenuhi 100%</span>
              </div>
            </div>
          </div>

          {/* Visual Forecast Curves */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Chart Panel: Hourly Demand vs Capacity (8 Cols) */}
            <div className="lg:col-span-8 bg-[#0e1726] border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div>
                  <h3 className="font-bold text-white text-sm">Kurva Proyeksi Demand vs Kapasitas Jam-ke-Jam (06.00 – 24.00 WIB)</h3>
                  <p className="text-[10px] text-slate-400">Komparasi Lintasan A-B (Merak - Bakauheni) Sebelum vs Sesudah Rekomendasi Relokasi DSS</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-red-400 rounded"></span>
                    <span className="text-slate-300 text-[10px]">Demand A-B</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-slate-500 rounded border-dashed border-t"></span>
                    <span className="text-slate-400 text-[10px]">Kapasitas Baseline (720)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-emerald-400 rounded"></span>
                    <span className="text-emerald-300 text-[10px]">Kapasitas Baru (920)</span>
                  </div>
                </div>
              </div>

              {/* Interactive SVG Curve Visual */}
              <div className="h-64 w-full bg-[#070e1b] rounded-lg p-3 border border-slate-800/80 relative flex flex-col justify-between">
                {/* SVG Curve Canvas */}
                <div className="flex-1 w-full relative">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 180">
                    <defs>
                      <linearGradient id="deficitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
                      </linearGradient>
                      <linearGradient id="safeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    <line x1="0" y1="40" x2="600" y2="40" stroke="#1e293b" strokeDasharray="3,3" />
                    <line x1="0" y1="90" x2="600" y2="90" stroke="#1e293b" strokeDasharray="3,3" />
                    <line x1="0" y1="140" x2="600" y2="140" stroke="#1e293b" strokeDasharray="3,3" />

                    {/* Baseline Capacity Line (720 vehicles = y: 70) */}
                    <line x1="0" y1="70" x2="600" y2="70" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                    <text x="590" y="65" textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="monospace">Kapasitas Lama: 720</text>

                    {/* Post-Relocation Capacity Line (920 vehicles = y: 30) */}
                    <line x1="0" y1="30" x2="600" y2="30" stroke="#10b981" strokeWidth="2.5" />
                    <text x="590" y="25" textAnchor="end" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">Kapasitas Baru: 920</text>

                    {/* Demand Forecast Curve: Starts 420 at 06:00, rises to 900 at 20:00 (x=450, y=34) */}
                    <path
                      d="M 0,140 Q 150,130 250,90 T 450,34 Q 520,38 600,80"
                      fill="none"
                      stroke="#f87171"
                      strokeWidth="3.5"
                    />

                    {/* Deficit Shaded Zone between 720 and Peak 900 */}
                    <path
                      d="M 330,70 Q 400,34 450,34 Q 500,40 540,70 Z"
                      fill="url(#deficitGradient)"
                    />

                    {/* Peak Point Alert Marker */}
                    <circle cx="450" cy="34" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" className="animate-ping origin-center" />
                    <circle cx="450" cy="34" r="4" fill="#ef4444" />
                    
                    <rect x="380" y="5" width="140" height="20" rx="4" fill="#7f1d1d" opacity="0.9" />
                    <text x="450" y="19" textAnchor="middle" fill="#fecaca" fontSize="9" fontWeight="bold" fontFamily="monospace">
                      Puncak 20.00: 900 Kend.
                    </text>
                  </svg>
                </div>

                {/* X-Axis Hourly Ticks */}
                <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-800">
                  <span>06:00</span>
                  <span>08:00</span>
                  <span>10:00</span>
                  <span>12:00</span>
                  <span>14:00</span>
                  <span>16:00</span>
                  <span>18:00</span>
                  <span className="text-red-400 font-bold">20:00 (Puncak)</span>
                  <span>22:00</span>
                  <span>24:00 WIB</span>
                </div>
              </div>

              {/* Critical Takeaway Ribbon */}
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-emerald-300">Konfirmasi Prediksi Kapasitas DSS:</div>
                  <p className="text-slate-300 mt-0.5">
                    Dengan meningkatkan kapasitas angkut A-B dari <strong>720 ke 920 unit/jam</strong>, seluruh permintaan lonjakan kendaraan pada pukul 18.00–22.00 (puncak 900 unit) dapat terlayani tanpa menyisakan antrean ke jalan tol (estimasi antrean mendekati <strong>0 unit</strong>).
                  </p>
                </div>
              </div>
            </div>

            {/* Right Panel: Vehicle Classification & Weather (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-white text-xs">Proporsi Golongan Kendaraan (Puncak 900)</h4>
                  <span className="text-[10px] font-mono text-cyan-300">Ferizy Booking 89%</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300">Gol. IV-A (Mobil Pribadi)</span>
                      <span className="font-mono font-bold text-cyan-400">420 unit (47%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: '47%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300">Gol. II (Sepeda Motor)</span>
                      <span className="font-mono font-bold text-emerald-400">230 unit (25%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300">Gol. IV-B &amp; V (Pick-up &amp; Truk Sedang)</span>
                      <span className="font-mono font-bold text-amber-400">160 unit (18%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '18%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300">Gol. VI–IX (Truk Tronton &amp; Bus)</span>
                      <span className="font-mono font-bold text-purple-400">90 unit (10%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weather & Marine Forecast */}
              <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-white text-xs">Kondisi Maritim Selat Sunda &amp; Bali</h4>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.5 rounded">BMKG Valid</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-sans">Gelombang Selat Sunda</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">0.75 - 1.25 M</div>
                    <div className="text-[9px] text-slate-500">Aman untuk kapal &gt; 3.000 GRT</div>
                  </div>

                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-sans">Gelombang Selat Bali</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">0.50 - 1.00 M</div>
                    <div className="text-[9px] text-slate-500">Kondisi tenang prima</div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400">
                  Rute relokasi via pesisir selatan aman dari badai siklon tropis.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SIMULASI INTERAKTIF & SKENARIO DSS (Simulation Sandbox)            */}
      {/* ========================================================================= */}
      {activeTab === 'simulation' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: Interactive DSS Sliders (5 Cols) */}
            <div className="lg:col-span-5 bg-[#0e1726] border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-white text-sm">Simulator Tindakan DSS</h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  Real-Time Engine
                </span>
              </div>

              {/* Slider 1: Relokasi Kapal dari C-D */}
              <div className="space-y-1.5 p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">1. Relokasi Kapal dari Koridor C-D</span>
                  <span className="font-mono font-bold text-cyan-400">+{relocatedShips} Kapal ({relocatedShips * 200} kend.)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="1"
                  value={relocatedShips}
                  onChange={(e) => setRelocatedShips(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0 (Tanpa Relokasi)</span>
                  <span>1 Kapal (+200 kend.)</span>
                  <span>2 Kapal (+400 kend.)</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Kandidat: <strong className="text-white">KMP Ferrindo V</strong> (Kapasitas 200 kend., GRT 4.500)
                </div>
              </div>

              {/* Slider 2: Tambahan Trip Layar Lokal */}
              <div className="space-y-1.5 p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">2. Tambahan Trip Layar Lokal</span>
                  <span className="font-mono font-bold text-emerald-400">+{addedTrips} Trip (+{addedTrips * 60} kend.)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  value={addedTrips}
                  onChange={(e) => setAddedTrips(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>+0 Trip</span>
                  <span>+2 Trip</span>
                  <span>+4 Trip (Maksimal)</span>
                </div>
              </div>

              {/* Slider 3: Percepatan Port Time */}
              <div className="space-y-1.5 p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">3. Kompresi Waktu Sandar (Port Time)</span>
                  <span className="font-mono font-bold text-amber-400">-{portTimeSpeedup} Menit</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="5"
                  value={portTimeSpeedup}
                  onChange={(e) => setPortTimeSpeedup(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Normal (45 mnt)</span>
                  <span>-10 mnt (35 mnt)</span>
                  <span>-15 mnt (30 mnt)</span>
                </div>
              </div>

              {/* Toggle 4: Delaying System Buffer Tol */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">4. Delaying System Buffer KM 43</div>
                  <div className="text-[10px] text-slate-400">Menahan 80 kendaraan/jam saat lonjakan puncak</div>
                </div>
                <input
                  type="checkbox"
                  checked={bufferZoneActive}
                  onChange={(e) => setBufferZoneActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 cursor-pointer"
                />
              </div>

              {/* Preset Scenario Quick Buttons */}
              <div className="pt-2 border-t border-slate-800">
                <div className="text-[11px] text-slate-400 font-semibold mb-1.5">Pilih Preset Skenario Cepat:</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {scenarioMatrix.map((sc, i) => (
                    <button
                      key={sc.id}
                      onClick={() => handleApplyScenarioToControls(i)}
                      className={`px-2 py-1.5 rounded text-[10px] text-left border transition-all ${
                        selectedScenarioIndex === i
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-200 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {sc.name.split(':')[0]} ({sc.capAB})
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleApplyToCase}
                className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Terapkan Skenario &amp; Ajukan ke Kasus Tindak Lanjut</span>
              </button>
            </div>

            {/* Right Column: Live Calculated Results & Impact Dashboard (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Dynamic Outcome Card */}
              <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                    Hasil Perhitungan Live Mesin DSS
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    dynamicQueueAB === 0 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : dynamicQueueAB < 80 
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-red-950 text-red-400 border border-red-800'
                  }`}>
                    {dynamicQueueAB === 0 ? '✓ Antrean Tuntas (≈ 0)' : `Antrean Sisa: ±${dynamicQueueAB} Unit`}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Kapasitas Koridor A-B</div>
                    <div className="text-xl font-bold font-mono text-cyan-300 mt-1 tabular-nums">
                      {currentCapAB}
                    </div>
                    <div className="text-[9px] text-slate-500">Demand: {demandAB} kend.</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Kapasitas Koridor C-D</div>
                    <div className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
                      {currentCapCD}
                    </div>
                    <div className="text-[9px] text-slate-500">Demand: {demandCD} kend.</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Estimasi Waktu Tunggu</div>
                    <div className="text-xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
                      {waitTimeHours} Jam
                    </div>
                    <div className="text-[9px] text-slate-500">Target: &lt; 1.5 Jam</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Faktor Biaya Relatif</div>
                    <div className="text-xl font-bold font-mono text-purple-300 mt-1 tabular-nums">
                      {dynamicCostFactor}x
                    </div>
                    <div className="text-[9px] text-slate-500">Basis 1,00x normal</div>
                  </div>
                </div>

                {/* Corridor Balance Visual Bars */}
                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Coverage Permintaan Lintasan A-B (Merak - Bakauheni):</span>
                      <span className={`font-mono font-bold ${currentCapAB >= demandAB ? 'text-emerald-400' : 'text-red-400'}`}>
                        {Math.round((currentCapAB / demandAB) * 100)}% ({currentCapAB} / {demandAB})
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          currentCapAB >= demandAB ? 'bg-gradient-to-r from-cyan-500 to-emerald-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, (currentCapAB / demandAB) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Buffer Keamanan Lintasan Asal C-D (Ketapang - Gilimanuk):</span>
                      <span className="font-mono font-bold text-cyan-300">
                        {currentCapCD >= demandCD ? `Aman (+${currentCapCD - demandCD} cadangan)` : 'Kritis'}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (currentCapCD / 500) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Economic & Customer Satisfaction Impact */}
              <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <h4 className="font-bold text-white text-xs">Dampak Bisnis &amp; Kepuasan Pengguna Jasa</h4>
                  <span className="text-[10px] text-emerald-400 font-mono">FR-61 Compliant</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Net Benefit Tambahan</div>
                    <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                      +Rp {netBenefitMillion} Juta
                    </div>
                    <div className="text-[9px] text-slate-500">Tiket - Biaya Relokasi</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Reduksi Antrean Tol</div>
                    <div className="text-base font-bold font-mono text-cyan-300 mt-0.5">
                      -{Math.max(0, 180 - dynamicQueueAB)} Kend.
                    </div>
                    <div className="text-[9px] text-slate-500">Bebas Macet Cikuasa Atas</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Ketahanan Operasi</div>
                    <div className="text-base font-bold font-mono text-purple-300 mt-0.5">
                      {relocatedShips > 0 ? 'Indeks 92 (Tinggi)' : 'Indeks 48 (Rentan)'}
                    </div>
                    <div className="text-[9px] text-slate-500">Kesiapan Hadapi Cuaca</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LIGHTBOX MODAL: FULL HIGH-RES INFOGRAPHIC IMAGE (image_cdd2828a.png)       */}
      {/* ========================================================================= */}
      {isPosterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-[#0b1320] border border-cyan-800 rounded-2xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                <div>
                  <h3 className="font-extrabold text-white text-sm sm:text-base">
                    Infografis Resmi: DSS Penyeberangan Nasional — Optimasi Penggunaan Kapal Sesuai Demand
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Dokumen Arsitektur Sistem Operasional &amp; Manajemen Kapasitas Holding ASDP Indonesia Ferry
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPosterModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Body with Zoomable Container */}
            <div className="flex-1 overflow-auto p-2 sm:p-4 bg-slate-950 flex items-center justify-center">
              <img
                src="/assets/aistudio/image_cdd2828a.png"
                alt="DSS Penyeberangan Nasional - Optimasi Penggunaan Kapal Sesuai Demand"
                className="max-w-full max-h-[76vh] object-contain rounded-lg shadow-2xl border border-slate-800"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-800 bg-[#0e1726] flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <span className="font-mono text-cyan-300">
                Asset: /assets/aistudio/image_cdd2828a.png
              </span>
              <button
                onClick={() => setIsPosterModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
