// Create Task Store - Zustand store for create task modal state

import { create } from 'zustand';

interface CreateTaskState {
  // Modal visibility
  isOpen: boolean;

  // Context - which message triggered the modal
  messageId: string | null;
  messageContent: string | null;
  conversationId: string | null;

  // Actions
  openModal: (params: {
    messageId: string;
    messageContent?: string;
    conversationId: string;
  }) => void;
  closeModal: () => void;
}

export const useCreateTaskStore = create<CreateTaskState>((set) => ({
  // Initial state
  isOpen: false,
  messageId: null,
  messageContent: null,
  conversationId: null,

  // Open modal with context
  openModal: ({ messageId, messageContent, conversationId }) =>
    set({
      isOpen: true,
      messageId,
      messageContent: messageContent ?? null,
      conversationId,
    }),

  // Close modal and reset state
  closeModal: () =>
    set({
      isOpen: false,
      messageId: null,
      messageContent: null,
      conversationId: null,
    }),
}));
