const Report = require('../models/Report');
const { isDuplicateLocation } = require('../services/geoService');
const { analyzeImageWithAI } = require('../services/mlService');
const fs = require('fs');

// 1. Handle Uploads & ML Analysis
exports.uploadReport = async (req, res) => {
    try {
        const { lat, lng, locationName } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required' });
        }
        const imagePath = req.file.path; 

        // Check for Duplicates
        const activeReports = await Report.find({ status: { $ne: 'Cleaned' } });
        let duplicateReport = null;
        for (let report of activeReports) {
            if (isDuplicateLocation(lat, lng, report.coordinates.lat, report.coordinates.lng)) {
                duplicateReport = report;
                break;
            }
        }

        if (duplicateReport) {
            duplicateReport.clusterCount += 1;
            await duplicateReport.save();
            return res.status(200).json({ message: 'Duplicate detected. Clustered.', report: duplicateReport });
        }

        // Run the AI
        const aiResult = await analyzeImageWithAI(imagePath);

        // OVERWRITE the uploaded image with the YOLO-drawn image from Python!
        if (aiResult.annotated_base64) {
            const buffer = Buffer.from(aiResult.annotated_base64, 'base64');
            fs.writeFileSync(imagePath, buffer);
        }

        // Save to MongoDB
        const newReport = new Report({ 
            locationName, 
            coordinates: { lat, lng }, 
            imageUrl: imagePath,           
            status: aiResult.status,       
            densityScore: aiResult.density 
        });
        
        await newReport.save();
        
        res.status(201).json({ message: 'Report submitted and analyzed', report: newReport });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// 2. Fetch All Reports
exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });
        res.status(200).json(reports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
};