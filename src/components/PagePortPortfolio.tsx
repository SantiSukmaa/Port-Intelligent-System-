import React, { useState, useMemo } from 'react';
import { PortData, SegmentType, PortStatus } from '../types/dashboard.ts';
import { 
  Search, 
  Download, 
  Layers, 
  CheckSquare, 
  SlidersHorizontal, 
  ArrowUpDown, 
  ExternalLink,
  Ship,
  Anchor,
  Activity,
  RotateCcw,
  Filter
} from 'lucide-react';

interface PagePortPortfolioProps {
  ports: PortData[];
  onSelectPort: (port: PortData) => void;
  onNavigatePage: (page: string) => void;
  onOpenCompareModal: (selectedIds: string[]) => void;
}

export const PagePortPortfolio: React.FC<PagePortPortfolioProps> = ({
  ports,
  onSelectPort,
  onNavigatePage,
  onOpenCompareModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSegment, setActiveSegment] = useState<SegmentType | 'all'>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedPortName, setSelectedPortName] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<PortStatus | 'all'>('all');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>(['merak', 'bakauheni', 'ketapang']);
  const [sortField, setSortField] = useState<keyof PortData>('totalQueueVehicles');
  const [sortAsc, setSortAsc] = useState(false);

  // Unique list of port names sorted alphabetically
  const uniquePortNames = useMemo(() => {
    return Array.from(new Set(ports.map((p) => p.name))).sort((a, b) =>
      a.localeCompare(b, 'id')
    );
  }, [ports]);

  // Counts of ports per status
  const statusCounts = useMemo(() => {
    return {
      all: ports.length,
      kritis: ports.filter((p) => p.status === 'kritis').length,
      padat: ports.filter((p) => p.status === 'padat').length,
      waspada: ports.filter((p) => p.status === 'waspada').length,
      normal: ports.filter((p) => p.status === 'normal').length,
    };
  }, [ports]);

  const toggleCompare = (portId: string) => {
    if (selectedForCompare.includes(portId)) {
      setSelectedForCompare(selectedForCompare.filter((id) => id !== portId));
    } else {
      if (selectedForCompare.length >= 5) {
        alert('Maksimal perbandingan 5 pelabuhan (FR-33).');
        return;
      }
      setSelectedForCompare([...selectedForCompare, portId]);
    }
  };

  const hasActiveFilters = 
    selectedStatus !== 'all' || 
    selectedPortName !== 'all' || 
    selectedRegion !== 'all' || 
    activeSegment !== 'all' || 
    searchTerm.trim() !== '';

  const handleResetFilters = () => {
    setSelectedStatus('all');
    setSelectedPortName('all');
    setSelectedRegion('all');
    setActiveSegment('all');
    setSearchTerm('');
  };

  const filteredPorts = ports.filter((port) => {
    if (activeSegment !== 'all' && port.segment !== activeSegment) return false;
    if (selectedRegion !== 'all' && port.region !== selectedRegion) return false;
    if (selectedStatus !== 'all' && port.status !== selectedStatus) return false;
    if (selectedPortName !== 'all' && port.name !== selectedPortName) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        port.name.toLowerCase().includes(q) ||
        port.city.toLowerCase().includes(q) ||
        port.code.toLowerCase().includes(q) ||
        port.branch.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sortedPorts = [...filteredPorts].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
  });

  const handleExportCSV = () => {
    const headers = ['Kode,Nama Pelabuhan,Cabang,Wilayah,Zona Waktu,Status,Segmen,Antrean (unit),Waktu Tunggu (mnt),Kapasitas Dermaga (%),OTP (%),PPI'];
    const rows = sortedPorts.map(p => 
      `${p.code},"${p.name}","${p.branch}","${p.region}",${p.timezone},${p.status},${p.segment},${p.totalQueueVehicles},${p.waitingTimeMinutes},${p.berthCapacityPercent},${p.onTimeDepartureRate},${p.portPerformanceIndex}`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ASDP_Portofolio_37_Pelabuhan_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-3 sm:p-4 lg:p-5 w-full space-y-4 text-slate-100">
      {/* Header ribbon */}
      <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white">Portofolio 37 Pelabuhan &amp; 27 Cabang ASDP</h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
              Master Data Holding
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar induk operasional terintegrasi seluruh pelabuhan penyeberangan komersial, perintis, dan tol laut.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {selectedForCompare.length > 0 && (
            <button
              onClick={() => onOpenCompareModal(selectedForCompare)}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Bandingkan ({selectedForCompare.length} Port)</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Segment Tabs, Filter Controls & Search Bar */}
      <div className="bg-[#0e1726] border border-slate-800 rounded-xl p-3 space-y-3 shadow-sm">
        {/* Row 1: Segment Tabs on Left & Dropdowns + Search on Right */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Segment Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: `Semua Port (${ports.length})` },
              { id: 'pantauan_nasional', label: 'Pantauan Nasional (15)' },
              { id: 'komersial', label: 'Komersial (11)' },
              { id: 'perintis', label: 'Perintis (8)' },
              { id: 'tol_laut', label: 'Tol Laut (3)' },
            ].map((seg) => (
              <button
                key={seg.id}
                onClick={() => setActiveSegment(seg.id as SegmentType | 'all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeSegment === seg.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {seg.label}
              </button>
            ))}
          </div>

          {/* Filter Controls: Nama Pelabuhan, Status Antrean, Regional & Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Nama Pelabuhan */}
            <div className="relative">
              <select
                value={selectedPortName}
                onChange={(e) => setSelectedPortName(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-medium"
                title="Filter Nama Pelabuhan"
              >
                <option value="all">Semua Nama Pelabuhan ({uniquePortNames.length})</option>
                {uniquePortNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Status Antrean */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as PortStatus | 'all')}
                className={`bg-slate-900 border text-xs rounded-lg px-2.5 py-1.5 focus:outline-none font-bold ${
                  selectedStatus === 'kritis' ? 'border-red-600 text-red-300' :
                  selectedStatus === 'padat' ? 'border-orange-600 text-orange-300' :
                  selectedStatus === 'waspada' ? 'border-yellow-600 text-yellow-300' :
                  selectedStatus === 'normal' ? 'border-emerald-600 text-emerald-300' :
                  'border-slate-700 text-slate-200'
                }`}
                title="Filter Status Antrean"
              >
                <option value="all">Semua Status Antrean</option>
                <option value="kritis">🔴 Kritis ({statusCounts.kritis})</option>
                <option value="padat">🟠 Padat ({statusCounts.padat})</option>
                <option value="waspada">🟡 Waspada ({statusCounts.waspada})</option>
                <option value="normal">🟢 Normal ({statusCounts.normal})</option>
              </select>
            </div>

            {/* Filter Regional */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
              title="Filter Regional"
            >
              <option value="all">Semua Regional</option>
              <option value="Regional I (Sumatera)">Regional I (Sumatera)</option>
              <option value="Regional II (Jawa & Bali)">Regional II (Jawa & Bali)</option>
              <option value="Regional III (Kalimantan & Sulawesi)">Regional III (Kalimantan & Sulawesi)</option>
              <option value="Regional IV (Maluku, Papua & Nusa Tenggara)">Regional IV (Maluku, Papua & Nusa Tenggara)</option>
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari pelabuhan, cabang, kode..."
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-52 sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Status Antrean Quick Chips & Active Filter Counter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5 text-[11px] mr-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Status Antrean:</span>
            </span>

            {[
              { id: 'all', label: `Semua (${statusCounts.all})`, color: 'bg-slate-800 text-slate-300 hover:bg-slate-700' },
              { id: 'kritis', label: `🔴 Kritis (${statusCounts.kritis})`, color: 'bg-red-950/80 text-red-300 border border-red-800/70 hover:bg-red-900/60' },
              { id: 'padat', label: `🟠 Padat (${statusCounts.padat})`, color: 'bg-orange-950/80 text-orange-300 border border-orange-800/70 hover:bg-orange-900/60' },
              { id: 'waspada', label: `🟡 Waspada (${statusCounts.waspada})`, color: 'bg-yellow-950/80 text-yellow-300 border border-yellow-800/70 hover:bg-yellow-900/60' },
              { id: 'normal', label: `🟢 Normal (${statusCounts.normal})`, color: 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/70 hover:bg-emerald-900/60' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedStatus(item.id as PortStatus | 'all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  selectedStatus === item.id
                    ? 'ring-2 ring-blue-400 shadow-md scale-105 ' + item.color
                    : 'opacity-70 hover:opacity-100 ' + item.color
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono">
              Menampilkan <strong className="text-white font-bold">{sortedPorts.length}</strong> dari <strong className="text-slate-300 font-bold">{ports.length}</strong> port
            </span>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold transition-colors px-2 py-0.5 rounded bg-rose-950/40 border border-rose-800/50"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 37 Ports Master Data Table */}
      <div className="bg-[#0e1726] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-3 w-10 text-center">Pilih</th>
                <th className="py-3 px-3">Kode</th>
                <th className="py-3 px-3">Nama Pelabuhan</th>
                <th className="py-3 px-3">Cabang ASDP</th>
                <th className="py-3 px-3">Status Antrean</th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => { setSortField('totalQueueVehicles'); setSortAsc(!sortAsc); }}>
                  <div className="flex items-center gap-1">
                    <span>Antrean Lapangan</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => { setSortField('waitingTimeMinutes'); setSortAsc(!sortAsc); }}>
                  <div className="flex items-center gap-1">
                    <span>Waktu Tunggu</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => { setSortField('berthCapacityPercent'); setSortAsc(!sortAsc); }}>
                  <div className="flex items-center gap-1">
                    <span>Okupansi Dermaga</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => { setSortField('onTimeDepartureRate'); setSortAsc(!sortAsc); }}>
                  <div className="flex items-center gap-1">
                    <span>OTP (%)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => { setSortField('portPerformanceIndex'); setSortAsc(!sortAsc); }}>
                  <div className="flex items-center gap-1">
                    <span>PPI Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {sortedPorts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                      <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400">
                        <Filter className="w-5 h-5" />
                      </div>
                      <div className="text-sm font-semibold text-slate-200">
                        Tidak ada pelabuhan yang cocok dengan kriteria filter
                      </div>
                      <p className="text-xs text-slate-400">
                        Silakan ubah pilihan pada filter Nama Pelabuhan, Status Antrean, Regional, atau kata kunci pencarian.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-bold transition-all shadow"
                      >
                        Reset Semua Filter
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedPorts.map((p) => {
                const isChecked = selectedForCompare.includes(p.id);
                return (
                  <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCompare(p.id)}
                        className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-bold text-blue-400">{p.code}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-100 font-sans">
                      <div>{p.name}</div>
                      <div className="text-[10px] text-slate-400">{p.city}, {p.province} ({p.timezone})</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans">{p.branch}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.status === 'kritis' ? 'bg-red-950 text-red-400 border border-red-800' :
                        p.status === 'padat' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                        p.status === 'waspada' ? 'bg-yellow-950 text-yellow-400 border border-yellow-800' :
                        'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white tabular-nums">
                      {p.totalQueueVehicles.toLocaleString('id-ID')} unit
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 tabular-nums">
                      {p.waitingTimeMinutes} menit
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 tabular-nums">{p.berthCapacityPercent}%</span>
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${p.berthCapacityPercent > 90 ? 'bg-red-500' : p.berthCapacityPercent > 75 ? 'bg-orange-500' : 'bg-blue-500'}`}
                            style={{ width: `${p.berthCapacityPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-400 tabular-nums">
                      {p.onTimeDepartureRate}%
                    </td>
                    <td className="py-2.5 px-3 font-bold tabular-nums">
                      <span className={p.portPerformanceIndex < 50 ? 'text-red-400' : p.portPerformanceIndex < 75 ? 'text-yellow-400' : 'text-emerald-400'}>
                        {p.portPerformanceIndex.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          onSelectPort(p);
                          onNavigatePage('page_port_detail');
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-sans font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <span>Pantau</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
