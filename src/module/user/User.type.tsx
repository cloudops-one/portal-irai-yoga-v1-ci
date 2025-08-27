export interface AddressType {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  isPrimary?: boolean;
}
export interface UserType {
  userFirstName: string;
  userLastName: string;
  userId?: string;
  userEmail: string;
  dateOfBirth: Date | null;
  userMobile: string;
  password?: string;
  confirmPassword?: string;
  orgId?: string;
  orgName?: string;
  addresses: AddressType[];
  userType: string;
  bloodGroup: string;
  gender?: string;
  userIconStorageId?: string | File | null;
  userIconStorageUrl?: string | null; // Optional field for profile picture URL
}
export interface Option {
  id: number;
  value: string;
  selected: boolean;
}

export interface UserAoiType {
  questionId: number;
  questionName: string;
  optionType: string;
  status: string;
  options: Option[];
}

export const formDataInitialState: UserType = {
  userFirstName: "",
  userLastName: "",
  userId: undefined,
  userEmail: "",
  dateOfBirth: null,
  userMobile: "",
  password: "",
  confirmPassword: "",
  orgId: "",
  addresses: [
    {
      addressLine1: "",
      addressLine2: "",
      city: "",
      stateProvince: "",
      postalCode: "",
      country: "",
      isPrimary: true,
    },
  ],
  userType: "",
  bloodGroup: "",
  userIconStorageId: null,
  userIconStorageUrl: null,
  gender: "",
  orgName: "",
};
