'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { IncidentCategory, IncidentSeverity } from '@/types';

interface MapMarker {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  category: IncidentCategory;
  severity: IncidentSeverity;
  risk_score: number;
}

interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  selectable?: boolean;
  selectedLocation?: [number, number] | null;
  onLocationSelect?: (lat: number, lng: number) => void;
  onMarkerClick?: (id: string) => void;
}

// Category icon map (using simple SVG shapes)
const getCategoryIconSvg = (category: IncidentCategory): string => {
  switch (category) {
    case 'Illegal Dumping':
      // Truck/Trash icon
      return `<path d="M3 16h20v4H3zm4-3h12V7H7zm2-9h8v3H9z" fill="currentColor"/>`;
    case 'Water Pollution':
      // Water droplet
      return `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="currentColor"/>`;
    case 'Deforestation':
      // Tree icon
      return `<path d="M12 2L3 17h6v5h6v-5h6z" fill="currentColor"/>`;
    case 'Wildlife Threat':
      // Paw icon
      return `<path d="M12 14c-1.66 0-3 1.34-3 3 0 2 2 3.5 3 4.5 1-1 3-2.5 3-4.5 0-1.66-1.34-3-3-3zm-4-3c-1.1 0-2 .9-2 2s1.5 2 2 3c.5-1 2-1.9 2-3s-.9-2-2-2zm8 0c-1.1 0-2 .9-2 2s1.5 2 2 3c.5-1 2-1.9 2-3s-.9-2-2-2zM8.5 7C7.67 7 7 7.67 7 8.5S8.5 11 8.5 11s1.5-1.67 1.5-2.5S9.33 7 8.5 7zm7 0c-.83 0-1.5.67-1.5 1.5S15.5 11 15.5 11s1.5-1.67 1.5-2.5S16.33 7 15.5 7z" fill="currentColor"/>`;
    case 'Air Pollution':
      // Wind/Smoke icon
      return `<path d="M2 13h15a3 3 0 0 0 0-6h-1.5M2 8h10a4 4 0 0 0 0-8H9.5M2 18h19a2 2 0 0 0 0-4H18.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>`;
    case 'Hazardous Waste':
      // Toxic/Biohazard shield
      return `<path d="M12 2L4 5v6.09C4 16.6 7.41 21.72 12 23c4.59-1.28 8-6.4 8-11.91V5zm-1 5h2v6h-2zm0 8h2v2h-2z" fill="currentColor"/>`;
    default:
      return `<circle cx="12" cy="12" r="8" fill="currentColor"/>`;
  }
};

const getSeverityColor = (severity: IncidentSeverity): string => {
  switch (severity) {
    case 'Critical': return '#f43f5e'; // rose-500
    case 'High': return '#f97316'; // orange-500
    case 'Medium': return '#eab308'; // yellow-500
    case 'Low': return '#64748b'; // slate-500
  }
};

export default function LeafletMap({
  center = [47.6062, -122.3321], // Seattle default
  zoom = 12,
  markers = [],
  selectable = false,
  selectedLocation = null,
  onLocationSelect,
  onMarkerClick,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const selectionMarkerRef = useRef<L.Marker | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create Leaflet Map instance
    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: false,
    });

    // Add CartoDB Dark Matter / Positron tiles depending on theme
    const isDark = document.documentElement.classList.contains('dark');
    
    // Using a sleek map style from CartoDB which is free and fits the dark mode dashboard perfectly!
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    markersGroupRef.current = L.layerGroup().addTo(map);

    // Click handler for location selection
    if (selectable && onLocationSelect) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        onLocationSelect(lat, lng);
      });
    }

    // Cleanup map on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Handle Selectable Location Marker changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectable) return;

    if (selectedLocation) {
      const [lat, lng] = selectedLocation;

      // Update or create selection marker
      if (selectionMarkerRef.current) {
        selectionMarkerRef.current.setLatLng([lat, lng]);
      } else {
        const pulseIcon = L.divIcon({
          className: 'custom-selection-marker',
          html: `
            <div class="relative w-7 h-7 flex items-center justify-center">
              <span class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
              <div class="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-md"></div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        selectionMarkerRef.current = L.marker([lat, lng], { icon: pulseIcon }).addTo(map);
      }

      // Smooth pan to location
      map.panTo([lat, lng]);
    } else {
      // Remove marker if null
      if (selectionMarkerRef.current) {
        selectionMarkerRef.current.remove();
        selectionMarkerRef.current = null;
      }
    }
  }, [selectedLocation, selectable]);

  // 3. Render Incident Markers
  useEffect(() => {
    const map = mapRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    // Clear previous markers
    group.clearLayers();

    markers.forEach((marker) => {
      const color = getSeverityColor(marker.severity);
      const isCritical = marker.severity === 'Critical';
      const iconSvg = getCategoryIconSvg(marker.category);

      const htmlContent = `
        <div class="custom-map-marker flex items-center justify-center rounded-full" 
             style="background-color: ${color}; width: 34px; height: 34px; border: 2.5px solid white;">
          <svg viewBox="0 0 24 24" class="w-5 h-5 text-white" style="filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.4))">
            ${iconSvg}
          </svg>
          ${isCritical ? `<div class="absolute inset-0 rounded-full animate-ping opacity-50 bg-rose-500 -z-10" style="transform: scale(1.4)"></div>` : ''}
        </div>
      `;

      const markerIcon = L.divIcon({
        className: 'bg-transparent',
        html: htmlContent,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const leafletMarker = L.marker([marker.latitude, marker.longitude], { icon: markerIcon });

      // Click callback
      if (onMarkerClick) {
        leafletMarker.on('click', () => {
          onMarkerClick(marker.id);
        });
      }

      // Add a popup preview
      const popupHtml = `
        <div class="p-2.5 max-w-[200px] flex flex-col gap-1.5 font-sans">
          <div class="flex items-center gap-1.5">
            <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
              marker.severity === 'Critical' ? 'bg-rose-500/20 text-rose-500' :
              marker.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
              marker.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
              'bg-slate-500/20 text-slate-400'
            }">${marker.severity}</span>
            <span class="text-[9px] text-muted-foreground font-semibold">${marker.category}</span>
          </div>
          <h4 class="font-bold text-sm leading-tight text-foreground truncate">${marker.title}</h4>
          <div class="flex justify-between items-center text-[10px] text-muted-foreground pt-1.5 border-t border-border">
            <span>Risk Score: <strong class="text-foreground">${marker.risk_score}</strong></span>
            <span class="text-emerald-400 font-bold hover:underline cursor-pointer">View Details &rarr;</span>
          </div>
        </div>
      `;

      leafletMarker.bindPopup(popupHtml, {
        closeButton: false,
        offset: [0, -10]
      });

      group.addLayer(leafletMarker);
    });
  }, [markers, onMarkerClick]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-border shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
