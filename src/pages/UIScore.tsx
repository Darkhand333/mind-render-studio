import GlassNavbar from "../components/GlassNavbar";
import UIScorePage from "../components/UIScorePage";
import LivingBackground from "../components/LivingBackground";

const UIScore = () => {
  return (
    <div className="relative min-h-screen">
      <LivingBackground />
      <GlassNavbar />
      <UIScorePage />
    </div>
  );
};

export default UIScore;
