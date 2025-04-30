import React, { useState, useRef, useEffect } from 'react';

const SingingPracticeMode = ({ referenceTrack }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReferenceTrackPlaying, setIsReferenceTrackPlaying] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Initialize audio context
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 2048;

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        analyzePitch(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      startVisualizer(stream);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const startVisualizer = (stream) => {
    const audioSource = audioContextRef.current.createMediaStreamSource(stream);
    audioSource.connect(analyserRef.current);
    
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = 'rgb(20, 20, 30)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(99, 102, 241)';
      canvasCtx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };

    draw();
  };

  const analyzePitch = async (audioBlob) => {
    // This is a placeholder for pitch analysis
    // In a real implementation, you would use a pitch detection library
    // or send the audio to a backend service for analysis
    setAudioFeedback({
      pitch: 'Good pitch accuracy',
      timing: 'Slight timing variations',
      overall: 'Keep practicing!'
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleAudioFile(e.dataTransfer.files[0]);
    }
  };

  const handleAudioFile = (file) => {
    if (file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      setRecordedAudio(url);
      analyzePitch(file);
    } else {
      alert('Please upload an audio file');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="lesson-card">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Singing Practice Mode</h2>

          {/* Reference Track Player */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Reference Track</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <audio
                src={referenceTrack.url}
                controls
                className="w-full"
                onPlay={() => setIsReferenceTrackPlaying(true)}
                onPause={() => setIsReferenceTrackPlaying(false)}
              />
            </div>
          </div>

          {/* Recording Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Your Recording</h3>
            <div className="waveform-container mb-4">
              <canvas
                ref={canvasRef}
                className="audio-visualizer"
                width="800"
                height="200"
              />
            </div>

            <div className="flex items-center justify-center space-x-4 mb-6">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`recording-btn ${
                  isRecording ? 'recording-btn-recording' : 'recording-btn-idle'
                }`}
              >
                {isRecording ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="6" y="6" width="12" height="12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="6" fill="currentColor" />
                  </svg>
                )}
              </button>
              {recordedAudio && (
                <audio
                  src={recordedAudio}
                  controls
                  className="w-full max-w-md"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              )}
            </div>

            {/* Upload Zone */}
            <div
              className={`upload-zone ${dragActive ? 'upload-zone-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={(e) => handleAudioFile(e.target.files[0])}
                className="hidden"
              />
              <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-600">
                Drag and drop your recording here, or{' '}
                <button
                  type="button"
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse
                </button>
              </p>
            </div>
          </div>

          {/* Feedback Section */}
          {audioFeedback && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Performance Feedback</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pitch Accuracy</span>
                  <span className="feedback-indicator feedback-good">
                    {audioFeedback.pitch}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Timing</span>
                  <span className="feedback-indicator feedback-warning">
                    {audioFeedback.timing}
                  </span>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{audioFeedback.overall}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingingPracticeMode;
