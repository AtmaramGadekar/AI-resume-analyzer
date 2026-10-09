const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Set up Multer to store uploaded files temporarily in the 'uploads' folder
const upload = multer({ dest: 'uploads/' });

// The main endpoint React will call
app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF uploaded.' });
        }

        console.log(`Received file: ${req.file.originalname}. Forwarding to AI engine...`);

        // 1. Prepare the file to be sent to Python
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path), req.file.originalname);

        // 2. Call the Python AI API
        const pythonApiUrl = 'http://127.0.0.1:8000/analyze-resume';
        const aiResponse = await axios.post(pythonApiUrl, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        // 3. Delete the temporary file from the Node server to save space
        fs.unlinkSync(req.file.path);

        // 4. Send the successful AI data back to React
        res.json(aiResponse.data);

    } catch (error) {
        console.error('Error communicating with Python AI:', error.message);
        
        // Cleanup file if an error occurs
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ error: 'Failed to analyze resume in AI engine.' });
    }
});

app.listen(PORT, () => {
    console.log(`Node.js API Gateway running on http://localhost:${PORT}`);
});