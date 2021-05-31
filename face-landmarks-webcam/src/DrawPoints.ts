import { AnnotatedPrediction } from "@tensorflow-models/facemesh";
import { Coords3D } from "@tensorflow-models/facemesh/dist/util";

// Draw the points
export const drawPoints = (predictions: AnnotatedPrediction[], ctx: CanvasRenderingContext2D) => {
    if(predictions.length > 0) {
        predictions.forEach(prediction => {
            const keypoints  = prediction.scaledMesh as Coords3D;
            for(let i = 0; i < keypoints.length; i++) {
                const x = keypoints[i][0];
                const y = keypoints[i][1];
                ctx.beginPath();
                ctx.arc(x,y,1,0,3*Math.PI);
                ctx.fillStyle = "aqua";
                ctx.fill();
        }
        });
    }
};