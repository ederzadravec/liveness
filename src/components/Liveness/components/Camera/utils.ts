import * as facemesh from "@tensorflow-models/face-landmarks-detection";

export const drawMesh = (
  predictions: facemesh.Face[],
  ctx: CanvasRenderingContext2D
) => {
  if (predictions.length > 0) {
    predictions.forEach((prediction) => {
      const keypoints = prediction.keypoints;

      // Draw Dots
      for (let i = 0; i < keypoints.length; i++) {
        const x = keypoints[i].x;
        const y = keypoints[i].y;

        ctx.beginPath();
        ctx.arc(x, y, 1 /* radius */, 0, 3 * Math.PI);
        ctx.fillStyle = "aqua";
        ctx.fill();
      }
    });
  }
};
