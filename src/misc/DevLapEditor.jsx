import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { Box3, CatmullRomCurve3, Vector3 } from "three";
import { catmullRomPoints } from "./trackPoints";
import { useGameStore } from "../store";
import { devFlags } from "../constants";

const findClosestT = (curve, point, samples = 400) => {
  let closestT = 0;
  let closestDist = Number.POSITIVE_INFINITY;
  const tmp = new Vector3();

  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    curve.getPointAt(t, tmp);
    const dist = tmp.distanceToSquared(point);
    if (dist < closestDist) {
      closestDist = dist;
      closestT = t;
    }
  }

  return closestT;
};

export const DevLapEditor = () => {
  const isEditingStart = useGameStore((state) => state.isEditingStart);
  const setLapStartT = useGameStore((state) => state.setLapStartT);
  const setLapZeroStart = useGameStore((state) => state.setLapZeroStart);
  const setLapCount = useGameStore((state) => state.setLapCount);
  const lapStartT = useGameStore((state) => state.lapStartT);

  const { camera } = useThree();

  const curve = useMemo(
    () => new CatmullRomCurve3(catmullRomPoints, true, "centripetal"),
    []
  );
  const linePoints = useMemo(() => curve.getPoints(500), [curve]);
  const bounds = useMemo(() => {
    const box = new Box3().setFromPoints(linePoints);
    const center = new Vector3();
    const size = new Vector3();
    box.getCenter(center);
    box.getSize(size);
    return { center, size };
  }, [linePoints]);

  useEffect(() => {
    if (!isEditingStart) return;
    const height = Math.max(bounds.size.x, bounds.size.z, 200);
    camera.position.set(
      bounds.center.x,
      bounds.center.y + height,
      bounds.center.z
    );
    camera.lookAt(bounds.center);
    camera.updateProjectionMatrix();
  }, [isEditingStart, camera, bounds]);

  if (!devFlags.enabled || !isEditingStart) return null;

  const markerPos = curve.getPointAt(lapStartT);

  const handlePointerDown = (event) => {
    event.stopPropagation();
    const closestT = findClosestT(curve, event.point, 600);
    setLapStartT(closestT);
    setLapZeroStart(false);
    setLapCount(-1);
  };

  return (
    <group>
      <Line
        points={linePoints}
        color="#f6d251"
        lineWidth={2}
        depthTest={false}
      />
      <mesh onPointerDown={handlePointerDown}>
        <tubeGeometry args={[curve, 500, 1.5, 8, true]} />
        <meshBasicMaterial
          color="#f6d251"
          transparent
          opacity={0.15}
          depthTest={false}
        />
      </mesh>
      <mesh position={markerPos}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial color="#ff4d4d" depthTest={false} />
      </mesh>
    </group>
  );
};
