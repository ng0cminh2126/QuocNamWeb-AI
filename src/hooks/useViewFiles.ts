/**
 * useViewFiles Hook
 * Custom hook for managing View All Files modal open/close and file extraction
 * Handles getting files from a conversation and opening the modal
 */

import { useCallback } from 'react';
import { useViewFilesStore } from '@/stores/viewFilesStore';
import { extractAllFilesFromMessages } from '@/utils/fileExtraction';
import type { MessageDto } from '@/types/files';

interface UseViewFilesReturn {
  openModal: (messages: MessageDto[], groupId: string, workTypeId?: string) => void;
  closeModal: () => void;
  isOpen: boolean;
}

/**
 * Hook to manage View All Files modal with automatic file extraction
 * Uses individual selectors to prevent infinite re-renders
 * 
 * @example
 * const { openModal, closeModal, isOpen } = useViewFiles();
 * 
 * // In a button handler:
 * openModal(messages, groupId, workTypeId);
 */
export function useViewFiles(): UseViewFilesReturn {
  // Use individual selectors instead of destructuring to prevent re-render cascade
  const isModalOpen = useViewFilesStore((state) => state.isModalOpen);
  const storeOpenModal = useViewFilesStore((state) => state.openModal);
  const storeCloseModal = useViewFilesStore((state) => state.closeModal);

  const openModal = useCallback(
    (messages: MessageDto[], groupId: string, workTypeId?: string) => {
      try {
        // Extract all files from messages (both media and documents)
        const allFiles = extractAllFilesFromMessages(messages);

        // Open modal with extracted files
        storeOpenModal(allFiles, groupId, workTypeId);
      } catch (error) {
        console.error('Error opening View All Files modal:', error);
        // Store will handle error state
      }
    },
    [storeOpenModal]
  );

  const closeModal = useCallback(() => {
    storeCloseModal();
  }, [storeCloseModal]);

  return {
    openModal,
    closeModal,
    isOpen: isModalOpen,
  };
}
