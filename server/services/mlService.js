const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

exports.analyzeImageWithAI = async (imagePath) => {
    try {
        const formData = new FormData();
        formData.append('image', fs.createReadStream(imagePath));

        // Send the image to the Python Flask server
        const response = await axios.post('http://127.0.0.1:5001/analyze', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        // THE FIX: Return the ENTIRE response data, which now includes annotated_base64!
        return response.data; 

    } catch (error) {
        console.error('ML Service Error:', error.message);
        // Safe fallback if the Python server is off
        return { 
            status: 'Pending AI', 
            density: 0, 
            items_detected: 0,
            annotated_base64: null 
        };
    }
};