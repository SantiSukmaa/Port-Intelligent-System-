import React from 'react';
import { FERIZY_REVIEWS_SENTIMENT } from '../data/mockData.ts';
import { 
  HeartHandshake, 
  ThumbsDown, 
  ThumbsUp, 
  Meh, 
  MessageSquare, 
  Smartphone, 
  TrendingUp, 
  TrendingDown,
  Star,
  Users
} from 'lucide-react';

export const PageCustomerAnalytics: React.FC = () => {
  const data = FERIZY_REVIEWS_SENTIMENT;

  return (
    <div className="p-3 sm:p-4 lg:p-5 w-full space-y-4 text-slate-100">
      {/* Header */}
      <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white">Analisis Kepuasan Pengguna &amp; Sentimen Ferizy</h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
              Voice of Customer (VoC)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Agregasi ulasan aplikasi mobile Ferizy, tiket online, dan laporan pengaduan Contact Center ASDP 191 (FR-70).
          </p>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-slate-400">Total Sampel Ulasan Terverifikasi</div>
          <div className="text-lg font-bold font-mono text-cyan-300">
            {data.totalReviews.toLocaleString('id-ID')} Sampel Ulasan
          </div>
        </div>
      </div>

      {/* Top Sentiment Cards (Slide 9 match) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* CSAT Score */}
        <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400">Skor Kepuasan (CSAT)</div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5 flex items-baseline gap-1.5">
              <span>{data.satisfactionScore}</span>
              <span className="text-xs text-slate-400 font-normal">/ 7,00</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 font-mono">Survei Resmi ASDP 2024</div>
          </div>
          <div className="p-3 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/80">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
        </div>

        {/* Sentimen Negatif (74.6%) */}
        <div className="bg-[#0e1726] border border-red-800/60 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-red-300 font-bold uppercase tracking-wider">Sentimen Negatif</div>
            <div className="text-2xl font-extrabold font-mono text-red-400 mt-0.5">
              {data.negativePercent}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1">18.568 keluhan tercatat</div>
          </div>
          <div className="p-3 rounded-full bg-red-950 text-red-400 border border-red-800">
            <ThumbsDown className="w-6 h-6" />
          </div>
        </div>

        {/* Sentimen Positif (18.3%) */}
        <div className="bg-[#0e1726] border border-emerald-800/60 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider">Sentimen Positif</div>
            <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-0.5">
              {data.positivePercent}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1">4.554 ulasan puas</div>
          </div>
          <div className="p-3 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
            <ThumbsUp className="w-6 h-6" />
          </div>
        </div>

        {/* Sentimen Netral (7.1%) */}
        <div className="bg-[#0e1726] border border-slate-700 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">Sentimen Netral</div>
            <div className="text-2xl font-extrabold font-mono text-slate-300 mt-0.5">
              {data.neutralPercent}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1">1.768 ulasan saran</div>
          </div>
          <div className="p-3 rounded-full bg-slate-900 text-slate-400 border border-slate-700">
            <Meh className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main 2-Column: Sentimen Bar & Top Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Presentation Slide 9 Highlight Box (5 cols) */}
        <div className="lg:col-span-5 bg-[#0e1726] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-2.5">
            <h3 className="font-bold text-white text-base">Gambaran Sentimen Ulasan Ferizy (Slide 9)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Distribusi sentimen pengguna aplikasi Ferizy periode Angkutan Puncak Lebaran &amp; Nataru.
            </p>
          </div>

          {/* Large Segmented Bar Display */}
          <div className="space-y-2">
            <div className="h-6 w-full rounded-lg overflow-hidden flex shadow-inner">
              <div className="bg-red-500 h-full flex items-center justify-center text-[11px] font-bold text-white font-mono" style={{ width: '74.6%' }}>
                74.6% Negatif
              </div>
              <div className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-bold text-white font-mono" style={{ width: '18.3%' }}>
                18.3%
              </div>
              <div className="bg-slate-500 h-full flex items-center justify-center text-[10px] font-bold text-white font-mono" style={{ width: '7.1%' }}>
                7.1%
              </div>
            </div>

            <div className="flex justify-between text-xs text-slate-400 font-mono text-[11px]">
              <span className="text-red-400">■ Negatif: 74.6%</span>
              <span className="text-emerald-400">■ Positif: 18.3%</span>
              <span className="text-slate-400">■ Netral: 7.1%</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Kesimpulan Analitik CX:</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Mayoritas ulasan bersifat negatif (74.6%), mayoritas bersumber dari frustrasi antrean di luar pelabuhan saat jam puncak dan keterlambatan jadwal sandar kapal. Hal ini mempertegas perlunya <strong>DSS Prediksi Dini</strong> dan <strong>integrasi buffer zone jalan tol</strong> agar calon penumpang tidak menumpuk di waktu yang sama.
            </p>
          </div>
        </div>

        {/* Right: Top Complaint Topics Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-[#0e1726] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="font-bold text-white text-base">Topik Keluhan Utama Pengguna (Top Complaint Topics)</h3>
            <span className="text-xs text-slate-400 font-mono">24.890 Data Ulasan</span>
          </div>

          <div className="space-y-3.5">
            {data.topComplaintTopics.map((topic, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[11px] text-slate-400">
                      {idx + 1}
                    </span>
                    <span className="font-semibold">{topic.topic}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-white font-bold">{topic.count.toLocaleString('id-ID')} tiket</span>
                    <span className="text-slate-400">({topic.percent}%)</span>
                    <span className={`text-[10px] font-bold ${topic.trend.startsWith('+') ? 'text-red-400' : 'text-emerald-400'}`}>
                      {topic.trend}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${topic.percent * 2.2}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
