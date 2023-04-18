import styled, { css } from "styled-components";

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
  position: relative;
  display: flex;
  max-width: 640px;
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
  width: calc(100% - 48px);
  justify-content: center;
  align-items: center;
  position: absolute;
  text-align: center;
  top: 0;
  left: 0;
  color: #fff;
  font-size: 24px;
  padding: 16px 24px;
  z-index: 999;

  @media (max-width: 400px) {
    font-size: 20px;
    width: calc(100% - 40px);
    padding: 12px 20px;
  }
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
    transition: 0.4s ease;
  }
`;

export const CameraBorder = styled.div<{ isActive: boolean; loading: string }>`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  width: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
  border: 4px solid ${({ isActive }) => (isActive ? "green" : "yellow")};
  border-radius: 50%;
  background: ${({ isActive }) => (isActive ? "transparent" : "#0007")};
  transition: ease 0.4s;

  &:before {
    display: block;
    opacity: ${({ isActive }) => (isActive ? 0 : 1)};
    font-size: 28px;
    color: #fff;
    content: "Aguarde";
    transition: ease 0.4s;
  }
`;

export const Markers = styled.div<{ show: boolean }>`
  position: absolute;
  height: 300px;
  width: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: ease 0.4s;
`;

const ElippseMarker = css`
  content: " ";
  display: block;
  height: 280px;
  width: 180px;
  margin: 5px;
  border: 4px solid red;
  border-radius: 50%;
`;

export const MarkerTop = styled.div<{ isActive: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 15px;
  width: 100%;
  overflow: hidden;

  &:before {
    ${ElippseMarker};
    border-color: ${({ isActive, theme }) => (isActive ? "green" : "red")};
  }
`;

export const MarkerBottom = styled.div<{ isActive: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 15px;
  width: 100%;
  overflow: hidden;
  transform: rotate(180deg);

  &:before {
    ${ElippseMarker};
    border-color: ${({ isActive, theme }) => (isActive ? "green" : "red")};
  }
`;

export const MarkerLeft = styled.div<{ isActive: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 15px;
  overflow: hidden;

  &:before {
    ${ElippseMarker};
    border-color: ${({ isActive, theme }) => (isActive ? "green" : "red")};
  }
`;

export const MarkerRight = styled.div<{ isActive: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 15px;
  overflow: hidden;
  transform: rotate(180deg);

  &:before {
    ${ElippseMarker}
    border-color:${({ isActive, theme }) => (isActive ? "green" : "red")};
  }
`;

export const FooterButton = styled.div`
  position: absolute;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  bottom: 24px;
  width: calc(100% - 64px);
  z-index: 999;
  padding: 0 32px;
`;

export const Icon = styled.span<{ isActive: boolean }>`
  opacity: ${({ isActive }) => (isActive ? 1 : 0)};
  transition: ease 0.4s;
  color: #fff;
  font-size: 32px;
`;

export const Button = styled.button`
  border: 1px solid #fff;
  background: transparent;
  color: #fff;
  font-size: 18px;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;

  :disabled {
    cursor: not-allowed;
  border: 1px solid #bbb;
  color: #bbb;
  }
`;
