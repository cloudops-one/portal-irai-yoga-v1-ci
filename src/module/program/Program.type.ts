export interface Program {
  programId: string;
  orgId?: string;
  orgName?: string;
  orgIconStorageUrl?: string;
  programBannerStorageId?: string;
  programBannerStorageUrl?: string;
  programBannerExternalUrl?: string;
  programName: string;
  programDescription: string;
  programAuthor: string;
  programStatus?: "ACTIVE" | "INACTIVE";
  programDuration?: number;
  programRating?: number;
  programRatingCount?: number;
  programLikes?: number;
  programViews?: number;
  flag?: string;
  tags?: string[];
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface Section {
  sectionId: string;
  programId: string;
  sectionName: string;
  sectionDescription: string;
  sectionOrder?: number;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface Lesson {
  lessonId: string;
  sectionId: string;
  lessonName: string;
  lessonStorageId?: string;
  lessonExternalUrl?: string;
  duration?: number;
  lessonDescription?: string;
  lessonText?: string;
  lessonOrder?: number;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface ProgramFormData {
  programName: string;
  orgId: string;
  programDescription: string;
  programAuthor: string;
  programBannerStorageId?: string;
  programBannerExternalUrl?: string;
  tags?: string[];
  programDuration?: number;
}

export interface SectionFormData {
  programId: string;
  sectionName: string;
  sectionDescription: string;
  sectionOrder?: number;
}

export interface LessonFormData {
  sectionId: string;
  lessonName: string;
  lessonDescription?: string;
  lessonText?: string;
  lessonStorageId?: string;
  lessonStorageUrl?: string;
  lessonExternalUrl?: string;
  duration?: number;
  lessonOrder?: number;
}

export interface OrderUpdate {
  programId: string;
  sections: {
    sectionId: string;
    sectionOrder: number;
  }[];
}

export interface LessonOrderUpdate {
  sectionId: string;
  lessons: {
    lessonId: string;
    lessonOrder: number;
  }[];
}
