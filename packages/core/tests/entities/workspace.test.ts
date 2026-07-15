import { describe, it, expect } from "vitest";
import { Workspace } from "../../src/entities/workspace.js";

describe("Workspace", () => {
  const baseProps = {
    id: "ws_001",
    name: "My Workspace",
    organizationId: "org_001",
    createdBy: "usr_001",
  };

  it("creates a workspace", () => {
    const ws = Workspace.create(baseProps);
    expect(ws.name).toBe("My Workspace");
    expect(ws.organizationId).toBe("org_001");
    expect(ws.createdBy).toBe("usr_001");
  });

  it("renames a workspace", () => {
    const ws = Workspace.create(baseProps);
    ws.rename("Renamed Workspace");
    expect(ws.name).toBe("Renamed Workspace");
  });

  it("converts to JSON", () => {
    const ws = Workspace.create(baseProps);
    const json = ws.toJSON();
    expect(json.name).toBe("My Workspace");
    expect(json.id).toBe("ws_001");
  });

  it("has timestamps", () => {
    const ws = Workspace.create(baseProps);
    expect(ws.createdAt).toBeInstanceOf(Date);
    expect(ws.updatedAt).toBeInstanceOf(Date);
  });
});
