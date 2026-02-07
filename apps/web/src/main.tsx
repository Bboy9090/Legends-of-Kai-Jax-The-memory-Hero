import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ErrorFallback } from "./components/ErrorFallback";
import "./index.css";

const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorFallback>
        <App />
      </ErrorFallback>
    </React.StrictMode>
  );
}
