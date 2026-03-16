import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

export default function Scanner({ onSignOut }) {
    const webcamRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setCapturedImage(imageSrc);
        setResult(null); // Clear previous results
    }, [webcamRef]);

    const retake = () => {
        setCapturedImage(null);
        setResult(null);
    };

    // THIS IS THE BRIDGE TO FLASK
   const analyzeLeaf = async () => {
        setIsAnalyzing(true);
        setResult(null);
        
        try {
            // 1. Convert the base64 React Webcam image back into a real File Blob
            const responseBlob = await fetch(capturedImage);
            const blob = await responseBlob.blob();
            
            // 2. Package it exactly how your Flask app.py expects it
            const formData = new FormData();
            formData.append('file', blob, 'react-capture.jpg');

            // 3. Send it to your existing Flask server
            const response = await fetch('http://http://127.0.0.1:5000/', {
                method: 'POST',
                body: formData // No headers needed, the browser sets the multipart boundary automatically
            });

            const data = await response.json();
            
            if (data.error) {
                setResult({ error: data.error });
            } else {
                // 4. Map your Flask response to the React UI
                setResult({
                    diagnosis: data.disease,
                    confidence: (data.confidence * 100).toFixed(1),
                    model: data.model_used
                });
            }
        } catch (error) {
            console.error("Error connecting to Flask:", error);
            setResult({ error: "Could not connect to the AI Server. Make sure app.py is running!" });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div style={styles.dashboard}>
            <header style={styles.header}>
                <h2 style={styles.title}>CitriScan Diagnostic Hub</h2>
                <button onClick={onSignOut} style={styles.signOutBtn}>Sign Out</button>
            </header>

            <div style={styles.container}>
                {!capturedImage ? (
                    <div style={styles.card}>
                        <p style={styles.instruction}>Position the citrus leaf clearly in the frame.</p>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: "environment" }}
                            style={styles.webcam}
                        />
                        <button onClick={capture} style={styles.captureBtn}>📷 Capture Leaf</button>
                    </div>
                ) : (
                    <div style={styles.card}>
                        <img src={capturedImage} alt="Captured Leaf" style={styles.webcam} />
                        
                        {/* RESULT DISPLAY AREA */}
                        {result && (
                            <div style={result.error ? styles.errorBox : styles.resultBox}>
                                {result.error ? (
                                    <p>{result.error}</p>
                                ) : (
                                    <>
                                        <h3 style={{margin: '0 0 10px 0'}}>Diagnosis Complete</h3>
                                        <p><strong>Disease:</strong> {result.diagnosis}</p>
                                        <p><strong>Confidence:</strong> {result.confidence}%</p>
                                    </>
                                )}
                            </div>
                        )}

                        <div style={styles.buttonRow}>
                            <button onClick={retake} style={styles.retakeBtn} disabled={isAnalyzing}>
                                ↺ Retake
                            </button>
                            <button onClick={analyzeLeaf} style={styles.analyzeBtn} disabled={isAnalyzing}>
                                {isAnalyzing ? 'Analyzing AI...' : '🔍 Analyze Disease'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Professional Styling
const styles = {
    dashboard: { backgroundColor: '#f0f4f1', minHeight: '100vh', fontFamily: 'sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
    title: { color: '#2e7d32', margin: 0 },
    signOutBtn: { padding: '8px 16px', backgroundColor: '#ffebee', color: '#c62828', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    container: { maxWidth: '600px', margin: '40px auto', padding: '0 20px' },
    card: { backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', textAlign: 'center' },
    instruction: { color: '#666', marginBottom: '20px', fontSize: '16px' },
    webcam: { width: '100%', borderRadius: '12px', border: '2px solid #e0e0e0' },
    captureBtn: { marginTop: '20px', width: '100%', padding: '15px', backgroundColor: '#388e3c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' },
    buttonRow: { display: 'flex', gap: '15px', marginTop: '20px' },
    retakeBtn: { flex: 1, padding: '15px', backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #ccc', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
    analyzeBtn: { flex: 2, padding: '15px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
    resultBox: { marginTop: '20px', padding: '20px', backgroundColor: '#e8f5e9', borderLeft: '5px solid #4caf50', borderRadius: '8px', textAlign: 'left', color: '#2e7d32' },
    errorBox: { marginTop: '20px', padding: '15px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '8px' }
};