import styled from "styled-components";
import WebCamComponent from "react-webcam";

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 480px;
  width: 100%;
  max-width: 640px;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

export const Viewer = styled.div<{ loading?: boolean }>`
  position: relative;
  min-width: 640px;
  max-width: 640px;
  height: 480px;
`;

export const WebCam = styled(WebCamComponent)`
  position: absolute;
  top: 0;
  left: 0;
  width: 640px;
  height: 480px;
`;

export const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 640px;
  height: 480px;
`;

export const CameraOverlay = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 640px;
  height: 480px;
`;
