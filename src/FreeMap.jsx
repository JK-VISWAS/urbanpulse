import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icon markers not showing up
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const FreeMap = ({ reports }) => {
  const indiaCenter = [20.5937, 78.9629]; // Central India

  return (
    // Ensure the container has a defined height
    <div style={{ height: "400px", width: "100%" }}>
      <MapContainer center={indiaCenter} zoom={5} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {reports.map((report) => (
          report.location && (
            <Marker key={report.id} position={[report.location.lat, report.location.lng]}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">{report.title}</h3>
                  <p className="text-sm">{report.category}</p>
                  <span className={`text-[10px] uppercase font-bold ${report.status === 'Resolved' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {report.status}
                  </span>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default FreeMap;