import { describe, it, expect } from "vitest";
import { User } from "../../src/entities/user.js";
import { Email } from "../../src/value-objects/email.js";

describe("User", () => {
  const baseProps = {
    id: "usr_001",
    email: Email.create("test@flowmind.ai"),
    name: "Test User",
    passwordHash: "$2b$10$hashedpassword",
  };

  it("creates a user with active status", () => {
    const user = User.create(baseProps);
    expect(user.name).toBe("Test User");
    expect(user.isActive).toBe(true);
    expect(user.email.toString()).toBe("test@flowmind.ai");
  });

  it("updates profile", () => {
    const user = User.create(baseProps);
    user.updateProfile({ name: "Updated Name" });
    expect(user.name).toBe("Updated Name");
  });

  it("updates avatar", () => {
    const user = User.create(baseProps);
    user.updateProfile({ avatarUrl: "https://example.com/avatar.png" });
    expect(user.avatarUrl).toBe("https://example.com/avatar.png");
  });

  it("records login timestamp", () => {
    const user = User.create(baseProps);
    expect(user.lastLoginAt).toBeUndefined();
    user.recordLogin();
    expect(user.lastLoginAt).toBeInstanceOf(Date);
  });

  it("deactivates a user", () => {
    const user = User.create(baseProps);
    expect(user.isActive).toBe(true);
    user.deactivate();
    expect(user.isActive).toBe(false);
  });

  it("converts to JSON", () => {
    const user = User.create(baseProps);
    const json = user.toJSON();
    expect(json.name).toBe("Test User");
    expect(json.id).toBe("usr_001");
  });
});
