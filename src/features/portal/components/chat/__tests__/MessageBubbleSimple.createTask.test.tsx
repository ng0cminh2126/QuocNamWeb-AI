import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageBubbleSimple } from '../MessageBubbleSimple';
import type { ChatMessage } from '@/types/messages';

describe('MessageBubbleSimple - Create Task Visibility', () => {
  const mockFormatTime = vi.fn((date: string) => new Date(date).toLocaleTimeString());
  const mockOnCreateTask = vi.fn();

  const baseMessage: ChatMessage = {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-1',
    senderName: 'John Doe',
    senderIdentifier: 'john.doe',
    senderFullName: 'John Doe',
    senderRoles: 'user',
    parentMessageId: null,
    content: 'Test message',
    contentType: 'TXT',
    sentAt: '2026-01-14T10:00:00Z',
    editedAt: null,
    linkedTaskId: null,
    reactions: [],
    attachments: [],
    replyCount: 0,
    isStarred: false,
    isPinned: false,
    threadPreview: null,
    mentions: [],
  };

  it('should show create task button when message has no linked task', () => {
    render(
      <MessageBubbleSimple
        message={baseMessage}
        isOwn={false}
        formatTime={mockFormatTime}
        onCreateTask={mockOnCreateTask}
      />
    );

    const createTaskButton = screen.getByTestId('create-task-button');
    expect(createTaskButton).toBeInTheDocument();
  });

  it('should hide create task button when message has linked task', () => {
    const messageWithTask: ChatMessage = {
      ...baseMessage,
      linkedTaskId: 'task-123',
    };

    render(
      <MessageBubbleSimple
        message={messageWithTask}
        isOwn={false}
        formatTime={mockFormatTime}
        onCreateTask={mockOnCreateTask}
      />
    );

    const createTaskButton = screen.queryByTestId('create-task-button');
    expect(createTaskButton).not.toBeInTheDocument();
  });

  it('should not show create task button when onCreateTask callback is not provided', () => {
    render(
      <MessageBubbleSimple
        message={baseMessage}
        isOwn={false}
        formatTime={mockFormatTime}
      />
    );

    const createTaskButton = screen.queryByTestId('create-task-button');
    expect(createTaskButton).not.toBeInTheDocument();
  });

  it('should call onCreateTask with message id when button clicked', async () => {
    const user = userEvent.setup();

    render(
      <MessageBubbleSimple
        message={baseMessage}
        isOwn={false}
        formatTime={mockFormatTime}
        onCreateTask={mockOnCreateTask}
      />
    );

    const createTaskButton = screen.getByTestId('create-task-button');
    await user.click(createTaskButton);

    expect(mockOnCreateTask).toHaveBeenCalledWith(baseMessage.id);
  });

  it('should hide create task button after task is linked (linkedTaskId updated)', () => {
    const { rerender } = render(
      <MessageBubbleSimple
        message={baseMessage}
        isOwn={false}
        formatTime={mockFormatTime}
        onCreateTask={mockOnCreateTask}
      />
    );

    // Button should be visible initially
    expect(screen.getByTestId('create-task-button')).toBeInTheDocument();

    // Update message with linkedTaskId
    const updatedMessage: ChatMessage = {
      ...baseMessage,
      linkedTaskId: 'task-456',
    };

    rerender(
      <MessageBubbleSimple
        message={updatedMessage}
        isOwn={false}
        formatTime={mockFormatTime}
        onCreateTask={mockOnCreateTask}
      />
    );

    // Button should be hidden after update
    expect(screen.queryByTestId('create-task-button')).not.toBeInTheDocument();
  });
});
