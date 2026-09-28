import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  LocateFixed, 
  ExternalLink, 
  Loader2, 
  Check, 
  Layers, 
  Info,
  Maximize2,
  Compass
} from 'lucide-react';

interface InteractiveMapPickerProps {
  initialLat?: string | number;
  initialLng?: string | number;
  onLocationChange: (lat: string, lng: string) => void;
  readOnly?: boolean;
}

// Default center: Tangerang Aetra Operating Area (Curug / Cikupa)
const DEFAULT_LAT = -6.2366;
const DEFAULT_LNG = 106.5621;

const QUICK_AREAS = [
  { name: 'Cikupa', lat: -6.2238, lng: 106.5284 },
  { name: 'Pasar Kemis', lat: -6.1558, lng: 106.5369 },
  { name: 'Sepatan', lat: -6.1158, lng: 106.5742 },
  { name: 'Balaraja', lat: -6.1963, lng: 106.4578 },
  { name: 'Curug (Pusat Aetra)', lat: -6.2625, lng: 106.5647 },
  { name: 'Sindang Jaya', lat: -6.1772, lng: 106.5186 },
];

export const InteractiveMapPicker: React.FC<InteractiveMapPickerProps> = ({
  initialLat,
  initialLng,
  onLocationChange,
  readOnly = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const parsedLat = initialLat ? parseFloat(String(initialLat)) : DEFAULT_LAT;
  const parsedLng = initialLng ? parseFloat(String(initialLng)) : DEFAULT_LNG;

  const [currentLat, setCurrentLat] = useState<number>(!isNaN(parsedLat) ? parsedLat : DEFAULT_LAT);
  const [currentLng, setCurrentLng] = useState<number>(!isNaN(parsedLng) ? parsedLng : DEFAULT_LNG);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite'>('streets');
  const [statusNote, setStatusNote] = useState<string>('Geser atau klik langsung pada peta untuk memindahkan posisi pin lokasi');

  // Custom Google-style Pin Marker
  const createGooglePinIcon = () => {
    return L.divIcon({
      className: 'custom-google-pin',
      html: `
        <div style="position: relative; width: 36px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: grab;">
          <svg viewBox="0 0 384 512" width="36" height="44" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));">
            <path fill="#EA4335" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
            <circle cx="192" cy="192" r="74" fill="#FFFFFF"/>
            <circle cx="192" cy="192" r="42" fill="#005DAA"/>
          </svg>
          <div style="position: absolute; bottom: 0px; width: 10px; height: 4px; background: rgba(0,0,0,0.3); border-radius: 50%; filter: blur(1px);"></div>
        </div>
      `,
      iconSize: [36, 44],
      iconAnchor: [18, 44],
      popupAnchor: [0, -40],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const lat = !isNaN(parsedLat) ? parsedLat : DEFAULT_LAT;
    const lng = !isNaN(parsedLng) ? parsedLng : DEFAULT_LNG;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: true,
      attributionControl: false,
    });

    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    });

    streetLayer.addTo(map);

    // Add draggable marker
    const marker = L.marker([lat, lng], {
      icon: createGooglePinIcon(),
      draggable: !readOnly,
      title: 'Titik Pemasangan Sambungan Air',
    }).addTo(map);

    // Marker drag event
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      const newLat = parseFloat(position.lat.toFixed(6));
      const newLng = parseFloat(position.lng.toFixed(6));
      setCurrentLat(newLat);
      setCurrentLng(newLng);
      onLocationChange(String(newLat), String(newLng));
      setStatusNote(`Posisi diperbarui: ${newLat}, ${newLng}`);
    });

    // Map click event
    if (!readOnly) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const newLat = parseFloat(e.latlng.lat.toFixed(6));
        const newLng = parseFloat(e.latlng.lng.toFixed(6));
        marker.setLatLng([newLat, newLng]);
        setCurrentLat(newLat);
        setCurrentLng(newLng);
        onLocationChange(String(newLat), String(newLng));
        setStatusNote(`Pin dipindahkan ke: ${newLat}, ${newLng}`);
      });
    }

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Invalidate size after rendering to avoid grey tiles
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map when props change externally
  useEffect(() => {
    if (initialLat && initialLng && markerRef.current && mapInstanceRef.current) {
      const pLat = parseFloat(String(initialLat));
      const pLng = parseFloat(String(initialLng));
      if (!isNaN(pLat) && !isNaN(pLng)) {
        if (Math.abs(pLat - currentLat) > 0.0001 || Math.abs(pLng - currentLng) > 0.0001) {
          setCurrentLat(pLat);
          setCurrentLng(pLng);
          markerRef.current.setLatLng([pLat, pLng]);
          mapInstanceRef.current.panTo([pLat, pLng]);
        }
      }
    }
  }, [initialLat, initialLng]);

  // Handle Layer Toggle
  const toggleLayer = (layer: 'streets' | 'satellite') => {
    if (!mapInstanceRef.current) return;
    setMapLayer(layer);

    mapInstanceRef.current.eachLayer((l) => {
      if (l instanceof L.TileLayer) {
        mapInstanceRef.current?.removeLayer(l);
      }
    });

    if (layer === 'satellite') {
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(mapInstanceRef.current);
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }
  };

  // Jump to specific coordinates
  const jumpTo = (lat: number, lng: number, label: string) => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
    markerRef.current.setLatLng([lat, lng]);
    setCurrentLat(lat);
    setCurrentLng(lng);
    onLocationChange(String(lat), String(lng));
    setStatusNote(`Peta diarahkan ke wilayah ${label}`);
  };

  // Detect GPS Location
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung deteksi GPS.');
      return;
    }
    setIsLocating(true);
    setStatusNote('Mendeteksi sinyal GPS perangkat Anda...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        jumpTo(lat, lng, 'Lokasi GPS Anda');
        setStatusNote(`Berhasil mendeteksi lokasi GPS Anda: ${lat}, ${lng}`);
      },
      (err) => {
        setIsLocating(false);
        console.warn('GPS error:', err);
        setStatusNote('Tidak dapat mengakses GPS. Silakan klik atau geser pin manual pada peta.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-blue-200 shadow-sm">
      {/* Top Bar with Map Title and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#005DAA]" />
            Pilih Langsung di Peta Google Maps
          </span>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
            Klik di mana saja atau geser pin merah untuk menandai posisi meteran air Anda secara akurat.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Layer switcher */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => toggleLayer('streets')}
              className={`px-2.5 py-1 rounded-md transition ${
                mapLayer === 'streets'
                  ? 'bg-white text-[#005DAA] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Peta Jalan
            </button>
            <button
              type="button"
              onClick={() => toggleLayer('satellite')}
              className={`px-2.5 py-1 rounded-md transition ${
                mapLayer === 'satellite'
                  ? 'bg-white text-[#005DAA] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Satelit
            </button>
          </div>

          {/* GPS Detector button */}
          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={isLocating || readOnly}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#005DAA] hover:bg-[#004A88] text-white rounded-lg text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
            title="Deteksi posisi GPS perangkat saya saat ini"
          >
            {isLocating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Mendeteksi...</span>
              </>
            ) : (
              <>
                <LocateFixed className="w-3.5 h-3.5 text-sky-200" />
                <span>GPS Saya</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Jump Badges for Aetra Service Areas */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-semibold text-slate-600 no-scrollbar">
        <span className="text-slate-400 shrink-0">Wilayah Cepat:</span>
        {QUICK_AREAS.map((a) => (
          <button
            key={a.name}
            type="button"
            onClick={() => jumpTo(a.lat, a.lng, a.name)}
            className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#005DAA] hover:border-blue-300 border border-slate-200 shrink-0 transition"
          >
            {a.name}
          </button>
        ))}
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="relative w-full h-72 sm:h-80 rounded-xl overflow-hidden border-2 border-blue-200 shadow-inner z-0">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Instruction Banner */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-500 pointer-events-none">
          <div className="bg-slate-900/85 backdrop-blur-xs text-white text-[11px] px-3 py-1.5 rounded-xl shadow-lg flex items-center justify-between gap-2 max-w-lg mx-auto">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>
              <span className="truncate">{statusNote}</span>
            </div>
            <span className="text-[10px] text-amber-300 font-mono shrink-0 font-bold">
              {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
            </span>
          </div>
        </div>

        {/* External Google Maps Button */}
        <div className="absolute bottom-2.5 right-2.5 z-500">
          <a
            href={`https://www.google.com/maps?q=${currentLat},${currentLng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 hover:bg-white text-[#005DAA] hover:text-blue-900 rounded-xl text-[11px] font-bold shadow-md border border-slate-200 transition"
            title="Buka titik koordinat ini langsung di Google Maps"
          >
            <span>Buka di Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Manual Input Readouts (Synchronized with Map) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>Latitude (Garis Lintang)</span>
            <span className="text-[10px] text-slate-400 font-mono">Presisi GPS</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.000001"
              value={currentLat}
              disabled={readOnly}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setCurrentLat(val);
                if (!isNaN(val)) {
                  onLocationChange(String(val), String(currentLng));
                  if (markerRef.current && mapInstanceRef.current) {
                    markerRef.current.setLatLng([val, currentLng]);
                    mapInstanceRef.current.panTo([val, currentLng]);
                  }
                }
              }}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005DAA] focus:outline-hidden"
            />
            <MapPin className="w-4 h-4 text-red-500 absolute left-2.5 top-2" />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>Longitude (Garis Bujur)</span>
            <span className="text-[10px] text-slate-400 font-mono">Presisi GPS</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.000001"
              value={currentLng}
              disabled={readOnly}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setCurrentLng(val);
                if (!isNaN(val)) {
                  onLocationChange(String(currentLat), String(val));
                  if (markerRef.current && mapInstanceRef.current) {
                    markerRef.current.setLatLng([currentLat, val]);
                    mapInstanceRef.current.panTo([currentLat, val]);
                  }
                }
              }}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005DAA] focus:outline-hidden"
            />
            <MapPin className="w-4 h-4 text-red-500 absolute left-2.5 top-2" />
          </div>
        </div>
      </div>
    </div>
  );
};
