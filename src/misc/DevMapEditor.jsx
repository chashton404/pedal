import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { Box3, CatmullRomCurve3, Vector3 } from "three";
import { catmullRomPoints } from "./trackPoints";
import { useGameStore } from "../store";
import { devFlags } from "../constants";

export const DevMapEditor = () => {
  const isEditingMap = useGameStore((state) => state.isEditingMap);
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
    if (!devFlags.enabled || !isEditingMap) return;
    const height = Math.max(bounds.size.x, bounds.size.z, 200);
    camera.position.set(
      bounds.center.x,
      bounds.center.y + height,
      bounds.center.z
    );
    camera.lookAt(bounds.center);
    camera.updateProjectionMatrix();
  }, [isEditingMap, camera, bounds]);

  if (!devFlags.enabled || !isEditingMap) return null;

  return (
    <Line
      points={linePoints}
      color="#6df0ff"
      lineWidth={2}
      depthTest={false}
    />
  );
};
