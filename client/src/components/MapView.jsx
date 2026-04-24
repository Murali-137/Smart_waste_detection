import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issues with React
const getIcon = (status) => {
    let color = 'blue';
    if (status === 'Critical') color = 'red';
    if (status === 'Moderate') color = 'orange';
    if (status === 'Cleaned') color = 'green';
    
    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: '[https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png](https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png)',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
};

const MapView = ({ reports }) => {
    // Default to Visakhapatnam
    const center = [17.7292, 83.3151];

    return (
        <div className="flex-1 bg-gray-200 relative h-full">
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap"
                />
                
                {reports.filter(r => r.status !== 'Pending AI').map(report => (
                    <Marker 
                        key={report._id || report.id} 
                        position={[report.coordinates.lat, report.coordinates.lng]} 
                        icon={getIcon(report.status)}
                    >
                        <Popup>
                            <strong>{report.locationName}</strong><br/>
                            Status: {report.status}<br/>
                            {report.densityScore && `Density: ${report.densityScore}%`}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapView;
