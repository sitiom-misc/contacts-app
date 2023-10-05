import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonBackButton,
  IonButtons,
  IonItem,
  IonLabel,
  IonIcon,
  IonList,
  IonButton,
  IonPopover,
  useIonAlert,
  useIonRouter,
} from "@ionic/react";
import { useParams } from "react-router-dom";
import avatar from "../assets/avatar.svg";
import { call, mail, ellipsisVertical } from "ionicons/icons";
import { useLongPress } from "react-use";
import ContactModal from "../components/ContactModal";
import { useRef, useState } from "react";
import { DocumentReference, deleteDoc, doc, setDoc } from "firebase/firestore";
import { useFirestore, useFirestoreDocData } from "reactfire";
import { Contact } from "../types/contacts";

interface RouteParams {
  id: string;
}

const ContactDetails = () => {
  const { id } = useParams<RouteParams>();

  const contactRef = doc(
    useFirestore(),
    "contacts",
    id,
  ) as DocumentReference<Contact>;
  const { status, data: contact } = useFirestoreDocData(contactRef, {
    idField: "id",
  });

  const emailLongPress = useLongPress(() => {
    if (!contact?.email) return;
    window.open(`mailto:${contact.email}`);
  });
  const phoneLongPress = useLongPress(() => {
    if (!contact?.phone) return;
    window.open(`tel:${contact.phone}`);
  });
  const [presentAlert] = useIonAlert();
  const router = useIonRouter();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popover = useRef<HTMLIonPopoverElement>(null);

  const openPopover = (e: any) => {
    popover.current!.event = e;
    setPopoverOpen(true);
  };

  const confirmDelete = () =>
    presentAlert({
      header: "Confirm deletion",
      message: "Are you sure?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Delete",
          role: "destructive",
          cssClass: "!text-red-500",
          handler: () => {
            deleteDoc(contactRef);
            if (router.canGoBack()) router.goBack();
            else router.push("/contacts", "back", "replace");
          },
        },
      ],
    });

  if (status === "loading" || !contact) return null;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="none">
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonButtons slot="end">
            <IonButton onClick={openPopover}>
              <IonIcon icon={ellipsisVertical} />
            </IonButton>
          </IonButtons>
          <IonPopover
            ref={popover}
            isOpen={popoverOpen}
            onDidDismiss={() => setPopoverOpen(false)}
          >
            <IonContent>
              <IonList>
                <IonItem button id="edit">
                  Edit
                </IonItem>
                <ContactModal
                  trigger="edit"
                  title="Update Contact"
                  onSubmit={(contact) => {
                    delete contact.id;
                    setDoc(contactRef, contact, { merge: true });
                    setPopoverOpen(false);
                  }}
                  contact={contact}
                />
                <IonItem button onClick={confirmDelete}>
                  Delete
                </IonItem>
              </IonList>
            </IonContent>
          </IonPopover>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="my-9">
          <img
            src={contact.avatarUrl || avatar}
            alt="avatar"
            className="mx-auto h-36 w-36 rounded-full object-cover"
          />
          <h1 className="mt-5 text-center text-3xl font-bold ">
            {contact.firstName} {contact.lastName}
          </h1>
        </div>
        <IonList>
          <IonItem button {...phoneLongPress}>
            <IonIcon icon={call} slot="start" />
            <IonLabel>
              <h3>Phone</h3>
              <p>{contact.phone}</p>
            </IonLabel>
          </IonItem>
          <IonItem button {...emailLongPress}>
            <IonIcon icon={mail} slot="start" />
            <IonLabel>
              <h3>E-mail</h3>
              <p>{contact.email}</p>
            </IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};
export default ContactDetails;
