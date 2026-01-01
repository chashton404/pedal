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
  const pathRef = useRef(new CatmullRomCurve3(
    [
      new Vector3(-30, 0, 50),    // start
      new Vector3(-30, 0, -180),  // straight
      new Vector3(-30, 0, -360),  // end of straight
      new Vector3(0,   0, -420),  // begin turn
      new Vector3(80,  0, -420),  // apex of turn (swinging right)
      new Vector3(140, 0, -360),  // exit turn
      new Vector3(140, 0, -180),  // align to return
      new Vector3(140, 0, 50),    // back up the parallel straight
    ], false, "centripetal"))
  
  const pathLengthRef = useRef(pathRef.current.getLength())
  const progressRef = useRef(0)

  const [, get] = useKeyboardControls();

  //Speed Refs
  const speedRef = useRef(0);
  const rotationSpeedRef = useRef(0);
  const smoothedDirectionRef = useRef(new Vector3(0, 0, -1));

  //Zustand Hooks
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
  const setSpeed = useGameStore((state) => state.setSpeed);
  const setGamepad = useGameStore((state) => state.setGamepad);
  const bikeWatts = useGameStore((state) => state.bikeWatts ?? 0);
  const bodyWeightKg = useGameStore((state) => state.bodyWeight ?? 75);
  const kPower = useGameStore((state) => state.kPower ?? 1);

  //Camera Constants
  const tmpEye = useRef(new Vector3());
  const tmpTarget = useRef(new Vector3());
  const toTarget = useRef(new Vector3());
  const smoothedTarget = useRef(new Vector3());

  const getGamepad = () => {
    if (navigator.getGamepads) {
      const gamepads = navigator.getGamepads();
      if (gamepads.length > 0) {
        gamepadRef.current = gamepads[0];
        setGamepad(gamepadRef.current);
      }
    }
  };

  function updateSpeed(forward, backward, delta, watts, massKg, powerScale = 1) {
    const maxSpeed = kartSettings.speed.max;
    const minSpeed = kartSettings.speed.min;

    const gamepadButtons = {
      forward: false,
      backward: false,
    };

    if (gamepadRef.current) {
      gamepadButtons.forward = gamepadRef.current.buttons[0].pressed;
      gamepadButtons.backward = gamepadRef.current.buttons[1].pressed;
    }

    const throttleInput = Number(forward || gamepadButtons.forward);
    const brakeInput = Number(backward || gamepadButtons.backward);

    const speed = speedRef.current;
    const v = Math.max(Math.abs(speed), 0.1); // avoid div/zero for power-based accel
    const effectiveMass = Math.max(massKg, 1);
    const effectiveWatts = Math.max(watts, 0);

    // Power -> acceleration: a = (eff * P) / (m * v)
    const drivetrainEff = 0.95;
    const bikeAccel = (drivetrainEff * effectiveWatts * powerScale) / (effectiveMass * v);

    // Keyboard throttle as a small additive accel to let non-bike input still work
    const manualAccel = throttleInput * (maxSpeed * 0.08);

    // Simple quadratic drag opposing motion
    const dragCoeff = 0.02;
    const dragAccel = dragCoeff * speed * speed;

    // Braking decel
    const brakeAccel = brakeInput * (maxSpeed * 0.12);

    let netAccel = bikeAccel + manualAccel - brakeAccel;
    netAccel -= Math.sign(speed || 1) * dragAccel;

    speedRef.current = speedRef.current + netAccel * delta;
    speedRef.current = Math.min(Math.max(speedRef.current, minSpeed), maxSpeed);
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
  
    //Constants for the camera
    //Desired positions
    const dersiredEye = cameraGroupRef.current.getWorldPosition(tmpEye.current);
    const desiredTarget = kartRef.current.getWorldPosition(tmpTarget.current);
    
    // Smooth target with a clamped step
    const maxStep = 1.5 //this can be tuned
    toTarget.current.copy(desiredTarget).sub(smoothedTarget.current);
    if (toTarget.current.length() > maxStep) {
      toTarget.current.setLength(maxStep);
    }
    smoothedTarget.current.add(toTarget.current);

    // Smooth eye
    const t = Math.min(1, 5 * delta); // tune 5
    camera.position.lerp(dersiredEye, t)
    camera.lookAt(smoothedTarget.current);
  
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
      backwardInput = backwardInput || Number(gamepadRef.current.buttons[1].pressed)
    }

    const massKg = Math.max((bodyWeightKg || 0) + kartSettings.weight, 1);
    const watts = bikeWatts || 0;

    let inputDirection = forwardInput - backwardInput;
    if (inputDirection === 0 && watts > 0) {
      inputDirection = 1; // treat pedaling power as forward intent
    }

    updateSpeed(forward, backward, delta, watts, massKg, kPower);
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
