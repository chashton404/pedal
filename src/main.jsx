import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import { WebGPUCanvas } from "./WebGPUCanvas.jsx";
import { CoordinateHUD } from "./misc/CoordinateHUD.jsx";
import { BikeOverlay } from "./misc/BikeOverlay.jsx";
import { SettingsPanel } from "./misc/SettingsPanel.jsx";
import { LandingPage } from "./LandingPage.jsx";

const GamePage = () => {
  return (
    <div className="canvas-container">
      <Suspense fallback={<div className="loading-overlay">Loading...</div>}>
        <WebGPUCanvas />
        <CoordinateHUD />
        <BikeOverlay />
        <SettingsPanel />
      </Suspense>
      <div className="version">Mario Kart Trainer - v0.0.0</div>
    </div>
  );
};

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/game" element={<GamePage />} />
    </Routes>
  </BrowserRouter>
);
