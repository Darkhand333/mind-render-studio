import GlassNavbar from "../components/GlassNavbar";
import SettingsPage from "../components/SettingsPage";
import LivingBackground from "../components/LivingBackground";
import BackButton from "../components/BackButton";

const Settings = () => {
  return (
    <div className="relative min-h-screen">
      <LivingBackground />
      <GlassNavbar />
      <BackButton />
      <SettingsPage />
    </div>
  );
};

export default Settings;
