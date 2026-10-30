import React, { useState } from 'react';
import { OperationalAlert } from '../types/dashboard.ts';
import { X, Bell, AlertTriangle, ShieldAlert, CheckCircle2, ExternalLink } from 'lucide-react';

interface ModalAlertsProps {
  alerts: OperationalAlert[];
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCase: () => void;
}

export const ModalAlerts: React.FC<ModalAlertsProps> = ({
  alerts,
  isOpen,
  onClose,
  onNavigateToCase,
}) => {
  const [filterUrgency, setFilterUrgency] = useState<string>('all');

  if (!isOpen) return null;

  const filtered = alerts.filter((a) => {
    if (filterUrgency !== 'all' && a.urgency !== filterUrgency) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0e1726] border border-slate-700 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Pusat Peringatan &amp; Notifikasi Operasional (FR-05)</h3>
              <p className="text-xs text-slate-400">Deteksi anomali cuaca, defisit kapasitas, dan arahan KSOP</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Total {filtered.length} Alert Terdeteksi</span>
          <div className="flex items-center gap-1">
            {['all', 'Kritis', 'Tinggi'].map((u) => (
              <button
                key={u}
                onClick={() => setFilterUrgency(u)}
                className={`px-2.5 py-1 rounded capitalize font-medium text-xs transition-colors ${
                  filterUrgency === u ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {u === 'all' ? 'Semua Urgensi' : u}
              </button>
            ))}
          </div>
        </div>

        {/* Alert List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filtered.map((alert) => (
            <div
              key={alert.id}
              className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                alert.urgency === 'Kritis' ? 'bg-red-950/40 border-red-800/80 text-red-200' :
                alert.urgency === 'Tinggi' ? 'bg-orange-950/40 border-orange-800/80 text-orange-200' :
                'bg-slate-900 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <span>{alert.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 uppercase">
                      {alert.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {alert.portName} ({alert.route}) · Pukul {alert.timestamp}
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  alert.urgency === 'Kritis' ? 'bg-red-900 text-white' : 'bg-orange-900 text-white'
                }`}>
                  {alert.urgency}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{alert.description}</p>

              <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-[11px] space-y-1">
                <div><strong className="text-cyan-400">Rekomendasi:</strong> {alert.recommendedAction}</div>
                <div className="text-slate-400 font-mono text-[10px]">
                  Kewenangan: <span className="text-amber-400">{alert.authority}</span> · {alert.referenceSource}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400">Notifikasi otomatis terhubung ke BigQuery Event Stream</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onClose();
                onNavigateToCase();
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Buka Tindak Lanjut Kasus</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
