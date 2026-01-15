/**
 * useViewFiles Hook Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useViewFiles } from '@/hooks/useViewFiles';
import { useViewFilesStore } from '@/stores/viewFilesStore';
import type { MessageDto } from '@/types/files';

// Mock test data with correct MessageDto format
const mockMessages: MessageDto[] = [
  {
    id: 'msg_1',
    conversationId: 'conv1',
    groupId: 'group1',
    senderId: 'user1',
    senderName: 'User One',
    content: 'Test message with attachment',
    createdAt: new Date().toISOString(),
    attachments: [{
      fileId: 'file1',
      fileName: 'photo.jpg',
      fileSize: 1048576, // 1 MB
      contentType: 'image/jpeg',
      uploadedAt: new Date().toISOString(),
      url: 'http://example.com/photo.jpg'
    }]
  },
  {
    id: 'msg_2',
    conversationId: 'conv1',
    groupId: 'group1',
    senderId: 'user1',
    senderName: 'User One',
    content: 'Another message',
    createdAt: new Date().toISOString(),
    attachments: [{
      fileId: 'file2',
      fileName: 'report.pdf',
      fileSize: 2097152, // 2 MB
      contentType: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      url: 'http://example.com/report.pdf'
    }]
  }
];

describe('useViewFiles', () => {
  it('should initialize with modal closed', () => {
    const { result } = renderHook(() => useViewFiles());
    expect(result.current.isOpen).toBe(false);
  });

  it('should open modal with extracted files', () => {
    const { result } = renderHook(() => useViewFiles());

    act(() => {
      result.current.openModal(mockMessages, 'group1', 'workType1');
    });

    expect(result.current.isOpen).toBe(true);
    const state = useViewFilesStore.getState();
    expect(state.allFiles.length).toBe(2); // 2 attachments extracted
  });

  it('should extract files from messages', () => {
    const { result } = renderHook(() => useViewFiles());

    act(() => {
      result.current.openModal(mockMessages, 'group1');
    });

    const state = useViewFilesStore.getState();
    const fileNames = state.allFiles.map((f: any) => f.name);
    expect(fileNames).toContain('photo.jpg');
    expect(fileNames).toContain('report.pdf');
  });

  it('should close modal', () => {
    const { result } = renderHook(() => useViewFiles());

    act(() => {
      result.current.openModal(mockMessages, 'group1');
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should handle empty messages', () => {
    const { result } = renderHook(() => useViewFiles());

    act(() => {
      result.current.openModal([], 'group1');
    });

    const state = useViewFilesStore.getState();
    expect(state.allFiles.length).toBe(0);
  });

  it('should handle messages without attachments', () => {
    const messagesNoAttachments: Message[] = [
      {
        id: 'msg3',
        groupId: 'group1',
        senderId: 'user2',
        sender: 'Charlie',
        type: 'text',
        content: 'No attachments here',
        createdAt: new Date().toISOString(),
        time: '12:00',
      },
    ];

    const { result } = renderHook(() => useViewFiles());

    act(() => {
      result.current.openModal(messagesNoAttachments, 'group1');
    });

    const state = useViewFilesStore.getState();
    expect(state.allFiles.length).toBe(0);
  });

  it('should set group and worktype on open', () => {
    const { result } = renderHook(() => useViewFiles());

    act(() => {
      result.current.openModal(mockMessages, 'group123', 'workType456');
    });

    const state = useViewFilesStore.getState();
    expect(state.currentGroupId).toBe('group123');
    expect(state.currentWorkTypeId).toBe('workType456');
  });

  it('should handle extraction errors gracefully', () => {
    const { result } = renderHook(() => useViewFiles());
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Pass invalid data to trigger error
    act(() => {
      result.current.openModal(
        null as any,
        'group1'
      );
    });

    // Should not throw, just log error
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
