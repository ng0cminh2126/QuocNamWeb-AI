// ChatMainContainer - Container that fetches messages and integrates with ChatMain

import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  useMemo,
} from "react";
import { useMessages, flattenMessages } from "@/hooks/queries/useMessages";
import { useSendMessage } from "@/hooks/mutations/useSendMessage";
import { usePinnedMessages } from "@/hooks/queries/usePinnedMessages";
import {
  useStarredMessages,
  useConversationStarredMessages,
} from "@/hooks/queries/useStarredMessages";
import { useMessageRealtime } from "@/hooks/useMessageRealtime";
import { useSendTypingIndicator } from "@/hooks/useSendTypingIndicator";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useAuthStore } from "@/stores/authStore";
import { useCreateTaskStore } from "@/stores/createTaskStore";
// import { MessageSkeleton } from "../components/MessageSkeleton";
import { MessageSkeleton } from "../MessageSkeleton";
import { groupMessages } from "@/utils/messageGrouping";
import { MessageBubbleSimple } from "./MessageBubbleSimple";
import { OfflineBanner } from "@/components/OfflineBanner";
import {
  RefreshCw,
  Send,
  Loader2,
  Paperclip,
  ChevronLeft,
  Image as ImageIcon,
  Pin,
  Star,
  StarOff,
  MoreVertical,
} from "lucide-react";
import { Avatar } from "../Avatar";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FileIcon from "@/components/FileIcon";
import { cn } from "@/lib/utils";
import FilePreview from "@/components/FilePreview";
import { useFileValidation } from "@/hooks/useFileValidation";
import {
  revokeFilePreview,
  validateBatchFileSelection,
  extractSuccessfulUploads,
} from "@/utils/fileHelpers";
import { useUploadFiles } from "@/hooks/mutations/useUploadFiles";
import { useUploadFilesBatch } from "@/hooks/mutations/useUploadFilesBatch";
import { formatAttachment } from "@/utils/formatAttachment";
import { getFileUrl } from "@/utils/fileUrl";
import { toast } from "sonner";
import ChatInput from "@/features/portal/components/ChatInput";
import MessageImage from "@/features/portal/workspace/MessageImage";
import FilePreviewModal from "@/components/FilePreviewModal";
import type { ChatMessage } from "@/types/messages";
import type { SelectedFile, FileUploadProgressState } from "@/types/files";
import { FILE_CATEGORIES } from "@/types/files";
import ImagePreviewModal from "@/components/ImagePreviewModal";

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
  workspaceId?: string; // Optional for backward compatibility
  conversationId: string;
  conversationName: string;
  conversationType?: "GRP" | "DM";
  memberCount?: number;
  onlineCount?: number;
  status?: "Active" | "Archived" | "Muted";
  avatarUrl?: string;
  isMobile?: boolean;
  onBack?: () => void;
  onTogglePin?: (messageId: string, isPinned: boolean) => void;
  onToggleStar?: (messageId: string, isStarred: boolean) => void;
  onMessagesLoaded?: (messages: any[]) => void;
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
  workspaceId = "default-workspace", // Default value
  conversationId,
  conversationName,
  conversationType = "GRP",
  memberCount,
  onlineCount = 0,
  status = "Active",
  avatarUrl,
  isMobile = false,
  onBack,
  onTogglePin,
  onToggleStar,
  onMessagesLoaded,
}) => {
  const user = useAuthStore((state) => state.user);
  const openCreateTaskModal = useCreateTaskStore((state) => state.openModal);
  const [inputValue, setInputValue] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<
    Map<string, FileUploadProgressState>
  >(new Map());
  const [isUploading, setIsUploading] = useState(false);
  const [previewFileId, setPreviewFileId] = useState<string | null>(null); // For image preview modal
  const [previewFileName, setPreviewFileName] = useState<string>("");
  const [previewImages, setPreviewImages] = useState<
    Array<{ fileId: string; fileName: string }>
  >([]); // Phase 2.1: Gallery mode
  const [previewInitialIndex, setPreviewInitialIndex] = useState(0);
  const [showPinnedModal, setShowPinnedModal] = useState(false);
  const [showConversationStarredModal, setShowConversationStarredModal] =
    useState(false);
  const [showAllStarredModal, setShowAllStarredModal] = useState(false);
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

  // Fetch pinned messages for modal
  const { data: pinnedMessages = [] } = usePinnedMessages({
    conversationId,
    enabled: !!conversationId && showPinnedModal,
  });

  // Fetch starred messages in conversation for modal
  const { data: conversationStarredMessages = [] } =
    useConversationStarredMessages({
      conversationId,
      enabled: !!conversationId && showConversationStarredModal,
    });

  // Fetch all starred messages for modal
  const { data: allStarredMessages = [] } = useStarredMessages({
    enabled: showAllStarredModal,
  });

  // Send message mutation
  const sendMessageMutation = useSendMessage({
    workspaceId,
    conversationId,
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

  // Network status (Phase 7: Timeout & Retry UI)
  const { isOnline, wasOffline } = useNetworkStatus();

  // Function to scroll to a message or jump via API if not in view
  const handleScrollToMessage = useCallback(async (messageId: string) => {
    // First, check if message exists in current view
    const messageElement = document.querySelector(
      `[data-testid="message-bubble-${messageId}"]`
    );

    if (messageElement) {
      // Message is in current view, scroll to it
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });

      // Highlight the message briefly
      messageElement.classList.add("ring-2", "ring-amber-400", "ring-offset-2");
      setTimeout(() => {
        messageElement.classList.remove(
          "ring-2",
          "ring-amber-400",
          "ring-offset-2"
        );
      }, 2000);
    } else {
      // Message not in current view, need to load it via API
      // This is a simplified approach - in production, you'd implement proper message jumping
      toast.info("Đang tải tin nhắn...");

      // For now, we'll just show a message
      // In a full implementation, you would:
      // 1. Call API with beforeMessageId to get messages around the target
      // 2. Update the messages query with the new data
      // 3. Scroll to the message once loaded
      toast.warning("Tin nhắn không có trong khung nhìn hiện tại");
    }
  }, []);

  // Phase 2: File upload
  const uploadFilesMutation = useUploadFiles();
  const uploadBatchMutation = useUploadFilesBatch();
  // File validation
  const { validateAndAdd } = useFileValidation();

  // Get flattened messages
  const messages = flattenMessages(messagesQuery.data);

  // Call onMessagesLoaded callback when messages are loaded (only when data changes)
  const prevMessagesRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (onMessagesLoaded) {
      const messagesJson = JSON.stringify(messages);
      // Only call if messages actually changed (not just reference change)
      if (prevMessagesRef.current !== messagesJson) {
        prevMessagesRef.current = messagesJson;
        onMessagesLoaded(messages);
      }
    }
  }, [onMessagesLoaded]);
  // Phase 4: Group messages by time proximity (10 minutes)
  // Convert ChatMessage to format compatible with groupMessages
  const groupedMessages = useMemo(() => {
    const messagesWithTimestamp = messages.map((msg) => ({
      ...msg,
      timestamp: new Date(msg.sentAt).getTime(),
    }));
    return groupMessages(messagesWithTimestamp, 10 * 60 * 1000); // 10 minutes
  }, [messages]);

  // Auto scroll to bottom when conversation changes or data loads successfully
  useEffect(() => {
    if (messagesQuery.isSuccess && messages.length > 0) {
      // Use setTimeout to ensure DOM is fully rendered (including image placeholders)
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
      }, 200); // Increased timeout to allow all image placeholders to render and calculate height
    }
  }, [conversationId, messagesQuery.isSuccess, messages.length]); // ✅ Also trigger on messages.length change

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

  // Handle send message with file upload (Phase 2 - Batch Upload)
  const handleSend = useCallback(async () => {
    // Phase 7: Check network status before sending
    if (!isOnline) {
      toast.error("Không có kết nối mạng. Vui lòng kiểm tra kết nối của bạn.");
      return;
    }

    if (!inputValue.trim() && selectedFiles.length === 0) return;

    stopTyping();
    setIsUploading(true);

    try {
      if (selectedFiles.length === 0) {
        // Case 1: Text-only message (no files)
        await sendMessageMutation.mutateAsync({
          conversationId,
          content: inputValue.trim(),
        });
      } else if (selectedFiles.length === 1) {
        // Case 2: Single file upload (Phase 1 API)
        const result = await uploadFilesMutation.mutateAsync({
          files: selectedFiles,
          sourceModule: 1,
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

        if (result.failedCount > 0) {
          toast.error("Lỗi upload file. Vui lòng thử lại.");
          setIsUploading(false);
          return;
        }

        // Send message with single attachment (as array)
        const attachment = formatAttachment(
          result.files[0].originalFile,
          result.files[0].uploadResult
        );

        await sendMessageMutation.mutateAsync({
          conversationId,
          content: inputValue.trim() || "", // Empty string instead of null for API
          attachments: [attachment], // Phase 2: Always use attachments[] array
        });
      } else {
        // Case 3: Batch upload (Phase 2 API - 2+ files)
        const batchResult = await uploadBatchMutation.mutateAsync({
          files: selectedFiles.map((sf) => sf.file),
          sourceModule: 1,
          sourceEntityId: conversationId,
        });

        // Extract successful uploads
        const attachments = extractSuccessfulUploads(batchResult);

        if (attachments.length === 0) {
          toast.error("Tất cả file upload thất bại. Vui lòng thử lại.");
          setIsUploading(false);
          return;
        }

        // Show warning for partial success
        if (batchResult.partialSuccess) {
          toast.warning(
            `${batchResult.successCount}/${batchResult.totalFiles} file upload thành công`
          );
        }

        // Send 1 message with multiple attachments (Phase 2 API v2.0)
        await sendMessageMutation.mutateAsync({
          conversationId,
          content: inputValue.trim() || "", // Empty string instead of null for API
          attachments, // Phase 2: Array of AttachmentInputDto
        });
      }

      // Success - clear state
      selectedFiles.forEach((sf) => revokeFilePreview(sf.preview));
      setSelectedFiles([]);
      setInputValue("");
      setIsUploading(false);

      setTimeout(() => inputRef.current?.focus(), 0);
    } catch (error) {
      console.error("Send message error:", error);
      toast.error("Lỗi gửi tin nhắn. Vui lòng thử lại.");
      setIsUploading(false);
    }
  }, [
    inputValue,
    sendMessageMutation,
    stopTyping,
    selectedFiles,
    conversationId,
    uploadFilesMutation,
    uploadBatchMutation,
    isOnline,
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

  // Handle file selection (Phase 2: Batch upload - allow 2-10 files)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // Phase 2: Validate batch file selection
    const validationError = validateBatchFileSelection(
      fileArray,
      10, // Max 10 files
      10 * 1024 * 1024, // Max 10MB per file
      50 * 1024 * 1024 // Max 50MB total
    );

    if (validationError) {
      toast.error(validationError.message);
      e.target.value = "";
      return;
    }

    // Add validated files
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

  // Phase 7: Handle retry failed message
  const handleRetry = useCallback(
    (messageId: string) => {
      // Find the failed message in cache
      const message = messages.find((m) => m.id === messageId);
      if (!message || message.sendStatus !== "failed") return;

      // Check network status
      if (!isOnline) {
        toast.error(
          "Không có kết nối mạng. Vui lòng kiểm tra kết nối của bạn."
        );
        return;
      }

      // Retry sending the message
      sendMessageMutation.mutate({
        conversationId,
        content: message.content || "",
        parentMessageId: message.parentMessageId || undefined,
        // TODO: Handle attachment retry if needed
      });
    },
    [messages, conversationId, sendMessageMutation, isOnline]
  );

  // Format time for message
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle create task from message
  const handleCreateTask = useCallback(
    (messageId: string) => {
      // Find the message to get its content
      const message = groupedMessages.find((g) => g.message.id === messageId)?.message;
      if (!message) return;

      openCreateTaskModal({
        messageId,
        messageContent: message.content || message.attachments?.[0]?.fileName || '',
        conversationId,
      });
    },
    [conversationId, openCreateTaskModal, groupedMessages]
  );

  // Get display name from DM format
  const getDisplayName = (name: string) => {
    if (conversationType === "DM") {
      return name.replace(/^DM:\s*/, "").split(" <> ")[0];
    }
    return name;
  };

  // Translate status to Vietnamese
  const translateStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      Active: "Hoạt động",
      Archived: "Đã lưu trữ",
      Muted: "Đã tắt thông báo",
    };
    return statusMap[status] || status;
  };

  // Format status line
  const formatStatusLine = (
    status: string,
    memberCount: number,
    onlineCount?: number,
    isDirect?: boolean
  ): string => {
    const parts: string[] = [];
    parts.push(translateStatus(status));

    if (!isDirect && memberCount > 0) {
      parts.push(`${memberCount} thành viên`);
    }

    if (onlineCount !== undefined && onlineCount > 0) {
      parts.push(`${onlineCount} đang online`);
    }

    return parts.join(" • ");
  };

  const displayName = getDisplayName(conversationName);

  // Format status line
  const isDirect = conversationType === "DM";
  console.log({ status, memberCount, onlineCount, isDirect });
  const statusLine = formatStatusLine(
    status,
    memberCount || 0,
    onlineCount,
    isDirect
  );

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
          <Avatar name={displayName} avatarUrl={avatarUrl} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-800 truncate">
              {displayName}
            </div>
            <div className="text-xs text-gray-500">Đang tải...</div>
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
          <Avatar name={displayName} avatarUrl={avatarUrl} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-800 truncate">
              {displayName}
            </div>
            <div
              className="text-xs font-medium text-brand-600"
              data-testid="conversation-status-line"
            >
              {statusLine}
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
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {isMobile && onBack && (
            <IconButton
              className="rounded-full bg-white shrink-0"
              onClick={onBack}
              icon={<ChevronLeft className="h-5 w-5 text-brand-600" />}
            />
          )}
          <Avatar name={displayName} avatarUrl={avatarUrl} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-800 truncate">
              {displayName}
            </div>
            <div
              className="text-xs font-medium text-brand-600"
              data-testid="conversation-status-line"
            >
              {statusLine}
            </div>
          </div>
        </div>

        {/* Header actions menu */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              data-testid="chat-header-menu-button"
            >
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="end">
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                className="justify-start gap-2 text-sm"
                onClick={() => {
                  setShowPinnedModal(true);
                }}
                data-testid="open-pinned-modal-button"
              >
                <Pin className="h-4 w-4 text-amber-600" />
                Tin nhắn đã ghim
              </Button>
              <Button
                variant="ghost"
                className="justify-start gap-2 text-sm"
                onClick={() => {
                  setShowConversationStarredModal(true);
                }}
                data-testid="open-conversation-starred-modal-button"
              >
                <Star className="h-4 w-4 text-amber-600" />
                Tin nhắn đã đánh dấu
              </Button>
              <Button
                variant="ghost"
                className="justify-start gap-2 text-sm"
                onClick={() => {
                  setShowAllStarredModal(true);
                }}
                data-testid="open-all-starred-modal-button"
              >
                <Star className="h-4 w-4 text-blue-600" />
                Tất cả tin nhắn đã đánh dấu
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Phase 7: Network status banner */}
      {(isOnline === false || wasOffline) && (
        <div className="px-4">
          <OfflineBanner isOnline={isOnline} wasOffline={wasOffline} />
        </div>
      )}

      {/* Message list */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-0.5 min-h-0 bg-gray-50"
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
        {groupedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">
              Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!
            </p>
          </div>
        ) : (
          groupedMessages.map((groupedMsg) => {
            const message = groupedMsg.message;
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
                onImageClick={(images, initialIndex) => {
                  // Phase 2.1: Gallery mode navigation
                  setPreviewImages(images);
                  setPreviewInitialIndex(initialIndex);
                  setPreviewFileId(images[initialIndex]?.fileId || null);
                }}
                onTogglePin={onTogglePin}
                onToggleStar={onToggleStar}
                onCreateTask={handleCreateTask}
                onRetry={handleRetry}
                isFirstInGroup={groupedMsg.isFirstInGroup}
                isMiddleInGroup={groupedMsg.isMiddleInGroup}
                isLastInGroup={groupedMsg.isLastInGroup}
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
            multiple
            data-testid="file-input"
          />
          <input
            ref={imageInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept={FILE_CATEGORIES.IMAGE.join(",")}
            multiple
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

      {/* Image Preview Modal - Placed at container level */}
      <ImagePreviewModal
        open={!!previewFileId}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewFileId(null);
            setPreviewImages([]);
            setPreviewInitialIndex(0);
          }
        }}
        fileId={previewImages.length > 0 ? null : previewFileId} // Use fileId only for single image mode
        fileName={previewFileName}
        images={previewImages.length > 0 ? previewImages : undefined} // Gallery mode
        initialIndex={previewInitialIndex}
      />

      {/* Pinned Messages Modal */}
      <Dialog open={showPinnedModal} onOpenChange={setShowPinnedModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pin className="h-5 w-5 text-amber-600" />
              Tin nhắn đã ghim
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {pinnedMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Chưa có tin nhắn nào được ghim
              </div>
            ) : (
              pinnedMessages.map((pinned) => (
                <div
                  key={pinned.messageId}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => {
                    handleScrollToMessage(pinned.messageId);
                    setShowPinnedModal(false);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-brand-700">
                        {pinned.message.senderName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {pinned.message.senderName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(pinned.pinnedAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {pinned.message.content || "[File đính kèm]"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Conversation Starred Messages Modal */}
      <Dialog
        open={showConversationStarredModal}
        onOpenChange={setShowConversationStarredModal}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-600" />
              Tin nhắn đã đánh dấu
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {conversationStarredMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Chưa có tin nhắn nào được đánh dấu
              </div>
            ) : (
              conversationStarredMessages.map((starred) => (
                <div
                  key={starred.messageId}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => {
                    handleScrollToMessage(starred.messageId);
                    setShowConversationStarredModal(false);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-brand-700">
                        {starred.message.senderName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {starred.message.senderName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(starred.starredAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {starred.message.content || "[File đính kèm]"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* All Starred Messages Modal */}
      <Dialog open={showAllStarredModal} onOpenChange={setShowAllStarredModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-600" />
              Tất cả tin nhắn đã đánh dấu
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {allStarredMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Chưa có tin nhắn nào được đánh dấu
              </div>
            ) : (
              allStarredMessages.map((starred) => (
                <div
                  key={starred.messageId}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => {
                    // For all starred, if it's in a different conversation, we'd need to navigate
                    // For now, just try to scroll if in same conversation
                    if (starred.message.conversationId === conversationId) {
                      handleScrollToMessage(starred.messageId);
                    } else {
                      toast.info("Tin nhắn này ở cuộc trò chuyện khác");
                    }
                    setShowAllStarredModal(false);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-brand-700">
                        {starred.message.senderName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {starred.message.senderName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(starred.starredAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                      <div className="text-xs text-blue-600 mb-1">
                        Cuộc trò chuyện: {starred.message.conversationId}
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {starred.message.content || "[File đính kèm]"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
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

export default ChatMainContainer;
