from flask import Flask, request, send_file
import os
from werkzeug.utils import secure_filename
from pdf2docx import Converter
from docx2pdf import convert
from img2pdf import convert as img_to_pdf

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/convert/image-to-pdf', methods=['POST'])
def image_to_pdf():
    if 'file' not in request.files:
        return "No file uploaded", 400
    
    file = request.files['file']
    if file.filename == '':
        return "No file selected", 400
    
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    # Convert to PDF
    pdf_bytes = img_to_pdf(filepath)
    output_path = os.path.join(app.config['UPLOAD_FOLDER'], 'converted.pdf')
    with open(output_path, "wb") as f:
        f.write(pdf_bytes)
    
    return send_file(output_path, as_attachment=True)

# Similar endpoints for other conversions
