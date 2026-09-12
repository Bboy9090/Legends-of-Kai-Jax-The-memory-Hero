import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import KaiTestScene from "./components/game/characters/kai/KaiTestScene";
import { JaxTestScene } from "./components/game/characters/jax/JaxTestScene";
import RagingCityVerticalSliceScene from "./components/game/RagingCityVerticalSliceScene";
import "./index.css";

const isolatedMode = new URLSearchParams(window.location.search).get("mode");

createRoot(document.getElementById("root")!).render(
  isolatedMode === "jax-test" ? (
    <JaxTestScene />
  ) : isolatedMode === "kai-test" ? (
    <KaiTestScene />
  ) : isolatedMode === "vertical-slice-kai" ? (
    <RagingCityVerticalSliceScene forcedCharacter="kai" />
  ) : isolatedMode === "vertical-slice-jax" ? (
    <RagingCityVerticalSliceScene forcedCharacter="jax" />
  ) : (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
);
