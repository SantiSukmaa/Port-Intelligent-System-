import React, { useState } from 'react';
import { OperationalCase, CaseStatus } from '../types/dashboard.ts';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  ShieldAlert, 
  ChevronRight, 
  Filter,
  Plus
} from 'lucide-react';

interface PageCaseManagementProps {
  cases: OperationalCase[];
  onUpdateCaseStatus: (caseId: string, newStatus: CaseStatus) => void;
}

export const PageCaseManagement: React.FC<PageCaseManagementProps> = ({
  cases,
  onUpdateCaseStatus,
}) => {
  const [selectedCase, setSelectedCase] = useState<OperationalCase>(cases[0]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const statusWorkflow: CaseStatus[] = [
    'Baru',
    'Diverifikasi',
    'Diusulkan',
    'Menunggu pihak eksternal',
    'Disetujui',
    'Dilaksanakan',
    'Dievaluasi',
    'Ditutup',
  ];

  const filteredCases = cases.filter((c) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="p-3 sm:p-4 lg:p-5 w-full space-y-4 text-slate-100">
      {/* Header */}
      <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white">Tindak Lanjut &amp; Manajemen Kasus Operasional</h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
              SLA Terpantau &amp; Akuntabel
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Pencatatan kasus terpadu, persetujuan lintas kewenangan (ASDP, BPTD, KSOP), dan evaluasi efektivitas intervensi.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Filter Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Status ({cases.length})</option>
            {statusWorkflow.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main 2-Column: Case List vs Detail Workflow Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Case List (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          {filteredCases.map((c) => {
            const isSelected = selectedCase.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-950/70 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                    : 'bg-[#0e1726] hover:bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono font-bold text-blue-400">{c.caseNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.urgency === 'Kritis' ? 'bg-red-950 text-red-400 border border-red-800' :
                    c.urgency === 'Tinggi' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                    'bg-yellow-950 text-yellow-400 border border-yellow-800'
                  }`}>
                    {c.urgency}
                  </span>
                </div>

                <div className="font-bold text-sm text-slate-100 mb-1 leading-snug">{c.title}</div>
                <div className="text-xs text-slate-400 mb-2">
                  Lokasi: <strong className="text-slate-300">{c.portName}</strong> ({c.route})
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400 font-mono">Batas: {c.responseDeadline.split('(')[0]}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-200">
                    {c.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detail & Workflow Stage (7 cols) */}
        <div className="lg:col-span-7 bg-[#0e1726] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono text-cyan-400 font-bold text-sm">{selectedCase.caseNumber}</span>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold font-mono bg-amber-950 text-amber-300 border border-amber-700">
                {selectedCase.authority}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">{selectedCase.title}</h3>
            <p className="text-xs text-slate-400 mt-1">
              Dibuat: {selectedCase.createdAt} · Penanggung Jawab: <strong className="text-slate-200">{selectedCase.responsibleOfficer}</strong> ({selectedCase.role})
            </p>
          </div>

          {/* Workflow Stage Stepper (FR-50) */}
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
              <span>Alur Status Penanganan Kasus (FR-50)</span>
              <span className="text-blue-400 font-mono text-[11px]">Status Saat Ini: {selectedCase.status}</span>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
              {statusWorkflow.map((st, idx) => {
                const isPassed = statusWorkflow.indexOf(selectedCase.status) >= idx;
                const isCurrent = selectedCase.status === st;

                return (
                  <button
                    key={st}
                    onClick={() => onUpdateCaseStatus(selectedCase.id, st)}
                    className={`px-2 py-1 rounded whitespace-nowrap font-semibold transition-all ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400'
                        : isPassed
                        ? 'bg-blue-950 text-blue-300 border border-blue-800 hover:bg-blue-900'
                        : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {idx + 1}. {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action & Evidence Details */}
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Usulan Tindakan:</span>
              <p className="text-slate-200 leading-relaxed font-sans">{selectedCase.proposedAction}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Pemberi Persetujuan Internal:</span>
                <div className="font-semibold text-white">{selectedCase.internalApprover}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Pemberi Persetujuan Eksternal:</span>
                <div className="font-semibold text-white">{selectedCase.externalApprover || 'Tidak Diperlukan'}</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Nomor Surat / Arahan:</span>
                <span className="font-mono text-cyan-300 font-bold">{selectedCase.officialLetterNo || 'Dalam Proses Penerbitan'}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">SLA Batas Waktu Respons:</span>
                <span className="font-mono text-amber-400 font-bold">{selectedCase.responseDeadline}</span>
              </div>
            </div>

            {/* FR-52 Evaluasi Dampak */}
            <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-800/60 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Evaluasi Efektivitas Intervensi (FR-52)
              </span>
              <p className="text-slate-300 leading-relaxed">
                <strong>Target Hasil:</strong> {selectedCase.expectedOutcome}
              </p>
              {selectedCase.actualOutcome && (
                <p className="text-emerald-300 leading-relaxed pt-1 border-t border-emerald-900/40">
                  <strong>Hasil Aktual Lapangan:</strong> {selectedCase.actualOutcome}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
