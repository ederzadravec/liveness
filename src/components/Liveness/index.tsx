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
    const nose = getKeypoint(face, "noseTip") as facemesh.Keypoint;
    const box = face.box;

    const maxToleranceBox = 20;
    const midX = 640 / 2;
    const midY = 480 / 2;

    // Centralizar o rosto na horizontal
    const midXBox = box.xMin + box.width / 2;

    if (
      midXBox <= midX - maxToleranceBox ||
      midXBox >= midX + maxToleranceBox
    ) {
      return;
    }

    // Centralizar o rosto na vertical
    const midYEye = (leye.y + reye.y) / 2;

    if (
      midYEye <= midY - maxToleranceBox ||
      midYEye >= midY + maxToleranceBox
    ) {
      return;
    }

    // Garantir que esta olhando para frente
    const ldistance = reye.x - box.xMin;
    const rdistance = box.xMax - leye.x;

    const diff = ldistance - rdistance;
    const maxToleranceEyes = 5;

    if (diff <= maxToleranceEyes) {
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

    const maxToleranceMovement = 12;

    if (!finishLeft) {
      if (nose.x - reye.x <= maxToleranceMovement) {
        setFinishLeft(true);
        setProgress(66);
      }

      return;
    }

    if (!finishRight) {
      if (leye.x - nose.x <= maxToleranceMovement) {
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
    isRunning && hasPerson && !isBetterPosition && validatePosition(face);
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
