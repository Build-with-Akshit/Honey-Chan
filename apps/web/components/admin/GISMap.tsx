"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const CLUSTERS = [
  { name: "Sonipat Honey Cluster", lat: 28.9931, lng: 77.0151, hives: 1200, health: 87, production: 4.8, status: "HEALTHY" },
  { name: "Moradabad Cluster", lat: 28.8386, lng: 78.7733, hives: 890, health: 82, production: 3.6, status: "WARNING" },
  { name: "Alwar Cluster", lat: 27.5530, lng: 76.6346, hives: 1450, health: 90, production: 5.2, status: "HEALTHY" },
  { name: "Pune Cluster", lat: 18.5204, lng: 73.8567, hives: 680, health: 65, production: 1.8, status: "CRITICAL" },
  { name: "Kangra Cluster", lat: 32.0998, lng: 76.2691, hives: 940, health: 88, production: 3.9, status: "HEALTHY" },
  { name: "Ranchi Cluster", lat: 23.3441, lng: 85.3096, hives: 520, health: 81, production: 2.1, status: "WARNING" },
];

export default function GISMap() {
  // Fix Leaflet CSS issues in Next.js
  useEffect(() => {
    // This is needed for leaflet markers if we were using them, but we are using CircleMarker
  }, []);

  return (
    <MapContainer 
      center={[23.0, 78.0]} 
      zoom={5} 
      className="w-full h-full rounded-xl z-0"
      zoomControl={false}
      scrollWheelZoom={false}
    >
      {/* High contrast dark tile layer (CartoDB Dark Matter) */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {CLUSTERS.map((cluster, i) => {
        const color = cluster.status === "HEALTHY" ? "#22c55e" : cluster.status === "WARNING" ? "#f59e0b" : "#ef4444";
        const fillColor = cluster.status === "HEALTHY" ? "#15803d" : cluster.status === "WARNING" ? "#b45309" : "#b91c1c";
        
        return (
          <CircleMarker
            key={i}
            center={[cluster.lat, cluster.lng]}
            radius={Math.sqrt(cluster.hives) / 2}
            pathOptions={{ 
              color: color, 
              fillColor: fillColor, 
              fillOpacity: 0.6,
              weight: 2
            }}
          >
            <Tooltip 
              direction="top" 
              offset={[0, -10]} 
              opacity={1}
              className="custom-leaflet-tooltip"
            >
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-gray-900 border-b pb-1 mb-2">{cluster.name}</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500 block">Active Hives</span>
                    <span className="font-bold">{cluster.hives.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Avg Health</span>
                    <span className={`font-bold ${
                      cluster.health >= 85 ? "text-green-600" : 
                      cluster.health >= 75 ? "text-amber-600" : "text-red-600"
                    }`}>{cluster.health}%</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 block">Status</span>
                    <span className="font-bold">{cluster.status}</span>
                  </div>
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
