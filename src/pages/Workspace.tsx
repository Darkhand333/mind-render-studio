import GlassNavbar from "../components/GlassNavbar";
import WorkspaceCanvas from "../components/WorkspaceCanvas";
import LivingBackground from "../components/LivingBackground";

const Workspace = () => {
  return (
    <div className="relative min-h-screen">
      <LivingBackground />
      <GlassNavbar />
      <WorkspaceCanvas />
    </div>
  );
};

export default Workspace;
