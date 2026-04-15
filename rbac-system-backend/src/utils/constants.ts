/**
 * Application-wide enums for Role and Status.
 * Designed to be easily extended with new roles/statuses.
 */
export enum Role {
  ADMIN = "admin",
  MANAGER = "manager",
  USER = "user",
}

export enum Status {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

/** Ordered hierarchy — higher index = more privilege */
export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.USER]: 1,
  [Role.MANAGER]: 2,
  [Role.ADMIN]: 3,
};
