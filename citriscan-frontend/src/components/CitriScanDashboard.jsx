import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, Send, Activity, LogOut, User } from 'lucide-react';
import DOMPurify from 'dompurify';
import './CitriScanDashboard.css';

// Helper to convert Base64 to File
const dataURLtoFile = (dataurl, filename) => {
  let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type:mime});
};

export default function CitriScanDashboard({ onSignOut, user }) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am the CitriScan Assistant. Upload a photo or use your camera to analyze a citrus leaf.' }
  ]);

  const webcamRef = useRef(null);
  const chatEndRef = useRef(null);
  const videoConstraints = { facingMode: "environment" };

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setIsCameraOpen(false);

    const file = dataURLtoFile(imageSrc, 'capture.jpg');
    analyzeImage(file);
  }, [webcamRef]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);
      setIsCameraOpen(false);
      analyzeImage(file);
    }
  };

  const addChatMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text }]);
  };

  const analyzeImage = async (file) => {
    setIsAnalyzing(true);
    setDiagnosis(null);
    addChatMessage('bot', "Analyzing leaf spectrum... Connecting to CitriScan AI core.");

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.error) {
        addChatMessage('bot', `Analysis failed: ${data.error}`);
      } else {
        const isDangerous = data.disease !== 'Healthy';
        setDiagnosis({
          name: data.disease,
          confidence: (data.confidence * 100).toFixed(1),
          isDangerous: isDangerous,
          modelUsed: data.model_used
        });

        if (isDangerous) {
          addChatMessage('bot', `<strong>⚠️ WARNING</strong>: High probability (${(data.confidence * 100).toFixed(1)}%) of <strong>${data.disease}</strong> detected using ${data.model_used}. Would you like me to suggest immediate treatment protocols?`);
        } else {
          addChatMessage('bot', `Great news! With ${(data.confidence * 100).toFixed(1)}% confidence, this leaf appears <strong>HEALTHY</strong>. ✅`);
        }
      }
    } catch (error) {
      console.error("Error connecting to server:", error);
      addChatMessage('bot', "Connection error to analysis server. Please ensure your Flask backend is running on port 5000.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userText = chatInput;
    addChatMessage('user', userText);
    setChatInput("");

    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });

      const data = await response.json();
      addChatMessage('bot', data.response);
    } catch (error) {
      console.error("Chat Error:", error);
      addChatMessage('bot', "I couldn't connect to the AI brain. Is the Flask server running?");
    }
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="dashboard" id="citriscan-dashboard">
      <div className="dashboard__shell">

        {/* ========== LEFT PANEL: SCANNER ========== */}
        <div className="dashboard__scanner">
          {/* Header */}
          <div className="dashboard__scanner-header">
            <div className="dashboard__brand">
              <h1 className="dashboard__brand-title">🍋 CitriScan</h1>
              <h2 className="dashboard__brand-subtitle">Leaf Analysis Protocol</h2>
            </div>
            <div className="dashboard__header-right">
              <Activity className="dashboard__activity-icon" size={20} />
              <div className="dashboard__user-info">
                <User size={14} />
                <span>{displayName}</span>
              </div>
              <button className="dashboard__signout-btn" onClick={onSignOut} id="dashboard-signout" title="Sign Out">
                <LogOut size={16} />
              </button>
            </div>
          </div>

          {/* Viewfinder */}
          <div className="dashboard__viewfinder" id="viewfinder">
            {/* Empty state */}
            {!isCameraOpen && !capturedImage && (
              <div className="dashboard__empty-state">
                <div className="dashboard__empty-icon-wrap">
                  <Camera size={48} />
                </div>
                <p>Position a single citrus leaf in frame</p>
              </div>
            )}

            {/* Webcam */}
            {isCameraOpen && (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="dashboard__camera-feed"
              />
            )}

            {/* Captured image */}
            {capturedImage && (
              <img src={capturedImage} alt="Scanned Leaf" className="dashboard__captured-img" />
            )}

            {/* Analyzing bar */}
            {isAnalyzing && (
              <div className="dashboard__analyzing-bar"></div>
            )}

            {/* Diagnosis overlay */}
            {diagnosis && !isAnalyzing && (
              <div className="dashboard__diagnosis-overlay">
                <p className={`dashboard__diagnosis-label ${diagnosis.isDangerous ? 'dashboard__diagnosis-label--danger' : 'dashboard__diagnosis-label--safe'}`}>
                  Analysis Complete
                </p>
                <h3 className="dashboard__diagnosis-name">{diagnosis.name}</h3>
                <div className="dashboard__diagnosis-bar-row">
                  <span className="dashboard__diagnosis-confidence">{diagnosis.confidence}%</span>
                  <div className="dashboard__diagnosis-track">
                    <div
                      className={`dashboard__diagnosis-fill ${diagnosis.isDangerous ? 'dashboard__diagnosis-fill--danger' : 'dashboard__diagnosis-fill--safe'}`}
                      style={{ width: `${diagnosis.confidence}%` }}
                    ></div>
                  </div>
                </div>
                <span className="dashboard__diagnosis-model">via {diagnosis.modelUsed}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="dashboard__actions" id="scanner-actions">
            {isCameraOpen ? (
              <button onClick={capturePhoto} className="dashboard__action-btn dashboard__action-btn--capture" id="capture-btn">
                <Camera size={20} /> Capture Scan
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setIsCameraOpen(true); setCapturedImage(null); setDiagnosis(null); }}
                  className="dashboard__action-btn dashboard__action-btn--default"
                  id="camera-btn"
                >
                  <Camera size={20} /> Use Camera
                </button>
                <label className="dashboard__action-btn dashboard__action-btn--default" id="upload-btn">
                  <Upload size={20} /> Upload Image
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="dashboard__file-input" />
                </label>
              </>
            )}
          </div>
        </div>

        {/* ========== RIGHT PANEL: CHAT ========== */}
        <div className="dashboard__chat">
          {/* Chat header */}
          <div className="dashboard__chat-header">
            <h3 className="dashboard__chat-title">Assistant</h3>
            <div className="dashboard__chat-status">
              <span>Online</span>
              <div className="dashboard__status-dot"></div>
            </div>
          </div>

          {/* Messages */}
          <div className="dashboard__chat-messages" id="chat-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`dashboard__msg ${msg.sender === 'user' ? 'dashboard__msg--user' : 'dashboard__msg--bot'}`}
              >
                {msg.sender === 'bot' ? (
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.text) }} />
                ) : (
                  msg.text
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <div className="dashboard__chat-input-wrap">
            <div className="dashboard__chat-input-inner">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about treatments..."
                className="dashboard__chat-input"
                id="chat-input"
              />
              <button onClick={handleSendMessage} className="dashboard__chat-send" id="chat-send-btn">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
