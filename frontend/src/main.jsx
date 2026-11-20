
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";

const particlesInit = async (engine) => {
  await loadSlim(engine);
};

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <ParticlesProvider init={particlesInit}>
        <App />
      </ParticlesProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);
