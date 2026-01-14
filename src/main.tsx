import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initializeBackend } from "./services/index";

// Initialize React app immediately, don't wait for backend
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Initialize backend services in the background
initializeBackend().then(() => {
  console.log('Backend initialized successfully');
}).catch((error) => {
  console.error('Backend initialization failed:', error);
  console.log('App will continue to work with limited functionality');
});
