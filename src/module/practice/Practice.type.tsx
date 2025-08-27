export interface PracticeType {
  practiceId: string;
  practiceName: string;
  practiceDescription: string;
  practiceStatus: "ACTIVE" | "INACTIVE";
  orgId: string;
  orgName: string;
  orgIconStorageUrl: string;
  practiceCategoryId: string;
  practiceCategoryName: string;
  practiceIconStorageUrl: string | null;
  practiceIconStorageId: string | null;
  practiceIconExternalUrl: string | null;
  practiceBannerStorageUrl: string | null;
  practiceBannerExternalUrl: string | null;
  practiceBannerStorageId: string | null;
  practiceStorageUrl: string | null;
  practiceExternalUrl: string | null;
  practiceStorageId: string | null;
  tags: string[];
  rating: number;
  ratingCount: number;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedBy: string;
  updatedByName: string;
  updatedAt: string;
}

export interface PracticeFormData {
  practiceName: string;
  practiceDescription: string;
  practiceCategoryId: string;
  tags: string[];
  bannerImage?: File | null;
  orgId: string;

  practiceIconStorageId: string | null;
  practiceIconStorageUrl: string | null;
  practiceIconExternalUrl: string | null;

  practiceBannerStorageId: string | null;
  practiceBannerStorageUrl: string | null;
  practiceBannerExternalUrl: string | null;

  practiceStorageId: string | null;
  practiceStorageUrl: string | null;
  practiceExternalUrl: string | null;
}

export interface PracticeModalPropsType {
  open: boolean;
  handleClose: () => void;
  refetch: () => void;
  practiceData?: PracticeType;
}

export interface CategoryOption {
  practiceCategoryId: string;
  practiceCategoryName: string;
}
