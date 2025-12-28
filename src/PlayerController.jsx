import { useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { Vector3, MeshBasicMaterial } from "three";
import { damp } from "three/src/math/MathUtils.js";
import { kartSettings } from "./constants";
import { useGameStore } from "./store";
import gsap from "gsap";
import { Kart } from "./models/Kart";
import { buildCollider, checkCollision, kartColliderSettings } from "./utils/KartCollision";
import { MeshBVHHelper } from "three-mesh-bvh";

// Check for debug mode in URL (?debug)
const isDebugMode = typeof window !== "undefined" && window.location.search.includes("debug");
if (isDebugMode) console.log("🔧 Debug mode enabled - collision visualization active");

export const PlayerController = () => {
  const playerRef = useRef(null);
  const cameraGroupRef = useRef(null);
  const cameraLookAtRef = useRef(null);
  const kartRef = useRef(null);
  const jumpIsHeld = useRef(false);
  const jumpOffset = useRef(0);
  const isJumping = useRef(false);
  const gamepadRef = useRef(null);
  const inputTurn = useRef(0);

  const [, get] = useKeyboardControls();

  const speedRef = useRef(0);
  const rotationSpeedRef = useRef(0);
  const smoothedDirectionRef = useRef(new Vector3(0, 0, -1));
  
  // Collision stun system
  const collisionStunTimer = useRef(0); // Remaining stun time
  const COLLISION_STUN_DURATION = 1.5; // Seconds
  const COLLISION_BOUNCE_SPEED = -15; // Negative = backwards

  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
  const setIsBoosting = useGameStore((state) => state.setIsBoosting);
  const setSpeed = useGameStore((state) => state.setSpeed);
  const setGamepad = useGameStore((state) => state.setGamepad);

  // Collision system
  const colliderRef = useRef(null);
  const colliderBuilt = useRef(false);
  const bvhHelperRef = useRef(null);
  const { scene } = useThree();

  // Build collider from scene walls
  useEffect(() => {
    if (colliderBuilt.current) return;

    // Wait a bit for scene to be ready, then build collider
    const buildTimer = setTimeout(() => {
      // Find wall/barrier meshes in scene (exclude ground meshes)
      const wallMeshes = [];
      scene.traverse((child) => {
        if (child.isMesh) {
          const name = child.name.toLowerCase();
          // Include walls, barriers, fences - exclude ground
          if (
            name.includes("wall") ||
            name.includes("barrier") ||
            name.includes("fence") ||
            name.includes("border") ||
            name.includes("collision")
          ) {
            wallMeshes.push(child);
          }
        }
      });

      if (wallMeshes.length > 0) {
        const collider = buildCollider({ traverse: (fn) => wallMeshes.forEach(fn) });
        if (collider) {
          colliderRef.current = collider;
          scene.add(collider);
          colliderBuilt.current = true;
          console.log("Kart collision enabled with", wallMeshes.length, "wall meshes");

          // Debug mode: Add BVH helper and make collider visible
          if (isDebugMode) {
            collider.visible = true;
            collider.material = new MeshBasicMaterial({
              color: 0xff0000,
              wireframe: true,
              transparent: true,
              opacity: 0.3,
            });

            // Add BVH helper to visualize the bounding volume hierarchy
            const bvhHelper = new MeshBVHHelper(collider, 10);
            bvhHelper.color.set(0x00ff00);
            scene.add(bvhHelper);
            bvhHelperRef.current = bvhHelper;
            console.log("Debug: BVH helper added");
          }
        }
      } else {
        console.log("No wall meshes found for collision. Name meshes with 'wall', 'barrier', 'fence', 'border', or 'collision'");
      }
    }, 1000);

    return () => {
      clearTimeout(buildTimer);
      // Cleanup BVH helper on unmount
      if (bvhHelperRef.current) {
        scene.remove(bvhHelperRef.current);
        bvhHelperRef.current = null;
      }
    };
  }, [scene]);

  const getGamepad = () => {
    if (navigator.getGamepads) {
      const gamepads = navigator.getGamepads();
      if (gamepads.length > 0) {
        gamepadRef.current = gamepads[0];
        setGamepad(gamepadRef.current);
      }
    }
  };

  const jumpAnim = () => {
    gsap.to(jumpOffset, {
      current: 0.3,
      duration: 0.125,
      ease: "power2.out",
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        isJumping.current = false;
      },
    });
  };

  function updateSpeed(forward, backward, delta) {
    // Tick down stun timer
    if (collisionStunTimer.current > 0) {
      collisionStunTimer.current -= delta;
      // While stunned, gradually recover speed to 0 but block acceleration
      speedRef.current = damp(speedRef.current, 0, 2, delta);
      setSpeed(speedRef.current);
      setIsBoosting(false);
      return;
    }

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

  function jumpPlayer(spaceKey) {
    if (spaceKey && !jumpIsHeld.current && !isJumping.current) {
      // rb.applyImpulse({ x: 0, y: 45, z: 0 }, true);

      jumpAnim();
      isJumping.current = true;
      jumpIsHeld.current = true;
    }

    if (!spaceKey) {
      jumpIsHeld.current = false;
    }
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
    const desiredPosition = new Vector3(desiredX, player.position.y, desiredZ);

    // Check collision if collider exists
    if (colliderRef.current) {
      const result = checkCollision(
        player.position,
        desiredPosition,
        colliderRef.current,
        kartColliderSettings
      );
      player.position.x = result.position.x;
      player.position.z = result.position.z;

      // Bounce back and stun on collision
      if (result.collided && collisionStunTimer.current <= 0) {
        speedRef.current = COLLISION_BOUNCE_SPEED;
        collisionStunTimer.current = COLLISION_STUN_DURATION;
      }
    } else {
      // No collision system - move freely
      player.position.x = desiredX;
      player.position.z = desiredZ;
    }

    setPlayerPosition(player.position);
  }

  useFrame((state, delta) => {
    if (!playerRef.current) return;
    const player = playerRef.current;
    const cameraGroup = cameraGroupRef.current;
    const kart = kartRef.current;
    const camera = state.camera;

    if (!player || !cameraGroup || !kart) return;

    const { forward, backward, left, right, jump } = get();

    const gamepadButtons = {
      jump: false,
      x: 0,
    };

    if (gamepadRef.current) {
      gamepadButtons.jump =
        gamepadRef.current.buttons[5].pressed ||
        gamepadRef.current.buttons[7].pressed;
      gamepadButtons.x = gamepadRef.current.axes[0];
    }
    updateSpeed(forward, backward, delta);
    rotatePlayer(left, right, player, delta);
    updatePlayer(player, speedRef.current, camera, kart, delta);
    const isJumpPressed = jump || gamepadButtons.jump;
    jumpPlayer(isJumpPressed);
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

          {/* Debug: Show player collision capsule */}
          {isDebugMode && (
            <mesh position={[0, (kartColliderSettings.radius + kartColliderSettings.height) / 2, 0]}>
              <capsuleGeometry args={[
                kartColliderSettings.radius,
                kartColliderSettings.height - kartColliderSettings.radius * 2,
                4,
                16
              ]} />
              <meshBasicMaterial color={0x00ffff} wireframe transparent opacity={0.5} />
            </mesh>
          )}

          <group ref={cameraLookAtRef} position={[0, -2, -9]}></group>
        </group>
      </group>

      {/* <OrbitControls/> */}
    </>
  );
};
