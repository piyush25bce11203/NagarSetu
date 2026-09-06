/**
 * MiniMap — read-only Leaflet map showing a single marker at given coordinates.
 * Used in StaffPortal detail drawer to display where a complaint was filed.
 */
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MiniMapProps {
  lat: number;
  lng: number;
  label?: string;
  className?: string;
}

// Leaflet default icon fix (webpack asset issue)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export function MiniMap({ lat, lng, label, className }: MiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // Prevent double-init on StrictMode re-mount
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }

    const map = L.map(containerRef.current, {
      center:          [lat, lng],
      zoom:            15,
      zoomControl:     false,
      scrollWheelZoom: false,
      dragging:        false,
      doubleClickZoom: false,
      boxZoom:         false,
      keyboard:        false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Red pin marker
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:28px;height:28px;border-radius:50% 50% 50% 0;
        background:#ef4444;border:3px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,0.4);
        transform:rotate(-45deg);
      "></div>`,
      iconSize:   [28, 28],
      iconAnchor: [14, 28],
    });

    const marker = L.marker([lat, lng], { icon }).addTo(map);
    if (label) marker.bindPopup(label).openPopup();

    // Small attribution bottom-right
    L.control.attribution({ prefix: false, position: 'bottomright' }).addTo(map);

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [lat, lng, label]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ borderRadius: '0.75rem', overflow: 'hidden' }}
    />
  );
}
