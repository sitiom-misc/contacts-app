import { create } from "zustand";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import papa from "papaparse";
import { Contact } from "./types/contacts";
import {
  PersistStorage,
  StateStorage,
  StorageValue,
  persist,
} from "zustand/middleware";

interface ContactStore {
  contacts: Contact[];
  addContact: (contact: Contact) => void;
  removeContact: (contact: Contact) => void;
  updateContact: (contact: Contact) => void;
}

const defaults: Contact[] = [
  {
    id: self.crypto.randomUUID(),
    firstName: "Daniel Carlo",
    lastName: "Abalos",
    email: "daniel.abalos@iacademy.ph",
    phone: "09123456789",
    avatarUrl: "https://i.postimg.cc/dtc5qy1k/daniel-carlo-abalos.jpg",
  },
  {
    id: self.crypto.randomUUID(),
    firstName: "Darth",
    lastName: "Vader",
    email: "darth.vader@iacademy.ph",
    phone: "09123456789",
    avatarUrl: "https://i.postimg.cc/RFnXBGT6/Star-Wars-Darth-Vader.jpg",
  },
  {
    id: self.crypto.randomUUID(),
    firstName: "Doctor Stephen",
    lastName: "Strange",
    email: "dr.strange@iacademy.edu.ph",
    phone: "09123456789",
    avatarUrl: "https://i.postimg.cc/9MVrmQdd/140222-Dr-S-02.jpg",
  },
  {
    id: self.crypto.randomUUID(),
    firstName: "Gus",
    lastName: "Fring",
    email: "gus.fring@iacademy.edu.ph",
    phone: "09123456789",
    avatarUrl: "https://i.postimg.cc/FRTBYnkP/Gus-Fring-2002.jpg",
  },
  {
    id: self.crypto.randomUUID(),
    firstName: "Mitch",
    lastName: "Andaya",
    email: "mitch.andaya@iacademy.edu.ph",
    phone: "09123456789",
    avatarUrl: "https://i.postimg.cc/15ckN51C/image.webp",
  },
  {
    id: self.crypto.randomUUID(),
    firstName: "Peter",
    lastName: "Parker",
    email: "peter.parker@iacademy.edu.ph",
    phone: "09123456789",
    avatarUrl: "https://i.postimg.cc/YS6cC3xV/spiderman.png",
  },
  {
    id: self.crypto.randomUUID(),
    firstName: "Walter",
    lastName: "White",
    email: "walter.white@iacademy.edu.ph",
    phone: "09123456789",
    avatarUrl: "https://i.postimg.cc/rs8qkbXQ/Walter-White-S5-B.png",
  },
  {
    id: self.crypto.randomUUID(),
    firstName: "Winnie",
    lastName: "The Pooh",
    email: "w.pooh@iacademy.edu.ph",
    phone: "09123456789",
    avatarUrl: "https://i.postimg.cc/hjBvMthJ/Pooh.png",
  },
  {
    id: self.crypto.randomUUID(),
    firstName: "Yui",
    lastName: "Hirasawa",
    email: "yui.hirasawa@iacademy.ph",
    phone: "09123456789",
    avatarUrl: "https://i.postimg.cc/MHyfsg05/Yui-Hirasawa-new-mugshot.png",
  },
];

const checkFileExists = async (path: string) => {
  try {
    await Filesystem.stat({ path: path, directory: Directory.External });
    return true;
  } catch (e) {
    if (
      e instanceof Error &&
      ["Entry does not exist.", "File does not exist"].includes(e.message)
    ) {
      return false;
    } else {
      throw e;
    }
  }
};

const fsExternalStorage: StateStorage = {
  getItem: async (name) => {
    console.log(`Reading ${name}.csv`);
    if (!(await checkFileExists(`${name}.csv`))) {
      return null;
    } else {
      const { data } = await Filesystem.readFile({
        path: `${name}.csv`,
        directory: Directory.External,
        encoding: Encoding.UTF8,
      });
      return data;
    }
  },
  setItem: async (name, value) => {
    console.log(`Writing to ${name}.csv`);
    await Filesystem.writeFile({
      path: `${name}.csv`,
      directory: Directory.External,
      data: value,
      encoding: Encoding.UTF8,
    });
  },
  removeItem: async (name) => {
    console.log(`Deleting ${name}.csv`);
    await Filesystem.deleteFile({
      path: `${name}.csv`,
      directory: Directory.External,
    });
  },
};

function createCsvStorage<S extends Contact[]>(
  getStorage: () => StateStorage
): PersistStorage<S> {
  const storage = getStorage();
  const persistStorage: PersistStorage<S> = {
    getItem: (name) => {
      const parse = (str: string | null) => {
        if (str === null) {
          return null;
        }
        return {
          state: papa.parse<Contact>(str, {
            header: true,
            skipEmptyLines: true,
          }).data,
        } as StorageValue<S>;
      };
      const str = storage.getItem(name);
      if (str instanceof Promise) {
        return str.then(parse);
      }
      return parse(str);
    },
    setItem: (name, newValue) =>
      storage.setItem(name, papa.unparse(newValue.state)),
    removeItem: (name) => storage.removeItem(name),
  };
  return persistStorage;
}

const useContactStore = create<ContactStore>()(
  persist(
    (set) => ({
      contacts: defaults,
      addContact: async (contact) => {
        set((state) => ({ contacts: [...state.contacts, contact] }));
      },
      removeContact: async (contact) => {
        set((state) => ({
          contacts: state.contacts.filter((c) => c !== contact),
        }));
      },
      updateContact: async (contact) => {
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === contact.id ? contact : c
          ),
        }));
      },
    }),
    {
      name: "contacts",
      storage: createCsvStorage(() => fsExternalStorage),
      partialize: (state) => state.contacts,
      merge: (persisted, current) => ({
        ...current,
        contacts: (persisted as Contact[]) || current.contacts,
      }),
    }
  )
);

export default useContactStore;
