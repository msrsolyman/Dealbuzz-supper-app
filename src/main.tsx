import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./i18n";
import App from "./App.tsx";
import "./index.css";

// Unregister any leftover service workers from PWA feature to fix white screen
let shouldReload = false;
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
      shouldReload = true;
    }
    if (shouldReload) {
      window.location.reload();
    }
  }).catch(err => console.log('Service Worker unregistration failed: ', err));
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
