import React from "react";
import * as R from "ramda";
import * as facemesh from "@tensorflow-models/face-detection";

import Camera from "./components/Camera";
import * as S from "./styled";

const getKeypoint = (face: facemesh.Face, type: facemesh.Keypoint["name"]) => {
  return face.keypoints.find((x) => x.name === type);
};

const validateHorizontalMovement = (
  smallDistance: number,
  bigDistance: number,
  minDistance: number
) => {
  const movement = smallDistance <= minDistance;

  const validProportion = smallDistance <= bigDistance * 0.35;

  return movement && validProportion;
};

const getVoice = () => {
  const VOICES = ["Luciana"];

  const voices = window.speechSynthesis
    .getVoices()
    .filter((x) => x.lang === "pt-BR");

  const betterVoice = VOICES.reduce<SpeechSynthesisVoice | undefined>(
    (acc, voice) => acc || voices?.find((x) => x.name == voice),
    undefined
  );

  return betterVoice || voices[0];
};

type StepType = "NONE" | "POSITION" | "MOVE" | "DONE";
type DistanceType = "NONE" | "NEAR" | "FAR" | "PERFECT";
type MovementType = "UP" | "DOWN" | "LEFT" | "RIGHT";

const Liveness: React.FC = () => {
  const [isSpeaking, setSpeak] = React.useState<boolean>(false);
  const [step, setStep] = React.useState<StepType>("NONE");
  const [distance, setDistance] = React.useState<DistanceType>("NONE");
  const [movements, setMovements] = React.useState<Array<MovementType>>([]);
  const [hasPerson, setPerson] = React.useState(false);
  const [isRunning, setRunning] = React.useState(false);
  const [progress, setProgress] = React.useState<number>(0);
  const [betterVoice, setBetterVoice] = React.useState<SpeechSynthesisVoice>();

  // Procura rosto
  const validatePerson = (face: facemesh.Face) => {
    const leye = getKeypoint(face, "leftEye");
    const reye = getKeypoint(face, "rightEye");
    const lear = getKeypoint(face, "leftEarTragion");
    const rear = getKeypoint(face, "rightEarTragion");
    const mouth = getKeypoint(face, "mouthCenter");
    const nose = getKeypoint(face, "noseTip");

    // Cancelar validação caso saia da distancia ou da frente da camera
    if (hasPerson && R.any(R.isEmpty, [leye, reye, lear, rear, mouth, nose])) {
      handleOnCancel();
    }

    // Verifica se tem rosto
    if (
      !hasPerson &&
      !R.any(R.isEmpty, [leye, reye, lear, rear, mouth, nose])
    ) {
      setPerson(true);
    }
  };

  // Valida distancia
  const validateDistance = (face: facemesh.Face) => {
    const lear = getKeypoint(face, "leftEarTragion");
    const rear = getKeypoint(face, "rightEarTragion");

    if (distance === "PERFECT") {
      setStep("POSITION");
    }

    // Distancia ideal
    if (distance === "PERFECT") {
      return;
    }

    const distanceEar = lear?.x! - rear?.x!;
    const minDistance = 150;
    const maxDistance = 180;

    // Verifica se esta longe
    if (distanceEar < minDistance) {
      setDistance("FAR");
      return;
    }

    // Verifica se esta muito próximo
    if (distanceEar > maxDistance) {
      setDistance("NEAR");
      return;
    }

    // Distancia ideal
    setDistance("PERFECT");
  };

  // Verifica se esta de frente para a camera
  const validatePosition = (face: facemesh.Face) => {
    const leye = getKeypoint(face, "leftEye") as facemesh.Keypoint;
    const reye = getKeypoint(face, "rightEye") as facemesh.Keypoint;
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
      setStep("MOVE");
      setProgress(25);
    }
  };

  // Verifica se a pessoa é real ou foto
  const validateRealPerson = (face: facemesh.Face) => {
    const leye = getKeypoint(face, "leftEye") as facemesh.Keypoint;
    const reye = getKeypoint(face, "rightEye") as facemesh.Keypoint;
    const lear = getKeypoint(face, "leftEarTragion") as facemesh.Keypoint;
    const rear = getKeypoint(face, "rightEarTragion") as facemesh.Keypoint;
    const nose = getKeypoint(face, "noseTip") as facemesh.Keypoint;

    const maxToleranceMovement = 15;
    const midYEar = (lear.y + rear.y) / 2;
    const midYEye = (leye.y + reye.y) / 2;

    const hasUp = movements?.includes("UP");
    const hasDown = movements?.includes("DOWN");
    const hasLeft = movements?.includes("LEFT");
    const hasRight = movements?.includes("RIGHT");

    if (movements.length >= 3) {
      setStep("DONE");
    }

    if (!hasUp) {
      if (nose.y <= midYEar - 5) {
        setMovements((prev) => [...prev, "UP"]);
        setProgress((prev) => prev + 25);
        return;
      }
    }

    if (!hasDown) {
      if (midYEye >= midYEar - 5) {
        setMovements((prev) => [...prev, "DOWN"]);
        setProgress((prev) => prev + 25);
        return;
      }
    }

    if (
      !hasLeft &&
      validateHorizontalMovement(
        nose.x - reye.x,
        leye.x - nose.x,
        maxToleranceMovement
      )
    ) {
      setMovements((prev) => [...prev, "LEFT"]);
      setProgress((prev) => prev + 25);
      return;
    }

    if (
      !hasRight &&
      validateHorizontalMovement(
        leye.x - nose.x,
        nose.x - reye.x,
        maxToleranceMovement
      )
    ) {
      setMovements((prev) => [...prev, "RIGHT"]);
      setProgress((prev) => prev + 25);
      return;
    }
  };

  const finishValidation = () => {
    setRunning(false);
    setPerson(false);
    setDistance("FAR");
  };

  const handleOnFrame = (face: facemesh.Face) => {
    validatePerson(face);

    if (!isRunning) return;

    !isSpeaking && step === "NONE" && validateDistance(face);
    !isSpeaking && step === "POSITION" && validatePosition(face);
    !isSpeaking && step === "MOVE" && validateRealPerson(face);
    !isSpeaking && step === "DONE" && finishValidation();
  };

  const getMessage = (toSpeak: boolean = false) => {
    const MESSAGES = {
      FAR: "Aproxime um pouco o rosto",
      NEAR: "Afaste um pouco o rosto",
      PERFECT: "",
      NONE: "",
      POSITION: "Centralize o rosto no circulo",
      MOVE: "Movimente a cabeça, olhe para os lados, para cima e para baixo",
      DONE: "Concluido, estamos salvando os dados",
    };

    if (toSpeak) return MESSAGES?.[step] || "";

    return MESSAGES?.[distance] || MESSAGES?.[step] || "";
  };

  const handleOnStart = () => {
    setRunning(true);
    setPerson(false);
    setStep("NONE");
    setDistance("NONE");
    setMovements([]);
    setProgress(0);
    setSpeak(false);
  };

  const handleOnCancel = () => {
    setStep("NONE");
    setRunning(false);
    setPerson(false);
    setDistance("NONE");
    setMovements([]);
    setProgress(0);
    setSpeak(false);
  };

  // Fala a etapa atual
  const speakMessage = () => {
    const message = getMessage(true);

    if (!message) return;

    setSpeak(true);

    const speech = new SpeechSynthesisUtterance();
    speech.voice = betterVoice!;
    speech.lang = "pt-BR";
    speech.text = message;
    speech.rate = 1;

    speech.onend = () => {
      setSpeak(false);
    };

    window.speechSynthesis.speak(speech);
  };

  React.useEffect(() => {
    speakMessage();
  }, [step]);

  React.useEffect(() => {
    setBetterVoice(getVoice());

    window.speechSynthesis.onvoiceschanged = () => {
      setBetterVoice(getVoice());
    };
  }, []);

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
