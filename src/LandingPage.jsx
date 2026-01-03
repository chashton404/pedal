import { useNavigate } from "react-router-dom";

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <div className="landing__title">PEDAL</div>
      <button className="landing__start" onClick={() => navigate("/game")}>
        START
      </button>
      <div className="version-black">Made by Chase Ashton</div>
    </div>
  );
};
