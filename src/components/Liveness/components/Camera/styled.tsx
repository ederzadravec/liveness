import styled from "styled-components";
import WebCamComponent from "react-webcam";

export const Viewer = styled.div<{ loading?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: row;
  width: 600px;
  height: 480px;
`;

export const WebCam = styled(WebCamComponent)`
  position: absolute;
  top: 0;
  left: 0;
  width: 600px;
  height: 480px;
  border: 1px solid #000;
`;

export const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 600px;
  height: 480px;
  border: 1px solid #000;
`;
