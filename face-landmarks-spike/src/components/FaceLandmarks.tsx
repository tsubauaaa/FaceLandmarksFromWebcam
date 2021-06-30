import React, { useState, useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-converter";
import "@tensorflow/tfjs-backend-webgl";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import { Coords3D } from "@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh/util";
import {
  AnnotatedPrediction,
  MediaPipeFaceMesh,
} from "@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh";
import { Grid } from "@material-ui/core";

const FaceLandmarks: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<MediaPipeFaceMesh | null>(null);
  const [landmarks, setLandmarks] = useState<AnnotatedPrediction[] | null>(
    null
  );
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    faceLandmarksDetection
      .load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh)
      .then((net) => setModel(net));
  }, []);

  useEffect(() => {
    if (
      !webcamRef ||
      !canvasRef ||
      !landmarks ||
      webcamRef.current?.video?.readyState !== 4
    )
      return;
    const video = webcamRef.current.video;

    video.width = video.videoWidth;
    video.height = video.videoHeight;

    canvasRef.current!.width = video.videoWidth;
    canvasRef.current!.height = video.videoHeight;

    const ctx = canvasRef.current!.getContext("2d")!;
    drawLandmarks(landmarks, ctx);
  }, [landmarks]);

  const drawLandmarks = (
    landmarks: AnnotatedPrediction[],
    ctx: CanvasRenderingContext2D
  ) => {
    if (landmarks[0]) {
      landmarks.forEach((landmark) => {
        const keypoints = landmark.scaledMesh as Coords3D;
        for (let i = 0; i < keypoints.length; i++) {
          const x = keypoints[i][0];
          const y = keypoints[i][1];
          ctx?.beginPath();
          ctx?.arc(x, y, 1, 0, 3 * Math.PI);
          ctx?.fill();
        }
      });
    }
  };

  const estimate = useCallback(() => {
    if (!webcamRef || !model || webcamRef.current?.video?.readyState !== 4)
      return;

    const video = webcamRef.current.video;
    model
      .estimateFaces({
        input: video,
      })
      .then((landmarks) => setLandmarks(landmarks));
  }, [model]);

  const start = useCallback(() => {
    console.log("開始");
    if (!timerId) {
      clearTimeout(timerId!);
    }
    setTimerId(
      setInterval(() => {
        estimate();
      }, 100)
    );
  }, [estimate, timerId]);

  const stop = useCallback(() => {
    console.log("停止");
    if (!timerId) return;
    clearInterval(timerId);
    setTimerId(null);
  }, [timerId]);

  return (
    <div>
      <Grid container justify="center" direction="column">
        <Grid item>
          <Webcam audio={false} ref={webcamRef} />
          {timerId && <canvas ref={canvasRef} />}
        </Grid>
        <Grid item>
          <button onClick={start}>開始</button>
          <button onClick={stop}>停止</button>
        </Grid>
      </Grid>
    </div>
  );
};

export default FaceLandmarks;
