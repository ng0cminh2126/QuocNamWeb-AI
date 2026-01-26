/**
 * Unit tests for FilePreview component
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import FilePreview from "../FilePreview";
import type { SelectedFile } from "@/types/files";

describe("FilePreview", () => {
  const mockFiles: SelectedFile[] = [
    {
      id: "file-1",
      file: new File([""], "document.pdf", { type: "application/pdf" }),
    },
    {
      id: "file-2",
      file: new File([""], "spreadsheet.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
    },
  ];

  test("renders nothing when no files", () => {
    const { container } = render(<FilePreview files={[]} onRemove={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders file list when files exist", () => {
    render(<FilePreview files={mockFiles} onRemove={vi.fn()} />);

    expect(screen.getByTestId("file-preview-container")).toBeInTheDocument();
    expect(screen.getByTestId("file-preview-item-file-1")).toBeInTheDocument();
    expect(screen.getByTestId("file-preview-item-file-2")).toBeInTheDocument();
  });

  test("displays correct file information", () => {
    render(<FilePreview files={mockFiles} onRemove={vi.fn()} />);

    expect(screen.getByText("document.pdf")).toBeInTheDocument();
    expect(screen.getByText("spreadsheet.xlsx")).toBeInTheDocument();
  });

  test("calls onRemove when remove button clicked", () => {
    const onRemove = vi.fn();
    render(<FilePreview files={mockFiles} onRemove={onRemove} />);

    const removeButton = screen.getByTestId("file-preview-remove-file-1");
    fireEvent.click(removeButton);

    expect(onRemove).toHaveBeenCalledWith("file-1");
  });

  test("shows file icon based on MIME type", () => {
    render(<FilePreview files={mockFiles} onRemove={vi.fn()} />);

    // PDF should have 📄 icon
    const pdfItem = screen.getByTestId("file-preview-item-file-1");
    expect(pdfItem).toHaveTextContent("📄");

    // Excel should have 📊 icon
    const excelItem = screen.getByTestId("file-preview-item-file-2");
    expect(excelItem).toHaveTextContent("📊");
  });

  test("has proper accessibility attributes", () => {
    render(<FilePreview files={mockFiles} onRemove={vi.fn()} />);

    const container = screen.getByTestId("file-preview-container");
    expect(container).toHaveAttribute("role", "list");
    expect(container).toHaveAttribute("aria-label", "Selected files");

    const removeButton = screen.getByTestId("file-preview-remove-file-1");
    expect(removeButton).toHaveAttribute("aria-label", "Remove document.pdf");
  });
});
