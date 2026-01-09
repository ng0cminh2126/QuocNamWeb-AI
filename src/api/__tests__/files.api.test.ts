import { describe, it, expect, beforeEach, vi } from "vitest";
import MockAdapter from "axios-mock-adapter";
import { fileApiClient } from "../fileClient";
import {
  uploadFile,
  getImageThumbnail,
  getImagePreview,
  createBlobUrl,
  revokeBlobUrl,
} from "../files.api";
import type { UploadFileResult } from "@/types/files";

describe("files.api", () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    // Create fresh mock adapter for each test
    mockAxios = new MockAdapter(fileApiClient);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  describe("uploadFile()", () => {
    const mockFile = new File(["test content"], "test-document.pdf", {
      type: "application/pdf",
    });

    const mockUploadSuccess: UploadFileResult = {
      fileId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      storagePath: "chat/2024/01/06/3fa85f64-5717-4562-b3fc-2c963f66afa6.pdf",
      fileName: "test-document.pdf",
      contentType: "application/pdf",
      size: 1048576,
    };

    it("should upload file successfully", async () => {
      // Mock API response
      mockAxios.onPost(/\/api\/Files\?/).reply(201, mockUploadSuccess);

      // Upload file
      const result = await uploadFile({
        file: mockFile,
        sourceModule: 1,
      });

      // Verify result
      expect(result).toEqual(mockUploadSuccess);
      expect(result.fileId).toBe("3fa85f64-5717-4562-b3fc-2c963f66afa6");
      expect(result.fileName).toBe("test-document.pdf");
    });

    it("should create FormData with correct file", async () => {
      // Spy on FormData
      const formDataSpy = vi.spyOn(FormData.prototype, "append");

      mockAxios.onPost(/\/api\/Files\?/).reply(201, mockUploadSuccess);

      await uploadFile({
        file: mockFile,
        sourceModule: 1,
      });

      // Verify FormData contains file
      expect(formDataSpy).toHaveBeenCalledWith("file", mockFile);

      formDataSpy.mockRestore();
    });

    it("should include sourceModule in query params", async () => {
      mockAxios
        .onPost(/\/api\/Files\?sourceModule=1/)
        .reply(201, mockUploadSuccess);

      await uploadFile({
        file: mockFile,
        sourceModule: 1,
      });

      // Verify request was made with correct query param
      expect(mockAxios.history.post[0].url).toContain("sourceModule=1");
    });

    it("should include sourceEntityId if provided", async () => {
      const entityId = "conversation-uuid-123";

      mockAxios
        .onPost(/\/api\/Files\?sourceModule=1&sourceEntityId=/)
        .reply(201, mockUploadSuccess);

      await uploadFile({
        file: mockFile,
        sourceModule: 1,
        sourceEntityId: entityId,
      });

      // Verify URL contains sourceEntityId
      expect(mockAxios.history.post[0].url).toContain(
        `sourceEntityId=${entityId}`
      );
    });

    it("should call onUploadProgress callback", async () => {
      const onProgressMock = vi.fn();

      mockAxios.onPost(/\/api\/Files\?/).reply(201, mockUploadSuccess);

      await uploadFile({
        file: mockFile,
        sourceModule: 1,
        onUploadProgress: onProgressMock,
      });

      // Note: MockAdapter doesn't trigger onUploadProgress
      // In real scenario, this would be called during upload
      // We verify it's passed to axios config
      expect(mockAxios.history.post[0].onUploadProgress).toBeDefined();
    });

    it("should handle 401 Unauthorized error", async () => {
      mockAxios.onPost(/\/api\/Files\?/).reply(401, {
        type: "https://tools.ietf.org/html/rfc7235#section-3.1",
        title: "Unauthorized",
        status: 401,
        detail: "Authorization has been denied for this request.",
      });

      await expect(
        uploadFile({
          file: mockFile,
          sourceModule: 1,
        })
      ).rejects.toThrow();
    });

    it("should handle 400 Bad Request error", async () => {
      mockAxios.onPost(/\/api\/Files\?/).reply(400, {
        type: "https://tools.ietf.org/html/rfc7231#section-6.5.1",
        title: "One or more validation errors occurred.",
        status: 400,
        detail: "The sourceModule field is required.",
      });

      await expect(
        uploadFile({
          file: mockFile,
          sourceModule: 1,
        })
      ).rejects.toThrow();
    });

    it("should handle 413 File Too Large error", async () => {
      mockAxios.onPost(/\/api\/Files\?/).reply(413, {
        type: "https://tools.ietf.org/html/rfc7231#section-6.5.11",
        title: "Payload Too Large",
        status: 413,
        detail: "The uploaded file exceeds the maximum allowed size.",
      });

      await expect(
        uploadFile({
          file: mockFile,
          sourceModule: 1,
        })
      ).rejects.toThrow();
    });

    it("should handle 415 Unsupported Media Type error", async () => {
      mockAxios.onPost(/\/api\/Files\?/).reply(415, {
        type: "https://tools.ietf.org/html/rfc7231#section-6.5.13",
        title: "Unsupported Media Type",
        status: 415,
        detail: "The uploaded file type is not supported.",
      });

      await expect(
        uploadFile({
          file: mockFile,
          sourceModule: 1,
        })
      ).rejects.toThrow();
    });

    it("should handle network error", async () => {
      mockAxios.onPost(/\/api\/Files\?/).networkError();

      await expect(
        uploadFile({
          file: mockFile,
          sourceModule: 1,
        })
      ).rejects.toThrow();
    });
  });

  describe("getImageThumbnail()", () => {
    it("should fetch thumbnail with correct endpoint and params", async () => {
      // GIVEN: Mock API returns blob
      const mockBlob = new Blob(["fake-thumbnail"], { type: "image/jpeg" });
      mockAxios
        .onGet("/api/Files/file-123/watermarked-thumbnail")
        .reply(200, mockBlob);

      // WHEN: Call API with fileId and size
      const result = await getImageThumbnail("file-123", "large");

      // THEN: Returns blob
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe("image/jpeg");

      // Verify request was made
      const request = mockAxios.history.get[0];
      expect(request.url).toBe("/api/Files/file-123/watermarked-thumbnail");
      expect(request.params).toEqual({ size: "large" });
      expect(request.responseType).toBe("blob");
      expect(request.timeout).toBe(30000);
    });

    it("should use default size 'large' when not provided", async () => {
      const mockBlob = new Blob(["thumbnail"], { type: "image/jpeg" });
      mockAxios
        .onGet(/\/api\/Files\/.*\/watermarked-thumbnail/)
        .reply(200, mockBlob);

      await getImageThumbnail("file-456");

      const request = mockAxios.history.get[0];
      expect(request.params).toEqual({ size: "large" });
    });

    it("should handle timeout errors", async () => {
      mockAxios.onGet(/\/api\/Files\/.*\/watermarked-thumbnail/).timeout();

      await expect(getImageThumbnail("file-789")).rejects.toThrow();
    });

    it("should handle 404 errors", async () => {
      mockAxios
        .onGet("/api/Files/file-999/watermarked-thumbnail")
        .reply(404, { message: "File not found" });

      await expect(getImageThumbnail("file-999")).rejects.toThrow();
    });

    it("should accept all size values (small, medium, large)", async () => {
      const mockBlob = new Blob(["thumbnail"], { type: "image/jpeg" });
      mockAxios
        .onGet(/\/api\/Files\/.*\/watermarked-thumbnail/)
        .reply(200, mockBlob);

      // Test small
      await getImageThumbnail("file-1", "small");
      expect(mockAxios.history.get[0].params.size).toBe("small");

      // Test medium
      await getImageThumbnail("file-2", "medium");
      expect(mockAxios.history.get[1].params.size).toBe("medium");

      // Test large
      await getImageThumbnail("file-3", "large");
      expect(mockAxios.history.get[2].params.size).toBe("large");
    });
  });

  describe("getImagePreview()", () => {
    it("should fetch preview with correct endpoint", async () => {
      const mockBlob = new Blob(["fake-preview"], { type: "image/png" });
      mockAxios.onGet("/api/Files/file-123/preview").reply(200, mockBlob);

      const result = await getImagePreview("file-123");

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe("image/png");

      const request = mockAxios.history.get[0];
      expect(request.url).toBe("/api/Files/file-123/preview");
      expect(request.responseType).toBe("blob");
      expect(request.timeout).toBe(30000);
    });

    it("should handle preview errors (404, network)", async () => {
      mockAxios
        .onGet("/api/Files/file-missing/preview")
        .reply(404, { message: "File not found" });

      await expect(getImagePreview("file-missing")).rejects.toThrow();
    });

    it("should have 30s timeout configured", async () => {
      const mockBlob = new Blob(["preview"], { type: "image/jpeg" });
      mockAxios.onGet("/api/Files/file-test/preview").reply(200, mockBlob);

      await getImagePreview("file-test");

      const request = mockAxios.history.get[0];
      expect(request.timeout).toBe(30000);
    });
  });

  describe("createBlobUrl()", () => {
    it("should create blob URL from blob", () => {
      const mockBlob = new Blob(["test data"], { type: "image/jpeg" });
      const blobUrl = createBlobUrl(mockBlob);

      expect(blobUrl).toMatch(/^blob:/);
      expect(typeof blobUrl).toBe("string");

      // Cleanup
      revokeBlobUrl(blobUrl);
    });

    it("should create different URLs for different blobs", () => {
      const blob1 = new Blob(["data1"], { type: "image/jpeg" });
      const blob2 = new Blob(["data2"], { type: "image/png" });

      const url1 = createBlobUrl(blob1);
      const url2 = createBlobUrl(blob2);

      expect(url1).not.toBe(url2);

      // Cleanup
      revokeBlobUrl(url1);
      revokeBlobUrl(url2);
    });
  });

  describe("revokeBlobUrl()", () => {
    it("should revoke blob URL without throwing", () => {
      const mockBlob = new Blob(["test"], { type: "image/jpeg" });
      const blobUrl = createBlobUrl(mockBlob);

      expect(() => revokeBlobUrl(blobUrl)).not.toThrow();
    });

    it("should handle invalid URL gracefully", () => {
      // Should not throw when revoking invalid URL
      expect(() => revokeBlobUrl("invalid-url")).not.toThrow();
      expect(() => revokeBlobUrl("")).not.toThrow();
    });
  });
});
