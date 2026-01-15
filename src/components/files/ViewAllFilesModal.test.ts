/**
 * ViewAllFilesModal Component Tests
 * Tests for main container component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ViewAllFilesModal from '@/components/files/ViewAllFilesModal';
import { useViewFilesStore } from '@/stores/viewFilesStore';
import type { ExtractedFile } from '@/types/files';

const mockFiles: ExtractedFile[] = [
  {
    id: '1',
    name: 'image1.jpg',
    contentType: 'image/jpeg',
    size: 1024 * 100,
    url: 'https://example.com/image1.jpg',
    uploadedAt: '2025-01-09T10:00:00Z',
    senderName: 'Alice',
  },
  {
    id: '2',
    name: 'document.pdf',
    contentType: 'application/pdf',
    size: 1024 * 200,
    url: 'https://example.com/document.pdf',
    uploadedAt: '2025-01-08T10:00:00Z',
    senderName: 'Bob',
  },
];

beforeEach(() => {
  useViewFilesStore.setState({
    isModalOpen: false,
    currentGroupId: null,
    currentWorkTypeId: null,
    allFiles: [],
    filteredFiles: [],
    displayedFiles: [],
    filters: {
      images: true,
      videos: true,
      pdf: true,
      word: true,
      excel: true,
      powerpoint: true,
      other: true,
    },
    sortBy: 'newest',
    searchQuery: '',
    currentPage: 1,
    pageSize: 50,
    totalFiles: 0,
    previewFile: null,
    previewPosition: null,
    isLoading: false,
    error: null,
  });
});

describe('ViewAllFilesModal', () => {
  it('should not render when isOpen is false', () => {
    const { container } = render(
      <ViewAllFilesModal isOpen={false} onOpenChange={() => {}} />
    );
    const modal = container.querySelector('[data-testid="chat-view-all-files-modal"]');
    expect(modal).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    useViewFilesStore.setState({
      allFiles: mockFiles,
      filteredFiles: mockFiles,
      displayedFiles: mockFiles,
      totalFiles: mockFiles.length,
    });

    render(<ViewAllFilesModal isOpen={true} onOpenChange={() => {}} />);
    expect(screen.getByTestId('chat-view-all-files-modal')).toBeInTheDocument();
  });

  it('should render header with close button', () => {
    useViewFilesStore.setState({
      allFiles: mockFiles,
      filteredFiles: mockFiles,
      displayedFiles: mockFiles,
      totalFiles: mockFiles.length,
    });

    render(<ViewAllFilesModal isOpen={true} onOpenChange={() => {}} />);
    expect(screen.getByTestId('chat-view-all-files-header')).toBeInTheDocument();
    expect(screen.getByTestId('chat-view-all-files-close-button')).toBeInTheDocument();
  });

  it('should render toolbar with controls', () => {
    useViewFilesStore.setState({
      allFiles: mockFiles,
      filteredFiles: mockFiles,
      displayedFiles: mockFiles,
      totalFiles: mockFiles.length,
    });

    render(<ViewAllFilesModal isOpen={true} onOpenChange={() => {}} />);
    expect(screen.getByTestId('chat-view-all-files-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('chat-file-search-input')).toBeInTheDocument();
  });

  it('should show grid view by default', () => {
    useViewFilesStore.setState({
      allFiles: mockFiles,
      filteredFiles: mockFiles,
      displayedFiles: mockFiles,
      totalFiles: mockFiles.length,
    });

    render(<ViewAllFilesModal isOpen={true} onOpenChange={() => {}} />);
    const gridButton = screen.getByTestId('chat-view-all-files-view-grid-button');
    expect(gridButton).toHaveClass('bg-blue-100');
  });

  it('should toggle between grid and list view', async () => {
    const user = userEvent.setup();
    useViewFilesStore.setState({
      allFiles: mockFiles,
      filteredFiles: mockFiles,
      displayedFiles: mockFiles,
      totalFiles: mockFiles.length,
    });

    render(<ViewAllFilesModal isOpen={true} onOpenChange={() => {}} />);

    const listButton = screen.getByTestId('chat-view-all-files-view-list-button');
    await user.click(listButton);

    expect(listButton).toHaveClass('bg-blue-100');
  });

  it('should toggle filter panel', async () => {
    const user = userEvent.setup();
    useViewFilesStore.setState({
      allFiles: mockFiles,
      filteredFiles: mockFiles,
      displayedFiles: mockFiles,
      totalFiles: mockFiles.length,
    });

    render(<ViewAllFilesModal isOpen={true} onOpenChange={() => {}} />);

    const filterToggle = screen.getByTestId(
      'chat-view-all-files-filter-toggle-button'
    );
    await user.click(filterToggle);

    await waitFor(() => {
      expect(
        screen.getByTestId('chat-view-all-files-filters-panel')
      ).toBeInTheDocument();
    });
  });

  it('should display files in grid', () => {
    useViewFilesStore.setState({
      allFiles: mockFiles,
      filteredFiles: mockFiles,
      displayedFiles: mockFiles,
      totalFiles: mockFiles.length,
    });

    render(<ViewAllFilesModal isOpen={true} onOpenChange={() => {}} />);
    expect(screen.getByTestId('chat-file-grid-container')).toBeInTheDocument();
  });

  it('should show empty state when no files', () => {
    useViewFilesStore.setState({
      allFiles: [],
      filteredFiles: [],
      displayedFiles: [],
      totalFiles: 0,
    });

    render(<ViewAllFilesModal isOpen={true} onOpenChange={() => {}} />);
    expect(
      screen.getByTestId('chat-view-all-files-empty-state')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Không tìm thấy file')
    ).toBeInTheDocument();
  });

  it('should display pagination when files exist', () => {
    useViewFilesStore.setState({
      allFiles: mockFiles,
      filteredFiles: mockFiles,
      displayedFiles: mockFiles,
      totalFiles: mockFiles.length,
    });

    render(<ViewAllFilesModal isOpen={true} onOpenChange={() => {}} />);
    expect(
      screen.getByTestId('chat-view-all-files-pagination')
    ).toBeInTheDocument();
  });

  it('should call onOpenChange when closing', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    useViewFilesStore.setState({
      allFiles: mockFiles,
      filteredFiles: mockFiles,
      displayedFiles: mockFiles,
      totalFiles: mockFiles.length,
    });

    render(
      <ViewAllFilesModal isOpen={true} onOpenChange={onOpenChange} />
    );

    const closeButton = screen.getByTestId(
      'chat-view-all-files-close-button'
    );
    await user.click(closeButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should update title correctly', () => {
    useViewFilesStore.setState({
      allFiles: mockFiles,
      filteredFiles: mockFiles,
      displayedFiles: mockFiles,
      totalFiles: mockFiles.length,
    });

    render(<ViewAllFilesModal isOpen={true} onOpenChange={() => {}} />);
    expect(screen.getByText('Tất cả file')).toBeInTheDocument();
  });

  it('should have proper accessibility labels', () => {
    useViewFilesStore.setState({
      allFiles: mockFiles,
      filteredFiles: mockFiles,
      displayedFiles: mockFiles,
      totalFiles: mockFiles.length,
    });

    render(<ViewAllFilesModal isOpen={true} onOpenChange={() => {}} />);

    const gridButton = screen.getByTestId(
      'chat-view-all-files-view-grid-button'
    );
    const listButton = screen.getByTestId(
      'chat-view-all-files-view-list-button'
    );

    expect(gridButton).toHaveAttribute('title');
    expect(listButton).toHaveAttribute('title');
  });
});
