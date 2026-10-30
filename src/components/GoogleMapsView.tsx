import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { PortData } from '../types/dashboard.ts';
import { 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ExternalLink,
  MapPin,
  Layers,
  Compass,
  Filter
} from 'lucide-react';

interface GoogleMapsViewProps {
  ports: PortData[];
  selectedPort: PortData;
  onSelectPort: (port: PortData) => void;
}

export const GoogleMapsView: React.FC<GoogleMapsViewProps> = ({
  ports,
  selectedPort,
  onSelectPort,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  const [layerMode, setLayerMode] = useState<'satelit' | 'hibrida' | 'medan'>('hibrida');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Google Maps Tile server URLs
  const getGoogleTileUrl = (mode: 'satelit' | 'hibrida' | 'medan') => {
    switch (mode) {
      case 'satelit':
        // Pure Google Satellite imagery
        return 'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';
      case 'medan':
        // Google Maps Terrain / Physical
        return 'https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';
      case 'hibrida':
      default:
        // Google Satellite with roads, maritime labels, and city borders
        return 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
    }
  };

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'kritis': return '#ef4444'; // Red
      case 'padat': return '#f97316'; // Orange
      case 'waspada': return '#f59e0b'; // Amber / Gold
      default: return '#10b981'; // Emerald Green
    }
  };

  const [statusFilter, setStatusFilter] = useState<'all' | 'kritis' | 'padat' | 'waspada' | 'normal'>('all');
  const [selectedPortId, setSelectedPortId] = useState<string>(selectedPort.id);

  // Sync selectedPortId when selectedPort changes
  useEffect(() => {
    setSelectedPortId(selectedPort.id);
  }, [selectedPort.id]);

  // Filtered ports according to active status filter
  const filteredPorts = useMemo(() => {
    if (statusFilter === 'all') return ports;
    return ports.filter((p) => p.status === statusFilter);
  }, [ports, statusFilter]);

  // Group ports by regional categories for neat dropdown organization
  const groupedRegions = useMemo(() => {
    const defaultOrder = [
      'Regional I (Sumatera)',
      'Regional II (Jawa & Bali)',
      'Regional III (Kalimantan & Sulawesi)',
      'Regional IV (Maluku, Papua & Nusa Tenggara)',
    ];
    const availableRegions = Array.from(new Set(ports.map((p) => p.region))).filter(Boolean);
    const sorted = defaultOrder.filter((r) => availableRegions.includes(r as any));
    availableRegions.forEach((r) => {
      if (!sorted.includes(r as any)) sorted.push(r as any);
    });
    return sorted;
  }, [ports]);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center of Indonesian Archipelago (Seluruh RI)
    const map = L.map(mapContainerRef.current, {
      center: [-2.2, 118.0],
      zoom: 5,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
      maxBounds: [
        [-15.0, 92.0],
        [10.0, 144.0],
      ],
      maxBoundsViscosity: 0.8,
    });

    mapInstanceRef.current = map;

    // Add Google Maps Tile Layer
    const tileLayer = L.tileLayer(getGoogleTileUrl('hibrida'), {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Responsive container resize observer
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    // Cleanup on unmount
    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Update Tile Layer when layerMode changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const newLayer = L.tileLayer(getGoogleTileUrl(layerMode), {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  }, [layerMode]);

  // 3. Render and update Custom Pill Markers for all 37 ASDP Ports
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    filteredPorts.forEach((port) => {
      const isSelected = selectedPort.id === port.id;
      const bgColor = getMarkerColor(port.status);
      const isCritical = port.status === 'kritis';

      // Custom HTML Pill Marker matching Image 2
      const iconHtml = `
        <div class="relative group cursor-pointer flex flex-col items-center" style="transform: translate(-50%, -100%);">
          <!-- Selected Glow Ring -->
          ${isSelected ? `
            <div class="absolute -top-3 w-12 h-12 rounded-full border-2 border-cyan-400 border-dashed animate-spin -z-10" style="animation-duration: 6s;"></div>
          ` : ''}

          <!-- Critical Pulse Glow -->
          ${isCritical && !isSelected ? `
            <div class="absolute -top-1 w-10 h-10 rounded-full bg-red-500/30 animate-ping -z-10"></div>
          ` : ''}

          <!-- Pill Badge -->
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white font-bold text-[10.5px] shadow-lg border border-white/90 transition-transform group-hover:scale-110 tracking-wide font-sans whitespace-nowrap"
               style="background-color: ${bgColor}; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
            <!-- White Ship Silhouette Icon -->
            <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 21l3-12h14l3 12H2z" fill="white" fill-opacity="0.2"/>
              <path d="M19 9V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4"/>
              <path d="M12 3v6"/>
            </svg>
            <span>${port.code}</span>
          </div>

          <!-- Pointer Triangle -->
          <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] -mt-[1px] drop-shadow"
               style="border-top-color: ${bgColor};"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-port-pill',
        html: iconHtml,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([port.lat, port.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : isCritical ? 500 : 100,
      }).addTo(map);

      // Tooltip on hover
      marker.bindTooltip(
        `<div class="text-xs p-1">
          <div class="font-bold text-slate-900">${port.name} (${port.code})</div>
          <div class="text-slate-600">${port.city}, ${port.province}</div>
          <div class="text-[11px] mt-0.5 text-slate-800">Antrean: <strong>${port.totalQueueVehicles}</strong> kend. • Status: <strong>${port.status.toUpperCase()}</strong></div>
        </div>`,
        { direction: 'top', offset: [0, -28], opacity: 0.95 }
      );

      marker.on('click', () => {
        onSelectPort(port);
        setSelectedPortId(port.id);
      });

      markersRef.current[port.id] = marker;
    });
  }, [filteredPorts, selectedPort.id, onSelectPort]);

  // 4. Handle Quick Jump & Pan to Selected Port
  const handleJumpToPort = (portId: string) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (portId === 'all') {
      setSelectedPortId('all');
      map.flyTo([-2.2, 118.0], 5, { duration: 1.2 });
      return;
    }

    const targetPort = ports.find((p) => p.id === portId);
    if (targetPort) {
      setSelectedPortId(targetPort.id);
      onSelectPort(targetPort);
      map.flyTo([targetPort.lat, targetPort.lng], 11, { duration: 1.2 });
    }
  };

  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    setSelectedPortId('all');
    setStatusFilter('all');
    map.flyTo([-2.2, 118.0], 5, { duration: 1 });
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div
      className={`relative bg-[#0c1626] border border-slate-800 rounded-xl overflow-hidden flex flex-col transition-all duration-300 select-none shadow-xl ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'h-[520px]'
      }`}
    >
      {/* 1. TOP CONTROL BAR (Simplified: Removed Camera Dermaga/Koridor per User Request) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 bg-[#0a1220]/95 backdrop-blur border-b border-slate-800 text-xs z-[1000]">
        {/* Left: Google Maps Archipelago Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold text-slate-100 text-[13px] tracking-wide">
            Google Maps Nusantara · 37 Pelabuhan ASDP
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-900/70 text-blue-300 border border-blue-700/60 shadow-sm">
            Google Maps Live
          </span>
          <span className="text-slate-400 text-xs hidden md:inline">
            | Seluruh RI (Archipelago)
          </span>
        </div>

        {/* Right: Filter Pelabuhan 37 Port ASDP + LAYER Selector (Satelit, Hibrida, Medan) & Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter 37 Pelabuhan ASDP (Menggantikan tombol Lompat per User Request) */}
          <div className="flex items-center gap-1.5 bg-slate-900/95 px-2.5 py-1 rounded-lg border border-slate-700/80 shadow-sm">
            <Filter className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-[11px] font-bold text-slate-300 mr-0.5 shrink-0">Filter:</span>

            {/* Filter Status Antrean */}
            <select
              value={statusFilter}
              onChange={(e) => {
                const val = e.target.value as any;
                setStatusFilter(val);
                if (val !== 'all') {
                  const matching = ports.filter((p) => p.status === val);
                  if (matching.length > 0) {
                    handleJumpToPort(matching[0].id);
                  }
                } else {
                  handleResetView();
                }
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-2 py-0.5 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              title="Filter status antrean pelabuhan"
            >
              <option value="all">Semua Status ({ports.length})</option>
              <option value="kritis">🔴 Kritis ({ports.filter((p) => p.status === 'kritis').length})</option>
              <option value="padat">🟠 Padat ({ports.filter((p) => p.status === 'padat').length})</option>
              <option value="waspada">🟡 Waspada ({ports.filter((p) => p.status === 'waspada').length})</option>
              <option value="normal">🟢 Normal ({ports.filter((p) => p.status === 'normal').length})</option>
            </select>

            {/* Filter / Pilih Pelabuhan (Menampilkan 37 Pelabuhan ASDP) */}
            <select
              value={selectedPortId}
              onChange={(e) => handleJumpToPort(e.target.value)}
              className="bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs px-2.5 py-0.5 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer max-w-[220px] truncate"
              title="Pilih salah satu dari 37 Pelabuhan ASDP"
            >
              <option value="all" className="bg-slate-900 text-white font-bold">
                🌐 Seluruh RI ({filteredPorts.length} Pelabuhan)
              </option>
              {groupedRegions.map((regionName) => {
                const regionPorts = filteredPorts.filter((p) => p.region === regionName);
                if (regionPorts.length === 0) return null;
                return (
                  <optgroup key={regionName} label={`📍 ${regionName}`} className="bg-slate-900 text-slate-300 font-semibold">
                    {regionPorts.map((p) => {
                      const statusDot =
                        p.status === 'kritis' ? '🔴' :
                        p.status === 'padat' ? '🟠' :
                        p.status === 'waspada' ? '🟡' : '🟢';
                      return (
                        <option key={p.id} value={p.id} className="bg-slate-950 text-white font-medium py-1">
                          {statusDot} {p.name.replace('Pelabuhan ', '')} ({p.code})
                        </option>
                      );
                    })}
                  </optgroup>
                );
              })}
            </select>
          </div>

          {/* LAYER: Satelit, Hibrida, Medan */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              LAYER:
            </span>
            <div className="flex items-center gap-1 bg-slate-900/95 p-0.5 rounded-lg border border-slate-700">
              <button
                onClick={() => setLayerMode('satelit')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  layerMode === 'satelit'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Satelit
              </button>
              <button
                onClick={() => setLayerMode('hibrida')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  layerMode === 'hibrida'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hibrida
              </button>
              <button
                onClick={() => setLayerMode('medan')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  layerMode === 'medan'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Medan
              </button>
            </div>

            {/* Zoom, Reset & Fullscreen buttons */}
            <div className="flex items-center gap-1 ml-1.5 pl-2 border-l border-slate-800">
              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Perbesar"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Perkecil"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetView}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Reset Tampilan ke Seluruh RI"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. REAL GOOGLE MAPS LEAFLET CONTAINER */}
      <div className="relative flex-1 w-full h-full bg-[#0a1424] overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* 3. BOTTOM-LEFT FLOATING PORT SUMMARY CARD */}
        <div className="absolute bottom-3 left-3 bg-[#0a1424]/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs max-w-[280px] z-[1000] space-y-2 pointer-events-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-white text-sm">
              <span className={`w-2.5 h-2.5 rounded-full ${selectedPort.status === 'kritis' ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'}`} />
              <span>{selectedPort.name.replace('Pelabuhan ', '')}</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
              selectedPort.status === 'kritis' ? 'bg-red-950 text-red-400 border border-red-700' :
              selectedPort.status === 'padat' ? 'bg-orange-950 text-orange-400 border border-orange-700' :
              selectedPort.status === 'waspada' ? 'bg-yellow-950 text-yellow-400 border border-yellow-700' :
              'bg-emerald-950 text-emerald-400 border border-emerald-700'
            }`}>
              {selectedPort.code} • {selectedPort.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-800/80 font-mono">
            <div>
              <div className="text-[10px] text-slate-400 font-sans">PPI Score</div>
              <div className="font-extrabold text-white text-sm">{selectedPort.portPerformanceIndex.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-sans">Antrian</div>
              <div className="font-extrabold text-red-400 text-sm">{selectedPort.totalQueueVehicles} u</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-sans">Tunggu</div>
              <div className="font-extrabold text-amber-400 text-sm">{selectedPort.waitingTimeMinutes} m</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
            <span>{selectedPort.lat.toFixed(4)}°, {selectedPort.lng.toFixed(4)}°</span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${selectedPort.lat},${selectedPort.lng}`}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-sans font-semibold flex items-center gap-1"
            >
              <span>Buka di Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
