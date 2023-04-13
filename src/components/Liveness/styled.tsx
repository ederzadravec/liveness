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

export const Content = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: #eee;
  overflow: hidden;
`;

export const Camera = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
`;

export const Messages = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  color: #fff;
  font-size: 24px;
  padding: 16px 0;
  z-index: 999;
`;

export const Progress = styled.div<{ value: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  width: 100%;
  height: 15px;
  z-index: 999;

  &:before {
    display: block;
    content: " ";
    width: ${({ value }) => `${value}%`};
    height: 100%;
    background: red;
    transition: 0.4s ease;
  }
`;
