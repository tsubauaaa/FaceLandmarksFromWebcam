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
import styles from "./FaceLandmarks.module.css";
import firebase from "firebase/app";
import { db } from "../firebase";

const FaceLandmarks: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<MediaPipeFaceMesh | null>(null);
  const [preds, setPreds] = useState<AnnotatedPrediction[] | null>(null);
  const [analyzingTimerId, setAnalyzingTimerId] =
    useState<NodeJS.Timeout | null>(null);
  const [storeTimerId, setStoreTimerId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    faceLandmarksDetection
      .load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh)
      .then((net) => setModel(net));
  }, []);

  useEffect(() => {
    if (
      !webcamRef ||
      !canvasRef.current ||
      !preds ||
      webcamRef.current?.video?.readyState !== 4
    )
      return;
    const video = webcamRef.current.video;

    video.width = video.videoWidth;
    video.height = video.videoHeight;

    canvasRef.current.width = video.videoWidth;
    canvasRef.current.height = video.videoHeight;

    const ctx = canvasRef.current!.getContext("2d")!;

    if (preds[0]) {
      preds.forEach((pred) => {
        const keypoints = pred.scaledMesh as Coords3D;
        for (let i = 0; i < keypoints.length; i++) {
          const x = keypoints[i][0];
          const y = keypoints[i][1];
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, 3 * Math.PI);
          ctx.fillStyle = "aqua";
          ctx.fill();
        }
      });
    }
  }, [preds]);

  const estimate = useCallback(() => {
    if (!webcamRef || !model || webcamRef.current?.video?.readyState !== 4)
      return;

    const video = webcamRef.current.video;
    model
      .estimateFaces({
        input: video,
      })
      .then((p) => setPreds(p));
  }, [model]);

  const store = useCallback(() => {
    // db.collection("landmarks").add({
    //   timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    //   landmarks: landmarks,
    // });
  }, [preds]);

  const startAnalyzing = useCallback(() => {
    if (!analyzingTimerId || !storeTimerId) {
      clearTimeout(analyzingTimerId!);
    }
    setAnalyzingTimerId(
      setInterval(() => {
        estimate();
      }, 100)
    );
    setStoreTimerId(
      setInterval(() => {
        store();
      }, 5000)
    );
  }, [estimate, analyzingTimerId, store, storeTimerId]);

  const stopAnalyzing = useCallback(() => {
    if (!analyzingTimerId || !storeTimerId) return;
    clearInterval(analyzingTimerId);
    clearInterval(storeTimerId);
    setAnalyzingTimerId(null);
    setStoreTimerId(null);
  }, [analyzingTimerId, storeTimerId]);

  return (
    <>
      <Grid container direction="column" justify="center" alignItems="center">
        <Grid item>
          <Webcam className={styles.webcam} audio={false} ref={webcamRef} />
          {analyzingTimerId && (
            <canvas className={styles.canvas} ref={canvasRef} />
          )}
        </Grid>
        <Grid
          className={styles.button_start}
          item
          spacing={2}
          container
          justify="center"
        >
          <Grid item className={styles.button}>
            <button onClick={startAnalyzing}>開始</button>
          </Grid>
          <Grid item className={styles.button_stop}>
            <button onClick={stopAnalyzing}>停止</button>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default FaceLandmarks;
