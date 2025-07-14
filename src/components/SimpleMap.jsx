import React, { useEffect, useRef } from 'react';

export default function SimpleMap({ 
  center = { lat: 0, lng: 0 }, 
  markers = [], 
  zoom = 13,
  width = '100%',
  height = '300px'
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    
    script.onload = () => {
      if (window.L && mapRef.current) {
        const map = window.L.map(mapRef.current).setView([center.lat, center.lng], zoom);
        
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add markers
        markers.forEach((marker, index) => {
          const leafletMarker = window.L.marker([marker.lat, marker.lng])
            .addTo(map)
            .bindPopup(marker.popup || `Location ${index + 1}`);

          if (marker.color) {
            leafletMarker.setIcon(window.L.divIcon({
              className: 'custom-marker',
              html: `<div style="background-color: ${marker.color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
              iconSize: [20, 20]
            }));
          }
        });

        // Fit bounds if multiple markers
        if (markers.length > 1) {
          const bounds = window.L.latLngBounds(markers.map(m => [m.lat, m.lng]));
          map.fitBounds(bounds);
        }

        mapInstance.current = map;
      }
    };

    document.head.appendChild(script);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
    };
  }, [center, markers, zoom]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width, 
        height, 
        border: '1px solid #ccc',
        borderRadius: '8px'
      }}
    />
  );
} 