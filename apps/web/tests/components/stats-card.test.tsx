import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsCard } from "@/components/shared/stats-card";

describe("StatsCard", () => {
  it("renders title and value", () => {
    render(<StatsCard title="Total Flows" value="42" />);
    expect(screen.getByText("Total Flows")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<StatsCard title="Flows" value="10" description="Active flows" />);
    expect(screen.getByText("Active flows")).toBeInTheDocument();
  });

  it("renders positive trend", () => {
    render(<StatsCard title="Success Rate" value="98%" trend={{ value: 12, positive: true }} />);
    expect(screen.getByText("12%")).toBeInTheDocument();
  });

  it("renders negative trend", () => {
    render(<StatsCard title="Error Rate" value="2%" trend={{ value: 5, positive: false }} />);
    expect(screen.getByText("5%")).toBeInTheDocument();
  });

  it("shows loading skeleton when loading", () => {
    const { container } = render(<StatsCard title="Loading" value="0" loading />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders with accent variant", () => {
    const { container } = render(<StatsCard title="Accent" value="100" variant="accent" />);
    const card = container.querySelector(".card-accent-glow");
    expect(card).toBeInTheDocument();
  });

  it("renders with success variant", () => {
    const { container } = render(<StatsCard title="Success" value="100" variant="success" />);
    const card = container.querySelector(".border-emerald-500\\/20");
    expect(card).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(<StatsCard title="With Icon" value="5" icon={<span data-testid="icon">*</span>} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});
