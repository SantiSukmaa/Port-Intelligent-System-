import React, { useState } from 'react';
import { PortData } from '../types/dashboard.ts';
import { X, Send, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ModalManualInputProps {
  isOpen: boolean;
  onClose: () => void;
  ports: PortData[];
  selectedPort: PortData;
  onSubmitReport: (report: {
    officerName: string;
    portId: string;
    roadQueueLengthKm: number;
    estimatedVehicles: number;
    ksopLetterNo: string;
    incidentType: string;
    notes: string;
  }) => void;
}

export const ModalManualInput: React.FC<ModalManualInputProps> = ({
  isOpen,
  onClose,
  ports,
  selectedPort,
  onSubmitReport,
}) => {
  const [officerName, setOfficerName] = useState('Bripka Agus Rahardjo / Posko Terpadu');
  const [portId, setPortId] = useState(selectedPort.id);
  const [roadQueueLengthKm, setRoadQueueLengthKm] = useState<number>(3.5);
  const [estimatedVehicles, setEstimatedVehicles] = useState<number>(380);
  const [ksopLetterNo, setKsopLetterNo] = useState('KSOP.TW/UM.01/10/2026');
  const [incidentType, setIncidentType] = useState('Antrean Akses Jalan Luar (Arteri/Tol)');
  const [notes, setNotes] = useState('Ekor antrean kendaraan roda 4 mencapai KM 96 Tol Tangerang - Merak akibat perlambatan gerbang.');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReport({
      officerName,
      portId,
      roadQueueLengthKm,
      estimatedVehicles,
      ksopLetterNo,
      incidentType,
      notes,
    });
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#0e1726] border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Formulir Laporan Posko Lapangan (FR-25)</h3>
              <p className="text-xs text-slate-400">Verifikasi antrean akses jalan luar &amp; arahan KSOP</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-white">Laporan Berhasil Disimpan!</h4>
            <p className="text-xs text-slate-400">
              Data tersinkronisasi ke BigQuery mart dan memperbarui snapshot antrean 15 menit.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
            {/* Officer Name & Timestamp */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Petugas Posko:</label>
                <input
                  type="text"
                  required
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pelabuhan Posko:</label>
                <select
                  value={portId}
                  onChange={(e) => setPortId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {ports.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Incident Type */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Jenis Insiden / Laporan:</label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Antrean Akses Jalan Luar (Arteri/Tol)">Antrean Akses Jalan Luar (Arteri/Tol)</option>
                <option value="Instruksi Suspensi / Pembatasan KSOP">Instruksi Suspensi / Pembatasan KSOP</option>
                <option value="Pengalihan Rekayasa Lalu Lintas Kepolisian">Pengalihan Rekayasa Lalu Lintas Kepolisian</option>
                <option value="Penuh Buffer Zone Luar Pelabuhan">Penuh Buffer Zone Luar Pelabuhan</option>
              </select>
            </div>

            {/* Queue metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Panjang Antrean (KM):</label>
                <input
                  type="number"
                  step="0.1"
                  value={roadQueueLengthKm}
                  onChange={(e) => setRoadQueueLengthKm(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Estimasi Jumlah Kendaraan:</label>
                <input
                  type="number"
                  value={estimatedVehicles}
                  onChange={(e) => setEstimatedVehicles(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* KSOP Letter No / Evidence (FR-25 requirement) */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Nomor Surat / Bukti Arahan KSOP / Bukti Lapangan:
              </label>
              <input
                type="text"
                required
                value={ksopLetterNo}
                onChange={(e) => setKsopLetterNo(e.target.value)}
                placeholder="Contoh: KSOP.TW/UM.003/X-2026"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-cyan-300 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Catatan Kejadian:</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold flex items-center gap-1.5 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Laporan Posko</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
