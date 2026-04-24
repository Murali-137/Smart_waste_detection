const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    locationName: { type: String, required: true },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    imageUrl: { type: String, required: true },
    status: { type: String, enum: ['Pending AI', 'Critical', 'Moderate', 'Dispatched', 'Cleaned'], default: 'Pending AI' },
    densityScore: { type: Number, default: null }, // Calculated by YOLO
    clusterCount: { type: Number, default: 1 },    // For Deduplication
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);