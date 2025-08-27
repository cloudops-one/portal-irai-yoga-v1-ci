export type NewsType = {
  newsId: string;
  newsIconStorageId: string | null;
  newsBannerStorageId: string | null;
  newsIconExternalUrl: string;
  newsIconStorageUrl: string;
  newsBannerExternalUrl: string;
  newsBannerStorageUrl: string;
  newsStatus: string;
  newsName: string;
  newsDescription: string;
  isRecommended: boolean;
  likes: number;
  views: number;
  tags: string[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedBy: string;
  updatedByName: string;
  updatedAt: string;
};

export type NewsRequestDto = {
  newsIconStorageId?: string | null;
  newsBannerStorageId?: string | null;
  newsIconExternalUrl?: string;
  newsBannerExternalUrl?: string;
  newsName: string;
  newsDescription: string;
  tags: string[];
  isRecommended: boolean;
};
