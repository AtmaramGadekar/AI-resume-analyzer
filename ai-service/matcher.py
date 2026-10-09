import re
import math
from collections import Counter

# A mock database of job descriptions to test our matching algorithm
MOCK_JOBS = [
    {
        "id": "JOB_01",
        "title": "Machine Learning Engineer",
        "description": "Looking for an ML engineer with experience in NLP pipelines, voice recognition architectures, and building AI detection models in Python."
    },
    {
        "id": "JOB_02",
        "title": "Cybersecurity Analyst",
        "description": "Requires experience in host-based intrusion detection systems (IDS), unsupervised anomaly detection, file integrity monitoring, and rule-based network analysis."
    },
    {
        "id": "JOB_03",
        "title": "Full Stack Software Engineer",
        "description": "Seeking a software engineer proficient in building web applications using React, Node.js, Python, and managing SQL/NoSQL databases with optimized query processing."
    }
]

def get_word_vectors(text: str) -> Counter:
    """Cleans text and counts word frequencies, ignoring common filler words."""
    # Convert to lowercase and extract only words (removes punctuation)
    words = re.findall(r'\b\w+\b', text.lower())
    
    # Common words to ignore so they don't artificially inflate the match score
    stop_words = {"the", "and", "to", "a", "of", "in", "for", "is", "on", "that", "by", "this", "with", "i", "you", "it", "not", "or", "be", "are", "an", "as"}
    
    # Filter and count
    filtered_words = [word for word in words if word not in stop_words]
    return Counter(filtered_words)

def calculate_similarity(resume_text: str, job_description: str) -> float:
    """Calculates cosine similarity mathematically without external ML libraries."""
    vec1 = get_word_vectors(resume_text)
    vec2 = get_word_vectors(job_description)
    
    # Find words that exist in both the resume and the job description
    intersection = set(vec1.keys()) & set(vec2.keys())
    
    # Calculate the dot product (numerator)
    numerator = sum([vec1[x] * vec2[x] for x in intersection])
    
    # Calculate magnitudes (denominator)
    sum1 = sum([vec1[x]**2 for x in vec1.keys()])
    sum2 = sum([vec2[x]**2 for x in vec2.keys()])
    denominator = math.sqrt(sum1) * math.sqrt(sum2)
    
    if not denominator:
        return 0.0
        
    score = numerator / denominator
    return round(score * 100, 1)

def get_job_recommendations(resume_text: str) -> list:
    """Scores the resume against all available jobs and ranks them."""
    recommendations = []
    
    for job in MOCK_JOBS:
        match_score = calculate_similarity(resume_text, job["description"])
        recommendations.append({
            "job_id": job["id"],
            "title": job["title"],
            "match_percentage": match_score
        })
    
    # Sort the jobs from highest match to lowest match
    recommendations.sort(key=lambda x: x["match_percentage"], reverse=True)
    return recommendations