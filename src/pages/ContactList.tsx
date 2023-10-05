import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonList,
  IonLoading,
  IonPage,
  IonThumbnail,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Contact } from "../types/contacts";
import avatar from "../assets/avatar.svg";
import { add } from "ionicons/icons";
import ContactModal from "../components/ContactModal";
import { useFirestore, useFirestoreCollectionData } from "reactfire";
import {
  CollectionReference,
  collection,
  doc,
  setDoc,
} from "firebase/firestore";

interface GroupedContacts {
  [key: string]: Contact[];
}

const ContactList = () => {
  const contactsCollection = collection(
    useFirestore(),
    "contacts",
  ) as CollectionReference<Contact>;
  const { status, data: contacts } = useFirestoreCollectionData(
    contactsCollection,
    {
      idField: "id",
    },
  );

  // Sort & group contacts by first letter of first name
  const groupedContacts = contacts
    ?.sort((a, b) => a.firstName.localeCompare(b.firstName))
    .reduce((acc, contact) => {
      const firstLetter = contact.firstName[0].toUpperCase();
      if (!acc[firstLetter]) acc[firstLetter] = [];
      acc[firstLetter].push(contact);
      return acc;
    }, {} as GroupedContacts);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Contacts</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={status === "loading"} message="Loading..." />
        {status !== "success" || (
          <>
            <IonList>
              {Object.entries(groupedContacts).map(([letter, contacts]) => (
                <IonItemGroup key={letter}>
                  <IonItemDivider>
                    <IonLabel>{letter}</IonLabel>
                  </IonItemDivider>
                  {contacts.map((contact) => (
                    <IonItem
                      key={contact.id}
                      button
                      lines="none"
                      color="none"
                      routerLink={`/contacts/${contact.id}`}
                    >
                      <IonThumbnail slot="start">
                        <img
                          alt={`${contact.firstName} ${contact.lastName}`}
                          src={contact.avatarUrl || avatar}
                          className="h-full rounded-full"
                        />
                      </IonThumbnail>
                      <IonLabel>
                        {contact.firstName} {contact.lastName}
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonItemGroup>
              ))}
            </IonList>
            <IonFab slot="fixed" vertical="bottom" horizontal="end">
              <IonFabButton id="open-modal">
                <IonIcon icon={add} />
              </IonFabButton>
            </IonFab>
            <ContactModal
              trigger="open-modal"
              title="New Contact"
              onSubmit={(contact) => {
                delete contact.id;
                setDoc(
                  doc(contactsCollection, self.crypto.randomUUID()),
                  contact,
                );
              }}
            />
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ContactList;
