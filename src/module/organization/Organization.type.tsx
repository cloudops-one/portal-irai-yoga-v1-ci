export type OrganizationType = {
  orgId: string;
  orgIconStorageId: string;
  orgIconStorageUrl: string;
  orgStatus: string;
  orgName: string;
  orgRegistrationNumber: string;
  orgEmail: string;
  orgDescription: string;
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
    mobile: string;
    email: string;
  }[];
  urls: {
    id?: number | null;
    url: string;
    type: string;
  }[];
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountType?: string | null;
  bankIdentifierCode?: string | null;
  bankBranch?: string | null;
  bankAddress?: string | null;
  bankCurrency?: string | null;
  taxIdentificationNumber?: string | null;
  permanentAccountNumber?: string | null;
  goodsServicesTaxNumber?: string | null;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedBy: string;
  updatedByName: string;
  updatedAt: string;
};

export type OrganizationDropdown = {
  orgId: string;
  orgName: string;
  orgRegistrationNumber: string;
};

type AddressFieldPath =
  `addresses.${number}.${keyof OrganizationType["addresses"][0]}`;
type ContactFieldPath =
  `contacts.${number}.${keyof OrganizationType["contacts"][0]}`;
type UrlFieldPath = `urls.${number}.${keyof OrganizationType["urls"][0]}`;
export type OrganizationFieldPath =
  | keyof Omit<OrganizationType, "addresses" | "contacts" | "urls">
  | AddressFieldPath
  | ContactFieldPath
  | UrlFieldPath;
