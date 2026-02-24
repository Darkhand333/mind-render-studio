import GlassNavbar from "../components/GlassNavbar";
import WorkspaceCanvas from "../components/workspace/WorkspaceCanvas";

const Workspace = () => {
  return (
    <div className="relative min-h-screen bg-background">
      <GlassNavbar />
      <WorkspaceCanvas />
    </div>
  );
};

export default Workspace;
