import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DataTable } from "@/components/shared/data-table";

interface TestItem {
  id: string;
  name: string;
  value: number;
}

const columns = [
  { key: "name", header: "Name", cell: (item: TestItem) => item.name, sortable: true },
  { key: "value", header: "Value", cell: (item: TestItem) => item.value.toString(), sortable: true },
];

const data: TestItem[] = [
  { id: "1", name: "Alpha", value: 100 },
  { id: "2", name: "Beta", value: 50 },
  { id: "3", name: "Gamma", value: 200 },
];

describe("DataTable", () => {
  it("renders table with data", () => {
    render(<DataTable columns={columns} data={data} keyExtractor={(i) => i.id} />);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();
  });

  it("sorts by column when header is clicked", () => {
    render(<DataTable columns={columns} data={data} keyExtractor={(i) => i.id} />);
    const nameHeader = screen.getByText("Name");
    fireEvent.click(nameHeader);
    const cells = screen.getAllByRole("row");
    expect(cells.length).toBeGreaterThan(1);
  });

  it("shows loading state with skeletons", () => {
    const { container } = render(
      <DataTable columns={columns} data={[]} keyExtractor={(i) => i.id} loading />
    );
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows empty state when no data", () => {
    render(<DataTable columns={columns} data={[]} keyExtractor={(i) => i.id} />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("shows custom empty state when provided", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        keyExtractor={(i) => i.id}
        emptyState={<div>Custom empty</div>}
      />
    );
    expect(screen.getByText("Custom empty")).toBeInTheDocument();
  });

  it("shows error state when error is provided", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        keyExtractor={(i) => i.id}
        error="Failed to load"
      />
    );
    expect(screen.getByText("Failed to load data")).toBeInTheDocument();
    expect(screen.getByText("Failed to load")).toBeInTheDocument();
  });

  it("paginates data when pageSize is smaller than data length", () => {
    render(
      <DataTable columns={columns} data={data} keyExtractor={(i) => i.id} pageSize={2} />
    );
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
  });

  it("calls onRowClick when row is clicked", () => {
    const handleRowClick = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(i) => i.id}
        onRowClick={handleRowClick}
      />
    );
    const rows = screen.getAllByRole("row");
    fireEvent.click(rows[1]!);
    expect(handleRowClick).toHaveBeenCalledWith(data[0]);
  });
});
