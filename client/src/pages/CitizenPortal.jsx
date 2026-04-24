import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import exifr from 'exifr'; // <-- Import the new EXIF reader
import { fetchReports } from '../redux/reportSlice';

const CitizenPortal = () => {
    const reports = useSelector((state) => state.reports.data);
    const dispatch = useDispatch();
    
    const [isUploading, setIsUploading] = useState(false);
    const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert("Please select a photo from your PC first!");
            return;
        }

        setShowDuplicateAlert(false);
        setIsUploading(true);

        try {
            let finalLat = null;
            let finalLng = null;
            let locationSource = "";

            // 1. ATTEMPT EXIF EXTRACTION FIRST
            const exifData = await exifr.gps(selectedFile);
            
            if (exifData) {
                finalLat = exifData.latitude;
                finalLng = exifData.longitude;
                locationSource = "Extracted from Image GPS";
                console.log("📍 Location found inside image:", finalLat, finalLng);
                
                // Proceed directly to upload
                await submitToBackend(finalLat, finalLng, locationSource);
            } 
            // 2. FALLBACK TO BROWSER LOCATION IF NO EXIF DATA
            else {
                console.log("No GPS found in image. Asking browser for location...");
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                        finalLat = position.coords.latitude;
                        finalLng = position.coords.longitude;
                        locationSource = "PC Wi-Fi Location";
                        await submitToBackend(finalLat, finalLng, locationSource);
                    }, (error) => {
                        alert("Image has no GPS, and you denied browser location. Cannot upload.");
                        setIsUploading(false);
                    });
                } else {
                    alert("Geolocation is not supported by your browser.");
                    setIsUploading(false);
                }
            }
        } catch (error) {
            console.error("Error processing file:", error);
            setIsUploading(false);
        }
    };

    // Helper function to handle the actual API call
    const submitToBackend = async (lat, lng, source) => {
        const formData = new FormData();
        formData.append('image', selectedFile); 
        formData.append('lat', lat);
        formData.append('lng', lng);
        formData.append('locationName', source);

        try {
            const res = await axios.post('http://localhost:5000/api/reports/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (res.data.message.includes('Duplicate')) {
                setShowDuplicateAlert(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert(`Upload Successful! Location used: ${source}`);
            }
            
            setSelectedFile(null); 
            dispatch(fetchReports()); 
            
        } catch (error) {
            console.error(error);
            alert("Upload Failed. Make sure Node and Python servers are running.");
        } finally {
            setIsUploading(false);
            setTimeout(() => setShowDuplicateAlert(false), 5000);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-8 p-4 w-full fade-in">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-green-600 p-6 text-white text-center relative overflow-hidden">
                    <i className="fa-solid fa-leaf absolute opacity-10 text-6xl -right-4 -bottom-4"></i>
                    <h2 className="text-2xl font-bold mb-1">Report Street Waste</h2>
                    <p className="text-green-100 text-sm">Help keep Visakhapatnam clean.</p>
                </div>
                <div className="p-6">
                    {showDuplicateAlert && (
                        <div className="fade-in bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded mb-6 text-sm shadow-sm">
                            <p className="font-bold"><i className="fa-solid fa-circle-info mr-1"></i> Already Reported!</p>
                            <p>Our AI detected this garbage pile is already queued for cleaning.</p>
                        </div>
                    )}

                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

                    <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition cursor-pointer mb-6 ${selectedFile ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50 hover:bg-green-50'}`} onClick={() => fileInputRef.current.click()}>
                        <div className={`p-4 rounded-full shadow-sm mb-3 text-3xl bg-white ${selectedFile ? 'text-green-600' : 'text-green-500'}`}>
                            <i className={selectedFile ? "fa-solid fa-check" : "fa-solid fa-image"}></i>
                        </div>
                        <p className="font-semibold text-gray-700 text-center">
                            {selectedFile ? selectedFile.name : 'Click to Browse PC for Photo'}
                        </p>
                    </div>
                    
                    <button onClick={handleUpload} disabled={isUploading || !selectedFile} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-green-700 transition disabled:opacity-50 text-sm">
                        {isUploading ? 'Uploading & Analyzing...' : 'Submit Report to AI'}
                    </button>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-gray-600 font-bold mb-4 px-2 uppercase tracking-wider text-xs">My Recent Reports</h3>
                {reports.map(report => (
                    <div key={report._id} className={`bg-white p-4 rounded-xl shadow-sm mb-3 flex items-center gap-4 border-l-4 ${report.status === 'Pending AI' ? 'ai-processing' : report.status === 'Cleaned' ? 'border-green-500 bg-green-50' : report.status === 'Dispatched' ? 'border-blue-500' : 'border-red-500'}`}>
                        <div className="w-12 h-12 bg-gray-200 rounded-md bg-cover bg-center shadow-inner" style={{backgroundImage: `url('http://localhost:5000/${report.imageUrl}')`}}></div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-gray-800">{report.locationName}</p>
                            <p className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${report.status === 'Pending AI' ? 'bg-yellow-100 text-yellow-700' : report.status === 'Cleaned' ? 'bg-green-100 text-green-700' : report.status === 'Dispatched' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                            {report.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CitizenPortal;