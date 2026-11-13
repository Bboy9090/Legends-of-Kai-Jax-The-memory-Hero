import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./lib/sfx";
import "./lib/offlineAssets";
import "./lib/stores/useAccessibility";
import { startAutosave } from "./lib/saveSlotActions";
import { startMusicDirector } from "./lib/musicDirector";

startAutosave();
startMusicDirector();

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
