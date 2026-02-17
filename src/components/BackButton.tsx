import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/") return null;

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => navigate(-1)}
      className="fixed top-[4.5rem] left-4 z-40 w-9 h-9 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors duration-200"
      title="Go back"
    >
      <ArrowLeft className="w-4 h-4" />
    </motion.button>
  );
};

export default BackButton;
