import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FlowCard, FlowCardSkeleton } from "@/components/features/flows/flow-card";
import type { FlowSummary } from "@/types/flow";

const baseFlow: FlowSummary = {
  id: "flw_001",
  name: "Test Flow",
  status: "active",
  runCount: 42,
  successRate: 0.95,
  updatedAt: new Date().toISOString(),
};

describe("FlowCard", () => {
  it("renders flow name and status", () => {
    render(<FlowCard flow={baseFlow} />);
    expect(screen.getByText("Test Flow")).toBeInTheDocument();
  });

  it("renders run count", () => {
    render(<FlowCard flow={baseFlow} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders success rate as percentage", () => {
    render(<FlowCard flow={baseFlow} />);
    expect(screen.getByText("95%")).toBeInTheDocument();
  });

  it("renders last run status badge when present", () => {
    const flow = { ...baseFlow, lastRunStatus: "success" as const };
    render(<FlowCard flow={flow} />);
    expect(screen.getByText("success")).toBeInTheDocument();
  });

  it("does not render badge when no last run status", () => {
    render(<FlowCard flow={baseFlow} />);
    expect(screen.queryByText("success")).not.toBeInTheDocument();
  });

  it("renders draft status flow", () => {
    const flow = { ...baseFlow, status: "draft" as const };
    render(<FlowCard flow={flow} />);
    expect(screen.getByText("Test Flow")).toBeInTheDocument();
  });

  it("renders link to flow editor", () => {
    render(<FlowCard flow={baseFlow} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/flows/flw_001/edit");
  });

  it("shows Running... for running status", () => {
    const flow = { ...baseFlow, lastRunStatus: "running" as const };
    render(<FlowCard flow={flow} />);
    expect(screen.getByText("Running...")).toBeInTheDocument();
  });
});

describe("FlowCardSkeleton", () => {
  it("renders skeleton placeholders", () => {
    const { container } = render(<FlowCardSkeleton />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
