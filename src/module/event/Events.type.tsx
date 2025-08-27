export type EventType = {
  eventId: string;
  orgId: string;
  orgName: string;
  orgIconStorageUrl: string;
  eventBannerStorageId: string | null;
  eventBannerStorageUrl: string | null;
  eventBannerExternalUrl: string | null;
  eventIconStorageId: string | null;
  eventIconStorageUrl: string | null;
  eventIconExternalUrl: string | null;
  eventStatus: string;
  eventName: string;
  eventDescription: string;
  eventStartDateTime: string; // ISO string
  eventEndDateTime: string; // ISO string
  addresses: {
    id?: number | null;
    isPrimary: boolean;
    addressLine1: string;
    addressLine2: string;
    city: string;
    stateProvince: string;
    postalCode: string;
    country: string;
  }[];
  contacts: {
    id?: number | null;
    isPrimary: boolean;
    name: string;
    mobile: string | undefined;
    email: string;
    country: string | null;
  }[];
  urls: {
    id?: number | null;
    url: string;
    type: string;
  }[];
  createdBy: string | null;
  createdByName: string | null;
  createdAt: string;
  updatedBy: string | null;
  updatedByName: string | null;
  updatedAt: string;
};

type AddressFieldPath =
  `addresses.${number}.${keyof EventType["addresses"][0]}`;
type ContactFieldPath = `contacts.${number}.${keyof EventType["contacts"][0]}`;
type UrlFieldPath = `urls.${number}.${keyof EventType["urls"][0]}`;

export type EventFieldPath =
  | keyof Omit<EventType, "addresses" | "contacts" | "urls">
  | AddressFieldPath
  | ContactFieldPath
  | UrlFieldPath;
