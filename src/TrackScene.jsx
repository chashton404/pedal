import { PlayerController } from "./PlayerController";
import {Track} from './models/Oval-track';
import { DevLapEditor } from "./misc/DevLapEditor";
export const TrackScene = () => {
  return (
    <>
      <PlayerController />
      <Track />
      <DevLapEditor />
    </>
  );
};
