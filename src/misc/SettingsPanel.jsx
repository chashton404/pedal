import { useEffect, useRef, useState } from "react";
import { useGameStore } from "../store";
import { devFlags } from "../constants";

const kgToLbs = (kg) => (kg == null ? "" : kg * 2.20462);
const lbsToKg = (lbs) => (lbs == null ? null : lbs / 2.20462);

export const SettingsPanel = () => {
  const [open, setOpen] = useState(false);
  const [editingWeight, setEditingWeight] = useState(false);
  const weightInputRef = useRef(null);

  const showCoordinates = useGameStore((s) => s.showCoordinates);
  const setShowCoordinates = useGameStore((s) => s.setShowCoordinates);

  const bodyWeightKg = useGameStore((s) => s.bodyWeight);
  const setBodyWeight = useGameStore((s) => s.setBodyWeight);

  const kPower = useGameStore((s) => s.kPower);
  const setKPower = useGameStore((s) => s.setKPower);
  const isEditingStart = useGameStore((s) => s.isEditingStart);
  const setIsEditingStart = useGameStore((s) => s.setIsEditingStart);
  const isEditingMap = useGameStore((s) => s.isEditingMap);
  const setIsEditingMap = useGameStore((s) => s.setIsEditingMap);

  const [weightInput, setWeightInput] = useState(() =>
    bodyWeightKg ? kgToLbs(bodyWeightKg).toFixed(1) : ""
  );
  const [kPowerInput, setKPowerInput] = useState(
    kPower !== null && kPower !== undefined ? String(kPower) : ""
  );

  useEffect(() => {
    if (editingWeight) return;
    setWeightInput(bodyWeightKg ? kgToLbs(bodyWeightKg).toFixed(1) : "");
  }, [bodyWeightKg, editingWeight]);

  useEffect(() => {
    setKPowerInput(
      kPower !== null && kPower !== undefined ? String(kPower) : ""
    );
  }, [kPower]);

  useEffect(() => {
    if (editingWeight && weightInputRef.current) {
      weightInputRef.current.focus();
      weightInputRef.current.select();
    }
  }, [editingWeight]);

  const handleWeightChange = (event) => {
    const val = event.target.value;
    setWeightInput(val);
    const trimmed = val.trim();
    if (trimmed === "") return;
    const asNumber = Number(trimmed);
    if (!Number.isNaN(asNumber)) {
      setBodyWeight(lbsToKg(asNumber));
    }
  };

  const handleKPowerChange = (event) => {
    const val = event.target.value;
    setKPowerInput(val);
    if (val === "") return;
    const numeric = Number(val);
    if (!Number.isNaN(numeric)) {
      setKPower(numeric);
    }
  };

  return (
    <>
      <button className="settings-button" onClick={() => setOpen(true)}>
        Settings
      </button>

      {open && (
        <div className="settings-modal-overlay">
          <div className="settings-modal">
            <button
              className="settings-close"
              onClick={() => setOpen(false)}
              aria-label="Close settings"
            >
              ×
            </button>
            <div className="settings-content">
              <div className="settings-row">
                <label className="settings-label">
                  Show coordinates
                  <div className="toggle">
                    <input
                      type="checkbox"
                      checked={showCoordinates}
                      onChange={(e) => setShowCoordinates(e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </div>
                </label>
              </div>

              <div className="settings-row">
                <label className="settings-label">
                  Weight (lbs)
                  <div className="settings-input-with-action">
                    <input
                      ref={weightInputRef}
                      className="settings-input"
                      type="text"
                      inputMode="decimal"
                      min="0"
                      step="0.1"
                      value={weightInput}
                      onChange={handleWeightChange}
                      placeholder="Enter your weight"
                      readOnly={!editingWeight}
                      onBlur={() => setEditingWeight(false)}
                    />
                    <button
                      type="button"
                      className="settings-edit-button"
                      onClick={() => {
                        if (editingWeight) {
                          setEditingWeight(false);
                          weightInputRef.current?.blur();
                        } else {
                          setEditingWeight(true);
                        }
                      }}
                      aria-label={editingWeight ? "Save weight" : "Edit weight"}
                    >
                      {editingWeight ? "✓" : "✎"}
                    </button>
                  </div>
                </label>
              </div>

              <div className="settings-row">
                <label className="settings-label">
                  kPower (power scale)
                  <input
                    className="settings-input"
                    type="number"
                    min="0"
                    step="1"
                    value={kPowerInput}
                    onChange={handleKPowerChange}
                    placeholder="Enter kPower"
                  />
                </label>
              </div>

              {devFlags.enabled && (
                <div className="settings-row">
                  <label className="settings-label">
                    Dev: Change start point
                    <div className="settings-input-with-action">
                      <input
                        className="settings-input"
                        type="text"
                        value={isEditingStart ? "Click on track to set" : "Off"}
                        readOnly
                      />
                      <button
                        type="button"
                        className="settings-edit-button"
                        onClick={() => {
                          const next = !isEditingStart;
                          setIsEditingStart(next);
                          if (next) {
                            setIsEditingMap(false);
                          }
                        }}
                      >
                        {isEditingStart ? "Done" : "Edit"}
                      </button>
                    </div>
                  </label>
                </div>
              )}

              {devFlags.enabled && (
                <div className="settings-row">
                  <label className="settings-label">
                    Dev: Adjust map
                    <div className="settings-input-with-action">
                      <input
                        className="settings-input"
                        type="text"
                        value={isEditingMap ? "Use arrows to move track" : "Off"}
                        readOnly
                      />
                      <button
                        type="button"
                        className="settings-edit-button"
                        onClick={() => {
                          const next = !isEditingMap;
                          setIsEditingMap(next);
                          if (next) {
                            setIsEditingStart(false);
                          }
                        }}
                      >
                        {isEditingMap ? "Done" : "Edit"}
                      </button>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
