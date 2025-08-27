export type PracticeCategoryType = {
  practiceCategoryId?: string;
  practiceCategoryName: string;
  practiceCategoryIconStorageId: string;
  practiceCategoryIconExternalUrl: string;
  practiceCategoryIconStorageUrl: string;
  practiceCategoryStatus?: string; // Added for status
};

export const formDataInitialState: PracticeCategoryType = {
  practiceCategoryName: "",
  practiceCategoryIconStorageId: "",
  practiceCategoryIconExternalUrl: "",
  practiceCategoryIconStorageUrl: "",
};
