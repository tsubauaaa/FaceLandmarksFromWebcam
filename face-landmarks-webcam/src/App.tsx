import React, { useRef } from "react";
import "./App.css";
import Webcam from "react-webcam";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-converter";
import "@tensorflow/tfjs-backend-webgl";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import { MediaPipeFaceMesh } from "@tensorflow-models/face-landmarks-detection/dist/types";
import { drawPoints} from "./drowPoints";



const App: React.FC = () => {
  // Setup references
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load Facemesh
  const runFacemesh = async () => {
    const net = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
    );
      setInterval(() => {
        detectFaceLandmarks(net);
      }, 100);

  };

  const detectFaceLandmarks = async (net: MediaPipeFaceMesh) => {
    // readyState = 4 is HAVE_ENOUGH_DATA
    if(typeof webcamRef.current !== "undefined" && webcamRef.current !== null && webcamRef.current.video?.readyState === 4 && typeof canvasRef.current !== "undefined" && canvasRef.current !== null) {
      // Get video properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width and hight
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas width and height
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      // Detection
      const face = await net.estimateFaces({
        input: video,
      });
      // Get canvas context for drawing
      const ctx = canvasRef.current.getContext("2d")!;
      drawPoints(face, ctx);

    } else {
      return;
    }
  };

  runFacemesh();

  const screenStyle: React.CSSProperties = {
    position: "absolute",
    marginLeft: "auto",
    marginRight: "auto",
    left: 0,
    right: 0,
    textAlign: "center",
    zIndex: 9,
    width: 640,
    height: 480,
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="title">Face Landmark points Detection</div>
        <Webcam audio={false} ref={webcamRef} style={screenStyle} />
        <canvas ref={canvasRef} style={screenStyle} />
      </header>
    </div>
  );
};

export default App;

