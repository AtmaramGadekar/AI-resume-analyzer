import { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResults(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      // Send to the Node.js API Gateway
      const response = await axios.post("http://localhost:5000/api/upload-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResults(response.data);
    } catch (err) {
      setError("Failed to analyze resume. Make sure Node (5000) and Python (8000) are running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', backgroundColor: '#ffffff', color: '#333' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>AI Resume Analyzer</h1>
      <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Upload your PDF resume to see your ATS match score against our database.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '30px 0', padding: '40px', border: '2px dashed #bdc3c7', borderRadius: '10px', backgroundColor: '#fafafa' }}>
        <input type="file" accept=".pdf" onChange={handleFileChange} style={{ marginBottom: '20px' }} />
        <button 
          onClick={handleUpload} 
          disabled={loading}
          style={{ padding: '12px 24px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
          {loading ? "Analyzing Pipeline..." : "Analyze Resume"}
        </button>
        {error && <p style={{ color: '#e74c3c', marginTop: '15px' }}>{error}</p>}
      </div>

      {results && (
        <div style={{ border: '1px solid #ecf0f1', padding: '25px', borderRadius: '10px', backgroundColor: '#f9fbfb' }}>
          <h2 style={{ borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' }}>Analysis Results</h2>
          
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
            <h3 style={{ marginTop: 0, color: '#2980b9' }}>Top Extracted Keywords</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {results.extracted_data.keywords.slice(0, 15).map(kw => (
                <span key={kw} style={{ backgroundColor: '#e8f4f8', color: '#2980b9', padding: '6px 12px', borderRadius: '15px', fontSize: '14px', fontWeight: '500' }}>
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <h3>Recommended Roles (ATS Match)</h3>
          {results.recommended_jobs.map(job => (
            <div key={job.job_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: 'white', borderLeft: '5px solid #2ecc71', marginBottom: '15px', borderRadius: '6px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#2c3e50' }}>{job.title}</h4>
                <span style={{ fontSize: '13px', color: '#7f8c8d' }}>ID: {job.job_id}</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: job.match_percentage > 30 ? '#27ae60' : '#e67e22' }}>
                {job.match_percentage}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;