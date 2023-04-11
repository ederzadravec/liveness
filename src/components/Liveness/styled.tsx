import styled from "styled-components";
import WebCamComponent from "react-webcam";

export const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #333;
`;

export const Loading = styled.div`
  height: 40px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  color: #fff;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: row;
  background: #eee;
`;

export const WebCam = styled(WebCamComponent)`
  width: 600px;
  height: 480px;
  border: 1px solid #000;
`;

export const Canvas = styled.canvas`
  width: 600px;
  height: 480px;
  border: 1px solid #000;
  background: #333;
`;
