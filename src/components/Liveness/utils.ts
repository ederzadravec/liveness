import * as facemesh from "@tensorflow-models/face-landmarks-detection";

export const drawMesh = (
  predictions: facemesh.Face[],
  ctx: CanvasRenderingContext2D
) => {
  if (predictions.length > 0) {
    predictions.forEach((prediction) => {
      const keypoints = prediction.keypoints;

      // //  Draw Triangles
      // for (let i = 0; i < TRIANGULATION.length / 3; i++) {
      //   // Get sets of three keypoints for the triangle
      //   const points = [
      //     TRIANGULATION[i * 3],
      //     TRIANGULATION[i * 3 + 1],
      //     TRIANGULATION[i * 3 + 2],
      //   ].map((index) => keypoints[index]);
      //   //  Draw triangle
      //   drawPath(ctx, points, true);
      // }

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
