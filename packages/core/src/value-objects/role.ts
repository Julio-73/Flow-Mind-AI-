import { z } from "zod";

export const Role = {
  ADMIN_ORG: "ADMIN_ORG",
  DEVELOPER: "DEVELOPER",
  BUSINESS_USER: "BUSINESS_USER",
  VIEWER: "VIEWER",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const RoleSchema = z.nativeEnum(Role);

const roleHierarchy: Record<Role, number> = {
  ADMIN_ORG: 100,
  DEVELOPER: 80,
  BUSINESS_USER: 50,
  VIEWER: 10,
};

export function hasMinRole(userRole: Role, requiredRole: Role): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function isAdmin(role: Role): boolean {
  return role === Role.ADMIN_ORG;
}
