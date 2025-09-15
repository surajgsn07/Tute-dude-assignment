import { useEffect, useRef, useState } from "react";
import * as faceMesh from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import { uploadVideo} from "../../api/Services/Candidate.jsx";
import {useNavigate, useParams} from "react-router-dom";
import {toast} from "react-toastify";
import LoadingOverlay from "./components/LoadingOverlay.jsx";
import {useSocket} from "../../Context/SocketWrapper.jsx";

function CandidateInterview() {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [events, setEvents] = useState([]);
  const [cameraInitialized, setCameraInitialized] = useState(false);
  const {id} = useParams();
  const navigate = useNavigate();
  const[submiting,setSubmiting]=useState(false)
  const streamRef = useRef(null);
  const cameraRef = useRef(null);
  const eventsRef = useRef([]);
  const socket = useSocket();



  const noFaceTimer = useRef(null);
  const lookAwayTimer = useRef(null);

  const lastObjectCheck = useRef(0);
  const objectInterval = 1000; // 1 second

  const [objectModel, setObjectModel] = useState(null);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const voiceTimer = useRef(null);

  useEffect(() => {
    async function initTF() {
      try {
        // Set the backend to webgl for better performance
        await tf.setBackend('webgl');
        console.log("TensorFlow.js backend initialized:", tf.getBackend());
      } catch (error) {
        console.warn("WebGL backend not available, falling back to CPU",error);
        await tf.setBackend('cpu');
      }
    }

    socket.emit("candidate-join", id);

    initTF();
  }, []);

  useEffect(() => {
    async function loadModel() {
      try {
        const model = await cocoSsd.load();
        setObjectModel(model);
        console.log("COCO-SSD model loaded");
      } catch (error) {
        console.error("Error loading COCO-SSD model:", error);
      }
    }

    // Only load model after TensorFlow is ready
    if (tf.getBackend()) {
      loadModel();
    }
  }, [tf.getBackend()]);

  const detectObjects = async (video) => {
    const now = Date.now();
    if (!objectModel || now - lastObjectCheck.current < objectInterval) return;
    lastObjectCheck.current = now;

    try {
      const predictions = await objectModel.detect(video);
      const persons = predictions.filter(p => p.class === "person" && p.score > 0.6);

      if (persons.length > 1) {
        logEvent("MULTIPLE_FACES");
      }

      const now = Date.now();
      if (persons.length === 0) {
        if (!noFaceTimer.current) noFaceTimer.current = now;
        else if (now - noFaceTimer.current > 10000) {
          logEvent("NO_FACE", now - noFaceTimer.current);
          noFaceTimer.current = now;
        }
      }

      predictions.forEach((pred) => {
        const { class: className, score } = pred;
        if (score > 0.6) {
          if (["cell phone", "book", "laptop"].includes(className)) {
            logEvent(`${className.toUpperCase().replace(" ", "_")}_DETECTED`);
          }
        }
      });

    } catch (error) {
      console.error("Error detecting objects:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && objectModel && videoRef.current.readyState >= 2) {
        detectObjects(videoRef.current);
      }
    }, objectInterval);
    return () => clearInterval(interval);
  }, [objectModel]);

  const detectAudio = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkAudio = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      const volume = dataArray.reduce((a, b) => a + b) / bufferLength;

      if (volume > 40) {
        if (!voiceTimer.current) {
          // noise just started
          voiceTimer.current = Date.now();
          console.log("Noise detected at", formatTime(new Date(voiceTimer.current)));
          logEvent("BACKGROUND_VOICE_DETECTED", 0);
        }
      } else {
        // reset when silence
        voiceTimer.current = null;
      }

      requestAnimationFrame(checkAudio);
    };

    checkAudio();
  };

  // Start recording automatically
  const startRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "inactive"
    ) {
      mediaRecorderRef.current.start();
      setRecording(true);
      logEvent("RECORDING_STARTED");
      console.log("Recording started");
    }
  };

  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        streamRef.current = stream;

        // MediaRecorder setup
        mediaRecorderRef.current = new MediaRecorder(stream);
        let chunks = [];
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunks, { type: "video/webm" });
          chunks = [];
          endInterview(blob);
        };

        // Audio detection
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 512;
        source.connect(analyserRef.current);

        detectAudio();

        // MediaPipe Face Mesh setup
        const faceMeshModel = new faceMesh.FaceMesh({
          locateFile: (file) =>
              `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });
        faceMeshModel.setOptions({
          maxNumFaces: 2,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMeshModel.onResults((results) => {
          const now = Date.now();
          const faces = results.multiFaceLandmarks || [];

          if (faces.length === 0) {
            if (!noFaceTimer.current) noFaceTimer.current = now;
            else if (now - noFaceTimer.current > 10000) {
              logEvent("NO_FACE", now - noFaceTimer.current);
              noFaceTimer.current = now;
            }
          } else {
            noFaceTimer.current = null;
          }

          if (faces.length > 1) logEvent("MULTIPLE_FACES");

          if (faces.length === 1) {
            const nose = faces[0][1];
            if (nose.x < 0.3 || nose.x > 0.7) {
              if (!lookAwayTimer.current) lookAwayTimer.current = now;
              else if (now - lookAwayTimer.current > 1000) {
                logEvent("LOOK_AWAY", now - lookAwayTimer.current);
                lookAwayTimer.current = now;
              }
            } else {
              lookAwayTimer.current = null;
            }
          }
        });

        startFaceMeshCamera(faceMeshModel);
        setCameraInitialized(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }

    initCamera();

    return () => {

        stopAllMediaDevices();
      // Stop MediaRecorder if recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }

      // Stop all media tracks
      if (streamRef.current) {
        
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }


      // Clear video source
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      // Clear timers
      if (noFaceTimer.current) {
        clearTimeout(noFaceTimer.current);
        noFaceTimer.current = null;
      }

      if (lookAwayTimer.current) {
        clearTimeout(lookAwayTimer.current);
        lookAwayTimer.current = null;
      }

      if (voiceTimer.current) {
        clearTimeout(voiceTimer.current);
        voiceTimer.current = null;
      }

      setCameraInitialized(false);


      if (cameraRef.current) {
    cameraRef.current.stop();
    cameraRef.current = null;
  }
  console.log({videoRef,audioContextRef,mediaRecorderRef,cameraRef,streamRef,eventsRef})
      
    };
  }, []);


  useEffect(() => {
      

    return () => {

        stopAllMediaDevices();
      // Stop MediaRecorder if recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }

      // Stop all media tracks
      if (streamRef.current) {
        
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }


      // Clear video source
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      // Clear timers
      if (noFaceTimer.current) {
        clearTimeout(noFaceTimer.current);
        noFaceTimer.current = null;
      }

      if (lookAwayTimer.current) {
        clearTimeout(lookAwayTimer.current);
        lookAwayTimer.current = null;
      }

      if (voiceTimer.current) {
        clearTimeout(voiceTimer.current);
        voiceTimer.current = null;
      }

      setCameraInitialized(false);


      if (cameraRef.current) {
    cameraRef.current.stop();
    cameraRef.current = null;
  }
  console.log({videoRef,audioContextRef,mediaRecorderRef,cameraRef,streamRef,eventsRef})
      
    };
  },[])

async function stopAllMediaDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();

    for (const device of devices) {
      if (device.kind === "videoinput" || device.kind === "audioinput") {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: device.kind === "videoinput" ? { deviceId: device.deviceId } : false,
            audio: device.kind === "audioinput" ? { deviceId: device.deviceId } : false,
          });

          stream.getTracks().forEach(track => track.stop());
        } catch (err) {
          // Ignore errors if device cannot be opened
        }
      }
    }
  } catch (err) {
    console.error("Error stopping all media devices:", err);
  }
}



  useEffect(() => {
    if (cameraInitialized && mediaRecorderRef.current) {
      // Small delay to ensure everything is ready
      setTimeout(startRecording, 1000);
    }
  }, [cameraInitialized]);



  const startFaceMeshCamera = (faceMeshModel) => {
    let lastProcessedTime = 0;
    const interval = 300; // ms

     cameraRef.current = new Camera(videoRef.current, {
      onFrame: async () => {
        const now = Date.now();
        if (now - lastProcessedTime >= interval && videoRef.current && videoRef.current.readyState >= 2) {
          lastProcessedTime = now;
          await faceMeshModel.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    });
     cameraRef.current.start();
  };

  const logEvent = (type, duration = 0) => {
    const newEvent = { type, timestamp: new Date(), durationMs: duration };
    socket.emit("candidate-event",newEvent)
    eventsRef.current.push(newEvent); // <- store in ref
    setEvents((prev) => [...prev, newEvent]); // <- update state for UI
  };

  const handleStopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      logEvent("RECORDING_STOPPED");
    }
  };

  const endInterview = async (blob) => {
    try {
      setSubmiting(true);
      const file = new File([blob], "interview_recording.webm", { type: "video/webm" });
      const formData = new FormData();
      formData.append("video", file);
      formData.append("candidateId", id);
      formData.append("events", JSON.stringify(eventsRef.current));
      formData.append("deductions", eventsRef.current.length - 2);

      await uploadVideo(formData);
      toast.success("Interview uploaded successfully.");
      navigate('/candidate/end-interview')
    }
    catch (e) {
      console.error(e);
      toast.error("Failed to submit interview");
    }finally {
      setSubmiting(false);
    }
  };

  const formatTime = (date) => {
    return date.toTimeString().split(' ')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6 flex flex-col md:flex-row">
      {/* Main Content */}



      <LoadingOverlay visible={(!videoRef || !audioContextRef || !recording) && !submiting} text={'Loading the Interview...'} />
      <LoadingOverlay visible={submiting} text={'Submitting the Interview...'} />

      <div className="flex-1 flex flex-col items-center justify-center mb-6 md:mb-0">
        <h1 className="text-4xl font-extrabold mb-6 text-center">🎤 Candidate Interview</h1>

        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-96 bg-gray-800 rounded-3xl shadow-2xl border-2 border-gray-700"
            autoPlay
            playsInline
            muted
          />
          {recording && (
            <div className="absolute top-4 right-4 flex items-center bg-red-600 px-3 py-1 rounded-full">
              <span className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></span>
              <span className="text-sm font-semibold">Recording</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-4">
          {recording ? (
            <button
              onClick={handleStopRecording}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-full font-semibold"
            >
              End Interview
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-full font-semibold flex items-center"
              disabled={!cameraInitialized}
            >
              <span className="w-3 h-3 bg-white rounded-full mr-2"></span>
              Start Recording
            </button>
          )}

        </div>
      </div>

      {/* Side Column for Event Logs */}
      <div className="w-full md:w-80 md:ml-6 bg-gray-900 rounded-2xl shadow-2xl p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-indigo-400">Event Log</h2>
        <div className="flex-1 overflow-y-auto max-h-96">
          <ul className="text-gray-300 space-y-2">
            {events.map((event, index) => (
              <li key={index} className="p-2 bg-gray-800 rounded">
                <span className="text-gray-400">[{formatTime(event.timestamp)}]</span>{" "}
                {event.type}
                {event.durationMs > 0 && (
                  <span className="text-orange-400 text-sm ml-2">
                    ({Math.round(event.durationMs/1000)}s)
                  </span>
                )}
              </li>
            ))}
            {events.length === 0 && (
              <li className="text-gray-500">No events detected yet...</li>
            )}
          </ul>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <h3 className="font-semibold text-gray-400 mb-2">Detection Status</h3>
          <div className="text-sm text-gray-400">
            <div>Face Detection: <span className="text-green-400">Active</span></div>
            <div>Object Detection: <span className={objectModel ? "text-green-400" : "text-yellow-400"}>
              {objectModel ? "Active" : "Loading..."}
            </span></div>
            <div>Audio Monitoring: <span className="text-green-400">Active</span></div>
            <div>Recording: <span className={recording ? "text-red-400" : "text-gray-400"}>
              {recording ? "In Progress" : "Stopped"}
            </span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateInterview;