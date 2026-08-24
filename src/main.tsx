import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("#root not found");

const embed = new URLSearchParams(window.location.search).get("embed") === "1";

createRoot(root).render(
  <StrictMode>
    <App embed={embed} />
  </StrictMode>,
);
