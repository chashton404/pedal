import { PlayerController } from "./PlayerController";
import {Track} from './models/Oval-track';
import { DevLapEditor } from "./misc/DevLapEditor";
import { DevMapEditor } from "./misc/DevMapEditor";
export const TrackScene = () => {
  return (
    <>
      <PlayerController />
      <Track />
      <DevLapEditor />
      <DevMapEditor />
    </>
  );
};
