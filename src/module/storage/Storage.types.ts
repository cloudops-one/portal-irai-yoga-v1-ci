export interface StorageType {
  storageId: string;
  storageName: string;
  storageUrl: string;
  contentType: string | null;
  extension: string;
  size: number;
  tags: string;
  createdAt: string | null;
  createdByName: string | null;
  createdBy: string | null;
}
