import { insertCoin, onPlayerJoin, me } from "playroomkit";
import { useEffect, useMemo, useRef } from "react";
import { usePlayroomStore } from "./playroomStore";
import { extend, useFrame } from "@react-three/fiber";
import { BoxGeometry, DoubleSide, MeshBasicMaterial } from "three";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";
extend({ InstancedMesh2 });
export const PlayroomStarter = () => {
  const addPlayer = usePlayroomStore((state) => state.addPlayer);
  const removePlayer = usePlayroomStore((state) => state.removePlayer);
  const geometry = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const material = useMemo(
    () => new MeshBasicMaterial({ color: 0x00ff00, side: DoubleSide }),
    []
  );
  const ref = useRef();
  const start = async () => {
    await insertCoin();

    onPlayerJoin((state) => {
      if (state.id === me().id) return;
      addPlayer(state);
      console.log("Player joined", state);

      ref.current.addInstances(1, (obj) => {
        obj.position.set(0, 0, 0);
        obj.id = state.id;
        obj.state = state;
        obj.scale.set(5, 5, 5);
      });

      state.onQuit(() => {
        console.log("Player left", state);
        removePlayer(state);
      });
    });
  };

  useEffect(() => {
    start();
  }, []);

  useFrame(() => {
    if (ref.current) {
      ref.current.updateInstances((obj) => {
        console.log(obj.state.state.position);

        const { x, y, z } = obj.state.state.position;
        console.log(obj.position);
        if ((x, y, z)) {
          obj.position.set(x, y, z);
          obj.updateMatrix();
        }
      });
    }
  });
  return (
    <instancedMesh2
      ref={ref}
      args={[geometry, material, { createEntities: true }]}
      frustumCulled={false}
    />
  );
};
