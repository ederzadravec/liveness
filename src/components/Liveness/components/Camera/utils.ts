import * as facemesh from "@tensorflow-models/face-landmarks-detection";

export const drawMesh = (
  faces: facemesh.Face[],
  ctx: CanvasRenderingContext2D
) => {
  if (faces.length > 0) {
    faces.forEach((face) => {
      const keypoints = face.keypoints;
      const box = face.box;

      // Draw Dots
      for (let i = 0; i < keypoints.length; i++) {
        const x = keypoints[i].x;
        const y = keypoints[i].y;

        ctx.beginPath();
        ctx.arc(x, y, 1 /* radius */, 0, 3 * Math.PI);
        ctx.fillStyle = "aqua";
        ctx.fill();
        ctx.rect(box.xMin, box.yMin, box.xMax - box.xMin, box.yMax - box.yMin);
        ctx.strokeStyle = "red";
        ctx.stroke();
      }
    });
  }
};
