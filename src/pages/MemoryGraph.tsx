import GlassNavbar from "../components/GlassNavbar";
import MemoryGraphPage from "../components/MemoryGraphPage";
import LivingBackground from "../components/LivingBackground";
import BackButton from "../components/BackButton";

const MemoryGraph = () => {
  return (
    <div className="relative min-h-screen">
      <LivingBackground />
      <GlassNavbar />
      <BackButton />
      <MemoryGraphPage />
    </div>
  );
};

export default MemoryGraph;
