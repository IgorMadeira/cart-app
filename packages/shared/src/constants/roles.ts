export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  DASHBOARD_READ: 'dashboard:read',
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',
  DOCUMENT_MODELS_READ: 'document-models:read',
  DOCUMENT_MODELS_WRITE: 'document-models:write',
  CATEGORIES_WRITE: 'categories:write',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.EDITOR]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_WRITE,
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.DOCUMENT_MODELS_READ,
    PERMISSIONS.DOCUMENT_MODELS_WRITE,
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.DOCUMENT_MODELS_READ,
  ],
};
