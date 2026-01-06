import { useNavigate } from "react-router-dom";

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <div className="landing__title">PEDAL</div>
      <div className="landing__actions">
        <button className="landing__start" onClick={() => navigate("/game")}>
          START
        </button>
        <a href="https://youtu.be/e2mlBR0mk_w" target="_blank">
          <button className="landing__start">WATCH THE DEMO</button>
        </a>
      </div>
      <div className="version-black">Made by Chase Ashton</div>
    </div>
  );
};
