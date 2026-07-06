import { createRoot } from "react-dom/client";
import { CaptureLayer } from "./components/CaptureLayer";
import { SpacesSidebar } from "./components/SpacesSidebar";
import "./styles.css";

const existing = document.getElementById("spaces-extension-root");
if (existing) {
  existing.remove();
}

const host = document.createElement("div");
host.id = "spaces-extension-root";
document.documentElement.appendChild(host);

const shadow = host.attachShadow({ mode: "open" });
const stylesheet = document.createElement("link");
stylesheet.rel = "stylesheet";
const background = chrome.runtime.getManifest().background;
const serviceWorker = background && "service_worker" in background ? background.service_worker : "";
const stylesheetPath = serviceWorker.startsWith("dist/")
  ? "dist/assets/style.css"
  : "assets/style.css";
stylesheet.href = chrome.runtime.getURL(stylesheetPath);
shadow.appendChild(stylesheet);

const mount = document.createElement("div");
shadow.appendChild(mount);

createRoot(mount).render(
  <>
    <CaptureLayer />
    <SpacesSidebar />
  </>,
);
