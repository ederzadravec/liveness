import React from "react";
import * as R from "ramda";
import * as facemesh from "@tensorflow-models/face-detection";

import Camera from "./components/Camera";
import * as S from "./styled";

const getKeypoint = (face: facemesh.Face, type: facemesh.Keypoint["name"]) =>
  face.keypoints.find((x) => x.name === type);

const Liveness: React.FC = () => {
  const [hasPerson, setPerson] = React.useState(false);
  const [isRunning, setRunning] = React.useState(false);
  const [distance, setDistance] = React.useState<"NEAR" | "FAR" | "PERFECT">(
    "FAR"
  );
  const [isBetterPosition, setBetterPosition] = React.useState(false);
  const [hasRealPerson, setRealPerson] = React.useState(false);
  const [finishLeft, setFinishLeft] = React.useState(false);
  const [finishRight, setFinishRight] = React.useState(false);
  const [isDone, setDone] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [initialNose, setInitialNose] = React.useState<number>();

  // Procura rosto e valida distancia
  const validatePerson = (face: facemesh.Face) => {
    const leye = getKeypoint(face, "leftEye");
    const reye = getKeypoint(face, "rightEye");
    const mouth = getKeypoint(face, "mouthCenter");
    const nose = getKeypoint(face, "noseTip");
    const box = face.box;

    // Cancelar validação caso saia da distancia ou da frente da camera
    if (hasPerson && R.any(R.isEmpty, [leye, reye, mouth, nose])) {
      handleOnCancel();
    }

    // Verifica se tem rosto
    if (!hasPerson && !R.any(R.isEmpty, [leye, reye, mouth, nose])) {
      setPerson(true);
    }

    // Verifica se esta longe
    if (box.height < 155) {
      setDistance("FAR");
      return;
    }

    // Verifica se esta muito próximo
    if (box.height > 185) {
      setDistance("NEAR");
      return;
    }

    // Distancia ideal
    if (distance !== "PERFECT") {
      setDistance("PERFECT");
    }
  };

  // Verifica se esta de frente para a macera
  const validatePosition = (face: facemesh.Face) => {
    const leye = getKeypoint(face, "leftEye") as facemesh.Keypoint;
    const reye = getKeypoint(face, "rightEye") as facemesh.Keypoint;
    const lear = getKeypoint(face, "leftEarTragion") as facemesh.Keypoint;
    const rear = getKeypoint(face, "rightEarTragion") as facemesh.Keypoint;
    const nose = getKeypoint(face, "noseTip") as facemesh.Keypoint;
    const box = face.box;

    const ldistance = lear.x - leye.x;
    const rdistance = reye.x - rear.x;

    const diff = ldistance - rdistance;
    const minDiff = 5;

    // Centralizar o rosto
    if (box.yMin < 170 || box.yMin > 240 || box.xMin < 210 || box.xMin > 260) {
      return;
    }

    // Garantir que esta olhando para frente
    if (diff <= minDiff && diff >= minDiff * -1) {
      setBetterPosition(true);
      setProgress(33);
      setInitialNose(nose.x);
    }
  };

  // Verifica se a pessoa é real ou foto
  const validateRealPerson = (face: facemesh.Face) => {
    const leye = getKeypoint(face, "leftEye") as facemesh.Keypoint;
    const reye = getKeypoint(face, "rightEye") as facemesh.Keypoint;
    const nose = getKeypoint(face, "noseTip") as facemesh.Keypoint;

    // const betweenEyes = leye.x - reye.x;
    // const midSpaceEyes = betweenEyes / 2;
    // const minMovement = midSpaceEyes * 0.9;

    if (!finishLeft) {
      // const distanceNose = initialNose! - nose.x;

      if (nose.x - reye.x <= 10) {
        setFinishLeft(true);
        setProgress(66);
      }

      return;
    }

    if (!finishRight) {
      // const distanceNose = nose.x - initialNose!;

      if (leye.x - nose.x <= 10) {
        setFinishRight(true);
        setProgress(100);
      }

      return;
    }
  };

  const finishValidation = () => {
    setDone(true);
    setRunning(false);
    setPerson(false);
    setDistance("FAR");
    setBetterPosition(false);
    setRealPerson(false);
    setFinishLeft(false);
    setFinishRight(false);
  };

  const handleOnFrame = (face: facemesh.Face) => {
    validatePerson(face);
    isRunning && hasPerson && validatePosition(face);
    isBetterPosition && validateRealPerson(face);
    finishLeft && finishRight && finishValidation();
  };

  const getMessage = () => {
    if (isDone) return "Concluido";
    if (distance === "FAR") return "Se aproxime da camera";
    if (distance === "NEAR") return "Se afaste da camera";
    if (!hasPerson) return "Nenhum rosto encontrado";
    if (!isRunning) return "Aperte em iniciar";
    if (!isBetterPosition)
      return "Fique de frente para a camera e centralize o rosto ";
    if (!finishLeft) return "Vire o rosto para a esquerda";
    if (!finishRight) return "Vire o rosto para a direita";
    return "";
  };

  const handleOnStart = () => {
    setRunning(true);
    setPerson(false);
    setDistance("FAR");
    setBetterPosition(false);
    setRealPerson(false);
    setFinishLeft(false);
    setFinishRight(false);
    setDone(false);
    setProgress(0);
  };

  const handleOnCancel = () => {
    setRunning(false);
    setPerson(false);
    setDistance("FAR");
    setBetterPosition(false);
    setRealPerson(false);
    setFinishLeft(false);
    setFinishRight(false);
    setProgress(0);
  };

  return (
    <S.Container>
      <S.Content>
        <S.Camera>
          <S.Messages>{getMessage()}</S.Messages>

          <S.Progress value={progress} />

          <Camera onCancel={handleOnCancel} onFrame={(x) => handleOnFrame(x)} />
        </S.Camera>

        {!isRunning ? (
          <button disabled={!hasPerson} onClick={handleOnStart}>
            Iniciar
          </button>
        ) : (
          <button onClick={handleOnCancel}>Parar</button>
        )}
      </S.Content>
    </S.Container>
  );
};

export default Liveness;
