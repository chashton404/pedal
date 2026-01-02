import { useCallback, useEffect, useRef, useState } from "react";
import { useGameStore } from "../store"; 

const CPS_SERVICE = 0x1818; // Cycling Power Service
const CPM_CHAR = 0x2a63; // Cycling Power Measurement characteristic

const wrapDiffU16 = (curr, prev) => (curr - prev + 65536) % 65536;

export const BikeOverlay = () => {
  const [watts, setWatts] = useState(null);
  const [cadence, setCadence] = useState(null);
  const [status, setStatus] = useState("Not connected");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const deviceRef = useRef(null);
  const characteristicRef = useRef(null);
  const lastCrankRef = useRef({ revs: null, time: null });

  //To update the bike data in store.js
  const updateWatts = useGameStore((state) => state.setBikeWatts);
  const updateCadence = useGameStore((state) => state.setBikeCadence);

  const resetState = useCallback(() => {
    setIsConnected(false);
    setIsConnecting(false);
    setWatts(null);
    setCadence(null);
    lastCrankRef.current = { revs: null, time: null };
  }, []);

  const handleMeasurement = useCallback((event) => {
    const dv = event.target.value;

    const flags = dv.getUint16(0, true);
    const power = dv.getInt16(2, true);

    setWatts(power);
    updateWatts(power);


    // Flag bit 4 (0x0010) indicates crank revolution data is present
    const crankPresent = (flags & 0x0010) !== 0;
    if (!crankPresent || dv.byteLength < 16) {
      setCadence(null);
      return;
    }

    const crankRevs = dv.getUint16(12, true);
    const crankTime = dv.getUint16(14, true); // ticks of 1/1024 sec

    const { revs: lastRevs, time: lastTime } = lastCrankRef.current;
    if (lastRevs !== null && lastTime !== null) {
      const dRevs = wrapDiffU16(crankRevs, lastRevs);
      const dTicks = wrapDiffU16(crankTime, lastTime);

      if (dTicks > 0 && dRevs > 0) {
        const seconds = dTicks / 1024;
        const rpm = 60 * (dRevs / seconds);
        setCadence(rpm);
        updateCadence(rpm);
      }
    }

    lastCrankRef.current = { revs: crankRevs, time: crankTime };
  }, [updateCadence, updateWatts]);

  const onDisconnected = useCallback((message) => {
    const statusMessage =
      typeof message === "string" ? message : "Disconnected.";

    if (characteristicRef.current) {
      characteristicRef.current.removeEventListener(
        "characteristicvaluechanged",
        handleMeasurement
      );
    }

    if (deviceRef.current) {
      deviceRef.current.removeEventListener(
        "gattserverdisconnected",
        onDisconnected
      );
    }

    deviceRef.current = null;
    characteristicRef.current = null;
    resetState();
    setStatus(statusMessage);
  }, [handleMeasurement, resetState]);

  const connect = useCallback(async () => {
    if (!navigator.bluetooth) {
      setStatus("Web Bluetooth not supported. Try Chrome on desktop.");
      return;
    }

    setIsConnecting(true);
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [CPS_SERVICE] }],
        optionalServices: [CPS_SERVICE],
      });

      device.addEventListener("gattserverdisconnected", onDisconnected);
      deviceRef.current = device;

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(CPS_SERVICE);
      const characteristic = await service.getCharacteristic(CPM_CHAR);

      await characteristic.startNotifications();
      characteristic.addEventListener(
        "characteristicvaluechanged",
        handleMeasurement
      );

      characteristicRef.current = characteristic;
      setIsConnected(true);
      setStatus("Connected. Start pedaling…");
    } catch (err) {
      console.error(err);
      onDisconnected(err?.message || "Failed to connect");
    } finally {
      setIsConnecting(false);
    }
  }, [handleMeasurement, onDisconnected]);

  const disconnect = useCallback(async () => {
    try {
      const device = deviceRef.current;
      if (device?.gatt?.connected) {
        device.gatt.disconnect();
      } else {
        onDisconnected();
      }
    } catch (err) {
      console.error(err);
      setStatus("Error while disconnecting");
    }
  }, [onDisconnected]);

  useEffect(() => () => onDisconnected(), [onDisconnected]);

  const wattsDisplay = watts !== null ? watts : "--";
  const cadenceDisplay =
    cadence !== null ? cadence.toFixed(1).replace(/\.0$/, "") : "--";

  return (
    <div className="bike-overlay">
      <div className="bike-overlay__header">Bike Data</div>
      <div className="bike-overlay__metrics">
        <div className="metric">
          <div className="metric__value">{wattsDisplay}</div>
          <div className="metric__label">watts</div>
        </div>
        <div className="metric">
          <div className="metric__value">{cadenceDisplay}</div>
          <div className="metric__label">cadence (rpm)</div>
        </div>
      </div>
      <div className="bike-overlay__controls">
        <button onClick={connect} disabled={isConnecting || isConnected}>
          {isConnecting ? "Connecting..." : "Connect"}
        </button>
        <button onClick={disconnect} disabled={!isConnected}>
          Disconnect
        </button>
      </div>
      <div className="bike-overlay__status">{status}</div>
    </div>
  );
};
