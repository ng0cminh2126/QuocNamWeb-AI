// ChatMainContainer - Container that fetches messages and integrates with ChatMain

import React, { useEffect, useRef, useCallback, useState } from "react";
import { useMessages, flattenMessages } from "@/hooks/queries/useMessages";
import { useSendMessage } from "@/hooks/mutations/useSendMessage";
import { useMessageRealtime } from "@/hooks/useMessageRealtime";
import { useSendTypingIndicator } from "@/hooks/useSendTypingIndicator";
import { useAuthStore } from "@/stores/authStore";
import { MessageSkeleton } from "../components/MessageSkeleton";
import {
  RefreshCw,
  Send,
  Loader2,
  Paperclip,
  ChevronLeft,
  Image as ImageIcon,
} from "lucide-react";
import { Avatar } from "../components";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import FileIcon from "@/components/FileIcon";
import { cn } from "@/lib/utils";
import FilePreview from "@/components/FilePreview";
import { useFileValidation } from "@/hooks/useFileValidation";
import { revokeFilePreview } from "@/utils/fileHelpers";
import { useUploadFiles } from "@/hooks/mutations/useUploadFiles";
import { formatAttachment } from "@/utils/formatAttachment";
import { getFileUrl } from "@/utils/fileUrl";
import { toast } from "sonner";
import ChatInput from "@/features/portal/components/ChatInput";
import MessageImage from "@/features/portal/workspace/MessageImage";
import FilePreviewModal from "@/components/FilePreviewModal";
import type { ChatMessage } from "@/types/messages";
import type { SelectedFile, FileUploadProgressState } from "@/types/files";
import { FILE_CATEGORIES } from "@/types/files";

/**
 * Format file size from bytes to human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get file extension from filename or MIME type
 */
function getFileExtension(fileName?: string, contentType?: string): string {
  // Try to get from filename first
  if (fileName) {
    const match = fileName.match(/\.(\w+)$/);
    if (match) return `.${match[1].toLowerCase()}`;
  }

  // Fallback to MIME type mapping
  if (contentType) {
    const mimeMap: Record<string, string> = {
      "application/pdf": ".pdf",
      "application/msword": ".doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        ".docx",
      "application/vnd.ms-excel": ".xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        ".xlsx",
      "application/vnd.ms-powerpoint": ".ppt",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        ".pptx",
    };
    return mimeMap[contentType] || "";
  }

  return "";
}

interface ChatMainContainerProps {
  conversationId: string;
  conversationName: string;
  conversationType?: "GRP" | "DM";
  memberCount?: number;
  isMobile?: boolean;
  onBack?: () => void;
}

/**
 * Container component that:
 * 1. Fetches messages from API
 * 2. Shows loading skeleton
 * 3. Shows error state with retry
 * 4. Handles sending messages
 * 5. Handles realtime updates
 * 6. Handles typing indicators
 */
