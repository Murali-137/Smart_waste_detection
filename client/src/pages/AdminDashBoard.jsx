import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const getIcon = (status) => {
    let color = 'blue';
    if (status === 'Critical') color = 'red';
    if (status === 'Moderate') color = 'orange';
    if (status === 'Cleaned') color = 'green';
    
    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
};

const truckIcon = new L.DivIcon({
    html: '<div class="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg border-2 border-blue-500 animate-pulse"><i class="fa-solid fa-truck-front text-blue-600 text-lg"></i></div>',
    className: 'custom-truck-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

const AdminDashboard = () => {
    const rawReports = useSelector((state) => state.reports.data);
    const [detailedPinId, setDetailedPinId] = useState(null);
    const [localDispatched, setLocalDispatched] = useState([]); 

    const adminReports = rawReports.map(r => {
        const imageUrl = r.imageUrl?.startsWith('http') ? r.imageUrl : `http://localhost:5000/${r.imageUrl}`;
        const jitterLat = (Math.random() - 0.5) * 0.003;
        const jitterLng = (Math.random() - 0.5) * 0.003;
        const isDispatchedLocally = localDispatched.includes(r._id);

        return {
            id: r._id,
            location: r.locationName,
            status: isDispatchedLocally ? 'Dispatched' : r.status,
            density: r.densityScore || 0,
            reportsCount: r.clusterCount || 1,
            img: imageUrl,
            time: new Date(r.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            lat: (r.coordinates?.lat || 17.7292) + jitterLat,
            lng: (r.coordinates?.lng || 83.3151) + jitterLng
        };
    }).filter(r => r.status !== 'Pending AI');

    const getPinStyles = (status) => {
        switch(status) {
            case 'Critical': return { bg: 'bg-red-600', text: 'text-red-700', lightBg: 'bg-red-100', hoverBg: 'hover:bg-red-700' };
            case 'Moderate': return { bg: 'bg-orange-500', text: 'text-orange-700', lightBg: 'bg-orange-100', hoverBg: 'hover:bg-orange-600' };
            case 'Dispatched': return { bg: 'bg-blue-600', text: 'text-blue-700', lightBg: 'bg-blue-100', hoverBg: 'hover:bg-blue-700' };
            case 'Cleaned': return { bg: 'bg-green-500', text: 'text-green-700', lightBg: 'bg-green-100', hoverBg: 'hover:bg-green-600' };
            default: return { bg: 'bg-gray-500', text: 'text-gray-700', lightBg: 'bg-gray-100', hoverBg: 'hover:bg-gray-600' };
        }
    };

    const detailedPin = adminReports.find(r => r.id === detailedPinId);
    const detailedStyles = detailedPin ? getPinStyles(detailedPin.status) : null;

    const handleDispatch = (id) => {
        setLocalDispatched([...localDispatched, id]);
        setDetailedPinId(null); 
    };

    const mapCenter = [17.7292, 83.3151];

    return (
        <div className="flex-1 flex overflow-hidden bg-gray-100 h-[calc(100vh-70px)] fade-in">
            
            <div className="w-96 bg-white border-r border-gray-200 flex flex-col shadow-lg z-10">
                <div className="p-5 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 mb-1">Live Action Queue</h2>
                    <p className="text-xs text-gray-500">Filtered by Severity Score</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {adminReports.length === 0 && <p className="text-sm text-gray-500 text-center mt-10">No active reports.</p>}
                    {adminReports.map(report => {
                        const styles = getPinStyles(report.status);
                        return (
                            <div key={report.id} className={`border rounded-lg p-4 relative overflow-hidden transition-all ${report.status === 'Cleaned' ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-gray-200 shadow-sm'}`}>
                                <div className={`absolute top-0 left-0 w-1 h-full ${styles.bg}`}></div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`${styles.lightBg} ${styles.text} text-xs font-bold px-2 py-1 rounded`}>
                                        {report.status === 'Dispatched' ? <><i className="fa-solid fa-truck-fast mr-1"></i> Dispatched</> : `${report.status} (${report.density}%)`}
                                    </span>
                                    <span className="text-xs text-gray-500">{report.time}</span>
                                </div>
                                <h3 className="font-bold text-gray-800 text-sm mb-1">{report.location}</h3>
                                {report.reportsCount > 1 && (
                                    <p className="text-xs text-blue-600 font-bold bg-blue-50 inline-block px-2 py-1 rounded mb-3">
                                        <i className="fa-solid fa-users mr-1"></i> Clustered: {report.reportsCount} User Reports
                                    </p>
                                )}
                                {report.reportsCount <= 1 && <div className="h-2"></div>}
                                <button onClick={() => setDetailedPinId(report.id)} className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold py-2 rounded transition shadow-sm mt-2">
                                    Review Full Report
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 relative z-0">
                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    
                    {adminReports.map(report => (
                        <Marker 
                            key={report.id} 
                            position={[report.lat, report.lng]}
                            icon={report.status === 'Dispatched' ? truckIcon : getIcon(report.status)}
                        >
                            <Popup>
                                <div className="w-48">
                                    <img src={report.img} alt="Waste" className="w-full h-24 object-cover rounded mb-2" />
                                    <h4 className="font-bold text-gray-800 text-xs mb-1">{report.location}</h4>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-gray-200">{report.status}</span>
                                        <span className="text-[10px] text-gray-500 font-bold">{report.density}% Density</span>
                                    </div>
                                    <button onClick={() => setDetailedPinId(report.id)} className="w-full bg-gray-800 hover:bg-gray-900 text-white text-[10px] font-bold py-1.5 rounded transition shadow">
                                        View AI Report
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {detailedPin && detailedStyles && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/70 backdrop-blur-sm p-4 fade-in" onClick={() => setDetailedPinId(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row transition-all" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Image Side - Fake CSS Box Removed! */}
                        <div className="md:w-3/5 bg-gray-900 relative min-h-[300px] flex items-center justify-center overflow-hidden">
                            <img src={detailedPin.img} alt="Street View" className="absolute w-full h-full object-cover" />
                        </div>

                        {/* Details Side */}
                        <div className="md:w-2/5 p-6 md:p-8 flex flex-col bg-gray-50 relative">
                            <button onClick={() => setDetailedPinId(null)} className="absolute top-4 right-4 w-8 h-8 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full flex items-center justify-center transition"><i className="fa-solid fa-times"></i></button>
                            <div className="mb-6">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Report ID: #{detailedPin.id.toString().slice(-6)}</p>
                                <h2 className="text-2xl font-black text-gray-900 leading-tight mb-2">{detailedPin.location}</h2>
                                <span className={`inline-block ${detailedStyles.lightBg} ${detailedStyles.text} text-xs font-bold px-3 py-1 rounded-full uppercase`}>Priority: {detailedPin.status}</span>
                            </div>
                            <div className="space-y-4 mb-8 flex-1">
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Waste Density</p>
                                        <p className="text-xl font-black text-gray-800">{detailedPin.density}% Cover</p>
                                    </div>
                                    <i className="fa-solid fa-chart-pie text-3xl text-gray-200"></i>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Deduplication Engine</p>
                                    <div className="flex items-center gap-2">
                                        <i className="fa-solid fa-tower-broadcast text-blue-500"></i>
                                        <p className="text-sm font-bold text-gray-700">Clustered {detailedPin.reportsCount} citizen uploads.</p>
                                    </div>
                                </div>
                            </div>
                            
                            {detailedPin.status !== 'Cleaned' && detailedPin.status !== 'Dispatched' && (
                                <button onClick={() => handleDispatch(detailedPin.id)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition flex justify-center items-center gap-2">
                                    <i className="fa-solid fa-truck-fast"></i> Dispatch Cleanup Unit
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;