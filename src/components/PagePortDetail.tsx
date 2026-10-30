import React, { useState } from 'react';
import { PortData } from '../types/dashboard.ts';
import { AisFleetMap } from './AisFleetMap.tsx';
import { 
  Ship, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Layers, 
  Plus, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Waves, 
  Wind, 
  Anchor,
  Filter,
  FileText
} from 'lucide-react';

interface PagePortDetailProps {
  selectedPort: PortData;
  ports: PortData[];
  onSelectPort: (port: PortData) => void;
  onOpenPoskoModal: () => void;
  hourlyPrediction: { hour: string; arrivals: number; capacity: number; queue: number; ferizyReservations: number }[];
}

export const PagePortDetail: React.FC<PagePortDetailProps> = ({
  selectedPort,
  ports,
  onSelectPort,
  onOpenPoskoModal,
  hourlyPrediction,
}) => {
  const [direction, setDirection] = useState<'berangkat' | 'tiba'>('berangkat');
  const [timeRange, setTimeRange] = useState<'6h' | '12h' | '24h'>('24h');

  // Schedule vs realization data (FR-24)
  const scheduledTrips = [
    { tripNo: 'TR-101', vessel: 'KMP Portlink III', scheduleDep: '12:00', actualDep: '12:12', delayMin: 12, status: 'On-Time (Toleransi)', cargo: '94% (320 kend)', passengers: 840 },
    { tripNo: 'TR-102', vessel: 'KMP Sebuku', scheduleDep: '12:45', actualDep: '13:05', delayMin: 20, status: 'Keterlambatan Ringan', cargo: '98% (295 kend)', passengers: 790 },
    { tripNo: 'TR-103', vessel: 'KMP Batumandi', scheduleDep: '13:30', actualDep: '14:15', delayMin: 45, status: 'Terlambat (>30 min)', cargo: '100% (310 kend)', passengers: 920 },
    { tripNo: 'TR-104', vessel: 'KMP Legundi', scheduleDep: '14:15', actualDep: '14:35', delayMin: 20, status: 'Keterlambatan Ringan', cargo: '88% (260 kend)', passengers: 680 },
    { tripNo: 'TR-105', vessel: 'KMP Jatra III (Eksekutif)', scheduleDep: '15:00', actualDep: '15:04', delayMin: 4, status: 'Tepat Waktu', cargo: '96% (240 kend)', passengers: 850 },
    { tripNo: 'TR-106', vessel: 'KMP Ferrindo V (Cadangan)', scheduleDep: '15:45', actualDep: 'Standby', delayMin: 0, status: 'Disiagakan', cargo: 'Kapasitas 180', passengers: 500 },
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-5 w-full space-y-4 text-slate-100">
      {/* Port & Route Header Ribbon */}
      <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-950 text-blue-400 border border-blue-800">
            <Anchor className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">{selectedPort.name}</h2>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold uppercase bg-red-950 text-red-400 border border-red-800">
                {selectedPort.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Cabang: <strong className="text-slate-300">{selectedPort.branch}</strong> · Regional: <strong className="text-slate-300">{selectedPort.region}</strong> · Zona Waktu: <strong className="text-cyan-400">{selectedPort.timezone}</strong>
            </p>
          </div>
        </div>

        {/* Port Selector Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-slate-400">Pilih Pelabuhan:</span>
            <select
              value={selectedPort.id}
              onChange={(e) => {
                const found = ports.find((p) => p.id === e.target.value);
                if (found) onSelectPort(found);
              }}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              {ports.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code}) - {p.status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenPoskoModal}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Lapor Input Posko</span>
          </button>
        </div>
      </div>

      {/* AIS Spatial Fleet Tracking Real-Time Map (Page 2) */}
      <AisFleetMap />

      {/* FR-21: Alur Antrean 6 Zona Visual Pipeline */}
      <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">Alur Antrean Enam Zona (Real-Time Pipeline)</h3>
            <span className="text-[10px] text-slate-500">· Granularitas: Pelabuhan-Zona-15 Menit</span>
          </div>
          <span className="font-mono text-xs text-amber-400 font-bold">
            Total Kendaraan Mengantre: {selectedPort.totalQueueVehicles.toLocaleString('id-ID')} unit
          </span>
        </div>

        {/* 6 Zones Horizontal Flow */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          {/* Zone 1: Akses Jalan */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 relative">
            <span className="text-[10px] font-mono text-slate-500 block mb-1">ZONA 1 · EKSTERNAL</span>
            <div className="font-semibold text-xs text-slate-200">Akses Jalan Luar</div>
            <div className="text-xl font-bold font-mono text-red-400 my-1 tabular-nums">
              {selectedPort.queueZones.roadAccess} <span className="text-xs font-normal text-slate-400">kend</span>
            </div>
            <div className="text-[10px] text-slate-400">Arteri / Akses Tol</div>
            <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 hidden md:block text-slate-600 z-10">
              ➔
            </div>
          </div>

          {/* Zone 2: Buffer Zone */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 relative">
            <span className="text-[10px] font-mono text-slate-500 block mb-1">ZONA 2 · EKSTERNAL</span>
            <div className="font-semibold text-xs text-slate-200">Buffer Zone Tol</div>
            <div className="text-xl font-bold font-mono text-orange-400 my-1 tabular-nums">
              {selectedPort.queueZones.bufferZone} <span className="text-xs font-normal text-slate-400">kend</span>
            </div>
            <div className="text-[10px] text-slate-400">Kantong Parkir KM 43</div>
            <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 hidden md:block text-slate-600 z-10">
              ➔
            </div>
          </div>

          {/* Zone 3: Gerbang Tol (Toll Gate) */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 relative">
            <span className="text-[10px] font-mono text-slate-500 block mb-1">ZONA 3 · PELABUHAN</span>
            <div className="font-semibold text-xs text-slate-200">Toll Gate Masuk</div>
            <div className="text-xl font-bold font-mono text-yellow-400 my-1 tabular-nums">
              {selectedPort.queueZones.tollGate} <span className="text-xs font-normal text-slate-400">kend</span>
            </div>
            <div className="text-[10px] text-slate-400">Validasi E-Ticket Ferizy</div>
            <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 hidden md:block text-slate-600 z-10">
              ➔
            </div>
          </div>

          {/* Zone 4: Area Siap Muat */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 relative">
            <span className="text-[10px] font-mono text-slate-500 block mb-1">ZONA 4 · PELABUHAN</span>
            <div className="font-semibold text-xs text-slate-200">Area Siap Muat</div>
            <div className="text-xl font-bold font-mono text-blue-400 my-1 tabular-nums">
              {selectedPort.queueZones.waitingArea} <span className="text-xs font-normal text-slate-400">kend</span>
            </div>
            <div className="text-[10px] text-slate-400">Staging Area Dermaga</div>
            <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 hidden md:block text-slate-600 z-10">
              ➔
            </div>
          </div>

          {/* Zone 5: Boarding / Anjungan */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 relative">
            <span className="text-[10px] font-mono text-slate-500 block mb-1">ZONA 5 · PELABUHAN</span>
            <div className="font-semibold text-xs text-slate-200">Anjungan Boarding</div>
            <div className="text-xl font-bold font-mono text-cyan-400 my-1 tabular-nums">
              {selectedPort.queueZones.boardingZone} <span className="text-xs font-normal text-slate-400">kend</span>
            </div>
            <div className="text-[10px] text-slate-400">Masuk Ramp Door Kapal</div>
            <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 hidden md:block text-slate-600 z-10">
              ➔
            </div>
          </div>

          {/* Zone 6: Dermaga Keberangkatan */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 block mb-1">ZONA 6 · PELABUHAN</span>
            <div className="font-semibold text-xs text-slate-200">Dermaga Sandar</div>
            <div className="text-xl font-bold font-mono text-emerald-400 my-1 tabular-nums">
              {selectedPort.queueZones.berthDeparture} <span className="text-xs font-normal text-slate-400">kend</span>
            </div>
            <div className="text-[10px] text-slate-400">Lepas Tali & Berlayar</div>
          </div>
        </div>
      </div>

      {/* 2-Column: FR-22 Dermaga & POCC Status vs FR-23 Hourly Prediction Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: FR-22 Status Dermaga dan Kapal Sandar dari POCC */}
        <div className="lg:col-span-5 bg-[#0e1726] border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Ship className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">Status Dermaga & Kapal Sandar (POCC)</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
              POCC Live Synchronized
            </span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {selectedPort.berths.map((b) => (
              <div key={b.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-200 text-xs">{b.name}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>Tipe: {b.type}</span>
                    <span>·</span>
                    <span className="text-cyan-300 font-medium">{b.dockedShip || 'Kosong / Menunggu Sandar'}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    b.status === 'Sandar & Muat' ? 'bg-blue-900/80 text-blue-200' :
                    b.status === 'Tersedia' ? 'bg-emerald-900/80 text-emerald-200' :
                    b.status === 'Perbaikan' ? 'bg-slate-800 text-slate-400' :
                    'bg-red-900/80 text-red-200'
                  }`}>
                    {b.status}
                  </span>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">
                    Okupansi: <strong className="text-white">{b.utilization}%</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FR-26 Digital Twin Skematik Disclaimer Tag */}
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Visual layout dermaga disajikan dalam model digital twin skematik.</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
              Skematik
            </span>
          </div>
        </div>

        {/* Right: FR-23 Grafik Kedatangan, Pelayanan, dan Antrean per Jam */}
        <div className="lg:col-span-7 bg-[#0e1726] border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-white text-sm">Grafik Kedatangan, Pelayanan & Reservasi Ferizy</h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Kedatangan
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Kapasitas Layanan
              </span>
              <span className="flex items-center gap-1 text-indigo-400">
                <span className="w-2.5 h-0.5 bg-indigo-400" /> Tiket Ferizy
              </span>
            </div>
          </div>

          {/* Hourly Timeline Chart Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-2 px-2">Jam (WIB)</th>
                  <th className="py-2 px-2">Reservasi Ferizy</th>
                  <th className="py-2 px-2">Prediksi Tiba</th>
                  <th className="py-2 px-2">Kapasitas Muat</th>
                  <th className="py-2 px-2">Antrean Lapangan</th>
                  <th className="py-2 px-2 text-right">Status Beban</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {hourlyPrediction.slice(0, 8).map((row, idx) => {
                  const isSurge = row.arrivals > row.capacity;
                  return (
                    <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-2 px-2 font-bold text-slate-200">{row.hour}</td>
                      <td className="py-2 px-2 text-indigo-300">{row.ferizyReservations}</td>
                      <td className="py-2 px-2 text-cyan-300 font-bold">{row.arrivals} kend/j</td>
                      <td className="py-2 px-2 text-emerald-300">{row.capacity} kend/j</td>
                      <td className="py-2 px-2 font-bold text-white">{row.queue} unit</td>
                      <td className="py-2 px-2 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isSurge ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {isSurge ? 'Defisit Kapasitas' : 'Terkendali'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FR-24: Tabel Jadwal dan Realisasi Perjalanan beserta Keterlambatan */}
      <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Tabel Realisasi Perjalanan & Analisis Keterlambatan (OTP)</h3>
          </div>
          <span className="text-slate-400 text-xs">Lintasan: {selectedPort.mainRoute.origin} ➔ {selectedPort.mainRoute.destination}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-2 px-2">Trip ID</th>
                <th className="py-2 px-2">Nama Kapal</th>
                <th className="py-2 px-2">Jadwal Keberangkatan</th>
                <th className="py-2 px-2">Realisasi Berangkat</th>
                <th className="py-2 px-2">Keterlambatan</th>
                <th className="py-2 px-2">Keterisian Kendaraan</th>
                <th className="py-2 px-2">Penumpang</th>
                <th className="py-2 px-2 text-right">Status OTP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {scheduledTrips.map((trip) => (
                <tr key={trip.tripNo} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-2 px-2 text-blue-400 font-bold">{trip.tripNo}</td>
                  <td className="py-2 px-2 font-semibold text-slate-200">{trip.vessel}</td>
                  <td className="py-2 px-2 text-slate-400">{trip.scheduleDep}</td>
                  <td className="py-2 px-2 text-white font-bold">{trip.actualDep}</td>
                  <td className="py-2 px-2">
                    <span className={trip.delayMin > 30 ? 'text-red-400 font-bold' : trip.delayMin > 15 ? 'text-yellow-400' : 'text-emerald-400'}>
                      +{trip.delayMin} menit
                    </span>
                  </td>
                  <td className="py-2 px-2 text-cyan-300">{trip.cargo}</td>
                  <td className="py-2 px-2 text-slate-300">{trip.passengers} orang</td>
                  <td className="py-2 px-2 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      trip.status.includes('Tepat') ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      trip.status.includes('Toleransi') ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                      trip.status.includes('Disiagakan') ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' :
                      'bg-red-950 text-red-400 border border-red-800'
                    }`}>
                      {trip.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
