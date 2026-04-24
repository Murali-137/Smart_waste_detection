const fs = require('fs');
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const multer = require('multer');

// Ensure the 'uploads' directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure Multer to save files to the uploads folder
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create a unique filename so images don't overwrite each other
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
    }
});

const upload = multer({ storage: storage });

// Put the upload.single('image') middleware BEFORE your controller
router.post('/upload', upload.single('image'), reportController.uploadReport);

// Route for the Admin Dashboard and Citizen History
router.get('/', reportController.getAllReports);

module.exports = router;