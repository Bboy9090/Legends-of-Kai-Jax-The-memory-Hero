import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import KaiTestScene from "./components/game/characters/kai/KaiTestScene";
import { JaxTestScene } from "./components/game/characters/jax/JaxTestScene";
import "./index.css";

const isolatedMode = new URLSearchParams(window.location.search).get("mode");

createRoot(document.getElementById("root")!).render(
  isolatedMode === "jax-test" ? (
    <JaxTestScene />
  ) : isolatedMode === "kai-test" ? (
    <KaiTestScene />
  ) : (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
);
