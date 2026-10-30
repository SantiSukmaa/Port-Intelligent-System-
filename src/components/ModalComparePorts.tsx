import React from 'react';
import { PortData } from '../types/dashboard.ts';
import { X, Layers, ExternalLink } from 'lucide-react';

interface ModalComparePortsProps {
  isOpen: boolean;
  onClose: () => void;
  portsToCompare: PortData[];
  onSelectPort: (port: PortData) => void;
  onNavigatePage: (page: string) => void;
}

export const ModalComparePorts: React.FC<ModalComparePortsProps> = ({
  isOpen,
  onClose,
  portsToCompare,
  onSelectPort,
  onNavigatePage,
}) => {
  if (!isOpen || portsToCompare.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#0e1726] border border-slate-700 rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Perbandingan Kinerja Pelabuhan (FR-33)</h3>
              <p className="text-xs text-slate-400">Komparasi metrik real-time hingga 5 pelabuhan terpilih</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="p-4 overflow-x-auto flex-1">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3 font-sans">Metrik / Parameter</th>
                {portsToCompare.map((p) => (
                  <th key={p.id} className="py-2.5 px-3 min-w-[160px]">
                    <div className="font-bold text-white font-sans text-sm">{p.name.replace('Pelabuhan ', '')}</div>
                    <div className="text-[10px] text-blue-400">{p.code} · {p.region.split('(')[0]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-[11px]">
              <tr>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Status Antrean</td>
                {portsToCompare.map((p) => (
                  <td key={p.id} className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      p.status === 'kritis' ? 'bg-red-950 text-red-400 border border-red-800' :
                      p.status === 'padat' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                      p.status === 'waspada' ? 'bg-yellow-950 text-yellow-400 border border-yellow-800' :
                      'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Antrean Kendaraan Lapangan</td>
                {portsToCompare.map((p) => (
                  <td key={p.id} className="py-2.5 px-3 font-bold text-white">
                    {p.totalQueueVehicles.toLocaleString('id-ID')} unit
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Waktu Tunggu Rata-rata</td>
                {portsToCompare.map((p) => (
                  <td key={p.id} className="py-2.5 px-3 text-amber-400 font-bold">
                    {p.waitingTimeMinutes} menit
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Okupansi Kapasitas Dermaga</td>
                {portsToCompare.map((p) => (
                  <td key={p.id} className="py-2.5 px-3">
                    <span className={p.berthCapacityPercent > 90 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                      {p.berthCapacityPercent}%
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Keberangkatan Tepat Waktu (OTP)</td>
                {portsToCompare.map((p) => (
                  <td key={p.id} className="py-2.5 px-3 text-emerald-400 font-bold">
                    {p.onTimeDepartureRate}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Port Performance Index (PPI)</td>
                {portsToCompare.map((p) => (
                  <td key={p.id} className="py-2.5 px-3 font-extrabold text-cyan-300 text-sm">
                    {p.portPerformanceIndex.toFixed(1)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Armada Beroperasi</td>
                {portsToCompare.map((p) => (
                  <td key={p.id} className="py-2.5 px-3 text-slate-300">
                    {p.operatingVessels} / {p.scheduledVessels} kapal
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Potensi Opportunity Loss</td>
                {portsToCompare.map((p) => (
                  <td key={p.id} className="py-2.5 px-3 text-red-400 font-bold">
                    Rp {(p.opportunityLossMillionRp / 1000).toFixed(2)} M
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Lintasan Utama</td>
                {portsToCompare.map((p) => (
                  <td key={p.id} className="py-2.5 px-3 text-slate-300 text-[10px]">
                    {p.mainRoute.origin} ➔ {p.mainRoute.destination}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Tindakan</td>
                {portsToCompare.map((p) => (
                  <td key={p.id} className="py-2.5 px-3">
                    <button
                      onClick={() => {
                        onSelectPort(p);
                        onClose();
                        onNavigatePage('page_port_detail');
                      }}
                      className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-semibold flex items-center gap-1"
                    >
                      <span>Lihat Detail</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