export const ChatMainContainer: React.FC<ChatMainContainerProps> = ({
  conversationId,
  conversationName,
  conversationType = "GRP",
  memberCount,
  isMobile = false,
  onBack,
}) => {
  const user = useAuthStore((state) => state.user);
  const [inputValue, setInputValue] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<
    Map<string, FileUploadProgressState>
  >(new Map());
  const [isUploading, setIsUploading] = useState(false);
  // Phase 3.2: Unified file preview for all types (PDF, Word, Excel, PPT, TXT, Images)
  const [filePreviewId, setFilePreviewId] = useState<string | null>(null);
  const [filePreviewName, setFilePreviewName] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const prevConversationIdRef = useRef<string | undefined>(undefined);

  // Fetch messages
  const messagesQuery = useMessages({
    conversationId,
    enabled: !!conversationId,
  });

  // Send message mutation
  const sendMessageMutation = useSendMessage({
    onSuccess: () => {
      setInputValue("");
    },
  });

  // Realtime updates
  const { typingUsers } = useMessageRealtime({
    conversationId,
    onNewMessage: () => {
      // Scroll to bottom on new message
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
  });

  // Typing indicator
  const { handleTyping, stopTyping } = useSendTypingIndicator({
    conversationId,
    debounceMs: 500,
  });

  // Phase 2: File upload
  const uploadFilesMutation = useUploadFiles();
  // File validation
  const { validateAndAdd } = useFileValidation();

  // Get flattened messages
  const messages = flattenMessages(messagesQuery.data);

  // Auto scroll to bottom on initial load
  useEffect(() => {
    if (!messagesQuery.isLoading && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages.length, messagesQuery.isLoading]);

  // Phase 2: Auto-focus input when conversation changes
  useEffect(() => {
    const isConversationChanged =
      conversationId &&
      prevConversationIdRef.current !== undefined &&
      prevConversationIdRef.current !== conversationId;

    if (isConversationChanged) {
      inputRef.current?.focus();
    }

    prevConversationIdRef.current = conversationId;
  }, [conversationId]);

  // Handle send message with file upload (Phase 2 - Option A: Sequential Messages)
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() && selectedFiles.length === 0) return;

    stopTyping();
    setIsUploading(true);

    // Phase 2: Upload files if any
    if (selectedFiles.length > 0) {
      // Initialize progress
      const progressMap = new Map<string, FileUploadProgressState>();
      selectedFiles.forEach((file) => {
        progressMap.set(file.id, {
          fileId: file.id,
          fileName: file.file.name,
          status: "pending",
          progress: 0,
        });
      });
      setUploadProgress(progressMap);

      try {
        // Upload files sequentially
        const result = await uploadFilesMutation.mutateAsync({
          files: selectedFiles,
          sourceModule: 1, // Chat
          sourceEntityId: conversationId,
          onProgress: (fileId, progress) => {
            setUploadProgress((prev) => {
              const next = new Map(prev);
              const fileProgress = next.get(fileId);
              if (fileProgress) {
                next.set(fileId, {
                  ...fileProgress,
                  status: "uploading",
                  progress,
                });
              }
              return next;
            });
          },
        });

        // Update progress to success
        setUploadProgress((prev) => {
          const next = new Map(prev);
          result.files.forEach(({ originalFile, uploadResult }, index) => {
            const selectedFile = selectedFiles[index];
            if (selectedFile) {
              next.set(selectedFile.id, {
                fileId: selectedFile.id,
                fileName: selectedFile.file.name,
                status: "success",
                progress: 100,
                uploadedFileId: uploadResult.fileId,
              });
            }
          });
          return next;
        });

        // Handle partial success
        if (result.failedCount > 0) {
          toast.warning(
            `Upload thành công ${result.successCount}/${selectedFiles.length} file`
          );

          // Decision #4: Block send if any file failed
          setIsUploading(false);
          return; // Don't send message if any file failed
        }

        // Clear progress after 2s (Decision #10)
        setTimeout(() => setUploadProgress(new Map()), 2000);

        // Option A: Send sequential messages (1 file per message)
        // First message: user text + first file
        // Remaining messages: null content + file

        for (let i = 0; i < result.files.length; i++) {
          const { originalFile, uploadResult } = result.files[i];

          try {
            await sendMessageMutation.mutateAsync({
              conversationId,
              content: i === 0 ? inputValue.trim() : null, // Only first message has text
              attachment: formatAttachment(originalFile, uploadResult),
            });
          } catch (error) {
            console.error(`Failed to send message ${i + 1}:`, error);
            toast.error(
              `Lỗi gửi tin nhắn ${i + 1}/${
                result.files.length
              }. Vui lòng thử lại.`
            );
            setIsUploading(false);
            return;
          }
        }

        // Auto-focus after sending all messages
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Lỗi upload file. Vui lòng thử lại.");
        setIsUploading(false);
        return; // Don't send message if upload failed
      }
    } else {
      // No files: Send single text-only message
      try {
        await sendMessageMutation.mutateAsync({
          conversationId,
          content: inputValue.trim(),
        });

        // Auto-focus after sending
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      } catch (error) {
        console.error("Send message error:", error);
        toast.error("Lỗi gửi tin nhắn. Vui lòng thử lại.");
        setIsUploading(false);
        return;
      }
    }

    // Clear files and input
    selectedFiles.forEach((sf) => revokeFilePreview(sf.preview));
    setSelectedFiles([]);
    setIsUploading(false);
  }, [
    inputValue,
    sendMessageMutation,
    stopTyping,
    selectedFiles,
    conversationId,
    uploadFilesMutation,
  ]);

  // Handle key press (Enter to send)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle input change with typing indicator
  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (value) {
      handleTyping();
    }
  };

  // Handle file selection (Phase 2: Single file only)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Chỉ cho phép chọn 1 file tại 1 thời điểm
    if (files.length > 1) {
      toast.warning("Vui lòng chỉ chọn 1 file mỗi lần");
    }

    // Chỉ lấy file đầu tiên
    const fileArray = [files[0]];
    const validFiles = validateAndAdd(fileArray, selectedFiles.length);
    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);

      // Auto-focus input after file selection
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }

    // Reset input value to allow selecting same file again
    e.target.value = "";
  };

  // Handle remove file
  const handleRemoveFile = (fileId: string) => {
    setSelectedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove) {
        revokeFilePreview(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  // Cleanup file previews on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach((sf) => revokeFilePreview(sf.preview));
    };
  }, [selectedFiles]);

  // Handle load more (older messages)
  const handleLoadMore = () => {
    if (messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage) {
      messagesQuery.fetchNextPage();
    }
  };

  // Format time for message
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get display name from DM format
  const getDisplayName = (name: string) => {
    if (conversationType === "DM") {
      return name.replace(/^DM:\s*/, "").split(" <> ")[0];
    }
    return name;
  };

  const displayName = getDisplayName(conversationName);

  // Container classes
  const mainContainerCls = isMobile
    ? "flex flex-col w-full h-full min-h-0 bg-white"
    : "flex flex-col w-full rounded-2xl border border-gray-300 bg-white shadow-sm h-full min-h-0";

  // Loading state
  if (messagesQuery.isLoading) {
    return (
      <div className={mainContainerCls} data-testid="chat-main-loading">
        {/* Header */}
        <div className="flex items-center gap-3 border-b p-4">
          {isMobile && onBack && (
            <IconButton
              className="rounded-full bg-white"
              onClick={onBack}
              icon={<ChevronLeft className="h-5 w-5 text-brand-600" />}
            />
          )}
          <Avatar name={displayName} />
          <div>
            <div className="text-sm font-semibold text-gray-800">
              {displayName}
            </div>
            <div className="text-xs text-gray-500">
              {memberCount ? `${memberCount} thành viên` : "Đang tải..."}
            </div>
          </div>
        </div>

        {/* Skeleton */}
        <MessageSkeleton count={8} />

        {/* Input placeholder */}
        <div className="border-t p-3">
          <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state
  if (messagesQuery.isError) {
    return (
      <div className={mainContainerCls} data-testid="chat-main-error">
        {/* Header */}
        <div className="flex items-center gap-3 border-b p-4">
          {isMobile && onBack && (
            <IconButton
              className="rounded-full bg-white"
              onClick={onBack}
              icon={<ChevronLeft className="h-5 w-5 text-brand-600" />}
            />
          )}
          <Avatar name={displayName} />
          <div>
            <div className="text-sm font-semibold text-gray-800">
              {displayName}
            </div>
          </div>
        </div>

        {/* Error message */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-sm text-gray-500 mb-3">
              Không thể tải tin nhắn. Vui lòng thử lại.
            </p>
            <button
              onClick={() => messagesQuery.refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-brand-600 hover:bg-brand-50 rounded-lg border border-brand-200"
              data-testid="retry-button"
            >
              <RefreshCw className="h-4 w-4" />
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={mainContainerCls} data-testid="chat-main-container">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4 shrink-0">
        <div className="flex items-center gap-3">
          {isMobile && onBack && (
            <IconButton
              className="rounded-full bg-white"
              onClick={onBack}
              icon={<ChevronLeft className="h-5 w-5 text-brand-600" />}
            />
          )}
          <Avatar name={displayName} />
          <div>
            <div className="text-sm font-semibold text-gray-800">
              {displayName}
            </div>
            <div className="text-xs text-gray-500">
              {conversationType === "GRP" && memberCount
                ? `${memberCount} thành viên`
                : conversationType === "DM"
                ? "Trò chuyện riêng"
                : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Message list */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-gray-50"
        data-testid="message-list"
      >
        {/* Load more button */}
        {messagesQuery.hasNextPage && (
          <div className="text-center">
            <button
              onClick={handleLoadMore}
              disabled={messagesQuery.isFetchingNextPage}
              className="px-4 py-2 text-sm text-brand-600 hover:bg-brand-50 rounded-lg"
              data-testid="load-more-messages"
            >
              {messagesQuery.isFetchingNextPage
                ? "Đang tải..."
                : "Tải tin nhắn cũ hơn"}
            </button>
          </div>
        )}

        {/* Messages */}
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">
              Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            return (
              <MessageBubbleSimple
                key={message.id}
                message={message}
                isOwn={message.senderId === user?.id}
                formatTime={formatTime}
                onFilePreviewClick={(fileId, fileName) => {
                  setFilePreviewId(fileId);
                  setFilePreviewName(fileName);
                }}
              />
            );
          })
        )}

        {/* Typing indicator */}
        {typingUsers && typingUsers.length > 0 && (
          <div
            className="text-xs text-gray-500 italic"
            data-testid="typing-indicator"
          >
            {typingUsers.map((u) => u.userName).join(", ")} đang nhập...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* File Preview */}
      <FilePreview
        files={selectedFiles}
        onRemove={handleRemoveFile}
        uploadProgress={uploadProgress}
        onRetry={undefined} // TODO: Implement retry in Phase 3
      />

      {/* Input area */}
      <div className="border-t p-3 shrink-0" data-testid="message-input">
        <div className="flex items-center gap-2">
          {/* File upload button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={sendMessageMutation.isPending}
            className="shrink-0 hover:bg-gray-100"
            aria-label="Đính kèm file"
            data-testid="file-upload-button"
          >
            <Paperclip className="h-5 w-5 text-gray-600" />
          </Button>

          {/* Image upload button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => imageInputRef.current?.click()}
            disabled={sendMessageMutation.isPending}
            className="shrink-0 hover:bg-gray-100"
            aria-label="Đính kèm hình ảnh"
            data-testid="image-upload-button"
          >
            <ImageIcon className="h-5 w-5 text-gray-600" />
          </Button>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"
            data-testid="file-input"
          />
          <input
            ref={imageInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept={FILE_CATEGORIES.IMAGE.join(",")}
            data-testid="image-input"
          />

          {/* Text input - Multi-line with Shift+Enter support */}
          <ChatInput
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onSend={handleSend}
            autoFocus
            disabled={sendMessageMutation.isPending || isUploading}
            className="flex-1"
          />

          {/* Send button - Decision #9: Disable during upload */}
          <button
            onClick={handleSend}
            disabled={
              (!inputValue.trim() && selectedFiles.length === 0) ||
              sendMessageMutation.isPending ||
              isUploading
            }
            className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            data-testid="send-message-button"
          >
            {sendMessageMutation.isPending || isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* File Preview Modal - Unified for all types (PDF, Word, Excel, PPT, TXT, Images) */}
      {filePreviewId && (
        <FilePreviewModal
          isOpen={true}
          fileId={filePreviewId}
          fileName={filePreviewName}
          onClose={() => {
            setFilePreviewId(null);
            setFilePreviewName("");
          }}
        />
      )}
    </div>
  );
};

// =============================================================
// MessageBubbleSimple - Simple message bubble for API messages
// =============================================================

interface MessageBubbleSimpleProps {
  message: ChatMessage;
  isOwn: boolean;
  formatTime: (dateStr: string) => string;
  onFilePreviewClick?: (fileId: string, fileName: string) => void; // Unified for all file types
}

const MessageBubbleSimple: React.FC<MessageBubbleSimpleProps> = ({
  message,
  isOwn,
  formatTime,
  onFilePreviewClick,
}) => {
  return (
    <div
      className={`flex gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
      data-testid={`message-bubble-${message.id}`}
    >
      {/* Avatar (only for received messages) */}
      {!isOwn && (
        <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-brand-700">
            {message.senderName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
        {/* Sender name (only for received) */}
        {!isOwn && (
          <span
            className="text-xs text-gray-500 mb-1 block"
            data-testid="message-sender"
          >
            {message.senderName}
          </span>
        )}

        {/* Message bubble */}
        <div
          className={`rounded-lg overflow-hidden ${
            isOwn
              ? "bg-brand-600 text-white"
              : "bg-white text-gray-900 shadow-sm border"
          }`}
          data-testid="message-content"
        >
          {/* Helper: Check if message has text, image, or file */}
          {(() => {
            const hasText =
              message.content && message.content.trim().length > 0;
            const hasImage =
              message.attachments &&
              message.attachments.length > 0 &&
              message.attachments[0].contentType?.startsWith("image/");
            const hasFile =
              message.attachments &&
              message.attachments.length > 0 &&
              !hasImage;
            const hasMixedContent = hasText && hasImage;
            const hasMixedTextFile = hasText && hasFile;

            return (
              <>
                {/* Text content - with v2.1 padding for mixed content */}
                {hasText && (
                  <div
                    className={
                      hasMixedContent || hasMixedTextFile
                        ? "px-4 pt-2"
                        : "px-4 py-2"
                    }
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                )}

                {/* Gap between text and image/file */}
                {(hasMixedContent || hasMixedTextFile) && (
                  <div className="h-2" />
                )}

                {/* Image attachment - Using MessageImage component */}
                {hasImage && (
                  <MessageImage
                    fileId={message.attachments[0].fileId}
                    fileName={message.attachments[0].fileName || "Image"}
                    onPreviewClick={(fileId) => {
                      onFilePreviewClick?.(
                        fileId,
                        message.attachments[0].fileName || "Image"
                      );
                    }}
                  />
                )}

                {/* File attachment - v3.2: All file types clickable for preview */}
                {hasFile && (
                  <div
                    className={cn(
                      "flex items-center gap-3 cursor-pointer hover:bg-black/5 transition-colors",
                      hasText ? "px-4 pb-3" : "px-4 py-3"
                    )}
                    data-testid={`message-file-attachment-${message.attachments[0].fileId}`}
                    onClick={() => {
                      onFilePreviewClick?.(
                        message.attachments[0].fileId,
                        message.attachments[0].fileName || "document"
                      );
                    }}
                  >
                    {" "}
                    {/* Icon container with white background for visibility */}
                    <div className="bg-white rounded-lg p-2 shadow-sm">
                      <FileIcon
                        contentType={
                          message.attachments[0].contentType ||
                          "application/octet-stream"
                        }
                        size="md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {message.attachments[0].fileName || "File"}
                      </p>
                      <div
                        className={cn(
                          "flex items-center gap-2 text-xs",
                          isOwn ? "text-white/80" : "text-gray-600"
                        )}
                      >
                        {message.attachments[0].fileSize && (
                          <span>
                            {formatFileSize(message.attachments[0].fileSize)}
                          </span>
                        )}
                        {getFileExtension(
                          message.attachments[0].fileName ?? undefined,
                          message.attachments[0].contentType ?? undefined
                        ) && (
                          <>
                            {message.attachments[0].fileSize && <span>•</span>}
                            <span className="font-medium uppercase">
                              {getFileExtension(
                                message.attachments[0].fileName ?? undefined,
                                message.attachments[0].contentType ?? undefined
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Time */}
        <span
          className={`text-xs text-gray-400 mt-1 block ${
            isOwn ? "text-right" : "text-left"
          }`}
          data-testid="message-time"
        >
          {formatTime(message.sentAt)}
        </span>
      </div>
    </div>
  );
};

export default ChatMainContainer;
