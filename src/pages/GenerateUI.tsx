import GlassNavbar from "../components/GlassNavbar";
import LivingBackground from "../components/LivingBackground";
import BackButton from "../components/BackButton";
import UIGeneratorPanel from "../components/ui-generator/UIGeneratorPanel";

const GenerateUI = () => {
  return (
    <div className="relative min-h-screen">
      <LivingBackground />
      <GlassNavbar />
      <BackButton />
      <UIGeneratorPanel />
    </div>
  );
};

export default GenerateUI;
