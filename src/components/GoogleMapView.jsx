import React, { useEffect, useRef, useState } from 'react';
import { GOOGLE_MAPS_CONFIG } from '../config/maps';

export default function GoogleMapView({ 
  center, 
  markers = [], 
  zoom = 14, 
  height = "400px",
  onMapLoad,
  showDirections = false,
  routePoints = []
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);

  useEffect(() => {
    // Load Google Maps API
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_CONFIG.API_KEY}&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const mapOptions = {
      center: new window.google.maps.LatLng(center.lat, center.lng),
      zoom: zoom,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: GOOGLE_MAPS_CONFIG.MAP_STYLES
    };

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
    
    // Initialize directions service if needed
    if (showDirections) {
      directionsServiceRef.current = new window.google.maps.DirectionsService();
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#5C2D91',
          strokeWeight: 4
        }
      });
      directionsRendererRef.current.setMap(mapInstanceRef.current);
    }

    if (onMapLoad) {
      onMapLoad(mapInstanceRef.current);
    }
  };

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData, index) => {
      const marker = new window.google.maps.Marker({
        position: new window.google.maps.LatLng(markerData.lat, markerData.lng),
        map: mapInstanceRef.current,
        title: markerData.popup || `Marker ${index + 1}`,
        icon: {
          url: getMarkerIcon(markerData.color || '#5C2D91'),
          scaledSize: new window.google.maps.Size(32, 32),
          origin: new window.google.maps.Point(0, 0),
          anchor: new window.google.maps.Point(16, 32)
        },
        animation: markerData.isBus ? window.google.maps.Animation.BOUNCE : null
      });

      // Add info window
      if (markerData.popup) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h4 style="margin: 0 0 8px 0; color: #5C2D91;">${markerData.popup}</h4>
              ${markerData.details ? `<p style="margin: 0; font-size: 12px; color: #666;">${markerData.details}</p>` : ''}
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });
      }

      markersRef.current.push(marker);
    });

    // Show directions if route points are provided
    if (showDirections && routePoints.length >= 2 && directionsServiceRef.current) {
      const request = {
        origin: new window.google.maps.LatLng(routePoints[0].lat, routePoints[0].lng),
        destination: new window.google.maps.LatLng(routePoints[1].lat, routePoints[1].lng),
        travelMode: window.google.maps.TravelMode.DRIVING
      };

      directionsServiceRef.current.route(request, (result, status) => {
        if (status === 'OK') {
          directionsRendererRef.current.setDirections(result);
        }
      });
    }
  }, [markers, showDirections, routePoints]);

  const getMarkerIcon = (color) => {
    // Create custom marker SVG based on color
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    `)}`;
  };

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: height,
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    />
  );
} 