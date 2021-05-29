import React, { useRef } from "react";
import "./App.css";
import Webcam from "react-webcam";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-converter";
import "@tensorflow/tfjs-backend-webgl";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import { MediaPipeFaceMesh } from "@tensorflow-models/face-landmarks-detection/dist/types";



const App: React.FC = () => {
  // Setup references
  const webcamRef = useRef<Webcam>(null);

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
    if(typeof webcamRef.current !== "undefined" && webcamRef.current !== null && webcamRef.current.video?.readyState === 4) {
      const video = webcamRef.current.video;
      const face = await net.estimateFaces({
        input: video,
      });
      if(face.length > 0) {
        console.log(face);
      }
    } else {
      return;
    }
  };

  runFacemesh();

  return (
    <div className="App">
      <header className="App-header">
        <div className="title">Face Landmarks Detection</div>
        <Webcam audio={false} ref={webcamRef} height={480} width={640} />
      </header>
    </div>
  );
};

export default App;

