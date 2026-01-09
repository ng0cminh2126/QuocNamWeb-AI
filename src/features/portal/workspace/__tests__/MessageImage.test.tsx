import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, waitFor, fireEvent } from "@testing-library/react";
import MessageImage from "../MessageImage";
import { getImageThumbnail } from "@/api/files.api";

// Mock API
vi.mock("@/api/files.api", () => ({
  getImageThumbnail: vi.fn(),
}));

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => "blob:mock-url-123");
global.URL.revokeObjectURL = vi.fn();

// Mock Intersection Observer
class MockIntersectionObserver {
  constructor(private callback: IntersectionObserverCallback) {}
  observe() {
    // Auto-trigger visibility for tests
    this.callback(
      [{ isIntersecting: true }] as IntersectionObserverEntry[],
      this as any
    );
  }
  disconnect() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds = [];
}

global.IntersectionObserver = MockIntersectionObserver as any;

describe("MessageImage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should only load image when visible (lazy load)", async () => {
    // GIVEN: Mock API
    const mockBlob = new Blob(["image"], { type: "image/jpeg" });
    vi.mocked(getImageThumbnail).mockResolvedValueOnce(mockBlob);

    const onPreviewClick = vi.fn();

    // WHEN: Render component
    const { getByTestId } = render(
      <MessageImage
        fileId="123"
        fileName="test.jpg"
        onPreviewClick={onPreviewClick}
      />
    );

    // THEN: Image loads (Intersection Observer auto-triggers in test)
    await waitFor(() => {
      expect(getImageThumbnail).toHaveBeenCalledWith("123", "large");
    });

    // AND: Image rendered
    await waitFor(() => {
      const img = getByTestId("message-image") as HTMLImageElement;
      expect(img.src).toContain("blob:mock-url");
    });
  });

  it("should show skeleton loader while loading", async () => {
    // GIVEN: API is pending (never resolves)
    vi.mocked(getImageThumbnail).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    // WHEN: Render
    const { getByTestId } = render(
      <MessageImage fileId="123" fileName="test.jpg" onPreviewClick={vi.fn()} />
    );

    // THEN: Shows loading skeleton
    await waitFor(() => {
      expect(getByTestId("image-skeleton-loader")).toBeInTheDocument();
    });
  });

  it("should display image when loaded successfully", async () => {
    // GIVEN: API returns blob
    const mockBlob = new Blob(["image"], { type: "image/jpeg" });
    vi.mocked(getImageThumbnail).mockResolvedValueOnce(mockBlob);

    // WHEN: Render
    const { getByTestId } = render(
      <MessageImage fileId="123" fileName="test.jpg" onPreviewClick={vi.fn()} />
    );

    // THEN: Image rendered with blob URL
    await waitFor(() => {
      const img = getByTestId("message-image") as HTMLImageElement;
      expect(img).toBeInTheDocument();
      expect(img.src).toContain("blob:mock-url-123");
      expect(img.alt).toBe("test.jpg");
    });

    // AND: Blob URL created
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
  });

  it("should display error placeholder when API fails", async () => {
    // GIVEN: API fails
    vi.mocked(getImageThumbnail).mockRejectedValueOnce(
      new Error("Network error")
    );

    // WHEN: Render
    const { getByTestId } = render(
      <MessageImage fileId="123" fileName="test.jpg" onPreviewClick={vi.fn()} />
    );

    // THEN: Error placeholder shown
    await waitFor(() => {
      expect(getByTestId("image-error-placeholder")).toBeInTheDocument();
    });
  });

  it("should call onPreviewClick when image is clicked", async () => {
    // GIVEN: Image loaded successfully
    const mockBlob = new Blob(["image"], { type: "image/jpeg" });
    vi.mocked(getImageThumbnail).mockResolvedValueOnce(mockBlob);

    const onPreviewClick = vi.fn();

    // WHEN: Render
    const { getByTestId } = render(
      <MessageImage
        fileId="123"
        fileName="test.jpg"
        onPreviewClick={onPreviewClick}
      />
    );

    // THEN: Image rendered
    await waitFor(() => {
      expect(getByTestId("message-image")).toBeInTheDocument();
    });

    // WHEN: Click image
    fireEvent.click(getByTestId("message-image"));

    // THEN: Callback called with fileId
    expect(onPreviewClick).toHaveBeenCalledWith("123");
  });

  it("should call onPreviewClick when error placeholder is clicked", async () => {
    // GIVEN: Image load failed
    vi.mocked(getImageThumbnail).mockRejectedValueOnce(new Error("404"));

    const onPreviewClick = vi.fn();

    // WHEN: Render
    const { getByTestId } = render(
      <MessageImage
        fileId="456"
        fileName="missing.jpg"
        onPreviewClick={onPreviewClick}
      />
    );

    // THEN: Error placeholder shown
    await waitFor(() => {
      expect(getByTestId("image-error-placeholder")).toBeInTheDocument();
    });

    // WHEN: Click error placeholder
    fireEvent.click(getByTestId("image-error-placeholder"));

    // THEN: Callback called (modal opens anyway)
    expect(onPreviewClick).toHaveBeenCalledWith("456");
  });

  it("should revoke blob URL on unmount (cleanup)", async () => {
    // GIVEN: Image loaded with blob URL
    const mockBlob = new Blob(["image"], { type: "image/jpeg" });
    vi.mocked(getImageThumbnail).mockResolvedValueOnce(mockBlob);

    // WHEN: Render
    const { unmount } = render(
      <MessageImage fileId="123" fileName="test.jpg" onPreviewClick={vi.fn()} />
    );

    await waitFor(() => {
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    // WHEN: Unmount component
    unmount();

    // THEN: Blob URL revoked
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url-123");
  });

  it("should handle browsers without Intersection Observer support", async () => {
    // GIVEN: IntersectionObserver not supported
    const OriginalIntersectionObserver = global.IntersectionObserver;
    delete (global as any).IntersectionObserver;

    const mockBlob = new Blob(["image"], { type: "image/jpeg" });
    vi.mocked(getImageThumbnail).mockResolvedValueOnce(mockBlob);

    // WHEN: Render
    const { getByTestId } = render(
      <MessageImage fileId="123" fileName="test.jpg" onPreviewClick={vi.fn()} />
    );

    // THEN: Image loads immediately (fallback)
    await waitFor(() => {
      expect(getImageThumbnail).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(getByTestId("message-image")).toBeInTheDocument();
    });

    // Restore
    global.IntersectionObserver = OriginalIntersectionObserver;
  });
});
