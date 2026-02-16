import GlassNavbar from "../components/GlassNavbar";
import MemoryGraphPage from "../components/MemoryGraphPage";
import LivingBackground from "../components/LivingBackground";

const MemoryGraph = () => {
  return (
    <div className="relative min-h-screen">
      <LivingBackground />
      <GlassNavbar />
      <MemoryGraphPage />
    </div>
  );
};

export default MemoryGraph;
