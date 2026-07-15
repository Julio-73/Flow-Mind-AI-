import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/states";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState title="No items" description="No items found" />);
    expect(screen.getByText("No items")).toBeInTheDocument();
    expect(screen.getByText("No items found")).toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    const handleAction = vi.fn();
    render(<EmptyState title="Empty" action={{ label: "Create", onClick: handleAction }} />);
    const btn = screen.getByRole("button", { name: /create/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleAction).toHaveBeenCalledOnce();
  });

  it("renders without description", () => {
    render(<EmptyState title="Just title" />);
    expect(screen.getByText("Just title")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders custom icon", () => {
    render(<EmptyState title="Custom" icon={<span data-testid="custom-icon">*</span>} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });
});

describe("ErrorState", () => {
  it("renders default title and message", () => {
    render(<ErrorState message="Something broke" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Something broke")).toBeInTheDocument();
  });

  it("renders custom title", () => {
    render(<ErrorState title="Oops!" message="Error details" />);
    expect(screen.getByText("Oops!")).toBeInTheDocument();
  });

  it("renders retry button when onRetry is provided", () => {
    const handleRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={handleRetry} />);
    const retryBtn = screen.getByRole("button", { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledOnce();
  });

  it("does not show retry button without onRetry", () => {
    render(<ErrorState message="Error" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("LoadingState", () => {
  it("renders default loading text", () => {
    render(<LoadingState />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders custom loading text", () => {
    render(<LoadingState text="Fetching data..." />);
    expect(screen.getByText("Fetching data...")).toBeInTheDocument();
  });

  it("renders spinner element", () => {
    const { container } = render(<LoadingState />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });
});
