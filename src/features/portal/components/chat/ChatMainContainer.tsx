// ChatMainContainer - Container that fetches messages and integrates with ChatMain

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useState,
  useMemo,
} from "react";
import { useMessages, flattenMessages } from "@/hooks/queries/useMessages";
import { useSendMessage } from "@/hooks/mutations/useSendMessage";
import { useMarkConversationAsRead } from "@/hooks/mutations/useMarkConversationAsRead";
import { usePinnedMessages } from "@/hooks/queries/usePinnedMessages";
import {
  useStarredMessages,
  useConversationStarredMessages,
} from "@/hooks/queries/useStarredMessages";
import { useMessageRealtime } from "@/hooks/useMessageRealtime";
import { useConversationRealtime } from "@/hooks/useConversationRealtime"; // 🐛 FIX: Join category conversations
import { useSendTypingIndicator } from "@/hooks/useSendTypingIndicator";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useAuthStore } from "@/stores/authStore";
import { useCreateTaskStore } from "@/stores/createTaskStore";
import { useCategories } from "@/hooks/queries/useCategories"; // 🆕 NEW (CBN-002)
import { useGroups, flattenGroups } from "@/hooks/queries/useGroups"; // 🆕 NEW (v2.1.2): Realtime unread count
import {
  saveSelectedConversation,
  getSelectedConversation,
  saveSelectedCategory,
  getSelectedCategory,
} from "@/utils/storage"; // 🆕 NEW: Persist active conversation + category
// import { MessageSkeleton } from "../components/MessageSkeleton";
import { MessageSkeleton } from "../MessageSkeleton";
import { groupMessages } from "@/utils/messageGrouping";
import { MessageBubbleSimple } from "./MessageBubbleSimple";
import { SystemMessageBubble } from "./SystemMessageBubble";
import { ChatHeader } from "./ChatHeader";
import { EmptyCategoryState } from "./EmptyCategoryState"; // 🆕 NEW (CBN-002)
import { OfflineBanner } from "@/components/shared/OfflineBanner";
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
  DialogDescription,
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
import type { ConversationInfoDto } from "@/types/categories"; // 🆕 NEW (CBN-002)
import { FILE_CATEGORIES, MAX_FILES_PER_MESSAGE } from "@/types/files";
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

  // 🆕 NEW: Right panel toggle
  showRightPanel?: boolean;
  onToggleRightPanel?: () => void;
  onChatChange?: (target: {
    type: "group" | "dm";
    id: string;
    name?: string;
    category?: string;
    categoryId?: string;
    memberCount?: number;
  }) => void;

  // 🆕 NEW (CBN-002): Category-based navigation
  selectedCategoryId?: string; // If provided, enables conversation selector
  conversationCategory?: string; // Category name for display (optional, can be derived from selectedCategoryId)
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

  // 🆕 NEW: Right panel toggle
  showRightPanel,
  onToggleRightPanel,
  onChatChange,

  // 🆕 NEW (CBN-002): Category-based navigation
  selectedCategoryId,
  conversationCategory: conversationCategoryProp,
}) => {
  const user = useAuthStore((state) => state.user);
  const openCreateTaskModal = useCreateTaskStore((state) => state.openModal);

  // 🆕 NEW: Category state with localStorage persistence
  const [internalSelectedCategoryId, setInternalSelectedCategoryId] = useState<
    string | undefined
  >(() => {
    // Priority: localStorage > prop > undefined (restore from localStorage on reload)
    const stored = getSelectedCategory();
    if (stored) return stored;
    if (selectedCategoryId) return selectedCategoryId;
    return undefined;
  });

  // 🐛 FIX: Sync prop changes to internal state (when user clicks category in sidebar)
  useEffect(() => {
    if (
      selectedCategoryId &&
      selectedCategoryId !== internalSelectedCategoryId
    ) {
      setInternalSelectedCategoryId(selectedCategoryId);
    }
  }, [selectedCategoryId]);

  // Use internal state or prop
  const activeCategoryId = selectedCategoryId ?? internalSelectedCategoryId;

  // 🐛 FIX: Save to localStorage when internal state changes (user action)
  const isFirstCategoryMountRef = useRef(true);
  useEffect(() => {
    // Skip saving on first mount to preserve localStorage value
    if (isFirstCategoryMountRef.current) {
      isFirstCategoryMountRef.current = false;
      return;
    }

    // Save when internal state changes (from user action or prop sync)
    if (internalSelectedCategoryId) {
      saveSelectedCategory(internalSelectedCategoryId);
    }
  }, [internalSelectedCategoryId]);

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

  // 🆕 NEW (CBN-002): Fetch categories (only if category-based navigation enabled)
  const categoriesQuery = useCategories();
  const categories = activeCategoryId ? categoriesQuery.data : undefined;

  // 🆕 NEW (v2.1.2): Fetch groups for realtime unread count
  const groupsQuery = useGroups({ enabled: !!activeCategoryId });
  const apiGroups = flattenGroups(groupsQuery.data);

  // 🆕 NEW (CBN-002): Extract conversations from selected category with realtime unread count
  const categoryConversations = useMemo<ConversationInfoDto[]>(() => {
    if (!activeCategoryId || !categories) return [];

    const selectedCategory = categories.find(
      (cat) => cat.id === activeCategoryId,
    );

    // Merge unread count from groups (realtime) into category conversations
    const conversations = selectedCategory?.conversations ?? [];
    return conversations.map((conv) => {
      const groupData = apiGroups.find((g) => g.id === conv.conversationId);
      return {
        ...conv,
        // Use realtime unread count from groups if available
        unreadCount: groupData?.unreadCount ?? conv.unreadCount ?? 0,
      };
    });
  }, [activeCategoryId, categories, apiGroups, groupsQuery.dataUpdatedAt]); // 🐛 FIX: Add trigger for realtime updates

  // 🆕 NEW (CBN-002): Get category name for display (prioritize prop over derived)
  const conversationCategory = useMemo(() => {
    // If category name provided via prop, use it (higher priority)
    if (conversationCategoryProp) return conversationCategoryProp;

    // Otherwise, derive from selected category
    if (!activeCategoryId || !categories) return undefined;
    const selectedCategory = categories.find(
      (cat) => cat.id === activeCategoryId,
    );
    return selectedCategory?.name;
  }, [conversationCategoryProp, activeCategoryId, categories]);

  // 🆕 NEW (CBN-002): Auto-select first conversation when category changes
  useEffect(() => {
    if (activeCategoryId && categoryConversations.length > 0 && onChatChange) {
      // Auto-select first conversation if no conversation selected
      if (!conversationId) {
        const firstConv = categoryConversations[0];
        onChatChange({
          type: "group",
          id: firstConv.conversationId,
          name: firstConv.conversationName,
          category: conversationCategory,
          categoryId: activeCategoryId,
        });
      }
      // Fallback: If selected conversation doesn't exist in category, select first
      else if (
        !categoryConversations.find((c) => c.conversationId === conversationId)
      ) {
        const firstConv = categoryConversations[0];
        onChatChange({
          type: "group",
          id: firstConv.conversationId,
          name: firstConv.conversationName,
          category: conversationCategory,
          categoryId: activeCategoryId,
        });
      }
    }
  }, [
    activeCategoryId,
    categoryConversations,
    conversationId,
    onChatChange,
    conversationCategory,
  ]);

  // Handler for when user changes conversation via LinearTab
  const handleConversationChange = useCallback(
    (newConversationId: string) => {
      // Notify parent of the change
      if (onChatChange) {
        const conversation = categoryConversations.find(
          (c) => c.conversationId === newConversationId,
        );
        if (conversation) {
          const chatTarget = {
            type: "group" as const,
            id: newConversationId,
            name: conversation.conversationName,
            category: conversationCategory,
            categoryId: activeCategoryId,
          };
          onChatChange(chatTarget);
        }
      }
    },
    [
      onChatChange,
      categoryConversations,
      conversationCategory,
      activeCategoryId,
    ],
  );

  // Fetch messages
  const messagesQuery = useMessages({
    conversationId, // Use conversation ID from props
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

  // ✅ Realtime updates for conversation list unread counts
  // This is the ONLY place that handles MessageSent for unread count updates
  useConversationRealtime({
    activeConversationId: conversationId,
  });

  // Realtime updates for message list (current conversation only)
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
      `[data-testid="message-bubble-${messageId}"]`,
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
          "ring-offset-2",
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

  // 🐛 FIX: Mark conversation as read when switching conversations OR receiving new messages
  const markAsReadMutation = useMarkConversationAsRead();
  const isFirstMountRef = useRef(true);
  const lastMarkedMessageIdRef = useRef<string | undefined>(undefined);

  // Get last message ID from current messages
  const lastMessageId =
    messages.length > 0 ? messages[messages.length - 1]?.id : undefined;

  useEffect(() => {
    // Skip only on first mount
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      prevConversationIdRef.current = conversationId;
      lastMarkedMessageIdRef.current = lastMessageId;
      return;
    }

    // Case 1: Switching to different conversation
    const isConversationChanged =
      conversationId && prevConversationIdRef.current !== conversationId;

    // Case 2: New message arrived in current conversation
    const hasNewMessage =
      conversationId &&
      conversationId === prevConversationIdRef.current &&
      lastMessageId &&
      lastMessageId !== lastMarkedMessageIdRef.current;

    if (isConversationChanged || hasNewMessage) {
      // Mark as read up to last message ID (optimistic update in conversation list)
      markAsReadMutation.mutate({ conversationId, messageId: lastMessageId });

      // Update refs
      lastMarkedMessageIdRef.current = lastMessageId;
    }

    prevConversationIdRef.current = conversationId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, lastMessageId]); // Trigger on conversation change OR new message

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

  // Auto scroll to bottom when conversation changes (always scroll, even when revisiting)
  const prevConversationIdForScrollRef = useRef<string | undefined>(undefined);
  const lastMessageIdRef = useRef<string | undefined>(undefined);
  const shouldScrollOnLoadRef = useRef<boolean>(false);

  useEffect(() => {
    if (conversationId !== prevConversationIdForScrollRef.current) {
      prevConversationIdForScrollRef.current = conversationId;
      shouldScrollOnLoadRef.current = true; // Flag to scroll when messages load
    }
  }, [conversationId]);

  // Scroll to bottom after messages are loaded for the active conversation
  // BUT NOT when loading more older messages
  useEffect(() => {
    if (conversationId && messagesQuery.isSuccess && messages.length > 0) {
      const isLoadingMore = scrollPositionRef.current?.shouldRestore === true;
      const currentLastMessageId = messages[messages.length - 1]?.id;
      const hasNewMessage = currentLastMessageId !== lastMessageIdRef.current;
      const shouldScrollOnLoad = shouldScrollOnLoadRef.current;

      // Only auto-scroll if:
      // 1. NOT loading more older messages, AND
      // 2. (New message arrived OR conversation just loaded)
      if (!isLoadingMore && (hasNewMessage || shouldScrollOnLoad)) {
        // Use setTimeout to ensure DOM is fully rendered (including image placeholders)
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);

        // Update last message ID and reset scroll flag
        lastMessageIdRef.current = currentLastMessageId;
        shouldScrollOnLoadRef.current = false;
      }
    }
  }, [conversationId, messagesQuery.isSuccess, messages]); // Trigger when messages change

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
          result.files[0].uploadResult,
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
            `${batchResult.successCount}/${batchResult.totalFiles} file upload thành công`,
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

  // Compute file limit status
  const totalSize = selectedFiles.reduce((sum, f) => sum + f.file.size, 0);
  const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB
  const remainingSize = MAX_TOTAL_SIZE - totalSize;

  const isFileLimitReached =
    selectedFiles.length >= MAX_FILES_PER_MESSAGE || remainingSize < 1024; // Less than 1KB space left

  // Handle file selection (Phase 2: Batch upload - allow up to 10 files, 100MB total)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const currentCount = selectedFiles.length;
    const remainingSlots = MAX_FILES_PER_MESSAGE - currentCount;

    // STEP 1: Check total size FIRST (highest priority)
    const currentTotalSize = selectedFiles.reduce(
      (sum, f) => sum + f.file.size,
      0,
    );
    const newFilesSize = fileArray.reduce((sum, f) => sum + f.size, 0);
    const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB
    const remainingSize = MAX_TOTAL_SIZE - currentTotalSize;

    if (currentTotalSize + newFilesSize > MAX_TOTAL_SIZE) {
      toast.error(
        remainingSize <= 0
          ? "Đã đạt giới hạn 100MB. Vui lòng xóa file cũ để chọn file mới."
          : `Tổng dung lượng vượt quá 100MB. Còn trống ${formatFileSize(
              remainingSize,
            )}.`,
      );
      e.target.value = "";
      return;
    }

    // STEP 2: Check if already at file count limit
    if (remainingSlots === 0) {
      toast.error(
        `Đã đủ ${MAX_FILES_PER_MESSAGE} file. Vui lòng xóa file cũ để chọn file mới.`,
      );
      e.target.value = "";
      return;
    }

    // If selecting more than remaining, take only what fits (PARTIAL ACCEPT)
    let filesToAdd = fileArray;
    let showWarning = false;
    if (fileArray.length > remainingSlots) {
      filesToAdd = fileArray.slice(0, remainingSlots);
      const discardedCount = fileArray.length - remainingSlots;
      toast.warning(
        remainingSlots === MAX_FILES_PER_MESSAGE
          ? `Chỉ chọn được ${MAX_FILES_PER_MESSAGE} file. Đã tự động bỏ ${discardedCount} file.`
          : `Đã có ${currentCount} file. Chỉ chọn thêm được ${remainingSlots} file nữa.`,
      );
      showWarning = true;
    }

    // Then validate batch (size, type) for files to add
    const validationError = validateBatchFileSelection(
      filesToAdd,
      MAX_FILES_PER_MESSAGE, // 10 files (API limit)
      10 * 1024 * 1024, // 10MB per file
      100 * 1024 * 1024, // 100MB total (API limit)
    );

    if (validationError) {
      toast.error(validationError.message);
      e.target.value = "";
      return;
    }

    // Add validated files (toast notification handled by hook)
    const validFiles = validateAndAdd(filesToAdd, currentCount);
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

  // Track scroll position before loading more messages
  const scrollPositionRef = useRef<{
    scrollHeight: number;
    scrollTop: number;
    shouldRestore: boolean;
  } | null>(null);

  // Handle load more (older messages)
  const handleLoadMore = async () => {
    if (messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage) {
      // Save scroll position BEFORE loading more messages
      const container = messagesContainerRef.current;
      if (!container) return;

      scrollPositionRef.current = {
        scrollHeight: container.scrollHeight,
        scrollTop: container.scrollTop,
        shouldRestore: true,
      };

      // Fetch next page
      await messagesQuery.fetchNextPage();
    }
  };

  // Restore scroll position AFTER new messages are rendered
  // Use pages.length as dependency to only trigger when load more happens
  const pageCount = messagesQuery.data?.pages.length ?? 0;
  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    const scrollPos = scrollPositionRef.current;

    if (container && scrollPos?.shouldRestore) {
      // Use requestAnimationFrame to ensure DOM is fully updated
      requestAnimationFrame(() => {
        const scrollHeightAfter = container.scrollHeight;
        const addedHeight = scrollHeightAfter - scrollPos.scrollHeight;

        // Adjust scroll position to maintain user's view
        // Keep the same visible content in view
        container.scrollTop = scrollPos.scrollTop + addedHeight;

        // Reset flag
        scrollPositionRef.current = null;
      });
    }
  }, [pageCount]); // Only trigger when page count changes (load more)

  // Phase 7: Handle retry failed message
  const handleRetry = useCallback(
    (messageId: string) => {
      // Find the failed message in cache
      const message = messages.find((m) => m.id === messageId);
      if (!message || message.sendStatus !== "failed") return;

      // Check network status
      if (!isOnline) {
        toast.error(
          "Không có kết nối mạng. Vui lòng kiểm tra kết nối của bạn.",
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
    [messages, conversationId, sendMessageMutation, isOnline],
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
      const message = groupedMessages.find(
        (g) => g.message.id === messageId,
      )?.message;
      if (!message) return;

      openCreateTaskModal({
        messageId,
        messageContent:
          message.content || message.attachments?.[0]?.fileName || "",
        conversationId,
      });
    },
    [conversationId, openCreateTaskModal, groupedMessages],
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
    isDirect?: boolean,
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
  // console.log({ status, memberCount, onlineCount, isDirect });
  const statusLine = formatStatusLine(
    status,
    memberCount || 0,
    onlineCount,
    isDirect,
  );

  // Container classes
  const mainContainerCls = isMobile
    ? "flex flex-col w-full h-full min-h-0 bg-white"
    : "flex flex-col w-full rounded-2xl border border-gray-300 bg-white shadow-sm h-full min-h-0";

  // 🆕 NEW (CBN-002): Empty state check - Show notification if category has no conversations
  if (selectedCategoryId && categoryConversations.length === 0) {
    return (
      <div className={mainContainerCls} data-testid="chat-main-empty-category">
        <EmptyCategoryState categoryName={conversationCategory} />
      </div>
    );
  }

  // Loading state
  if (messagesQuery.isLoading) {
    return (
      <div className={mainContainerCls} data-testid="chat-main-loading">
        {/* Header */}
        <ChatHeader
          conversationId={conversationId}
          conversationName={conversationName}
          conversationType={conversationType}
          conversationCategory={conversationCategory}
          onlineCount={onlineCount}
          status={status}
          avatarUrl={avatarUrl}
          isMobile={isMobile}
          onBack={onBack}
          showRightPanel={showRightPanel}
          onToggleRightPanel={onToggleRightPanel}
          categoryConversations={
            selectedCategoryId ? categoryConversations : undefined
          }
          onChangeConversation={
            selectedCategoryId ? handleConversationChange : undefined
          }
        />

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
        <ChatHeader
          conversationId={conversationId}
          conversationName={conversationName}
          conversationType={conversationType}
          conversationCategory={conversationCategory}
          onlineCount={onlineCount}
          status={status}
          avatarUrl={avatarUrl}
          isMobile={isMobile}
          onBack={onBack}
          showRightPanel={showRightPanel}
          onToggleRightPanel={onToggleRightPanel}
          categoryConversations={
            selectedCategoryId ? categoryConversations : undefined
          }
          onChangeConversation={
            selectedCategoryId ? handleConversationChange : undefined
          }
        />

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
      <ChatHeader
        conversationId={conversationId}
        conversationName={conversationName}
        conversationType={conversationType}
        conversationCategory={conversationCategory}
        onlineCount={onlineCount}
        status={status}
        avatarUrl={avatarUrl}
        isMobile={isMobile}
        onBack={onBack}
        onOpenPinnedModal={() => setShowPinnedModal(true)}
        onOpenConversationStarredModal={() =>
          setShowConversationStarredModal(true)
        }
        onOpenAllStarredModal={() => setShowAllStarredModal(true)}
        showRightPanel={showRightPanel}
        onToggleRightPanel={onToggleRightPanel}
        categoryConversations={
          selectedCategoryId ? categoryConversations : undefined
        }
        onChangeConversation={
          selectedCategoryId ? handleConversationChange : undefined
        }
      />

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
            
            // Render system messages differently
            if (message.contentType === "SYS") {
              return (
                <SystemMessageBubble
                  key={message.id}
                  message={message}
                  formatTime={formatTime}
                />
              );
            }
            
            // Render regular messages
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
            disabled={sendMessageMutation.isPending || isFileLimitReached}
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
            disabled={sendMessageMutation.isPending || isFileLimitReached}
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
            disabled={isFileLimitReached}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"
            multiple
            data-testid="file-input"
          />
          <input
            ref={imageInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isFileLimitReached}
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
            <DialogDescription>
              Xem tất cả tin nhắn đã được ghim trong cuộc trò chuyện này
            </DialogDescription>
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
                            "vi-VN",
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
            <DialogDescription>
              Xem tất cả tin nhắn đã được đánh dấu trong cuộc trò chuyện này
            </DialogDescription>
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
                            "vi-VN",
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
            <DialogDescription>
              Xem tất cả tin nhắn đã được đánh dấu từ mọi cuộc trò chuyện
            </DialogDescription>
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
                            "vi-VN",
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
