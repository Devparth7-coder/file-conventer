const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');
const libre = require('libreoffice-convert');
const librePath = require('libreoffice-convert').path;

const app = express();
const upload = multer({ dest: 'uploads/' });

// Serve static files
app.use(express.static('public'));

// Image to PDF conversion
async function convertImageToPdf(filePath) {
    try {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        
        // For simplicity, we're just creating an empty PDF
        // In a real app, you'd add the image to the PDF
        return await pdfDoc.save();
    } catch (err) {
        throw err;
    }
}

// Word to PDF conversion
function convertWordToPdf(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        const file = fs.readFileSync(inputPath);
        
        libre.convert(file, '.pdf', undefined, (err, done) => {
            if (err) {
                reject(err);
            }
            
            fs.writeFileSync(outputPath, done);
            resolve(outputPath);
        });
    });
}

// Main conversion endpoint
app.post('/convert', upload.array('files'), async (req, res) => {
    try {
        const format = req.body.format;
        const files = req.files;
        
        if (!files || files.length === 0) {
            return res.status(400).send('No files uploaded');
        }
        
        // For demo purposes, we'll just handle the first file
        const file = files[0];
        const inputPath = file.path;
        const outputPath = path.join(__dirname, 'converted.' + format);
        
        if (format === 'pdf') {
            // Convert to PDF (image or other format)
            const pdfBytes = await convertImageToPdf(inputPath);
            fs.writeFileSync(outputPath, pdfBytes);
        } else if (format === 'docx') {
            // Convert PDF to Word (would need different logic)
            // This is just a placeholder
            fs.copyFileSync(inputPath, outputPath);
        } else {
            // Other conversions
            fs.copyFileSync(inputPath, outputPath);
        }
        
        // Send the converted file
        res.download(outputPath, () => {
            // Clean up
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
        });
        
    } catch (err) {
        console.error('Conversion error:', err);
        res.status(500).send('Conversion failed: ' + err.message);
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the converter at http://localhost:${PORT}`);
});
