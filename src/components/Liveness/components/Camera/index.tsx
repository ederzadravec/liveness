import React, { ReactEventHandler, ReactHTMLElement } from "react";
import * as tf from "@tensorflow/tfjs";
import * as facemesh from "@tensorflow-models/face-detection";
import WebCamComponent from "react-webcam";
import { ReactComponent as FaceMask } from "./assets/face-mask.svg";

import { drawMesh } from "./utils";
import * as S from "./styled";

interface CameraProps {
  onCancel: () => void;
  onFrame: (frame: facemesh.Face) => void;
}

const Camera: React.FC<CameraProps> = ({ onCancel, onFrame }) => {
  const [isLoadingFacemesh, setLoadingFacemesh] = React.useState(true);
  const [isLoadingWebcam, setLoadingWebcam] = React.useState(true);
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

      const face = await net.estimateFaces(video, { flipHorizontal: true });

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
    const net = await facemesh.createDetector(
      facemesh.SupportedModels.MediaPipeFaceDetector,
      {
        runtime: "mediapipe",
        modelType: "short",
        solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_detection",
      }
    );

    setLoadingFacemesh(false);

    setInterval(() => {
      detect(net);
    }, 100);
  };

  React.useEffect(() => {
    runFacemesh();
  }, []);

  React.useEffect(() => {
    frame && onFrame(frame);
  }, [frame]);

  return (
    <S.Container>
      <S.Viewer>
        {isLoadingFacemesh || isLoadingWebcam ? "carregando" : "carregado"}

        <S.WebCam
          ref={webcamRef}
          mirrored
          onUserMedia={() => setLoadingWebcam(false)}
          imageSmoothing
        />

        <S.Canvas ref={canvasRef} />

        <S.CameraOverlay as={FaceMask} />
      </S.Viewer>
    </S.Container>
  );
};

export default Camera;
