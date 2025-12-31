// ChatMainContainer - Container that fetches messages and integrates with ChatMain

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useMessages, flattenMessages } from '@/hooks/queries/useMessages';
import { useSendMessage } from '@/hooks/mutations/useSendMessage';
import { useMessageRealtime } from '@/hooks/useMessageRealtime';
import { useSendTypingIndicator } from '@/hooks/useSendTypingIndicator';
import { useAuthStore } from '@/stores/authStore';
import { MessageSkeleton } from '../components/MessageSkeleton';
import { RefreshCw, Send, Loader2, Paperclip, ChevronLeft } from 'lucide-react';
import { Avatar } from '../components';
import { IconButton } from '@/components/ui/icon-button';
import type { ChatMessage } from '@/types/messages';

interface ChatMainContainerProps {
  conversationId: string;
  conversationName: string;
  conversationType?: 'GRP' | 'DM';
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
  conversationType = 'GRP',
  memberCount,
  isMobile = false,
  onBack,
}) => {
  const user = useAuthStore((state) => state.user);
  const [inputValue, setInputValue] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  const messagesQuery = useMessages({
    conversationId,
    enabled: !!conversationId,
  });

  // Send message mutation
  const sendMessageMutation = useSendMessage({
    conversationId,
    onSuccess: () => {
      setInputValue('');
    },
  });

  // Realtime updates
  const { typingUsers } = useMessageRealtime({
    conversationId,
    onNewMessage: () => {
      // Scroll to bottom on new message
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },
  });

  // Typing indicator
  const { handleTyping, stopTyping } = useSendTypingIndicator({
    conversationId,
    debounceMs: 500,
  });

  // Get flattened messages
  const messages = flattenMessages(messagesQuery.data);

  // Auto scroll to bottom on initial load
  useEffect(() => {
    if (!messagesQuery.isLoading && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [messagesQuery.isLoading, messages.length]);

  // Handle send message
  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;

    stopTyping();
    sendMessageMutation.mutate({
      content: inputValue.trim(),
      contentType: 'TXT',
    });
  }, [inputValue, sendMessageMutation, stopTyping]);

  // Handle key press (Enter to send)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle input change with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value) {
      handleTyping();
    }
  };

  // Handle load more (older messages)
  const handleLoadMore = () => {
    if (messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage) {
      messagesQuery.fetchNextPage();
    }
  };

  // Format time for message
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get display name from DM format
  const getDisplayName = (name: string) => {
    if (conversationType === 'DM') {
      return name.replace(/^DM:\s*/, '').split(' <> ')[0];
    }
    return name;
  };

  const displayName = getDisplayName(conversationName);

  // Container classes
  const mainContainerCls = isMobile
    ? 'flex flex-col w-full h-full min-h-0 bg-white'
    : 'flex flex-col w-full rounded-2xl border border-gray-300 bg-white shadow-sm h-full min-h-0';

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
            <div className="text-sm font-semibold text-gray-800">{displayName}</div>
            <div className="text-xs text-gray-500">
              {memberCount ? `${memberCount} thành viên` : 'Đang tải...'}
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
            <div className="text-sm font-semibold text-gray-800">{displayName}</div>
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
            <div className="text-sm font-semibold text-gray-800">{displayName}</div>
            <div className="text-xs text-gray-500">
              {conversationType === 'GRP' && memberCount
                ? `${memberCount} thành viên`
                : conversationType === 'DM'
                  ? 'Trò chuyện riêng'
                  : ''}
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
              {messagesQuery.isFetchingNextPage ? 'Đang tải...' : 'Tải tin nhắn cũ hơn'}
            </button>
          </div>
        )}

        {/* Messages */}
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubbleSimple
              key={message.id}
              message={message}
              isOwn={message.senderId === user?.id}
              formatTime={formatTime}
            />
          ))
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="text-xs text-gray-500 italic" data-testid="typing-indicator">
            {typingUsers.map((u) => u.userName).join(', ')} đang nhập...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t p-3 shrink-0" data-testid="message-input">
        <div className="flex items-center gap-2">
          <input
            className="flex-1 rounded-lg border px-3 py-2 text-sm border-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-200"
            placeholder="Nhập tin nhắn..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={sendMessageMutation.isPending}
            data-testid="message-textarea"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || sendMessageMutation.isPending}
            className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="send-message-button"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
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
}

const MessageBubbleSimple: React.FC<MessageBubbleSimpleProps> = ({
  message,
  isOwn,
  formatTime,
}) => {
  return (
    <div
      className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
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

      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender name (only for received) */}
        {!isOwn && (
          <span className="text-xs text-gray-500 mb-1 block" data-testid="message-sender">
            {message.senderName}
          </span>
        )}

        {/* Message bubble */}
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwn ? 'bg-brand-600 text-white' : 'bg-white text-gray-900 shadow-sm border'
          }`}
          data-testid="message-content"
        >
          {/* Text content */}
          {message.contentType === 'TXT' && <p className="text-sm">{message.content}</p>}

          {/* Image attachment */}
          {message.contentType === 'IMG' && message.attachments.length > 0 && (
            <img
              src={message.attachments[0].url}
              alt="Hình ảnh"
              className="max-w-full rounded"
            />
          )}

          {/* File attachment */}
          {message.contentType === 'FILE' && message.attachments.length > 0 && (
            <a
              href={message.attachments[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm underline"
            >
              <Paperclip className="h-4 w-4" />
              {message.attachments[0].name}
            </a>
          )}
        </div>

        {/* Time */}
        <span
          className={`text-xs text-gray-400 mt-1 block ${isOwn ? 'text-right' : 'text-left'}`}
          data-testid="message-time"
        >
          {formatTime(message.sentAt)}
        </span>
      </div>
    </div>
  );
};

export default ChatMainContainer;
