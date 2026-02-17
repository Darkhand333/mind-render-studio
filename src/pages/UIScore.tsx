import GlassNavbar from "../components/GlassNavbar";
import UIScorePage from "../components/UIScorePage";
import LivingBackground from "../components/LivingBackground";
import BackButton from "../components/BackButton";

const UIScore = () => {
  return (
    <div className="relative min-h-screen">
      <LivingBackground />
      <GlassNavbar />
      <BackButton />
      <UIScorePage />
    </div>
  );
};

export default UIScore;
