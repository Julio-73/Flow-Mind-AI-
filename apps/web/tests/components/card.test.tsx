import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

describe("Card", () => {
  it("renders with default variant", () => {
    render(<Card>Content</Card>);
    const card = screen.getByText("Content");
    expect(card.className).toContain("rounded-lg");
  });

  it("renders with interactive variant", () => {
    render(<Card variant="interactive">Interactive</Card>);
    const card = screen.getByText("Interactive");
    expect(card.className).toContain("hover:shadow-md");
    expect(card.className).toContain("cursor-pointer");
  });

  it("renders with accent variant", () => {
    render(<Card variant="accent">Accent</Card>);
    const card = screen.getByText("Accent");
    expect(card.className).toContain("border-biolume");
    expect(card.className).toContain("bg-gradient-to-br");
  });

  it("renders with glow variant", () => {
    render(<Card variant="glow">Glow</Card>);
    const card = screen.getByText("Glow");
    expect(card.className).toContain("shadow-lg");
    expect(card.className).toContain("shadow-biolume");
  });

  it("renders CardHeader, CardTitle, CardDescription, CardContent, CardFooter", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Body content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("CardTitle uses h3 tag", () => {
    render(<CardTitle>Heading</CardTitle>);
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveTextContent("Heading");
  });

  it("applies custom className", () => {
    render(<Card className="custom-class">Custom</Card>);
    const card = screen.getByText("Custom");
    expect(card.className).toContain("custom-class");
  });
});
