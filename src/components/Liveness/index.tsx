import React from "react";
import * as tf from "@tensorflow/tfjs";
// import * as facemesh from "@tensorflow-models/face-landmarks-detection";
import * as facemesh from "@tensorflow-models/face-detection";
import WebCamComponent from "react-webcam";

import { drawMesh } from "./utils";
import * as S from "./styled";

const Liveness: React.FC = () => {
  const [loading, setLoading] = React.useState(false);

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
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      // Set canvas width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const face = await net.estimateFaces(video);

      console.log(face);

      // Get canvas context
      const ctx = canvasRef.current.getContext("2d");
      requestAnimationFrame(() => {
        drawMesh(face, ctx!);
      });
    }
  };

  const runFacemesh = async () => {
    setLoading(true);

    const net = await facemesh.createDetector(
      facemesh.SupportedModels.MediaPipeFaceDetector,
      {
        runtime: "mediapipe",
        modelType: "full",
        solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_detection",
      }
    );

    setLoading(false);

    setInterval(() => {
      detect(net);
    }, 10);
  };

  React.useEffect(() => {
    runFacemesh();
  }, []);

  return (
    <S.Container>
      <S.Loading>{loading ? "Carregando ..." : "Pronto"}</S.Loading>

      <S.Content>
        <S.WebCam ref={webcamRef} />

        <S.Canvas ref={canvasRef} />
      </S.Content>
    </S.Container>
  );
};

export default Liveness;
