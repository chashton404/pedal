import { useGameStore } from "../store";
import { devFlags } from "../constants";

export const MapAdjustControls = () => {
  const isEditingMap = useGameStore((s) => s.isEditingMap);
  const nudgeTrackOffset = useGameStore((s) => s.nudgeTrackOffset);

  if (!devFlags.enabled || !isEditingMap) return null;

  return (
    <div className="map-adjust-controls" aria-label="Adjust map controls">
      <button
        type="button"
        className="map-adjust-button"
        onClick={() => nudgeTrackOffset(0, -5)}
      >
        ↑
      </button>
      <button
        type="button"
        className="map-adjust-button"
        onClick={() => nudgeTrackOffset(-5, 0)}
      >
        ←
      </button>
      <button
        type="button"
        className="map-adjust-button"
        onClick={() => nudgeTrackOffset(5, 0)}
      >
        →
      </button>
      <button
        type="button"
        className="map-adjust-button"
        onClick={() => nudgeTrackOffset(0, 5)}
      >
        ↓
      </button>
    </div>
  );
};
