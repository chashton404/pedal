import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Vector3 } from "three";
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
  const jumpOffset = useRef(0);
  const gamepadRef = useRef(null);
  const inputTurn = useRef(0);

  const [, get] = useKeyboardControls();

  const speedRef = useRef(0);
  const rotationSpeedRef = useRef(0);
  const smoothedDirectionRef = useRef(new Vector3(0, 0, -1));

  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
  const setIsBoosting = useGameStore((state) => state.setIsBoosting);
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
    setIsBoosting(false);

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

  function updatePlayer(player, speed, camera, kart, delta) {
    const desiredDirection = new Vector3(
      -Math.sin(player.rotation.y),
      0,
      -Math.cos(player.rotation.y)
    );

    smoothedDirectionRef.current.lerp(desiredDirection, 12 * delta);
    const dir = smoothedDirectionRef.current;

    const angle = Math.atan2(
      desiredDirection.x * dir.z - desiredDirection.z * dir.x,
      desiredDirection.x * dir.x + desiredDirection.z * dir.z
    );

    kart.rotation.y = damp(
      kart.rotation.y,
      angle * 1.3,
      6,
      delta
    );

    camera.lookAt(kartRef.current.getWorldPosition(new Vector3()));
    camera.position.lerp(
      cameraGroupRef.current.getWorldPosition(new Vector3()),
      24 * delta
    );
    

    // const body = useGameStore.getState().body;
    // if(body){
    //   cameraGroupRef.current.position.y = lerp(cameraGroupRef.current.position.y, body.position.y + 2, 8 * delta);
    //   cameraLookAtRef.current.position.y = body.position.y;
    // }
    const direction = smoothedDirectionRef.current;

    // Calculate desired new position
    const desiredX = player.position.x + direction.x * speed * delta;
    const desiredZ = player.position.z + direction.z * speed * delta;
    player.position.x = desiredX;
    player.position.z = desiredZ;

    setPlayerPosition(player.position);
  }

  useFrame((state, delta) => {
    if (!playerRef.current) return;
    const player = playerRef.current;
    const cameraGroup = cameraGroupRef.current;
    const kart = kartRef.current;
    const camera = state.camera;

    if (!player || !cameraGroup || !kart) return;

    const { forward, backward, left, right } = get();

    const gamepadButtons = {
      x: 0,
    };

    if (gamepadRef.current) {
      gamepadButtons.x = gamepadRef.current.axes[0];
    }
    updateSpeed(forward, backward, delta);
    rotatePlayer(left, right, player, delta);
    updatePlayer(player, speedRef.current, camera, kart, delta);
    getGamepad();
  });

  return (
    <>
      <group></group>
      <group ref={playerRef}>
        <group ref={cameraGroupRef} position={[0, 1, 5]}></group>

{/* <OrbitControls/> */}
        <group ref={kartRef}>
          <Kart speed={speedRef} jumpOffset={jumpOffset} inputTurn={inputTurn} />

          <group ref={cameraLookAtRef} position={[0, -2, -9]}></group>
        </group>
      </group>

      {/* <OrbitControls/> */}
    </>
  );
};
