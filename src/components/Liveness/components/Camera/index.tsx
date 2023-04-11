import React from "react";
import * as tf from "@tensorflow/tfjs";
import * as facemesh from "@tensorflow-models/face-detection";
import WebCamComponent from "react-webcam";

import { drawMesh } from "./utils";
import * as S from "./styled";

interface CameraProps {
  onCancel: () => void;
  onFrame: (frame: facemesh.Face) => void;
}

const Camera: React.FC<CameraProps> = ({ onCancel, onFrame }) => {
  const [isLoading, setLoading] = React.useState(true);
  const [frame, setFrame] = React.useState<facemesh.Face>();

  const webcamRef = React.useRef<WebCamComponent>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const detect = async (net: facemesh.FaceDetector) => {
    if (
      webcamRef.current &&
      canvasRef.current &&
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current?.video?.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const face = await net.estimateFaces(video);

      if (face.length !== 1) {
        onCancel();
        return;
      }

      const ctx = canvasRef.current.getContext("2d");
      requestAnimationFrame(() => {
        drawMesh(face, ctx!);
      });

      setFrame(face[0]);
    }
  };

  const runFacemesh = async () => {
    setLoading(true);

    const net = await facemesh.createDetector(
      facemesh.SupportedModels.MediaPipeFaceDetector,
      {
        runtime: "mediapipe",
        modelType: "short",
        solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_detection",
      }
    );

    setLoading(false);

    setInterval(() => {
      detect(net);
    }, 250);
  };

  React.useEffect(() => {
    runFacemesh();
  }, []);

  React.useEffect(() => {
    frame && onFrame(frame);
  }, [frame]);

  return (
    <S.Viewer>
      {isLoading ? "carregando" : "carregado"}
      <S.WebCam ref={webcamRef} />

      <S.Canvas ref={canvasRef} />
    </S.Viewer>
  );
};

export default Camera;
