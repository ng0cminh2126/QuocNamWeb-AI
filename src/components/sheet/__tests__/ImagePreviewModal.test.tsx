import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, waitFor, fireEvent } from "@testing-library/react";
import ImagePreviewModal from "../ImagePreviewModal";
import { getImagePreview } from "@/api/files.api";

// Mock API
vi.mock("@/api/files.api", () => ({
  getImagePreview: vi.fn(),
}));

// Mock URL APIs
global.URL.createObjectURL = vi.fn(() => "blob:preview-url-456");
global.URL.revokeObjectURL = vi.fn();

describe("ImagePreviewModal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render modal when fileId is provided", async () => {
    // GIVEN: fileId is not null
    const mockBlob = new Blob(["preview"], { type: "image/png" });
    vi.mocked(getImagePreview).mockResolvedValueOnce(mockBlob);

    const { getByTestId } = render(
      <ImagePreviewModal fileId="123" fileName="test.jpg" onClose={vi.fn()} />
    );

    // THEN: Modal is visible
    expect(getByTestId("image-preview-modal")).toBeInTheDocument();
  });

  it("should not render when fileId is null", () => {
    const { queryByTestId } = render(
      <ImagePreviewModal fileId={null} fileName="test.jpg" onClose={vi.fn()} />
    );

    // THEN: Modal not in DOM
    expect(queryByTestId("image-preview-modal")).not.toBeInTheDocument();
  });

  it("should show spinner while loading preview", () => {
    // GIVEN: API is pending
    vi.mocked(getImagePreview).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { getByTestId } = render(
      <ImagePreviewModal fileId="123" fileName="test.jpg" onClose={vi.fn()} />
    );

    // THEN: Shows loading spinner
    expect(getByTestId("preview-loading-spinner")).toBeInTheDocument();
  });

  it("should display preview image when loaded", async () => {
    // GIVEN: API returns blob
    const mockBlob = new Blob(["preview"], { type: "image/png" });
    vi.mocked(getImagePreview).mockResolvedValueOnce(mockBlob);

    const { getByTestId } = render(
      <ImagePreviewModal fileId="123" fileName="test.jpg" onClose={vi.fn()} />
    );

    // THEN: Preview image rendered
    await waitFor(() => {
      const img = getByTestId("preview-image") as HTMLImageElement;
      expect(img).toBeInTheDocument();
      expect(img.src).toContain("blob:preview-url");
      expect(img.alt).toBe("test.jpg");
    });

    // AND: Blob URL created
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
  });

  it("should show error and retry button when API fails", async () => {
    // GIVEN: API fails
    vi.mocked(getImagePreview).mockRejectedValueOnce(
      new Error("Network error")
    );

    const { getByTestId } = render(
      <ImagePreviewModal fileId="123" fileName="test.jpg" onClose={vi.fn()} />
    );

    // THEN: Error state shown
    await waitFor(() => {
      expect(getByTestId("preview-error-state")).toBeInTheDocument();
      expect(getByTestId("preview-retry-button")).toBeInTheDocument();
    });
  });

  it("should retry loading when retry button is clicked", async () => {
    // GIVEN: First call fails
    vi.mocked(getImagePreview)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(new Blob(["preview"], { type: "image/png" }));

    const { getByTestId } = render(
      <ImagePreviewModal fileId="123" fileName="test.jpg" onClose={vi.fn()} />
    );

    // THEN: Error shown
    await waitFor(() => {
      expect(getByTestId("preview-retry-button")).toBeInTheDocument();
    });

    // WHEN: Click retry
    fireEvent.click(getByTestId("preview-retry-button"));

    // THEN: API called again
    await waitFor(() => {
      expect(getImagePreview).toHaveBeenCalledTimes(2);
    });

    // AND: Image loads successfully
    await waitFor(() => {
      expect(getByTestId("preview-image")).toBeInTheDocument();
    });
  });

  it("should close on close button click", async () => {
    const mockBlob = new Blob(["preview"], { type: "image/png" });
    vi.mocked(getImagePreview).mockResolvedValueOnce(mockBlob);

    const onClose = vi.fn();
    const { getByTestId } = render(
      <ImagePreviewModal fileId="123" fileName="test.jpg" onClose={onClose} />
    );

    // WHEN: Click close button
    fireEvent.click(getByTestId("modal-close-button"));

    // THEN: onClose called
    expect(onClose).toHaveBeenCalled();
  });

  it("should close on backdrop click", async () => {
    const mockBlob = new Blob(["preview"], { type: "image/png" });
    vi.mocked(getImagePreview).mockResolvedValueOnce(mockBlob);

    const onClose = vi.fn();
    const { getByTestId } = render(
      <ImagePreviewModal fileId="123" fileName="test.jpg" onClose={onClose} />
    );

    // WHEN: Click backdrop
    fireEvent.click(getByTestId("modal-overlay"));

    // THEN: onClose called
    expect(onClose).toHaveBeenCalled();
  });

  it("should revoke blob URL on unmount", async () => {
    // GIVEN: Preview loaded with blob URL
    const mockBlob = new Blob(["preview"], { type: "image/png" });
    vi.mocked(getImagePreview).mockResolvedValueOnce(mockBlob);

    const { unmount, getByTestId } = render(
      <ImagePreviewModal fileId="123" fileName="test.jpg" onClose={vi.fn()} />
    );

    // Wait for image to load
    await waitFor(() => {
      expect(getByTestId("preview-image")).toBeInTheDocument();
    });

    // Track the blob URL that was created
    const createdBlobUrl = vi.mocked(URL.createObjectURL).mock.results[0]
      ?.value;

    // WHEN: Unmount component
    unmount();

    // THEN: Blob URL revoked with the created URL
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(createdBlobUrl);
  });

  it("should load new preview when fileId changes", async () => {
    const mockBlob1 = new Blob(["preview1"], { type: "image/png" });
    const mockBlob2 = new Blob(["preview2"], { type: "image/png" });

    vi.mocked(getImagePreview)
      .mockResolvedValueOnce(mockBlob1)
      .mockResolvedValueOnce(mockBlob2);

    const { rerender } = render(
      <ImagePreviewModal fileId="123" fileName="test1.jpg" onClose={vi.fn()} />
    );

    // Wait for first preview
    await waitFor(() => {
      expect(getImagePreview).toHaveBeenCalledWith("123");
    });

    // WHEN: Change fileId
    rerender(
      <ImagePreviewModal fileId="456" fileName="test2.jpg" onClose={vi.fn()} />
    );

    // THEN: New preview loaded
    await waitFor(() => {
      expect(getImagePreview).toHaveBeenCalledWith("456");
    });

    expect(getImagePreview).toHaveBeenCalledTimes(2);
  });
});
