import { Redirect, Route } from "react-router-dom";
import { setupIonicReact } from "@ionic/react";
import { IonApp, IonRouterOutlet } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import ContactList from "./pages/ContactList";
import "@ionic/react/css/core.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "./theme/variables.css";
import ContactDetails from "./pages/ContactDetails";
import { FirestoreProvider, StorageProvider, useFirebaseApp } from "reactfire";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

setupIonicReact();

function App() {
  const firestoreInstance = getFirestore(useFirebaseApp());

  return (
    <FirestoreProvider sdk={firestoreInstance}>
      <StorageProvider sdk={getStorage(useFirebaseApp())}>
        <IonApp>
          <IonReactRouter>
            <IonRouterOutlet>
              <Redirect exact from="/" to="/contacts" />
              <Route exact component={ContactList} path="/contacts" />
              <Route exact component={ContactDetails} path="/contacts/:id" />
            </IonRouterOutlet>
          </IonReactRouter>
        </IonApp>
      </StorageProvider>
    </FirestoreProvider>
  );
}

export default App;
