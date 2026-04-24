import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addReportLocal } from '../redux/reportSlice';

const UploadForm = () => {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleUpload = () => {
        setLoading(true);
        
        // 1. Get user GPS Coordinates
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const payload = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    locationName: "New GPS Upload", // In a real app, reverse-geocode this
                    imageUrl: "[https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=300](https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=300)" // Mock image URL
                };

                try {
                    // 2. Post to Express backend
                    const res = await axios.post('http://localhost:5000/api/reports/upload', payload);
                    
                    // 3. Update Redux store
                    dispatch(addReportLocal(res.data.report));
                    alert(res.data.message); // Will show "Duplicate detected" if clustered!
                } catch (error) {
                    console.error("Upload failed", error);
                } finally {
                    setLoading(false);
                }
            });
        } else {
            alert("Geolocation is not supported by this browser.");
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border p-6 text-center">
            <h2 className="text-xl font-bold text-green-600 mb-2">Report Waste</h2>
            <p className="text-sm text-gray-500 mb-4">Upload an image. Our AI will analyze the severity.</p>
            <button 
                onClick={handleUpload} 
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
            >
                {loading ? 'Uploading & Analyzing...' : <><i className="fa-solid fa-camera mr-2"></i> Take Photo</>}
            </button>
        </div>
    );
};

export default UploadForm;
