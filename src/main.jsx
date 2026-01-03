import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import "./index.css";
import { WebGPUCanvas } from "./WebGPUCanvas.jsx";
import { CoordinateHUD } from "./misc/CoordinateHUD.jsx";
import { BikeOverlay } from "./misc/BikeOverlay.jsx";
import { SettingsPanel } from "./misc/SettingsPanel.jsx";
import { HelpPanel } from "./misc/HelpPanel.jsx";
import { LandingPage } from "./LandingPage.jsx";

const GamePage = () => {
  const navigate = useNavigate();

  return (
    <div className="canvas-container">
      <Suspense fallback={<div className="loading-overlay">Loading...</div>}>
        <WebGPUCanvas />
        <CoordinateHUD />
        <BikeOverlay />
        <SettingsPanel />
        <HelpPanel />
      </Suspense>
      <button
        className="exit-button"
        onClick={() => navigate("/")}
        aria-label="Return to landing page"
      >
        Exit
      </button>
      <div className="version">Mario Kart Trainer - v0.1.0</div>
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
