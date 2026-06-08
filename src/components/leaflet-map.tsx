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

interface ForecastMarker {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  category: IncidentCategory;
  predicted_risk: number;
  confidence: number;
  threat_growth_pct: number;
  description: string;
}

interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  forecastMarkers?: ForecastMarker[];
  showForecastLayer?: boolean;
  selectable?: boolean;
  selectedLocation?: [number, number] | null;
  onLocationSelect?: (lat: number, lng: number) => void;
  onMarkerClick?: (id: string) => void;
}

// Custom Category SVGs
const getCategoryIconSvg = (category: IncidentCategory): string => {
  switch (category) {
    case 'Illegal Dumping':
      return `<path d="M3 16h20v4H3zm4-3h12V7H7zm2-9h8v3H9z" fill="currentColor"/>`;
    case 'Water Pollution':
      return `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="currentColor"/>`;
    case 'Air Pollution':
      return `<path d="M2 13h15a3 3 0 0 0 0-6h-1.5M2 8h10a4 4 0 0 0 0-8H9.5M2 18h19a2 2 0 0 0 0-4H18.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`;
    case 'Deforestation':
      return `<path d="M12 2L3 17h6v5h6v-5h6z" fill="currentColor"/>`;
    case 'Wildlife Threats':
      return `<path d="M12 14c-1.66 0-3 1.34-3 3 0 2 2 3.5 3 4.5 1-1 3-2.5 3-4.5 0-1.66-1.34-3-3-3zm-4-3c-1.1 0-2 .9-2 2s1.5 2 2 3c.5-1 2-1.9 2-3s-.9-2-2-2zm8 0c-1.1 0-2 .9-2 2s1.5 2 2 3c.5-1 2-1.9 2-3s-.9-2-2-2zM8.5 7C7.67 7 7 7.67 7 8.5S8.5 11 8.5 11s1.5-1.67 1.5-2.5S9.33 7 8.5 7zm7 0c-.83 0-1.5.67-1.5 1.5S15.5 11 15.5 11s1.5-1.67 1.5-2.5S16.33 7 15.5 7z" fill="currentColor"/>`;
    case 'Hazardous Waste':
      return `<path d="M12 2L4 5v6.09C4 16.6 7.41 21.72 12 23c4.59-1.28 8-6.4 8-11.91V5zm-1 5h2v6h-2zm0 8h2v2h-2z" fill="currentColor"/>`;
    default:
      return `<circle cx="12" cy="12" r="8" fill="currentColor"/>`;
  }
};

const getSeverityColor = (severity: IncidentSeverity): string => {
  switch (severity) {
    case 'Critical': return '#ef4444';  // rose-500
    case 'High': return '#f97316';      // orange-500
    case 'Moderate': return '#eab308';  // yellow-500
    case 'Low': return '#64748b';       // slate-500
  }
};

