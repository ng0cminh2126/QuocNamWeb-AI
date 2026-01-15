import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImageGridItem from "../ImageGridItem";
import { getImageThumbnail } from "@/api/files.api";

// Mock API
vi.mock("@/api/files.api", () => ({
  getImageThumbnail: vi.fn(),
  createBlobUrl: vi.fn((blob) => `blob:${Date.now()}`),
  revokeBlobUrl: vi.fn(),
}));

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(private callback: IntersectionObserverCallback) {}
  observe() {
    // Trigger callback asynchronously to simulate real behavior
    setTimeout(() => {
      this.callback(
        [
          {
            isIntersecting: true,
            intersectionRatio: 1,
          } as IntersectionObserverEntry,
        ],
        this as unknown as IntersectionObserver
      );
    }, 0);
  }
  disconnect() {}
  unobserve() {}
}

global.IntersectionObserver = MockIntersectionObserver as any;

describe("ImageGridItem", () => {
  const mockBlob = new Blob(["image data"], { type: "image/jpeg" });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TC-06.1: should render placeholder initially", () => {
    // Arrange
    vi.mocked(getImageThumbnail).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    // Act
    render(
      <ImageGridItem fileId="file-123" fileName="test.jpg" onClick={vi.fn()} />
    );

    // Assert
    expect(screen.getByTestId("image-grid-item-file-123")).toBeInTheDocument();
    expect(
      screen.getByTestId("image-grid-item-placeholder")
    ).toBeInTheDocument();
  });

  it("TC-06.2: should load and display image successfully", async () => {
    // Arrange
    vi.mocked(getImageThumbnail).mockResolvedValue(mockBlob);

    // Act
    render(
      <ImageGridItem fileId="file-456" fileName="photo.png" onClick={vi.fn()} />
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("image-grid-item-image")).toBeInTheDocument();
    });

    const img = screen.getByTestId("image-grid-item-image");
    expect(img).toHaveAttribute("alt", "photo.png");
    expect(img).toHaveAttribute("src", expect.stringContaining("blob:"));

    expect(getImageThumbnail).toHaveBeenCalledWith("file-456", "medium");
  });

  it("TC-06.3: should display error state if image load fails", async () => {
    // Arrange
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    vi.mocked(getImageThumbnail).mockRejectedValue(new Error("Network error"));

    // Act
    render(
      <ImageGridItem fileId="file-789" fileName="error.jpg" onClick={vi.fn()} />
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("image-grid-item-error")).toBeInTheDocument();
    });

    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it("TC-06.4: should call onClick when clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    const onClick = vi.fn();
    vi.mocked(getImageThumbnail).mockResolvedValue(mockBlob);

    // Act
    render(
      <ImageGridItem
        fileId="file-999"
        fileName="clickable.jpg"
        onClick={onClick}
      />
    );

    // Wait for image to load
    await waitFor(() => {
      expect(screen.getByTestId("image-grid-item-image")).toBeInTheDocument();
    });

    const container = screen.getByTestId("image-grid-item-file-999");
    await user.click(container);

    // Assert
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("TC-06.5: should cleanup blob URL on unmount", async () => {
    // Arrange
    vi.mocked(getImageThumbnail).mockResolvedValue(mockBlob);
    const { revokeBlobUrl } = await import("@/api/files.api");

    // Act
    const { unmount } = render(
      <ImageGridItem
        fileId="file-cleanup"
        fileName="cleanup.jpg"
        onClick={vi.fn()}
      />
    );

    // Wait for image to load
    await waitFor(() => {
      expect(screen.getByTestId("image-grid-item-image")).toBeInTheDocument();
    });

    // Unmount
    unmount();

    // Assert
    await waitFor(() => {
      expect(revokeBlobUrl).toHaveBeenCalled();
    });
  });

  it("TC-06.6: should have correct styling and hover effect", async () => {
    // Arrange
    vi.mocked(getImageThumbnail).mockResolvedValue(mockBlob);

    // Act
    render(
      <ImageGridItem
        fileId="file-style"
        fileName="style.jpg"
        onClick={vi.fn()}
      />
    );

    // Wait for image to load
    await waitFor(() => {
      expect(screen.getByTestId("image-grid-item-image")).toBeInTheDocument();
    });

    const container = screen.getByTestId("image-grid-item-file-style");

    // Assert
    expect(container).toHaveClass("aspect-square");
    expect(container).toHaveClass("rounded-lg");
    expect(container).toHaveClass("cursor-pointer");
    expect(container).toHaveClass("group");

    const img = screen.getByTestId("image-grid-item-image");
    expect(img).toHaveClass("group-hover:scale-102");
  });
});
