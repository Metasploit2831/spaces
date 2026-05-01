import { createRoot } from "react-dom/client";
import { CaptureLayer } from "./components/CaptureLayer";
import { DemoPage } from "./components/DemoPage";
import { SpacesSidebar } from "./components/SpacesSidebar";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <>
    <DemoPage />
    <CaptureLayer />
    <SpacesSidebar />
  </>,
);
