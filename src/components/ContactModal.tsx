import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
  IonInput,
  IonIcon,
  IonRippleEffect,
  IonLoading,
} from "@ionic/react";
import { useRef, useState } from "react";
import { checkmark, close } from "ionicons/icons";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Contact } from "../types/contacts";
import { useStorage } from "reactfire";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import avatar from "../assets/avatar.svg";

const contactSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
  email: z.string().email(),
  phone: z
    .string()
    .startsWith("09")
    .min(11)
    .regex(/^[0-9]+$/, { message: "Phone number does not match pattern" }),
});

interface ContactModalProps {
  trigger: string;
  title: string;
  contact?: Contact;
  onSubmit: (data: Contact) => void;
}

const ContactModal = ({
  trigger,
  title,
  onSubmit,
  contact,
}: ContactModalProps) => {
  const modal = useRef<HTMLIonModalElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(contact?.avatarUrl ?? avatar);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File>();
  const storage = ref(useStorage(), "contacts");

  const {
    register,
    getFieldState,
    handleSubmit,
    reset,
    formState: { isValid, errors, touchedFields },
  } = useForm<Contact>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    resolver: zodResolver(contactSchema),
    defaultValues: contact,
  });

  return (
    <IonModal
      ref={modal}
      trigger={trigger}
      initialBreakpoint={0.7}
      breakpoints={[0.5, 0.7]}
      onDidDismiss={() => reset()}
    >
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => modal.current?.dismiss()} slot="start">
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
          <IonTitle>{title}</IonTitle>
          <IonButtons slot="end">
            <IonButton
              strong={true}
              disabled={!isValid}
              type="submit"
              form="contactForm"
            >
              <IonIcon icon={checkmark} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={isUploading} message="Loading..." />
        <form
          id="contactForm"
          onSubmit={handleSubmit(async (data) => {
            if (avatarFile) {
              const avatarRef = ref(storage, `${data.id}/${avatarFile.name}`);
              setIsUploading(true);
              await uploadBytes(avatarRef, avatarFile);
              data.avatarUrl = await getDownloadURL(avatarRef);
              setIsUploading(false);
              setAvatarUrl(avatar); // Reset avatarUrl
            }
            onSubmit(data);
            modal.current?.dismiss();
          })}
          className="space-y-2"
        >
          <label>
            <div className="ion-activatable relative m-5 mx-auto h-36 w-36 rounded-2xl">
              <img
                src={avatarUrl}
                alt="avatar"
                className="mx-auto h-36 w-36 rounded-full object-cover"
              />
              <IonRippleEffect />
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setAvatarFile(file);
                setAvatarUrl(URL.createObjectURL(file));
              }}
            />
          </label>
          <input
            type="hidden"
            {...register("id")}
            value={contact?.id ?? self.crypto.randomUUID()}
          />
          <IonInput
            className={`${
              getFieldState("firstName").invalid && "ion-invalid"
            } ${touchedFields.firstName && "ion-touched"}`}
            mode="md"
            fill="solid"
            labelPlacement="floating"
            label="First Name"
            type="text"
            placeholder="Daniel"
            errorText={errors.firstName?.message}
            {...register("firstName")}
          />
          <IonInput
            className={`${getFieldState("lastName").invalid && "ion-invalid"} ${
              touchedFields.lastName && "ion-touched"
            }`}
            mode="md"
            fill="solid"
            labelPlacement="floating"
            label="Last Name"
            type="text"
            placeholder="Abalos"
            errorText={errors.lastName?.message}
            {...register("lastName")}
          />
          <IonInput
            className={`${getFieldState("email").invalid && "ion-invalid"} ${
              touchedFields.email && "ion-touched"
            }`}
            mode="md"
            fill="solid"
            labelPlacement="floating"
            label="Email"
            type="email"
            placeholder="daniel.abalos@iacademy.ph"
            errorText={errors.email?.message}
            {...register("email")}
          />
          <IonInput
            className={`${getFieldState("phone").invalid && "ion-invalid"} ${
              touchedFields.phone && "ion-touched"
            }`}
            mode="md"
            fill="solid"
            labelPlacement="floating"
            label="Phone"
            type="tel"
            placeholder="09123456789"
            errorText={errors.phone?.message}
            {...register("phone")}
          />
        </form>
      </IonContent>
    </IonModal>
  );
};

export default ContactModal;
