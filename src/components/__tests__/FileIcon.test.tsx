import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FileIcon from "../FileIcon";

describe("FileIcon", () => {
  it("should render PDF icon with red color", () => {
    const { container } = render(<FileIcon contentType="application/pdf" />);
    const icon = container.querySelector("svg");

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("text-red-500");
    expect(icon).toHaveAttribute("aria-label", "PDF file");
  });

  it("should render Word icon with blue color", () => {
    const { container } = render(<FileIcon contentType="application/msword" />);
    const icon = container.querySelector("svg");

    expect(icon).toHaveClass("text-blue-500");
    expect(icon).toHaveAttribute("aria-label", "Word file");
  });

  it("should render Excel icon with green color", () => {
    const { container } = render(
      <FileIcon contentType="application/vnd.ms-excel" />
    );
    const icon = container.querySelector("svg");

    expect(icon).toHaveClass("text-green-500");
    expect(icon).toHaveAttribute("aria-label", "Excel file");
  });

  it("should render PowerPoint icon with orange color", () => {
    const { container } = render(
      <FileIcon contentType="application/vnd.ms-powerpoint" />
    );
    const icon = container.querySelector("svg");

    expect(icon).toHaveClass("text-orange-500");
    expect(icon).toHaveAttribute("aria-label", "PowerPoint file");
  });

  it("should render generic icon with gray color for unknown types", () => {
    const { container } = render(<FileIcon contentType="text/plain" />);
    const icon = container.querySelector("svg");

    expect(icon).toHaveClass("text-gray-500");
    expect(icon).toHaveAttribute("aria-label", "File file");
  });

  it("should apply small size by default", () => {
    const { container } = render(<FileIcon contentType="application/pdf" />);
    const icon = container.querySelector("svg");

    expect(icon).toHaveClass("w-4", "h-4");
  });

  it("should apply medium size when specified", () => {
    const { container } = render(
      <FileIcon contentType="application/pdf" size="md" />
    );
    const icon = container.querySelector("svg");

    expect(icon).toHaveClass("w-5", "h-5");
  });

  it("should apply large size when specified", () => {
    const { container } = render(
      <FileIcon contentType="application/pdf" size="lg" />
    );
    const icon = container.querySelector("svg");

    expect(icon).toHaveClass("w-6", "h-6");
  });

  it("should merge custom className", () => {
    const { container } = render(
      <FileIcon contentType="application/pdf" className="custom-class" />
    );
    const icon = container.querySelector("svg");

    expect(icon).toHaveClass("text-red-500", "w-4", "h-4", "custom-class");
  });
});
