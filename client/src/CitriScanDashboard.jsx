import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, Send, Activity } from 'lucide-react';
import DOMPurify from 'dompurify';

// Reusable Glass Card Component
function GlassCard({ children, className = "" }) {
  return (
    <div className={`
      bg-white/5 /* 5% opaque white for transparency */
      backdrop-blur-xl /* Heavy background blur */
      border border-white/10 /* Precise inner glow rim light */
      shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] /* Deep shadow for depth */
      rounded-[2.5rem] /* Organic, round iOS style corners */
      ${className}
    `}>
      {children}
    </div>
  );
}

// Helper to convert Base64 to File
const dataURLtoFile = (dataurl, filename) => {
  let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type:mime});
}

export default function CitriScanDashboard() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am the CitriScan Assistant. Upload a photo or use your camera to analyze a citrus leaf.' }
  ]);

  const webcamRef = useRef(null);
  const videoConstraints = { facingMode: "environment" };

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
          addChatMessage('bot', `**WARNING**: High probability (${(data.confidence * 100).toFixed(1)}%) of ${data.disease} detected using ${data.model_used}. Would you like me to suggest immediate treatment protocols?`);
        } else {
          addChatMessage('bot', `Great news! With ${(data.confidence * 100).toFixed(1)}% confidence, this leaf appears **HEALTHY**.`);
        }
      }
    } catch (error) {
      console.error("Error connecting to server:", error);
      addChatMessage('bot', "Connection error to analysis server. Please ensure your Flask backend is running.");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d2b18] to-[#05120a] p-4 flex items-center justify-center font-sans">
      <div className="w-full max-w-6xl h-[90vh] bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] border border-white/10 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT PANEL: SCANNER */}
        <div className="flex-1 flex flex-col p-8 border-b md:border-b-0 md:border-r border-white/10">
          <div className="pb-4 mb-4 flex justify-between items-center">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-white tracking-tight">CitriScan</h1>
              <h2 className="uppercase tracking-widest text-green-400/70 font-light text-xs mt-1">Leaf Analysis Protocol</h2>
            </div>
            <Activity className="text-green-400 w-6 h-6 animate-pulse" />
          </div>

          <div className="flex-1 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 relative overflow-hidden flex items-center justify-center mb-8 shadow-inner">
            
            {!isCameraOpen && !capturedImage && (
              <div className="text-center text-white/50 flex flex-col items-center">
                <div className="p-6 bg-white/5 rounded-full mb-4">
                  <Camera className="w-12 h-12" />
                </div>
                <p className="font-medium tracking-wide">Position a single citrus leaf in frame</p>
              </div>
            )}

            {isCameraOpen && (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {capturedImage && (
               <img src={capturedImage} alt="Scanned Leaf" className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-luminosity" />
            )}

            {isAnalyzing && (
              <div className="absolute top-0 left-0 w-full h-1 bg-green-400 shadow-[0_0_30px_#4ade80] animate-[ping_2s_ease-in-out_infinite]" />
            )}

            {diagnosis && !isAnalyzing && (
              <div className="absolute bottom-6 left-6 right-6 p-5 bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
                <p className={`text-xs tracking-widest font-bold uppercase mb-1 ${diagnosis.isDangerous ? 'text-red-400' : 'text-green-400'}`}>
                  Analysis Complete
                </p>
                <h1 className="text-3xl font-bold text-white drop-shadow-md mb-3">{diagnosis.name}</h1>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-white/90">{diagnosis.confidence}%</span>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${diagnosis.isDangerous ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-green-400 shadow-[0_0_10px_#4ade80]'}`} 
                      style={{ width: `${diagnosis.confidence}%` }} 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            {isCameraOpen ? (
              <button onClick={capturePhoto} className="flex-1 py-4 bg-red-500/20 text-red-100 border border-red-500/50 backdrop-blur-md rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-red-500/40 transition-all shadow-lg">
                <Camera className="w-5 h-5" /> Capture Scan
              </button>
            ) : (
              <>
                <button onClick={() => { setIsCameraOpen(true); setCapturedImage(null); setDiagnosis(null); }} className="flex-1 py-4 bg-white/10 text-white border border-white/20 backdrop-blur-md rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-white/20 hover:border-white/40 transition-all shadow-lg">
                  <Camera className="w-5 h-5" /> Use Camera
                </button>
                <label className="flex-1 py-4 bg-white/10 text-white border border-white/20 backdrop-blur-md rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-white/20 hover:border-white/40 transition-all shadow-lg cursor-pointer">
                  <Upload className="w-5 h-5" /> Upload Image
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: CHAT */}
        <div className="w-full md:w-[420px] flex flex-col bg-black/20 backdrop-blur-sm">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-semibold text-white/90">Assistant</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">Online</span>
              <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]"></div>
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-5">
            {messages.map((msg, idx) => (
              <div key={idx} className={`max-w-[85%] p-4 text-sm shadow-md ${
                msg.sender === 'user' 
                  ? 'bg-green-500/20 text-green-50 border border-green-400/30 self-end rounded-2xl rounded-br-sm font-medium' 
                  : 'bg-white/10 text-white/90 border border-white/10 self-start rounded-2xl rounded-bl-sm backdrop-blur-md'
              }`}>
                {/* SECURITY: DOMPurify sanitizes AI responses before rendering HTML */}
                {msg.sender === 'bot' ? (
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.text) }} />
                ) : (
                  msg.text
                )}
              </div>
            ))}
          </div>

          <div className="p-5 border-t border-white/10">
            <div className="relative flex items-center">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about treatments..." 
                className="w-full bg-black/30 border border-white/20 rounded-full pl-5 pr-12 py-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-green-400/50 focus:bg-black/40 transition-all backdrop-blur-md"
              />
              <button onClick={handleSendMessage} className="absolute right-2 p-2 bg-green-400 text-black rounded-full hover:scale-105 transition-transform shadow-[0_0_15px_rgba(74,222,128,0.3)]">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}