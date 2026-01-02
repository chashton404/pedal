import { useGameStore } from "../store";

export const CoordinateHUD = () => {
  const pos = useGameStore((s) => s.playerPosition);
  const showCoordinates = useGameStore((s) => s.showCoordinates);
  if (!pos || !showCoordinates) return null;
  return (
    <div className="coords">
      x: {pos.x.toFixed(2)} y: {pos.y.toFixed(2)} z: {pos.z.toFixed(2)}
    </div>
  );
};
