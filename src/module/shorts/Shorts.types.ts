interface ShortsType {
  shortsId: string;
  orgId: string;

  shortsStatus: string;

  shortsStorageId: string | null;
  shortsStorageUrl: string;
  shortsExternalUrl: string;

  shortsBannerStorageId: string | null;
  shortsBannerStorageUrl: string;
  shortsBannerExternalUrl: string;

  shortsName: string;
  shortsDescription: string;
  orgName: string;

  duration: number;
  likes: number;
  views: number;

  tags: string[];

  createdBy: string;
  createdByName: string;
  createdAt: string; // ISO date string
  updatedBy: string;
  updatedByName: string;
  updatedAt: string; // ISO date string
}
export default ShortsType;
