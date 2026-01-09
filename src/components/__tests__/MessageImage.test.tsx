import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MessageImage from "../MessageImage";
import * as filesApi from "@/api/files.api";

// Mock API
vi.mock("@/api/files.api", () => ({
  getImageThumbnail: vi.fn(),
  createBlobUrl: vi.fn(),
  revokeBlobUrl: vi.fn(),
}));

describe("MessageImage", () => {
  const mockBlob = new Blob(["fake image"], { type: "image/jpeg" });
  const mockBlobUrl = "blob:mock-url-123";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(filesApi.getImageThumbnail).mockResolvedValue(mockBlob);
    vi.mocked(filesApi.createBlobUrl).mockReturnValue(mockBlobUrl);
  });

  it("should show loading skeleton initially", () => {
    render(<MessageImage fileId="file-123" />);

    expect(screen.getByTestId("message-image-skeleton")).toBeInTheDocument();
  });

  it("should load and display image successfully", async () => {
    render(<MessageImage fileId="file-123" alt="Test image" />);

    // Wait for image to load
    await waitFor(() => {
      expect(screen.getByTestId("message-image")).toBeInTheDocument();
    });

    const img = screen.getByTestId("message-image") as HTMLImageElement;
    expect(img.src).toBe(mockBlobUrl);
    expect(img.alt).toBe("Test image");

    // Verify API calls
    expect(filesApi.getImageThumbnail).toHaveBeenCalledWith("file-123");
    expect(filesApi.createBlobUrl).toHaveBeenCalledWith(mockBlob);
  });

  it("should use default alt text if not provided", async () => {
    render(<MessageImage fileId="file-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("message-image")).toBeInTheDocument();
    });

    const img = screen.getByTestId("message-image") as HTMLImageElement;
    expect(img.alt).toBe("Image");
  });

  it("should show error state when thumbnail fetch fails", async () => {
    vi.mocked(filesApi.getImageThumbnail).mockRejectedValue(
      new Error("Network error")
    );

    render(<MessageImage fileId="file-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("message-image-error")).toBeInTheDocument();
    });

    expect(screen.getByText("Không thể tải ảnh")).toBeInTheDocument();
  });

  it("should call onClick handler when image is clicked", async () => {
    const handleClick = vi.fn();
    render(<MessageImage fileId="file-123" onClick={handleClick} />);

    await waitFor(() => {
      expect(screen.getByTestId("message-image")).toBeInTheDocument();
    });

    const img = screen.getByTestId("message-image");
    await userEvent.click(img);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should revoke blob URL on unmount", async () => {
    const { unmount } = render(<MessageImage fileId="file-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("message-image")).toBeInTheDocument();
    });

    unmount();

    expect(filesApi.revokeBlobUrl).toHaveBeenCalledWith(mockBlobUrl);
  });

  it("should apply custom className", async () => {
    render(<MessageImage fileId="file-123" className="custom-class" />);

    await waitFor(() => {
      expect(screen.getByTestId("message-image")).toBeInTheDocument();
    });

    const img = screen.getByTestId("message-image");
    expect(img).toHaveClass("custom-class");
  });

  it("should reload thumbnail when fileId changes", async () => {
    const { rerender } = render(<MessageImage fileId="file-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("message-image")).toBeInTheDocument();
    });

    // Verify first load
    expect(filesApi.getImageThumbnail).toHaveBeenCalledWith("file-123");

    // Change fileId
    rerender(<MessageImage fileId="file-456" />);

    await waitFor(() => {
      expect(filesApi.getImageThumbnail).toHaveBeenCalledWith("file-456");
    });

    expect(filesApi.getImageThumbnail).toHaveBeenCalledTimes(2);
  });
});
