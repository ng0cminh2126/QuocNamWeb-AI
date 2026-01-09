import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImagePreviewModal from "../ImagePreviewModal";
import * as filesApi from "@/api/files.api";

// Mock API
vi.mock("@/api/files.api", () => ({
  getImagePreview: vi.fn(),
  createBlobUrl: vi.fn(),
  revokeBlobUrl: vi.fn(),
}));

describe("ImagePreviewModal", () => {
  const mockBlob = new Blob(["fake preview"], { type: "image/jpeg" });
  const mockBlobUrl = "blob:preview-url-456";
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(filesApi.getImagePreview).mockResolvedValue(mockBlob);
    vi.mocked(filesApi.createBlobUrl).mockReturnValue(mockBlobUrl);
  });

  it("should not render when closed", () => {
    render(
      <ImagePreviewModal
        open={false}
        onOpenChange={mockOnOpenChange}
        fileId="file-123"
      />
    );

    expect(screen.queryByTestId("image-preview-modal")).not.toBeInTheDocument();
  });

  it("should show loading skeleton when loading", () => {
    render(
      <ImagePreviewModal
        open={true}
        onOpenChange={mockOnOpenChange}
        fileId="file-123"
      />
    );

    expect(screen.getByTestId("image-preview-skeleton")).toBeInTheDocument();
  });

  it("should load and display preview image", async () => {
    render(
      <ImagePreviewModal
        open={true}
        onOpenChange={mockOnOpenChange}
        fileId="file-123"
        fileName="test.jpg"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("image-preview-image")).toBeInTheDocument();
    });

    const img = screen.getByTestId("image-preview-image") as HTMLImageElement;
    expect(img.src).toBe(mockBlobUrl);
    expect(img.alt).toBe("test.jpg");

    expect(filesApi.getImagePreview).toHaveBeenCalledWith("file-123");
    expect(filesApi.createBlobUrl).toHaveBeenCalledWith(mockBlob);
  });

  it("should show error state when preview fetch fails", async () => {
    vi.mocked(filesApi.getImagePreview).mockRejectedValue(
      new Error("Load error")
    );

    render(
      <ImagePreviewModal
        open={true}
        onOpenChange={mockOnOpenChange}
        fileId="file-123"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("image-preview-error")).toBeInTheDocument();
    });

    expect(screen.getByText("Không thể tải ảnh")).toBeInTheDocument();
  });

  it("should call onOpenChange when close button clicked", async () => {
    render(
      <ImagePreviewModal
        open={true}
        onOpenChange={mockOnOpenChange}
        fileId="file-123"
      />
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("image-preview-close-button")
      ).toBeInTheDocument();
    });

    const closeBtn = screen.getByTestId("image-preview-close-button");
    await userEvent.click(closeBtn);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("should trigger download when download button clicked", async () => {
    // Mock document.createElement and appendChild
    const mockLink = {
      href: "",
      download: "",
      click: vi.fn(),
    };
    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockReturnValue(mockLink as any);
    const appendChildSpy = vi
      .spyOn(document.body, "appendChild")
      .mockImplementation(() => mockLink as any);
    const removeChildSpy = vi
      .spyOn(document.body, "removeChild")
      .mockImplementation(() => mockLink as any);

    render(
      <ImagePreviewModal
        open={true}
        onOpenChange={mockOnOpenChange}
        fileId="file-123"
        fileName="download-test.png"
      />
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("image-preview-download-button")
      ).toBeInTheDocument();
    });

    const downloadBtn = screen.getByTestId("image-preview-download-button");
    await userEvent.click(downloadBtn);

    expect(createElementSpy).toHaveBeenCalledWith("a");
    expect(mockLink.href).toBe(mockBlobUrl);
    expect(mockLink.download).toBe("download-test.png");
    expect(mockLink.click).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it("should use default file name if not provided", async () => {
    render(
      <ImagePreviewModal
        open={true}
        onOpenChange={mockOnOpenChange}
        fileId="file-123"
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Xem ảnh")).toBeInTheDocument();
    });
  });

  it("should revoke blob URL when modal closes", async () => {
    const { rerender } = render(
      <ImagePreviewModal
        open={true}
        onOpenChange={mockOnOpenChange}
        fileId="file-123"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("image-preview-image")).toBeInTheDocument();
    });

    // Close modal
    rerender(
      <ImagePreviewModal
        open={false}
        onOpenChange={mockOnOpenChange}
        fileId="file-123"
      />
    );

    await waitFor(() => {
      expect(filesApi.revokeBlobUrl).toHaveBeenCalledWith(mockBlobUrl);
    });
  });

  it("should not load preview if fileId is null", () => {
    render(
      <ImagePreviewModal
        open={true}
        onOpenChange={mockOnOpenChange}
        fileId={null}
      />
    );

    expect(filesApi.getImagePreview).not.toHaveBeenCalled();
  });
});
