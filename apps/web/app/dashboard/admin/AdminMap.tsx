"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon issue with Next.js/Webpack
import L from "leaflet";
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = icon;

export default function AdminMap({ clusters }: { clusters: any[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[400px] w-full bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">Loading Map...</div>;
  }

  // Define some mock coordinates based on cluster names if they lack real coordinates
  const getCoordinates = (clusterName: string): [number, number] => {
    if (clusterName.toLowerCase().includes("haryana")) return [29.0588, 76.0856];
    if (clusterName.toLowerCase().includes("punjab")) return [31.1471, 75.3412];
    if (clusterName.toLowerCase().includes("uttar pradesh") || clusterName.includes("UP")) return [26.8467, 80.9462];
    if (clusterName.toLowerCase().includes("kerala")) return [10.8505, 76.2711];
    return [22.9734, 78.6569]; // Default central India
  };

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 relative z-0">
      <MapContainer 
        center={[22.9734, 78.6569]} 
        zoom={4} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {clusters.map((cluster) => {
          const coords = getCoordinates(cluster.name);
          return (
            <CircleMarker
              key={cluster.name}
              center={coords}
              radius={Math.max(8, cluster.batches / 2)}
              pathOptions={{
                color: cluster.avgHealth >= 85 ? "#059669" : "#d97706",
                fillColor: cluster.avgHealth >= 85 ? "#10b981" : "#f59e0b",
                fillOpacity: 0.6,
                weight: 2
              }}
            >
              <Popup>
                <div className="font-sans">
                  <h3 className="font-bold text-gray-900">{cluster.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{cluster.state}</p>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <span className="text-gray-500">Beekeepers:</span>
                    <span className="font-semibold">{cluster.totalBeekeepers}</span>
                    
                    <span className="text-gray-500">Hives:</span>
                    <span className="font-semibold">{cluster.totalHives}</span>
                    
                    <span className="text-gray-500">Health:</span>
                    <span className={`font-bold ${cluster.avgHealth >= 85 ? "text-green-600" : "text-amber-600"}`}>
                      {cluster.avgHealth}%
                    </span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
