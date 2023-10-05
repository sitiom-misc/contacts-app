import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { FirebaseAppProvider } from "reactfire";

const firebaseConfig = {
  apiKey: "AIzaSyACDNdgqWx5H8MUOptS__5v_IukJLU65C8",
  authDomain: "mobcomp2-itang.firebaseapp.com",
  projectId: "mobcomp2-itang",
  storageBucket: "mobcomp2-itang.appspot.com",
  messagingSenderId: "995597794321",
  appId: "1:995597794321:web:66af8c35eefa02e74245b0",
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <App />
    </FirebaseAppProvider>
  </React.StrictMode>,
);
