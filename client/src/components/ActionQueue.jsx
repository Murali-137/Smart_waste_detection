import React from 'react';

const ActionQueue = ({ reports }) => {
    // Filter out 'Pending AI' items for the Admin view
    const adminReports = reports.filter(r => r.status !== 'Pending AI');

    return (
        <div className="w-1/3 bg-white border-r overflow-y-auto p-4 h-full">
            <h2 className="font-bold text-lg mb-4">Live Dispatch Queue</h2>
            {adminReports.length === 0 && <p className="text-gray-400 text-sm">No active reports.</p>}
            
            {adminReports.map(report => (
                <div key={report._id || report.id} className="border p-4 rounded-lg mb-3 shadow-sm bg-white">
                    <div className="flex justify-between mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                            report.status === 'Critical' ? 'bg-red-100 text-red-700' :
                            report.status === 'Moderate' ? 'bg-orange-100 text-orange-700' :
                            report.status === 'Cleaned' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                            {report.status}
                        </span>
                        {report.clusterCount > 1 && (
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 rounded">
                                <i className="fa-solid fa-users mr-1"></i> {report.clusterCount}
                            </span>
                        )}
                    </div>
                    <h3 className="font-bold text-sm mb-2">{report.locationName}</h3>
                    <button className="w-full bg-gray-50 hover:bg-gray-100 border text-gray-700 text-xs font-bold py-2 rounded transition">
                        View Full AI Report
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ActionQueue;
