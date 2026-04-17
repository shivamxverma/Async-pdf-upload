import io
import re
import json
from pypdf import PdfReader

def extract_pdf_data(file_content: bytes, filename: str) -> dict:
    text = ""
    try:
        reader = PdfReader(io.BytesIO(file_content))
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    except Exception as e:
        text = "Error parsing PDF: " + str(e)
        
    if not text.strip():
        text = "No extractable text found in the PDF. It may be an image-based scanned document."

    word_count = len(text.split())
    
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    title = lines[0] if lines else filename
    
    category = "General Document"
    if "invoice" in text.lower() or "total:" in text.lower() or "amount" in text.lower():
        category = "Invoice"
    elif "resume" in text.lower() or "experience" in text.lower() or "education" in text.lower():
        category = "Resume"
    elif "contract" in text.lower() or "agreement" in text.lower():
        category = "Contract"

    words = re.findall(r'\b[A-Za-z]{5,}\b', text)
    word_freq = {}
    for w in words:
        wl = w.lower()
        word_freq[wl] = word_freq.get(wl, 0) + 1
    
    sorted_keywords = sorted(word_freq.keys(), key=lambda k: word_freq[k], reverse=True)
    extracted_keywords = sorted_keywords[:5] if sorted_keywords else ["document", "pdf"]
    
    summary = f"A document containing roughly {word_count} words. " \
              f"The main topic seems to be related to {', '.join(extracted_keywords)}."
              
    preview = text[:500] + "..." if len(text) > 500 else text

    return {
        "filename": filename,
        "file_size": len(file_content),
        "file_type": "application/pdf",
        "title": title,
        "category": category,
        "summary": summary,
        "extracted_keywords": extracted_keywords,
        "status": "Processed",
        "content_preview": preview
    }
