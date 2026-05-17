export interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  createdAt: string;
}

export interface DocumentModel {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  categoryId: string | null;
  categoryName: string | null;
  createdById: string;
  createdByName: string;
  tags: Pick<Tag, 'id' | 'name'>[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentModelListItem {
  id: string;
  title: string;
  description: string | null;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  categoryId: string | null;
  categoryName: string | null;
  createdById: string;
  createdByName: string;
  tags: Pick<Tag, 'id' | 'name'>[];
  createdAt: string;
  updatedAt: string;
}
