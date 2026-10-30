import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Sliders, 
  PieChart, 
  AlertCircle, 
  ShieldCheck,
  Fuel,
  Ship,
  HelpCircle
} from 'lucide-react';

export const PageFinancialAnalysis: React.FC = () => {
  const [demandFactor, setDemandFactor] = useState<number>(100); // 80% - 120%
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState<number>(14500); // Rp / Liter

  // Base financial figures from PRD Section 9.7 & 10.3
  const baseRevenueTripsMillion = 180.0;
  const standardHourlyCostMillion = 14.5; // FR-61
  const extraHours = 8;
  const baseFuelCostMillion = (extraHours * standardHourlyCostMillion) * (fuelPricePerLiter / 14500);
  const adjustedRevenueMillion = baseRevenueTripsMillion * (demandFactor / 100);
  const netBenefitMillion = adjustedRevenueMillion - baseFuelCostMillion;

  const fleetCostBreakdown = [
    { title: 'Biaya BBM Solar Industri (B35)', amount: 68.4, percent: 59 },
    { title: 'Tunjangan & Awak Kapal (Crew)', amount: 24.2, percent: 21 },
    { title: 'Jasa Kepelabuhanan & Tambat Dermaga', amount: 14.5, percent: 12 },
    { title: 'Pelumas & Pemeliharaan Ringan', amount: 9.3, percent: 8 },
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-5 w-full space-y-4 text-slate-100">
      {/* Header */}
      <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white">Analisis Finansial &amp; Manfaat Bersih Tambahan</h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              KPI-13 Net Economic Benefit
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Biaya kapal Grup ASDP mengacu standar biaya per jam layar disepakati Dit. Keuangan (FR-61).
          </p>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-slate-400">Total Opportunity Loss Nasional</div>
          <div className="text-lg font-bold font-mono text-red-400">Rp 18,25 Miliar / Hari</div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 mb-1">Target Pendapatan Holding 2024</div>
          <div className="text-2xl font-bold font-mono text-white">Rp 5,78 Triliun</div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1">Realisasi: Rp 5,02 T (86,9%)</div>
        </div>

        <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 mb-1">Standar Biaya Operasi Kapal ASDP</div>
          <div className="text-2xl font-bold font-mono text-cyan-300">Rp 14,5 Jt / Jam</div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">BBM + Pelumas + Crew</div>
        </div>

        <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 mb-1">Proyeksi Pendapatan Tambahan</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            +Rp {adjustedRevenueMillion.toFixed(1)} Jt
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">Dari optimalisasi trip puncak</div>
        </div>

        <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-400 mb-1">Manfaat Bersih Tambahan (KPI-13)</div>
          <div className="text-2xl font-bold font-mono text-emerald-300">
            +Rp {netBenefitMillion.toFixed(1)} Jt
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1">Net Gain Skenario Terpilih</div>
        </div>
      </div>

      {/* Sensitivity Analysis & Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Sensitivity Sliders (FR-62) */}
        <div className="lg:col-span-6 bg-[#0e1726] border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">Analisis Sensitivitas Permintaan &amp; Biaya (FR-62)</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">What-If Analysis</span>
          </div>

          {/* Slider 1: Demand Factor */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">Faktor Permintaan / Keterisian Penumpang &amp; Truk</span>
              <span className="font-mono font-bold text-cyan-400">{demandFactor}% dari Kuota Puncak</span>
            </div>
            <input
              type="range"
              min="70"
              max="130"
              step="5"
              value={demandFactor}
              onChange={(e) => setDemandFactor(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>70% (Sepi)</span>
              <span>100% (Normal Puncak)</span>
              <span>130% (Lonjakan Ekstrem)</span>
            </div>
          </div>

          {/* Slider 2: Fuel Price */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">Harga Bahan Bakar Solar Industri B35</span>
              <span className="font-mono font-bold text-amber-400">Rp {fuelPricePerLiter.toLocaleString('id-ID')} / Liter</span>
            </div>
            <input
              type="range"
              min="12000"
              max="18000"
              step="500"
              value={fuelPricePerLiter}
              onChange={(e) => setFuelPricePerLiter(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Rp 12.000 / L</span>
              <span>Rp 14.500 / L (Baseline)</span>
              <span>Rp 18.000 / L</span>
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <div className="font-semibold text-slate-200">Hasil Simulasi Finansial Terkini:</div>
            <div className="flex justify-between text-slate-400">
              <span>Biaya Tambahan Operasional (BBM &amp; Kru):</span>
              <span className="font-mono text-white">Rp {baseFuelCostMillion.toFixed(1)} Juta</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Pendapatan Tiket Tambahan:</span>
              <span className="font-mono text-emerald-400">+Rp {adjustedRevenueMillion.toFixed(1)} Juta</span>
            </div>
            <div className="flex justify-between font-bold text-white pt-2 border-t border-slate-800">
              <span>Surplus Ekonomi Bersih:</span>
              <span className="font-mono text-emerald-300 text-sm">+Rp {netBenefitMillion.toFixed(1)} Juta</span>
            </div>
          </div>
        </div>

        {/* Right: Cost Breakdown Table */}
        <div className="lg:col-span-6 bg-[#0e1726] border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Fuel className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-sm">Komponen Biaya Operasi Kapal (Cost Breakdown)</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Standar Litbang ASDP</span>
          </div>

          <div className="space-y-3">
            {fleetCostBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>{item.title}</span>
                  <span className="font-mono font-bold text-white">
                    Rp {item.amount} Jt ({item.percent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/60 text-xs text-slate-300 mt-4">
            <div className="font-bold text-blue-300 mb-1">Catatan Kebijakan Akuntansi:</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Sesuai PRD Seksi 9.7 (FR-61), efisiensi biaya armada mitra swasta diperhitungkan secara terpisah melalui mekanisme bagi hasil tarif feri reguler dan tidak dibebankan pada pos biaya kapal operasional ASDP.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
