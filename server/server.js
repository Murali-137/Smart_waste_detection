const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes'); // <-- Added Auth Routes
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
// Add this line to serve the uploads folder publicly
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);       // <-- Added Auth Routes
app.use('/api/reports', reportRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
