import React, { useState } from 'react';
import { 
  Ship, 
  Layers, 
  Clock, 
  Maximize2, 
  Minimize2, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Eye, 
  Zap, 
  Sliders, 
  Database, 
  Cpu, 
  RefreshCw, 
  ArrowRight, 
  Users, 
  Truck, 
  Car, 
  Compass, 
  ShieldCheck, 
  Info, 
  Sparkles,
  Camera,
  MapPin,
  Check,
  Play,
  RotateCcw
} from 'lucide-react';

interface ZoneDetail {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  queueCount: string;
  avgWaitTime: string;
  utilizationRate: string;
  status: 'Normal' | 'Waspada' | 'Padat' | 'Kritis';
  sensorType: string;
  cctvFeed: string;
  activeAction: string;
}

export const PageDigitalTwin3D: React.FC = () => {
  // Pilot project views: 'corridor' (Merak - Bakauheni image 1) or 'terminal' (Detail Pelabuhan Merak image 2)
  const [activePilotView, setActivePilotView] = useState<'corridor' | 'terminal'>('corridor');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // Interactive Simulation state for Pilot 1 (Corridor)
  const [isScenarioApplied, setIsScenarioApplied] = useState<boolean>(false);
  const [simulationRunning, setSimulationRunning] = useState<boolean>(false);
  const [showOverlays, setShowOverlays] = useState<boolean>(true);

  // Selected Zone for Pilot 2 (Terminal Detail)
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(3); // Default to Area Tunggu (Zone 3)
  const [isDrawerMinimized, setIsDrawerMinimized] = useState<boolean>(false);
  const [filterFlow, setFilterFlow] = useState<'all' | 'vehicle' | 'passenger' | 'ferry'>('all');

  // Exact coordinates of the 7 circular number badges in image_aec50863.png (1672 x 941)
  const ZONE_PIN_POSITIONS: Record<number, { x: string; y: string; labelPlacement: 'top' | 'bottom' }> = {
    1: { x: '3.77%', y: '85.55%', labelPlacement: 'top' },
    2: { x: '14.35%', y: '43.04%', labelPlacement: 'top' },
    3: { x: '33.13%', y: '34.22%', labelPlacement: 'top' },
    4: { x: '65.67%', y: '42.93%', labelPlacement: 'top' },
    5: { x: '85.41%', y: '54.94%', labelPlacement: 'top' },
    6: { x: '54.31%', y: '12.96%', labelPlacement: 'bottom' },
    7: { x: '80.20%', y: '9.88%', labelPlacement: 'bottom' },
  };

  // Zones data matching image_f35f95fc.png (1 to 7)
  const ZONES_DATA: Record<number, ZoneDetail> = {
    1: {
      id: 1,
      title: 'ANTREAN MASUK',
      subtitle: 'Kendaraan menuju gate pelabuhan',
      description: 'Arus masuk kendaraan dari jalan arteri Cikuasa Atas dan Tol Tangerang-Merak KM 98 menuju gerbang utama.',
      queueCount: '180 Unit Kendaraan',
      avgWaitTime: '18 Menit',
      utilizationRate: '78%',
      status: 'Padat',
      sensorType: 'CCTV AI Vehicle Counting & Speed Sensor KM 98',
      cctvFeed: 'CAM-01 Tol Cikuasa Atas & Flyover Masuk',
      activeAction: 'Aktivasi Delaying System di Rest Area KM 43 & 68 Tol Tangerang-Merak',
    },
    2: {
      id: 2,
      title: 'PEMERIKSAAN TIKET',
      subtitle: 'Gate kendaraan & akses pejalan kaki',
      description: 'Plaza tol otomatis dengan validasi barcode e-ticket Ferizy, pembacaan plat nomor otomatis (ANPR), dan timbangan WIM (Weight-in-Motion).',
      queueCount: '34 Unit di loket (12 Gate Aktif)',
      avgWaitTime: '45 Detik per Kendaraan',
      utilizationRate: '85%',
      status: 'Waspada',
      sensorType: 'RFID Reader, WIM Sensor & ANPR OCR Camera',
      cctvFeed: 'CAM-04 Tollgate Entry 1-12 & Pedestrian Gate',
      activeAction: 'Buka 2 Gate Cadangan & Percepatan Bantuan Petugas Loket',
    },
    3: {
      id: 3,
      title: 'AREA TUNGGU',
      subtitle: 'Jalur kendaraan & ruang tunggu penumpang',
      description: 'Staging area parkir terbagi 6 zona (Golongan II, IVA, IVB, VA, VB, VI-IX) serta terminal ruang tunggu penumpang ber-AC terintegrasi.',
      queueCount: '620 Unit (Kapasitas 850)',
      avgWaitTime: '45 Menit',
      utilizationRate: '78%',
      status: 'Padat',
      sensorType: 'Overhead Radar Occupancy & thermal passenger counting',
      cctvFeed: 'CAM-08 Area Staging Parkir Timur & Barat',
      activeAction: 'Pengalokasian antrean truk logistik ke dermaga LCM 4 & 5',
    },
    4: {
      id: 4,
      title: 'ANTREAN KENDARAAN NAIK KAPAL',
      subtitle: 'Jalur muat kendaraan ke rampa Ro-Ro',
      description: 'Jalur akses Moveable Bridge (MB) Dermaga 1, 2, 3, 4, 5, 6, 7 untuk proses embarkasi kendaraan langsung ke car deck kapal.',
      queueCount: '110 Unit Siap Muat',
      avgWaitTime: '22 Menit Port Time',
      utilizationRate: '92%',
      status: 'Kritis',
      sensorType: 'Tide Height Sensor, MB Angle & Stress Gauge',
      cctvFeed: 'CAM-11 Moveable Bridge Dermaga 1 & Dermaga Eksekutif',
      activeAction: 'Prioritaskan pemuatan kendaraan roda 4 golongan IV & ambulans darurat',
    },
    5: {
      id: 5,
      title: 'PENUMPANG NAIK KAPAL',
      subtitle: 'Garbarata / Passenger Boarding Bridge',
      description: 'Jembatan garbarata tertutup yang memisahkan pejalan kaki secara steril dari area car deck demi keselamatan dan kenyamanan penumpang.',
      queueCount: '450 Orang Pejalan Kaki',
      avgWaitTime: '8 Menit Boarding',
      utilizationRate: '60%',
      status: 'Normal',
      sensorType: 'Turnstile Barcode Scanner & Face Recognition',
      cctvFeed: 'CAM-15 Garbarata Dermaga Eksekutif Sosoro',
      activeAction: 'Alur pejalan kaki tertib, ramah lansia dan penyandang disabilitas',
    },
    6: {
      id: 6,
      title: 'ANTREAN FERRY SANDAR',
      subtitle: 'Menunggu alokasi dermaga (kolam labuh)',
      description: 'Zona perairan kolam labuh Pelabuhan Merak tempat kapal ferry antre menunggu instruksi sandar dari VTS & POCC ASDP.',
      queueCount: '3 Kapal di Kolam Labuh',
      avgWaitTime: '15 Menit Waiting Time',
      utilizationRate: '88%',
      status: 'Waspada',
      sensorType: 'AIS Class A Base Station & Marine Radar VTS Merak',
      cctvFeed: 'CAM-19 Kolam Labuh & Breakwater Merak',
      activeAction: 'Percepatan port time kapal sandar menjadi maksimal 40 menit',
    },
    7: {
      id: 7,
      title: 'KEBERANGKATAN MENURUT TUJUAN',
      subtitle: 'Antrean ferry perute (Reguler & Eksekutif)',
      description: 'Pemisahan koridor layanan penyeberangan menuju Pelabuhan Bakauheni (Layanan Reguler 16 mil laut dan Layanan Eksekutif dermaga khusus).',
      queueCount: '2 Kapal Sedang Berlayar',
      avgWaitTime: '1 Jam 45 Menit (Reguler) / 1 Jam (Eksekutif)',
      utilizationRate: '94%',
      status: 'Normal',
      sensorType: 'GPS Differential, Echo Sounder & AIS Transponder',
      cctvFeed: 'CAM-22 Alur Pelayaran Selat Sunda Sektor Merak',
      activeAction: 'Pengaturan headway keberangkatan per 12 menit di jam puncak',
    },
  };

  const handleApplyScenario = () => {
    setSimulationRunning(true);
    setTimeout(() => {
      setIsScenarioApplied(prev => !prev);
      setSimulationRunning(false);
    }, 600);
  };

  const currentZone = selectedZoneId ? ZONES_DATA[selectedZoneId] : null;

  return (
    <div className={`space-y-4 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] ${isFullscreen ? 'fixed inset-0 z-50 bg-[#070d17] p-4 overflow-y-auto' : 'p-3 sm:p-4 lg:p-5 w-full'}`}>
      
      {/* 1. TOP HEADER & PILOT PROJECT SELECTOR */}
      <div className="bg-[#0b1626] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg">
            <div className="w-full h-full bg-[#0b1626] rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white tracking-wide">
                DIGITAL TWIN OPERASIONAL PELABUHAN ASDP
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                PILOT PROJECT LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulasi Spasial Presisi Tinggi Alur Kendaraan, Penumpang &amp; Armada Lintasan Merak - Bakauheni
            </p>
          </div>
        </div>

        {/* PILOT PROJECT VIEW SWITCHER TABS */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-900/90 border border-slate-800 p-1 rounded-xl flex items-center gap-1 shadow-inner">
            <button
              onClick={() => setActivePilotView('corridor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activePilotView === 'corridor'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Pilot 1: Koridor Merak - Bakauheni</span>
            </button>
            <button
              onClick={() => setActivePilotView('terminal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activePilotView === 'terminal'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Pilot 2: Detail Terminal Pelabuhan Merak</span>
            </button>
          </div>

          {activePilotView === 'corridor' && (
            <button
              onClick={() => setShowOverlays(!showOverlays)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                showOverlays 
                  ? 'bg-slate-900 border-cyan-800 text-cyan-300 hover:bg-slate-800' 
                  : 'bg-cyan-950 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-950/50'
              }`}
              title="Tampilkan atau sembunyikan panel informasi HUD"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showOverlays ? 'Sembunyikan Panel' : 'Tampilkan Panel Data'}</span>
            </button>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 shadow"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: PILOT PROJECT KORIDOR MERAK - BAKAUHENI (Matching image_9126c830.png)
         ========================================================================= */}
      {activePilotView === 'corridor' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          
          {/* Main Visual Canvas Frame with Overlays */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#060e1a] shadow-2xl">
            {/* The Clean Pilot Project Image 1 */}
            <div className="relative w-full h-[520px] sm:h-[600px] lg:h-[680px]">
              <img
                src="/assets/aistudio/image_3966691d.png"
                alt="Digital Twin Koridor Penyeberangan Merak - Bakauheni Selat Sunda"
                className="w-full h-full object-cover object-center"
              />

              {/* Subtle Ambient vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#060e1a]/80 via-transparent to-[#060e1a]/30 pointer-events-none" />

              {/* OVERLAY CARD 1 (LEFT): PORT STATUS TELEMETRY */}
              {showOverlays && (
                <div className="absolute top-20 left-3 sm:left-4 z-20 w-64 sm:w-72 space-y-2.5 pointer-events-auto animate-in fade-in duration-200">
                  {/* BAKAUHENI CARD */}
                  <div className="bg-[#091526]/90 backdrop-blur-md border border-cyan-700/60 rounded-xl p-3 shadow-2xl text-slate-100 transition-all hover:border-cyan-500">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-xs tracking-wide text-white">BAKAUHENI</h3>
                          <div className="text-[9.5px] text-cyan-400 font-mono font-semibold">SUMATRA · CABANG BAKAUHENI</div>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                        Waspada
                      </span>
                    </div>

                  <div className="mt-2.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Car className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Antrean</span>
                      </div>
                      <div className="font-mono">
                        <strong className="text-cyan-300 text-base font-black">110</strong>
                        <span className="text-[11px] text-slate-400 ml-1">kendaraan</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Waktu tunggu</span>
                      </div>
                      <div className="font-mono">
                        <strong className="text-cyan-300 text-base font-black">30</strong>
                        <span className="text-[11px] text-slate-400 ml-1">menit</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Activity className="w-3 h-3 text-cyan-400" />
                          <span>Area tunggu</span>
                        </div>
                        <span className="font-mono font-bold text-cyan-300">61%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full" style={{ width: '61%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* MERAK CARD (DYNAMIC BASED ON SIMULATION) */}
                <div className={`bg-[#091526]/95 backdrop-blur-md border rounded-2xl p-3.5 shadow-2xl text-slate-100 transition-all ${
                  isScenarioApplied ? 'border-emerald-600/80 shadow-emerald-950/40' : 'border-amber-600/80 shadow-amber-950/40'
                }`}>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg border ${
                        isScenarioApplied ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-amber-950 text-amber-400 border-amber-800'
                      }`}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm tracking-wide text-white">MERAK</h3>
                        <div className="text-[10px] text-amber-400 font-mono font-semibold">JAWA · CABANG UTAMA MERAK</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isScenarioApplied 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                        : 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                    }`}>
                      {isScenarioApplied ? 'Terkendali' : 'Kritis (H-3)'}
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Car className="w-3.5 h-3.5 text-amber-400" />
                        <span>Antrean</span>
                      </div>
                      <div className="font-mono">
                        <strong className={`text-base font-black ${isScenarioApplied ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {isScenarioApplied ? '128' : '180'}
                        </strong>
                        <span className="text-[11px] text-slate-400 ml-1">kendaraan</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Waktu tunggu</span>
                      </div>
                      <div className="font-mono">
                        <strong className={`text-base font-black ${isScenarioApplied ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {isScenarioApplied ? '32' : '45'}
                        </strong>
                        <span className="text-[11px] text-slate-400 ml-1">menit</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Activity className="w-3 h-3 text-amber-400" />
                          <span>Area tunggu</span>
                        </div>
                        <span className={`font-mono font-bold ${isScenarioApplied ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {isScenarioApplied ? '56%' : '78%'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-700 ${
                            isScenarioApplied ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' : 'bg-gradient-to-r from-amber-500 to-red-500'
                          }`}
                          style={{ width: isScenarioApplied ? '56%' : '78%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

              {/* OVERLAY CARD 2 (RIGHT): PREDIKSI & SIMULASI */}
              {showOverlays && (
                <div className="absolute top-20 right-3 sm:right-4 z-20 w-72 sm:w-80 bg-[#091526]/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl text-slate-100 pointer-events-auto space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <h3 className="font-black text-xs tracking-wide text-white">PREDIKSI &amp; SIMULASI</h3>
                    </div>
                    <span className="text-[9.5px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800">
                      AI DSS ENGINE
                    </span>
                  </div>

                  {/* Metric 1: Prediksi 60 menit */}
                  <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
                    <div className="p-1.5 rounded bg-amber-950 text-amber-400 border border-amber-800/80 shrink-0 mt-0.5">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-[11.5px]">
                        Prediksi <strong className="text-amber-400 font-bold">60 menit</strong> ke depan
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {isScenarioApplied 
                          ? 'Arus kendaraan stabil dengan rotasi armada tambahan.' 
                          : 'Antrean Merak berpotensi meningkat +28% jika tanpa intervensi.'}
                      </div>
                    </div>
                  </div>

                  {/* Metric 2: Skenario Operasional */}
                  <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
                    <div className="p-1.5 rounded bg-blue-950 text-blue-400 border border-blue-800/80 shrink-0 mt-0.5">
                      <Ship className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-[11.5px] font-bold text-white">Skenario Operasional</div>
                      <div className="text-[10px] text-slate-300 mt-0.5">
                        <strong>Tambah 1 kapal</strong> pada lintasan (<span className="text-cyan-300 font-mono font-bold">KMP Ferrindo V</span>)
                      </div>
                    </div>
                  </div>

                  {/* Metric 3: Estimasi Dampak */}
                  <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
                    <div className="p-1.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80 shrink-0 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[11.5px] font-bold text-white">Estimasi Dampak Nyata</div>
                      <div className="text-[11px] font-mono mt-0.5 flex items-center gap-1.5">
                        <span className="text-slate-400">Waktu tunggu:</span>
                        <span className="text-red-400 line-through">45m</span>
                        <ArrowRight className="w-3 h-3 text-cyan-400" />
                        <strong className="text-emerald-400 text-xs font-black">32 menit</strong>
                      </div>
                      <div className="text-[9.5px] text-emerald-400 font-medium">
                        Pengurangan antrean: -52 unit (-29%)
                      </div>
                    </div>
                  </div>

                  {/* Peringatan Dini Kepadatan Banner */}
                  <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-600/70 flex items-center gap-2 text-[11px] text-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-bounce" />
                    <span className="font-semibold">Peringatan dini: Status Siaga H-3</span>
                  </div>

                  {/* SIMULATION INTERACTIVE BUTTON */}
                  <button
                    onClick={handleApplyScenario}
                    disabled={simulationRunning}
                    className={`w-full py-2 px-3 rounded-lg font-extrabold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-md ${
                      isScenarioApplied
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-cyan-900/40'
                    }`}
                  >
                    {simulationRunning ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-300" />
                        <span>Kalkulasi AI Digital Twin...</span>
                      </>
                    ) : isScenarioApplied ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                        <span>Kembalikan Skenario Normal</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Terapkan Skenario: Tambah 1 Kapal</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* BOTTOM DIGITAL TWIN WORKFLOW PIPELINE (Matching image_9126c830.png) */}
            <div className="p-3 bg-[#081323] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 flex-1">
                {/* Stage 1: Data Lapangan */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="p-1.5 rounded-lg bg-blue-950 text-blue-400 border border-blue-800">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-white text-[11px] uppercase tracking-wider">DATA LAPANGAN</div>
                    <div className="text-[10px] text-slate-400">CCTV • AIS • Tiket Ferizy • Cuaca BMKG</div>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-cyan-500 hidden md:block shrink-0" />

                {/* Stage 2: Model Digital */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-white text-[11px] uppercase tracking-wider">MODEL DIGITAL</div>
                    <div className="text-[10px] text-slate-400">Kapal • Dermaga MB • Alur Kendaraan</div>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-cyan-500 hidden md:block shrink-0" />

                {/* Stage 3: Simulasi */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-white text-[11px] uppercase tracking-wider">SIMULASI</div>
                    <div className="text-[10px] text-slate-400">Antrean • Kapasitas Sandar • Jadwal Headway</div>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-cyan-500 hidden md:block shrink-0" />

                {/* Stage 4: Keputusan Operator */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-white text-[11px] uppercase tracking-wider">KEPUTUSAN OPERATOR</div>
                    <div className="text-[10px] text-slate-400">Validasi Posko &amp; Tindak Lanjut DSS</div>
                  </div>
                </div>
              </div>

              {/* Loop back arrow feedback */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-800/80 text-cyan-300 font-mono text-[11px] font-bold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                <span>UMPAN BALIK OPERASIONAL REAL-TIME</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: PILOT PROJECT DETAIL TERMINAL PELABUHAN MERAK (image_f35f95fc.png)
         ========================================================================= */}
      {activePilotView === 'terminal' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          
          {/* Main Visual Terminal Frame with 7 Annotated Interactive Zones */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#060e1a] shadow-2xl">
            
            {/* Top Sub-Bar: 7 Zones Quick Filter Pill Ribbon */}
            <div className="px-4 py-2.5 bg-[#091526]/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-xs">PILIH ZONA DETAIL (1 - 7):</span>
                <span className="text-slate-400 text-[11px]">Klik nomor zona pada ilustrasi atau tombol di bawah untuk inspeksi telemetri:</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSelectedZoneId(num)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      selectedZoneId === num
                        ? 'bg-red-600 text-white shadow-md ring-2 ring-red-400'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-mono">
                      {num}
                    </span>
                    <span className="hidden sm:inline">{ZONES_DATA[num].title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Image 2 Background Container - Natural 100% Proportional Container (Unclipped, Never Cropped) */}
            <div className="relative w-full overflow-hidden select-none bg-[#050b14]">
              <img
                src="/assets/aistudio/image_aec50863.png"
                alt="Digital Twin Pelabuhan Merak - Alur Kendaraan, Penumpang & Armada"
                className="w-full h-auto block select-none pointer-events-none"
              />

              {/* 1. ANIMATED RED CIRCLE CURSOR TARGETING THE SELECTED PROCESS NUMBER (1 to 7) */}
              {selectedZoneId && ZONE_PIN_POSITIONS[selectedZoneId] && (
                <div
                  style={{
                    left: ZONE_PIN_POSITIONS[selectedZoneId].x,
                    top: ZONE_PIN_POSITIONS[selectedZoneId].y,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 transition-all duration-300 ease-out"
                >
                  {/* Concentric expanding animated red ping wave */}
                  <span className="absolute -inset-2.5 sm:-inset-3.5 rounded-full border-2 border-red-500 animate-ping opacity-75" />

                  {/* Outer slow-spinning dashed tactical ring */}
                  <div
                    className="absolute -inset-2 sm:-inset-2.5 rounded-full border border-dashed border-red-400/80 animate-spin"
                    style={{ animationDuration: '8s' }}
                  />

                  {/* Main Glowing Red Circular Frame - Scaled to frame the number disc perfectly with transparent center */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-[3px] sm:border-4 border-red-500 bg-red-500/10 shadow-[0_0_24px_rgba(239,68,68,1),inset_0_0_12px_rgba(239,68,68,0.35)] ring-4 ring-red-400/50 flex items-center justify-center animate-pulse">
                    {/* Interior is kept transparent so the number in the white disc is crystal clear */}
                  </div>

                  {/* Tactical Crosshair Marks at 12, 6, 9, 3 o'clock */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1 h-2 bg-red-400 rounded-full shadow-[0_0_6px_#ef4444]" />
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-2 bg-red-400 rounded-full shadow-[0_0_6px_#ef4444]" />
                  <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-1 bg-red-400 rounded-full shadow-[0_0_6px_#ef4444]" />
                  <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-1 bg-red-400 rounded-full shadow-[0_0_6px_#ef4444]" />

                  {/* Floating Process Callout Tag for Instant Recognition */}
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] tracking-wider shadow-[0_0_12px_rgba(239,68,68,0.8)] border border-red-300 flex items-center gap-1.5 ${
                      ZONE_PIN_POSITIONS[selectedZoneId].labelPlacement === 'bottom'
                        ? 'top-full mt-2'
                        : 'bottom-full mb-2'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>ZONA {selectedZoneId}</span>
                  </div>
                </div>
              )}

              {/* 2. INTERACTIVE CLICKABLE HITBOXES FOR EACH PROCESS NUMBER (1 to 7) */}
              {([1, 2, 3, 4, 5, 6, 7] as const).map((id) => {
                const pos = ZONE_PIN_POSITIONS[id];
                const isSelected = selectedZoneId === id;

                return (
                  <button
                    key={id}
                    onClick={() => {
                      setSelectedZoneId(id);
                      setIsDrawerMinimized(false);
                    }}
                    style={{ left: pos.x, top: pos.y }}
                    title={`Pilih Proses ${id}: ${ZONES_DATA[id].title}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full z-20 cursor-pointer flex items-center justify-center group focus:outline-none"
                  >
                    {/* Hover preview ring when not selected */}
                    {!isSelected && (
                      <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-dashed border-red-400/0 group-hover:border-red-400 group-hover:bg-red-500/20 group-hover:scale-110 transition-all duration-200 shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
                    )}
                  </button>
                );
              })}

              {/* 3. FLOATING TELEMETRY DRAWER FOR SELECTED ZONE (EXPANDABLE & MINIMIZABLE) */}
              {currentZone && (
                <div
                  className={`absolute z-30 transition-all duration-300 ease-out ${
                    isDrawerMinimized
                      ? 'bottom-3 right-3 sm:right-4'
                      : 'bottom-3 sm:bottom-4 right-3 sm:right-4 w-[calc(100%-24px)] sm:w-96 max-w-sm'
                  }`}
                >
                  {isDrawerMinimized ? (
                    // Minimized compact pill bar
                    <button
                      onClick={() => setIsDrawerMinimized(false)}
                      className="px-3.5 py-2 rounded-xl bg-[#091526]/95 hover:bg-[#0d1f38] backdrop-blur-xl border border-red-500/80 shadow-2xl flex items-center gap-2.5 text-xs text-white font-bold transition-all hover:scale-105 group"
                    >
                      <div className="w-5 h-5 rounded-lg bg-red-600 text-white font-mono font-black flex items-center justify-center text-[11px] shadow">
                        {currentZone.id}
                      </div>
                      <span className="text-red-300 font-extrabold">{currentZone.title}</span>
                      <span className="text-slate-400 text-[11px] font-normal hidden sm:inline">• Buka Telemetri</span>
                      <Maximize2 className="w-3.5 h-3.5 text-cyan-400 group-hover:text-white" />
                    </button>
                  ) : (
                    // Expanded full metrics card
                    <div className="bg-[#091526]/95 backdrop-blur-xl border border-red-600/70 rounded-2xl p-4 shadow-2xl text-slate-100 animate-in fade-in slide-in-from-bottom-4 space-y-3">
                      <div className="flex items-start justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-red-600 text-white font-mono font-black flex items-center justify-center text-sm shadow shadow-red-950/50">
                            {currentZone.id}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-white tracking-wide">
                              {currentZone.title}
                            </h4>
                            <div className="text-[11px] text-cyan-300 font-medium">
                              {currentZone.subtitle}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              currentZone.status === 'Kritis'
                                ? 'bg-red-950 text-red-300 border border-red-700'
                                : currentZone.status === 'Padat'
                                ? 'bg-orange-950 text-orange-300 border border-orange-700'
                                : currentZone.status === 'Waspada'
                                ? 'bg-yellow-950 text-yellow-300 border border-yellow-700'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            }`}
                          >
                            {currentZone.status}
                          </span>
                          <button
                            onClick={() => setIsDrawerMinimized(true)}
                            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-bold"
                            title="Kecilkan Panel"
                          >
                            <Minimize2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedZoneId(null)}
                            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-bold"
                            title="Tutup Panel Detail Zona"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {currentZone.description}
                      </p>

                      {/* 3 Metrics Box */}
                      <div className="grid grid-cols-3 gap-2 text-center p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
                        <div>
                          <div className="text-[10px] text-slate-400 font-sans">Panjang Antrean</div>
                          <div className="font-extrabold text-white text-xs mt-0.5">{currentZone.queueCount}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-sans">Waktu Tunggu</div>
                          <div className="font-extrabold text-amber-400 text-xs mt-0.5">{currentZone.avgWaitTime}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-sans">Okupansi</div>
                          <div className="font-extrabold text-cyan-300 text-xs mt-0.5">{currentZone.utilizationRate}</div>
                        </div>
                      </div>

                      {/* Sensor Feed & Recommendation */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Camera className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Feed: <strong className="text-slate-200 font-mono">{currentZone.cctvFeed}</strong></span>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-800/60 text-[11px] text-blue-200">
                          <strong>Tindakan Rekomendasi:</strong> {currentZone.activeAction}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