export default function LeafletMap({
  center = [47.6062, -122.3321],
  zoom = 12,
  markers = [],
  forecastMarkers = [],
  showForecastLayer = false,
  selectable = false,
  selectedLocation = null,
  onLocationSelect,
  onMarkerClick,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const selectionMarkerRef = useRef<L.Marker | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const forecastGroupRef = useRef<L.LayerGroup | null>(null);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: false,
    });

    const isDark = document.documentElement.classList.contains('dark');
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    markersGroupRef.current = L.layerGroup().addTo(map);
    forecastGroupRef.current = L.layerGroup().addTo(map);

    if (selectable && onLocationSelect) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        onLocationSelect(lat, lng);
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Handle Location Pin selection
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectable) return;

    if (selectedLocation) {
      const [lat, lng] = selectedLocation;

      if (selectionMarkerRef.current) {
        selectionMarkerRef.current.setLatLng([lat, lng]);
      } else {
        const selectionIcon = L.divIcon({
          className: 'custom-selection-marker',
          html: `
            <div class="relative w-8 h-8 flex items-center justify-center">
              <span class="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping"></span>
              <div class="w-4.5 h-4.5 bg-cyan-500 rounded-full border-2 border-white shadow-md"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        selectionMarkerRef.current = L.marker([lat, lng], { icon: selectionIcon }).addTo(map);
      }
      map.panTo([lat, lng]);
    } else {
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

    group.clearLayers();

    markers.forEach((marker) => {
      const color = getSeverityColor(marker.severity);
      const isCritical = marker.severity === 'Critical';
      const iconSvg = getCategoryIconSvg(marker.category);

      const htmlContent = `
        <div class="custom-map-marker flex items-center justify-center rounded-full" 
             style="background-color: ${color}; width: 34px; height: 34px; border: 2.5px solid white;">
          <svg viewBox="0 0 24 24" class="w-5 h-5 text-white" style="filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.45))">
            ${iconSvg}
          </svg>
          ${isCritical ? `<div class="absolute inset-0 rounded-full animate-ping opacity-40 bg-rose-500 -z-10" style="transform: scale(1.4)"></div>` : ''}
        </div>
      `;

      const markerIcon = L.divIcon({
        className: 'bg-transparent',
        html: htmlContent,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const leafletMarker = L.marker([marker.latitude, marker.longitude], { icon: markerIcon });

      if (onMarkerClick) {
        leafletMarker.on('click', () => onMarkerClick(marker.id));
      }

      const popupHtml = `
        <div class="p-2.5 max-w-[220px] flex flex-col gap-1.5 font-sans">
          <div class="flex items-center gap-1.5">
            <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
              marker.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400' :
              marker.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
              marker.severity === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-slate-500/20 text-slate-400'
            }">${marker.severity}</span>
            <span class="text-[9px] text-muted-foreground font-semibold">${marker.category}</span>
          </div>
          <h4 class="font-bold text-sm leading-tight text-foreground truncate">${marker.title}</h4>
          <div class="flex justify-between items-center text-[10px] text-muted-foreground pt-1.5 border-t border-border">
            <span>Risk Score: <strong class="text-foreground">${marker.risk_score}</strong></span>
            <span class="text-cyan-400 font-bold hover:underline cursor-pointer">Explore &rarr;</span>
          </div>
        </div>
      `;

      leafletMarker.bindPopup(popupHtml, { closeButton: false, offset: [0, -10] });
      group.addLayer(leafletMarker);
    });
  }, [markers, onMarkerClick]);

  // 4. Render Predictive Hotspot Layer
  useEffect(() => {
    const map = mapRef.current;
    const group = forecastGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (showForecastLayer) {
      forecastMarkers.forEach((marker) => {
        const iconSvg = getCategoryIconSvg(marker.category);
        
        // Custom dashed cyan radar-like forecast markers
        const htmlContent = `
          <div class="relative w-9 h-9 flex items-center justify-center rounded-full border border-dashed border-cyan-400 bg-cyan-950/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <svg viewBox="0 0 24 24" class="w-4.5 h-4.5">
              ${iconSvg}
            </svg>
            <span class="absolute inline-flex h-full w-full rounded-full border border-cyan-400/50 opacity-60 animate-ping" style="animation-duration: 2.5s"></span>
          </div>
        `;

        const forecastIcon = L.divIcon({
          className: 'bg-transparent',
          html: htmlContent,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const leafletMarker = L.marker([marker.latitude, marker.longitude], { icon: forecastIcon });

        const popupHtml = `
          <div class="p-3 max-w-[240px] flex flex-col gap-2 font-sans border-t-2 border-cyan-500">
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-cyan-500/20 text-cyan-400">AI Projected Hotspot</span>
              <span class="text-[9px] text-rose-400 font-bold">+${marker.threat_growth_pct}% Risk Growth</span>
            </div>
            <h4 class="font-bold text-sm leading-tight text-foreground">${marker.title}</h4>
            <p class="text-[10px] leading-relaxed text-muted-foreground">${marker.description}</p>
            <div class="flex justify-between items-center text-[10px] text-muted-foreground pt-1.5 border-t border-border">
              <span>Confidence: <strong class="text-foreground">${marker.confidence}%</strong></span>
              <span>Risk: <strong class="text-cyan-400">${marker.predicted_risk}%</strong></span>
            </div>
          </div>
        `;

        leafletMarker.bindPopup(popupHtml, { closeButton: false, offset: [0, -10] });
        group.addLayer(leafletMarker);
      });
    }
  }, [forecastMarkers, showForecastLayer]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-border shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
