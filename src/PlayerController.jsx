import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { CatmullRomCurve3, Vector3 } from "three";
import { damp } from "three/src/math/MathUtils.js";
import { kartSettings } from "./constants";
import { useGameStore } from "./store";
import { Kart } from "./models/Kart";


//useRef gives stable containers that persist across renders without causing rerenders when they change.
export const PlayerController = () => {
  const playerRef = useRef(null);
  const cameraGroupRef = useRef(null);
  const cameraLookAtRef = useRef(null);
  const kartRef = useRef(null);
  const gamepadRef = useRef(null);
  const inputTurn = useRef(0);

  //Here we create our spline
  const pathRef = useRef(new CatmullRomCurve3([new Vector3(-30,0,50), new Vector3(-30, 0, -360)], false, "centripetal"))
  const pathLengthRef = useRef(pathRef.current.getLength())
  const progressRef = useRef(0)

  const [, get] = useKeyboardControls();

  const speedRef = useRef(0);
  const rotationSpeedRef = useRef(0);
  const smoothedDirectionRef = useRef(new Vector3(0, 0, -1));

  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
  const setSpeed = useGameStore((state) => state.setSpeed);
  const setGamepad = useGameStore((state) => state.setGamepad);

  const getGamepad = () => {
    if (navigator.getGamepads) {
      const gamepads = navigator.getGamepads();
      if (gamepads.length > 0) {
        gamepadRef.current = gamepads[0];
        setGamepad(gamepadRef.current);
      }
    }
  };

  function updateSpeed(forward, backward, delta) {
    const maxSpeed = kartSettings.speed.max;

    const gamepadButtons = {
      forward: false,
      backward: false,
    };

    if (gamepadRef.current) {
      gamepadButtons.forward = gamepadRef.current.buttons[0].pressed;
      gamepadButtons.backward = gamepadRef.current.buttons[1].pressed;
    }
    const forwardAccel = Number(forward || gamepadButtons.forward);

    speedRef.current = damp(
      speedRef.current,
      maxSpeed * forwardAccel +
        kartSettings.speed.min * Number(backward || gamepadButtons.backward),
      1.5,
      delta
    );
    setSpeed(speedRef.current);
  }

  function rotatePlayer(left, right, player, delta) {
    const gamepadJoystick = {
      x: 0,
    };

    if (gamepadRef.current) {
      gamepadJoystick.x = gamepadRef.current.axes[0];
    }

    inputTurn.current =
      (-gamepadJoystick.x + (Number(left) - Number(right))) * 0.1;

    rotationSpeedRef.current = damp(
      rotationSpeedRef.current,
      inputTurn.current,
      4,
      delta
    );
    const targetRotation =
      player.rotation.y +
      (rotationSpeedRef.current *
        (speedRef.current > 40 ? 40 : speedRef.current)) /
        kartSettings.speed.max;

    player.rotation.y = damp(player.rotation.y, targetRotation, 8, delta);
  }

  function updatePlayer(player, speed, camera, kart, delta, inputDirection) {
    // Advance along the path based on input (W/S) and current speed; clamp between start and end
    const path = pathRef.current;
    const pathLength = pathLengthRef.current || 1;
    const deltaProgress = inputDirection * (Math.abs(speed) / pathLength) * delta;
    progressRef.current = Math.max(0, Math.min(1, progressRef.current + deltaProgress));
  
    // Sample the path: where the kart should be, and the forward direction to face
    const point = path.getPointAt(progressRef.current);
    const tangent = path.getTangentAt(progressRef.current).normalize();
  
    // Snap the kart’s transform to the path position and align facing to the tangent
    player.position.copy(point);
    const targetRotation = Math.atan2(-tangent.x, -tangent.z);
    player.rotation.y = damp(player.rotation.y, targetRotation, 8, delta);
    kart.rotation.y = damp(kart.rotation.y, 0, 6, delta); // keep body level
  
    // Keep camera following the kart smoothly
    camera.lookAt(kartRef.current.getWorldPosition(new Vector3()));
    camera.position.lerp(cameraGroupRef.current.getWorldPosition(new Vector3()), 10 * delta);
  
    // Publish position to the store (HUD/lighting)
    setPlayerPosition(player.position.clone());
  }

  useFrame((state, delta) => {
    if (!playerRef.current) return;
    const player = playerRef.current;
    const cameraGroup = cameraGroupRef.current;
    const kart = kartRef.current;
    const camera = state.camera;

    if (!player || !cameraGroup || !kart) return;

    const { forward, backward } = get();
    let forwardInput = Number(forward)
    let backwardInput = Number(backward)

    const gamepadButtons = {
      x: 0,
    };

    if (gamepadRef.current) {
      gamepadButtons.x = gamepadRef.current.axes[0];
      forwardInput = forwardInput || Number(gamepadRef.current.buttons[0].pressed)
      backwardInput = backwardInput || Number(gamepadRef.current.button[1].pressed)
    }

    const inputDirection = forwardInput - backwardInput;

    updateSpeed(forward, backward, delta);
    updatePlayer(player, speedRef.current, camera, kart, delta, inputDirection);
    getGamepad();
  });

  return (
    <>
      <group ref={playerRef} position={[-30, 0, 50]}>
        <group ref={cameraGroupRef} position={[0, 1, 5]}></group>

        <group ref={kartRef}>
          <Kart speed={speedRef} inputTurn={inputTurn} />

          <group ref={cameraLookAtRef} position={[0, -3, -9]}></group>
        </group>
      </group>
    </>
  );
};
