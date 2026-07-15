import { describe, it, expect } from "vitest";
import { Organization } from "../../src/entities/organization.js";
import { Slug } from "../../src/value-objects/slug.js";

describe("Organization", () => {
  const baseProps = {
    id: "org_001",
    name: "FlowMind Corp",
    slug: Slug.create("flowmind-corp"),
    ownerId: "usr_001",
    maxSeats: 10,
  };

  it("creates an organization", () => {
    const org = Organization.create(baseProps);
    expect(org.name).toBe("FlowMind Corp");
    expect(org.slug.toString()).toBe("flowmind-corp");
    expect(org.features).toEqual({});
  });

  it("updates settings", () => {
    const org = Organization.create(baseProps);
    org.updateSettings({ name: "New Name" });
    expect(org.name).toBe("New Name");
  });

  it("updates logo", () => {
    const org = Organization.create(baseProps);
    org.updateSettings({ logoUrl: "https://example.com/logo.png" });
    expect(org.logoUrl).toBe("https://example.com/logo.png");
  });

  it("checks features", () => {
    const org = Organization.create(baseProps);
    expect(org.hasFeature("analytics")).toBe(false);
    org.setFeature("analytics", true);
    expect(org.hasFeature("analytics")).toBe(true);
  });

  it("disables a feature", () => {
    const org = Organization.create(baseProps);
    org.setFeature("analytics", true);
    org.setFeature("analytics", false);
    expect(org.hasFeature("analytics")).toBe(false);
  });

  it("returns immutable features", () => {
    const org = Organization.create(baseProps);
    const features = org.features;
    features["custom"] = true;
    expect(org.features).not.toHaveProperty("custom");
  });

  it("converts to JSON", () => {
    const org = Organization.create(baseProps);
    const json = org.toJSON();
    expect(json.name).toBe("FlowMind Corp");
    expect(json.maxSeats).toBe(10);
  });
});
