import { useState } from "react";

const HELP_CONTENT = [
  {
    title: "What is Pedal?",
    body: "Pedal is a browser-based, Mario Kart styled bike trainer. It makes indoor biking feel like a game.",
  },
  {
    title: "How does it work",
    body: "You can still creep forward with the “W” key, but Pedal is built for a stationary trainer (like a Wahoo KICKR Core). Turn it on, click “Connect,” pick your trainer, and it links over Web Bluetooth to stream live power and cadence. The harder you pedal, the faster the kart goes.",
  },
  {
    title: "How it was made",
    body: "Inspired by https://github.com/mustache-dev/Mario-Kart-3.js, then forked to simplify physics, hook up a bike, and build custom tracks. The site uses React + Vite with Three.js via React Three Fiber for 3D rendering.",
  },
];

export const HelpPanel = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="help-button"
        onClick={() => setOpen(true)}
        aria-label="Open help"
      >
        ?
      </button>

      {open && (
        <div
          className="help-modal-overlay"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="help-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="About Pedal"
          >
            <div className="help-content">
              {HELP_CONTENT.map((section) => (
                <section key={section.title} className="help-section">
                  <h2 className="help-title">{section.title}</h2>
                  <p className="help-body">{section.body}</p>
                </section>
              ))}
            </div>
            <div className="help-actions">
              <button
                className="help-done"
                onClick={() => setOpen(false)}
                aria-label="Close help"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
