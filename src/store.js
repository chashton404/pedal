import { create } from "zustand";

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
}));
