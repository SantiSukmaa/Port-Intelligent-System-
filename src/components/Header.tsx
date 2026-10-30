import React, { useState, useEffect } from 'react';
import { UserRole, PortData } from '../types/dashboard.ts';
import { 
  Bell, 
  Calendar, 
  CheckCircle, 
  Clock, 
  CloudRain, 
  Database, 
  HelpCircle, 
  Layers, 
  ShieldCheck, 
  User, 
  AlertTriangle,
  Flame,
  Info
} from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  isPeakSeason: boolean;
  onTogglePeakSeason: (val: boolean) => void;
  selectedPort: PortData;
  unreadAlertCount: number;
  onOpenAlertsModal: () => void;
  onOpenPoskoModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  currentRole,
  onChangeRole,
  isPeakSeason,
  onTogglePeakSeason,
  selectedPort,
  unreadAlertCount,
  onOpenAlertsModal,
  onOpenPoskoModal,
}) => {
  const [pusatTime, setPusatTime] = useState<string>('');
  const [localPortTime, setLocalPortTime] = useState<string>('');

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      // UTC time
      const utcHours = now.getUTCHours();
      const utcMinutes = now.getUTCMinutes();
      const utcSeconds = now.getUTCSeconds();

      const formatTime = (offsetHours: number) => {
        const h = (utcHours + offsetHours + 24) % 24;
        const hh = h < 10 ? `0${h}` : `${h}`;
        const mm = utcMinutes < 10 ? `0${utcMinutes}` : `${utcMinutes}`;
        const ss = utcSeconds < 10 ? `0${utcSeconds}` : `${utcSeconds}`;
        return `${hh}.${mm}.${ss}`;
      };

      // WIB = UTC+7
      setPusatTime(formatTime(7));

      // Local Port Time based on selectedPort timezone:
      const portOffset = selectedPort.timezone === 'WIT' ? 9 : selectedPort.timezone === 'WITA' ? 8 : 7;
      setLocalPortTime(formatTime(portOffset));
    };

    updateClocks();
    const timer = setInterval(updateClocks, 1000);
    return () => clearInterval(timer);
  }, [selectedPort.timezone]);

  const navItems = [
    { id: 'page_executive', label: 'Summary Executive' },
    { id: 'page_port_detail', label: 'AIS Spatial Fleet MAP' },
    { id: 'page_digital_twin', label: 'Digital Twin 3D View', badge: '3D Live' },
    { id: 'page_portfolio', label: 'Detail 37 Port' },
    { id: 'page_simulation', label: 'DSS Optimasi Kapal & Simulasi', badge: 'Page 5' },
    { id: 'page_cases', label: 'Tindak Lanjut Kasus' },
    { id: 'page_financial', label: 'Analisis Financial' },
    { id: 'page_customer', label: 'Customer Analytics' },
  ];

  return (
    <header className="bg-[#0b1320] border-b border-slate-800 text-slate-100 sticky top-0 z-40 select-none shadow-md">
      {/* Top Banner Row */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {/* Canggih / ASDP stylized Logo mark */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 via-cyan-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-[#0b1320] rounded-[6px] flex items-center justify-center">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 text-sm">
                  C
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  PORT MANAGEMENT SYSTEM
                </h1>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  TTC x ASDP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Solusi integrasi data untuk keputusan yang tepat, cepat, dan berbasis kinerja
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right Status Strip: Clocks, Weather & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
          {/* Live Clocks (Pusat & Lokal Port) */}
          <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-900/90 rounded-lg border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Pusat (WIB):</span>
              <span className="font-bold text-white tabular-nums">{pusatTime || '12.30.07'}</span>
            </div>
            <span className="text-slate-600">·</span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span>Lokal {selectedPort.code} ({selectedPort.timezone}):</span>
              <span className="font-bold text-cyan-300 tabular-nums">{localPortTime || '12.30.07'}</span>
            </div>
          </div>

          {/* Weather Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 rounded-lg border border-slate-800 text-xs">
            <CloudRain className="w-4 h-4 text-cyan-400 animate-bounce" />
            <span className="text-slate-400">Weather :</span>
            <span className="font-semibold text-slate-200">JKT 🌧️ 28°C</span>
          </div>

          {/* Mode Switcher: Mode Reguler vs Periode Puncak (H-3 Lebaran) */}
          <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => onTogglePeakSeason(false)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                !isPeakSeason
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mode Reguler
            </button>
            <button
              onClick={() => onTogglePeakSeason(true)}
              className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
                isPeakSeason
                  ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white shadow-md font-semibold animate-pulse'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Periode Puncak (H-3 Lebaran)
            </button>
          </div>

          {/* ASDP Official Logo Branding */}
          <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-200 leading-none">asdp</div>
              <div className="text-[9px] text-emerald-400 font-semibold tracking-wider">INDONESIA FERRY</div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Navigation Links, Role Switcher & Operational Utility */}
      <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-3 bg-[#0a101c]">
        {/* Nav Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold tracking-tight ${
                    isActive ? 'bg-cyan-900 text-cyan-200 border border-cyan-400' : 'bg-emerald-950 text-emerald-300 border border-emerald-700/80'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Utilities: Role selector, Posko Report, Alert Center, Data Quality */}
        <div className="flex items-center gap-2.5 shrink-0 text-xs">
          {/* Posko Manual Entry Button (FR-25) */}
          <button
            onClick={onOpenPoskoModal}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-600/40 text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            <span>+ Input Posko</span>
          </button>

          {/* Alert Notification Bell (FR-05) */}
          <button
            onClick={onOpenAlertsModal}
            className="relative p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Pusat Peringatan & Alert"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center font-mono">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {/* Role Switcher (PRD Section 3 / Mockup Demonstator) */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1">
            <User className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={currentRole}
              onChange={(e) => onChangeRole(e.target.value as UserRole)}
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="EXEC">EXEC (Direksi Holding)</option>
              <option value="OPS_HQ">OPS_HQ (Operasional Pusat)</option>
              <option value="POCC">POCC (Operator Pelabuhan)</option>
              <option value="BRANCH">BRANCH (GM Cabang)</option>
              <option value="POSKO">POSKO (Petugas Lapangan)</option>
              <option value="FIN">FIN (Tim Keuangan)</option>
              <option value="CX">CX (Layanan Pelanggan)</option>
              <option value="ANALYST">ANALYST (Tim Analitik)</option>
              <option value="ADMIN">ADMIN (IT ASDP)</option>
            </select>
          </div>

          {/* Mandatory FR-06 Label "Data Simulasi" */}
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-600/50">
            Data Simulasi
          </span>

          {/* Data Quality Health Indicators (FR-04) */}
          <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-slate-800 text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Ferizy
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> POCC
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> BMKG
            </span>
          </div>
        </div>
      </div>

      {/* Periode Puncak Announcement Bar (FR-03 & AC-07) */}
      {isPeakSeason && (
        <div className="bg-gradient-to-r from-red-950/90 via-orange-950/90 to-red-950/90 border-b border-orange-700/60 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs text-orange-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <span className="font-bold">STATUS ANGKUTAN LEBARAN H-3:</span>
            <span>Aturan Truk Golongan VII–IX wajib dialihkan ke Dermaga Ciwandan & BBJ Bojonegara. Delaying system Tol KM 43 Aktif.</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="bg-orange-900/60 px-2 py-0.5 rounded border border-orange-700">Buffer Zone KM 43: 78% Terisi</span>
            <span className="bg-red-900/60 px-2 py-0.5 rounded border border-red-700 font-bold">Countdown Puncak: 48 Jam</span>
          </div>
        </div>
      )}
    </header>
  );
};
