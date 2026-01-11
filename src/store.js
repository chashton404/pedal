import { create } from "zustand";

const normalizeLapStartT = (value, fallback = 0) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  if (parsed < 0) return 0;
  if (parsed > 1) return 1;
  return parsed;
};

const defaultLapStartT = normalizeLapStartT(
  import.meta.env.VITE_LAP_START_T ?? 0,
  0
);

const readLapStartT = () => {
  if (typeof window === "undefined") return defaultLapStartT;
  const raw = window.localStorage.getItem("lapStartT");
  if (raw == null) return defaultLapStartT;
  return normalizeLapStartT(raw, defaultLapStartT);
};

const writeLapStartT = (value) => {
  if (typeof window === "undefined") return;
  const normalized = normalizeLapStartT(value, defaultLapStartT);
  window.localStorage.setItem("lapStartT", String(normalized));
};

export const useGameStore = create((set) => ({
  playerPosition: null,
  setPlayerPosition: (position) => set({ playerPosition: position }),
  speed: null,
  setSpeed: (speed) => set({ speed: speed }),
  isBoosting : false,
  setIsBoosting: (isBoosting) => set({ isBoosting }),
  groundPosition: null,
  setGroundPosition: (groundPosition) => set({groundPosition: groundPosition}),
  wheelPositions: null,
  setWheelPositions: (wheelPositions) => set({wheelPositions: wheelPositions}),
  body: null,
  setBody: (body) => set({body: body}),
  noiseTexture: null,
  setNoiseTexture: (noiseTexture) => set({noiseTexture: noiseTexture}),
  gamepad: null,
  setGamepad: (gamepad) => set({gamepad: gamepad}),
  isOnDirt:null,
  setIsOnDirt: (isOnDirt) => set({isOnDirt: isOnDirt}),
  // Collision system
  collider: null,
  setCollider: (collider) => set({ collider }),
  trackScene: null,
  setTrackScene: (trackScene) => set({ trackScene }),
  // Bike Inputs
  bikeWatts: null,
  setBikeWatts: (bikeWatts) => set({ bikeWatts }),
  bikeCadence: null,
  setBikeCadence: (bikeCadence) => set({ bikeCadence }),
  // Weight Inputs
  bodyWeight: 68,
  setBodyWeight: (bodyWeight) => set({ bodyWeight }),
  // Power scaling
  kPower: 100,
  setKPower: (kPower) => set({ kPower }),
  // UI
  showCoordinates: true,
  setShowCoordinates: (showCoordinates) => set({ showCoordinates }),
  // Lap Counting
  lapZeroStart: false,
  setLapZeroStart: (lapZeroStart) => set({ lapZeroStart }),
  lapCount: -1,
  setLapCount: (lapCount) => set({ lapCount }),
  incrementLap: () => set((state) => ({ lapCount: state.lapCount + 1 })),
  lapStartT: readLapStartT(),
  setLapStartT: (lapStartT) => {
    writeLapStartT(lapStartT);
    set({ lapStartT });
  },
  isEditingStart: false,
  setIsEditingStart: (isEditingStart) => set({ isEditingStart }),
  isEditingMap: false,
  setIsEditingMap: (isEditingMap) => set({ isEditingMap }),
  trackOffset: { x: 0, y: 0, z: 0 },
  setTrackOffset: (trackOffset) => set({ trackOffset }),
  nudgeTrackOffset: (dx = 0, dz = 0, dy = 0) =>
    set((state) => ({
      trackOffset: {
        x: state.trackOffset.x + dx,
        y: state.trackOffset.y + dy,
        z: state.trackOffset.z + dz,
      },
    })),
}));
