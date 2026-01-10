export const kartSettings = {
  speed: {
    min: -50,
    max: 50,
    default: 0,
  },
  weight: 10
};

const devSpeedMultiplier = Number(import.meta.env.VITE_DEV_SPEED_MULTIPLIER ?? 3);

export const devFlags = {
  enabled: import.meta.env.VITE_DEV_MODE === "true",
  speedMultiplier: Number.isFinite(devSpeedMultiplier) ? devSpeedMultiplier : 3,
};
