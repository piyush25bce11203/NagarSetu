/**
 * LocationPicker — interactive Leaflet map for ReportScreen.
 * User taps anywhere on the map to drop a pin and set complaint coordinates.
 * Starts centred on the user's district. Calls onPick({ lat, lng }) on each tap.
 */
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, LocateFixed } from 'lucide-react';
import { getDistrictCenter } from '../utils/mapConfig';

interface Coords { lat: number; lng: number; }

interface LocationPickerProps {
  district: string;
  initialCoords?: Coords;
  onPick: (coords: Coords) => void;
}

// Leaflet default icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const pinIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:32px;height:32px;border-radius:50% 50% 50% 0;
    background:#16a34a;border:3px solid white;
    box-shadow:0 2px 8px rgba(0,0,0,0.4);
    transform:rotate(-45deg);
  "></div>`,
  iconSize:   [32, 32],
  iconAnchor: [16, 32],
});

export function LocationPicker({ district, initialCoords, onPick }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const markerRef    = useRef<L.Marker | null>(null);
  const [picked, setPicked] = useState<Coords | null>(initialCoords ?? null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }

    // getDistrictCenter returns [lng, lat]
    const [lng, lat] = getDistrictCenter(district);
    const center = initialCoords ?? { lat, lng };

    const map = L.map(containerRef.current, {
      center:          [center.lat, center.lng],
      zoom:            14,
      zoomControl:     true,
      scrollWheelZoom: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // If we already have coords, drop initial marker
    if (initialCoords) {
      markerRef.current = L.marker([initialCoords.lat, initialCoords.lng], { icon: pinIcon }).addTo(map);
    }

    // Tap / click → move pin
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      // Remove old marker
      if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }
      // Place new marker
      markerRef.current = L.marker([lat, lng], { icon: pinIcon })
        .addTo(map)
        .bindPopup('📍 Complaint location')
        .openPopup();
      const coords = { lat, lng };
      setPicked(coords);
      onPick(coords);
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [district, initialCoords, onPick]); // reinit only on district change; initialCoords/onPick stable refs included to satisfy exhaustive-deps

  // Re-centre to GPS location
  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      mapRef.current!.setView([lat, lng], 16);
      if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }
      markerRef.current = L.marker([lat, lng], { icon: pinIcon })
        .addTo(mapRef.current!)
        .bindPopup('📍 Your location')
        .openPopup();
      const coords = { lat, lng };
      setPicked(coords);
      onPick(coords);
    });
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Instructions bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-primary/5 border-b border-gray-200">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span>Tap on the map to pin the complaint location</span>
        </div>
        <button
          type="button"
          onClick={handleLocateMe}
          className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
        >
          <LocateFixed className="w-3.5 h-3.5" /> Use GPS
        </button>
      </div>

      {/* Map canvas */}
      <div ref={containerRef} style={{ height: '220px', width: '100%' }} />

      {/* Picked coordinates display */}
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center gap-1">
        {picked ? (
          <>
            <MapPin className="w-3 h-3 text-green-600 flex-shrink-0" />
            <span className="text-green-700 font-medium">
              {picked.lat.toFixed(5)}, {picked.lng.toFixed(5)}
            </span>
          </>
        ) : (
          <span className="text-gray-400 italic">No location selected yet</span>
        )}
      </div>
    </div>
  );
}
