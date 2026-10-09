from fastapi import FastAPI, UploadFile, File, HTTPException
import uvicorn
from parser import extract_text_from_pdf, parse_resume_text
from matcher import get_job_recommendations # New import

app = FastAPI(title="AI Resume Analyzer API")

@app.post("/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        file_bytes = await file.read()
        
        # 1. Extract Text
        raw_text = extract_text_from_pdf(file_bytes)
        
        # 2. Parse Data using NLP (Keywords & Entities)
        parsed_data = parse_resume_text(raw_text)
        
        # 3. Machine Learning Job Matching
        job_matches = get_job_recommendations(raw_text)
        
        return {
            "status": "success",
            "filename": file.filename,
            "extracted_data": parsed_data,
            "recommended_jobs": job_matches
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)