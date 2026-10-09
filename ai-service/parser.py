import pymupdf
import spacy

# Load the NLP model
nlp = spacy.load("en_core_web_sm")

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts raw text from a PDF file."""
    text = ""
    # Open the PDF from bytes
    doc = pymupdf.open(stream=file_bytes, filetype="pdf")
    for page in doc:
        text += page.get_text()
    return text

def parse_resume_text(text: str) -> dict:
    """Runs basic NLP to extract entities and clean text."""
    doc = nlp(text)
    
    # Extract entities like organizations, degrees, etc.
    entities = [(ent.text, ent.label_) for ent in doc.ents]
    
    # Basic keyword extraction (nouns and proper nouns)
    keywords = [token.text for token in doc if token.pos_ in ["NOUN", "PROPN"]]
    
    return {
        "raw_length": len(text),
        "entities": list(set(entities)), # Deduplicate entities
        "keywords": list(set(keywords))[:30] # Return top 30 unique keywords
    }