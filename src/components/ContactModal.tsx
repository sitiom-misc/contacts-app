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
} from "@ionic/react";
import { useRef } from "react";
import { checkmark, close } from "ionicons/icons";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Contact } from "../types/contacts";

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
  avatarUrl: z.union([z.string().url(), z.literal("")]),
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
      initialBreakpoint={0.65}
      breakpoints={[0.5, 0.65]}
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
        <form
          id="contactForm"
          onSubmit={handleSubmit((data) => {
            console.table(data);
            onSubmit(data);
            modal.current?.dismiss();
          })}
          className="mt-5 space-y-2"
        >
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
          <IonInput
            className={`${
              getFieldState("avatarUrl").invalid && "ion-invalid"
            } ${touchedFields.avatarUrl && "ion-touched"}`}
            mode="md"
            fill="solid"
            labelPlacement="floating"
            label="Avatar URL (optional)"
            type="url"
            placeholder="https://example.com/avatar.png"
            errorText={errors.avatarUrl?.message}
            {...register("avatarUrl")}
          />
        </form>
      </IonContent>
    </IonModal>
  );
};

export default ContactModal;
