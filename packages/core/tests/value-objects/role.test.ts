import { describe, it, expect } from "vitest";
import { Role, hasMinRole, isAdmin, RoleSchema } from "../../src/value-objects/role.js";

describe("Role", () => {
  it("has all expected roles", () => {
    expect(Role.ADMIN_ORG).toBe("ADMIN_ORG");
    expect(Role.DEVELOPER).toBe("DEVELOPER");
    expect(Role.BUSINESS_USER).toBe("BUSINESS_USER");
    expect(Role.VIEWER).toBe("VIEWER");
  });

  it("checks minimum role hierarchy", () => {
    expect(hasMinRole(Role.ADMIN_ORG, Role.VIEWER)).toBe(true);
    expect(hasMinRole(Role.DEVELOPER, Role.BUSINESS_USER)).toBe(true);
    expect(hasMinRole(Role.VIEWER, Role.ADMIN_ORG)).toBe(false);
    expect(hasMinRole(Role.BUSINESS_USER, Role.DEVELOPER)).toBe(false);
  });

  it("identifies admin role", () => {
    expect(isAdmin(Role.ADMIN_ORG)).toBe(true);
    expect(isAdmin(Role.DEVELOPER)).toBe(false);
    expect(isAdmin(Role.VIEWER)).toBe(false);
  });

  it("allows same level access", () => {
    expect(hasMinRole(Role.DEVELOPER, Role.DEVELOPER)).toBe(true);
  });

  it("parses valid role from Zod schema", () => {
    const result = RoleSchema.parse("DEVELOPER");
    expect(result).toBe(Role.DEVELOPER);
  });

  it("throws on invalid role string", () => {
    expect(() => RoleSchema.parse("SUPER_ADMIN")).toThrow();
  });
});
