export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
  },
  USERS: {
    BASE: '/api/users',
    BY_ID: (id: string) => `/api/users/${id}`,
  },
  DASHBOARD: {
    STATS: '/api/dashboard/stats',
  },
  DOCUMENT_MODELS: {
    BASE: '/api/document-models',
    BY_ID: (id: string) => `/api/document-models/${id}`,
    DOWNLOAD: (id: string) => `/api/document-models/${id}/download`,
  },
  CATEGORIES: {
    BASE: '/api/categories',
    BY_ID: (id: string) => `/api/categories/${id}`,
  },
  TAGS: {
    BASE: '/api/tags',
    BY_ID: (id: string) => `/api/tags/${id}`,
  },
} as const;
