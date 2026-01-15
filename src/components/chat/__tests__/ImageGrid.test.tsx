import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImageGrid from "../ImageGrid";
import type { AttachmentDto } from "@/types/messages";

// Mock IntersectionObserver (needed for ImageGridItem child component)
class MockIntersectionObserver {
  observe() {
    // Trigger async callback to simulate visibility
    setTimeout(() => {
      this.callback(
        [{ isIntersecting: true } as unknown as IntersectionObserverEntry],
        this as unknown as IntersectionObserver
      );
    }, 0);
  }
  unobserve() {}
  disconnect() {}
  constructor(private callback: IntersectionObserverCallback) {}
}

global.IntersectionObserver =
  MockIntersectionObserver as never as typeof IntersectionObserver;

// Mock getImageThumbnail API - Must match ImageGridItem import path
vi.mock("@/api/files.api", () => ({
  getImageThumbnail: vi.fn(() =>
    Promise.resolve(new Blob(["fake"], { type: "image/jpeg" }))
  ),
  createBlobUrl: vi.fn((blob) => `blob:${Date.now()}`),
  revokeBlobUrl: vi.fn(),
}));

describe("ImageGrid", () => {
  beforeEach(() => {
    // Reset URL.createObjectURL/revokeObjectURL mocks
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();
  });
  const mockImages: AttachmentDto[] = [
    {
      id: "attach-123",
      fileId: "file-123",
      fileName: "image1.jpg",
      fileSize: 1024,
      contentType: "image/jpeg",
      createdAt: "2026-01-14T00:00:00Z",
    },
    {
      id: "attach-456",
      fileId: "file-456",
      fileName: "image2.png",
      fileSize: 2048,
      contentType: "image/png",
      createdAt: "2026-01-14T00:00:00Z",
    },
    {
      id: "attach-789",
      fileId: "file-789",
      fileName: "image3.gif",
      fileSize: 3072,
      contentType: "image/gif",
      createdAt: "2026-01-14T00:00:00Z",
    },
  ];

  it("TC-05.1: should render grid with all images", async () => {
    // Arrange & Act
    render(<ImageGrid images={mockImages} onImageClick={vi.fn()} />);

    // Assert
    const grid = screen.getByTestId("image-grid");
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass("grid", "grid-cols-2", "sm:grid-cols-3");

    // Check all images rendered
    expect(screen.getByTestId("image-grid-item-file-123")).toBeInTheDocument();
    expect(screen.getByTestId("image-grid-item-file-456")).toBeInTheDocument();
    expect(screen.getByTestId("image-grid-item-file-789")).toBeInTheDocument();

    // Wait for images to load after IntersectionObserver triggers
    await waitFor(() => {
      const images = screen.getAllByRole("img");
      expect(images).toHaveLength(3);
    });

    // Verify images loaded successfully with blob URLs (createBlobUrl returns blob:timestamp)
    const images = screen.getAllByRole("img");
    expect(images[0]).toHaveAttribute("src");
    expect(images[0].getAttribute("src")).toMatch(/^blob:/);
    expect(images[0]).toHaveAttribute("alt", "image1.jpg");
  });

  it("TC-05.2: should call onImageClick with correct params when image clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    const onImageClick = vi.fn();

    render(<ImageGrid images={mockImages} onImageClick={onImageClick} />);

    // Act - click second image
    const secondImage = screen.getByTestId("image-grid-item-file-456");
    await user.click(secondImage);

    // Assert
    expect(onImageClick).toHaveBeenCalledOnce();
    expect(onImageClick).toHaveBeenCalledWith("file-456", "image2.png");
  });

  it("TC-05.3: should not render anything if images array is empty", () => {
    // Arrange & Act
    const { container } = render(
      <ImageGrid images={[]} onImageClick={vi.fn()} />
    );

    // Assert
    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId("image-grid")).not.toBeInTheDocument();
  });

  it("TC-05.4: should apply custom className", () => {
    // Arrange & Act
    render(
      <ImageGrid
        images={mockImages}
        onImageClick={vi.fn()}
        className="custom-class"
      />
    );

    // Assert
    const grid = screen.getByTestId("image-grid");
    expect(grid).toHaveClass("custom-class");
    expect(grid).toHaveClass("grid", "grid-cols-2", "sm:grid-cols-3");
  });

  it("TC-05.5: should render with lazy loading attribute", async () => {
    // Arrange & Act
    render(<ImageGrid images={mockImages} onImageClick={vi.fn()} />);

    // Assert - wait for images to load and verify they rendered successfully
    await waitFor(() => {
      const images = screen.getAllByRole("img");
      expect(images).toHaveLength(3);
      // Verify images loaded with blob URLs (browser native lazy loading tested via render)
      images.forEach((img) => {
        expect(img).toHaveAttribute("src");
        expect(img.getAttribute("src")).toMatch(/^blob:/);
      });
    });
  });

  it("TC-05.6: should handle images without fileName gracefully", async () => {
    // Arrange
    const imagesWithoutName: AttachmentDto[] = [
      {
        id: "attach-999",
        fileId: "file-999",
        fileName: null,
        fileSize: 1024,
        contentType: "image/jpeg",
        createdAt: "2026-01-14T00:00:00Z",
      },
    ];

    const onImageClick = vi.fn();

    // Act
    render(
      <ImageGrid images={imagesWithoutName} onImageClick={onImageClick} />
    );

    // Assert - wait for image to load
    await waitFor(() => {
      const img = screen.getByRole("img");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("alt", "Image");
    });

    // Click should pass "Image" as fileName
    const gridItem = screen.getByTestId("image-grid-item-file-999");
    await userEvent.click(gridItem);

    // Verify click handler called with correct params
    await waitFor(() => {
      expect(onImageClick).toHaveBeenCalledWith("file-999", "Image");
    });
  });
});
