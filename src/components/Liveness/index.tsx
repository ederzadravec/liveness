import React from "react";
import * as R from "ramda";
import * as facemesh from "@tensorflow-models/face-detection";

import Camera from "./components/Camera";
import * as S from "./styled";

const getKeypoint = (face: facemesh.Face, type: facemesh.Keypoint["name"]) =>
  face.keypoints.find((x) => x.name === type);

const Liveness: React.FC = () => {
  const [isRunning, setRunning] = React.useState(false);
  const [hasPerson, setPerson] = React.useState(false);
  const [isBetterPosition, setBetterPosition] = React.useState(false);
  const [hasRealPerson, setRealPerson] = React.useState(false);
  const [finishLeft, setFinishLeft] = React.useState(false);
  const [finishRight, setFinishRight] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [initialNose, setInitialNose] = React.useState<number>();

  const validatePerson = (face: facemesh.Face) => {
    const leye = getKeypoint(face, "leftEye");
    const reye = getKeypoint(face, "rightEye");
    const mouth = getKeypoint(face, "mouthCenter");
    const nose = getKeypoint(face, "noseTip");

    if (!hasPerson && !R.any(R.isEmpty, [leye, reye, mouth, nose])) {
      setPerson(true);
      setProgress(25);
    }
  };

  const validatePosition = (face: facemesh.Face) => {
    const leye = getKeypoint(face, "leftEye") as facemesh.Keypoint;
    const reye = getKeypoint(face, "rightEye") as facemesh.Keypoint;
    const lear = getKeypoint(face, "leftEarTragion") as facemesh.Keypoint;
    const rear = getKeypoint(face, "rightEarTragion") as facemesh.Keypoint;

    const ldistance = lear.x - leye.x;
    const rdistance = reye.x - rear.x;

    const diff = ldistance - rdistance;
    const minDiff = 3;

    if (diff <= minDiff && diff >= -minDiff) {
      setBetterPosition(true);
      setProgress(50);
    }
  };

  const validateRealPerson = (face: facemesh.Face) => {
    const leye = getKeypoint(face, "leftEye") as facemesh.Keypoint;
    const reye = getKeypoint(face, "rightEye") as facemesh.Keypoint;
    const nose = getKeypoint(face, "noseTip") as facemesh.Keypoint;

    if (!initialNose) setInitialNose(nose.x);

    const betweenEyes = leye.x - reye.x;
    const midSpaceEyes = betweenEyes / 2;
    const minMovement = midSpaceEyes * 0.9;

    if (!finishLeft) {
      const distanceNose = nose.x - initialNose!;

      if (distanceNose >= minMovement) {
        setFinishLeft(true);
        setProgress(75);
      }

      return;
    }

    if (!finishRight) {
      const distanceNose = initialNose! - nose.x;

      if (distanceNose >= minMovement) {
        setFinishRight(true);
        setProgress(100);
      }

      return;
    }
  };

  const finishValidation = () => {
    handleOnCancel();
  };

  const handleOnFrame = (face: facemesh.Face) => {
    isRunning && !hasPerson && validatePerson(face);
    hasPerson && validatePosition(face);
    isBetterPosition && validateRealPerson(face);
    finishLeft && finishRight && finishValidation();
  };

  const handleOnStart = () => {
    setRunning(true);
    setPerson(false);
    setBetterPosition(false);
    setRealPerson(false);
    setFinishLeft(false);
    setFinishRight(false);
    setProgress(0);
  };

  const handleOnCancel = () => {
    setRunning(false);
    setPerson(false);
    setBetterPosition(false);
    setRealPerson(false);
    setFinishLeft(false);
    setFinishRight(false);
    setProgress(0);
  };

  return (
    <S.Container>
      <S.Loading>
        {hasPerson ? "Achamos uma Pessoa" : ""}

        {progress
          ? ` , estamos verificando se ela está presente (${progress}% concluido)`
          : ""}
        {hasPerson
          ? isBetterPosition
            ? " e esta numa boa posição"
            : " e precisa olhar para frente"
          : ""}

        {isBetterPosition && !finishLeft ? " olhe para a esquerda" : ""}

        {finishLeft && !finishRight ? " olhe para a direita" : ""}

        {finishRight && hasRealPerson ? " e ela é realmente está presente" : ""}
      </S.Loading>

      <S.Content>
        <Camera onCancel={handleOnCancel} onFrame={(x) => handleOnFrame(x)} />

        {!isRunning ? (
          <button onClick={handleOnStart}>Iniciar</button>
        ) : (
          <button onClick={handleOnCancel}>Parar</button>
        )}
      </S.Content>
    </S.Container>
  );
};

export default Liveness;
