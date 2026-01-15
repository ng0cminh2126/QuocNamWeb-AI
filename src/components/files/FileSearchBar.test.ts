/**
 * File Component Tests - Core Display & Control Components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileSearchBar from '@/components/files/FileSearchBar';
import FileSortDropdown from '@/components/files/FileSortDropdown';
import FileFilters from '@/components/files/FileFilters';
import FilePagination from '@/components/files/FilePagination';
import { useViewFilesStore } from '@/stores/viewFilesStore';

beforeEach(() => {
  // Reset store before each test
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

describe('FileSearchBar', () => {
  it('should render search input', () => {
    render(<FileSearchBar />);
    const input = screen.getByTestId('chat-file-search-input');
    expect(input).toBeInTheDocument();
  });

  it('should have placeholder text', () => {
    render(<FileSearchBar placeholder="Find files..." />);
    const input = screen.getByPlaceholderText('Find files...');
    expect(input).toBeInTheDocument();
  });

  it('should show clear button when input has value', async () => {
    const user = userEvent.setup();
    render(<FileSearchBar />);
    const input = screen.getByTestId('chat-file-search-input');

    await user.type(input, 'test');

    const clearButton = screen.getByTestId('chat-file-search-clear-button');
    expect(clearButton).toBeVisible();
  });

  it('should call onSearch callback', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<FileSearchBar onSearch={onSearch} />);
    const input = screen.getByTestId('chat-file-search-input');

    await user.type(input, 'test');

    expect(onSearch).toHaveBeenCalledWith('test');
  });

  it('should clear input when clear button clicked', async () => {
    const user = userEvent.setup();
    render(<FileSearchBar />);
    const input = screen.getByTestId('chat-file-search-input') as HTMLInputElement;

    await user.type(input, 'test');
    expect(input.value).toBe('test');

    const clearButton = screen.getByTestId('chat-file-search-clear-button');
    await user.click(clearButton);

    expect(input.value).toBe('');
  });
});

describe('FileSortDropdown', () => {
  it('should render sort dropdown', () => {
    render(<FileSortDropdown />);
    const select = screen.getByTestId('chat-file-sort-select');
    expect(select).toBeInTheDocument();
  });

  it('should show sort options', () => {
    render(<FileSortDropdown />);
    const select = screen.getByTestId('chat-file-sort-select');

    const options = select.querySelectorAll('option');
    expect(options.length).toBeGreaterThan(0);
  });

  it('should call onSortChange callback', async () => {
    const onSortChange = vi.fn();
    const user = userEvent.setup();
    render(<FileSortDropdown onSortChange={onSortChange} />);
    const select = screen.getByTestId('chat-file-sort-select');

    await user.selectOptions(select, 'oldest');

    expect(onSortChange).toHaveBeenCalled();
  });

  it('should have default sort as newest', () => {
    render(<FileSortDropdown />);
    const select = screen.getByTestId('chat-file-sort-select') as HTMLSelectElement;
    expect(select.value).toBe('newest');
  });
});

describe('FileFilters', () => {
  it('should render filter checkboxes', () => {
    render(<FileFilters />);
    const filterContainer = screen.getByTestId('chat-file-filters-container');
    expect(filterContainer).toBeInTheDocument();
  });

  it('should show select all checkbox', () => {
    render(<FileFilters />);
    const selectAllCheckbox = screen.getByTestId('chat-file-filters-select-all');
    expect(selectAllCheckbox).toBeInTheDocument();
  });

  it('should render individual filter options', () => {
    render(<FileFilters />);
    expect(screen.getByTestId('chat-file-filter-images')).toBeInTheDocument();
    expect(screen.getByTestId('chat-file-filter-videos')).toBeInTheDocument();
    expect(screen.getByTestId('chat-file-filter-pdf')).toBeInTheDocument();
  });

  it('should show filter counts when enabled', () => {
    useViewFilesStore.setState({
      allFiles: Array.from({ length: 5 }, (_, i) => ({
        id: String(i),
        name: `image-${i}.jpg`,
        contentType: 'image/jpeg',
        size: 1024,
        url: `https://example.com/image-${i}.jpg`,
        uploadedAt: new Date().toISOString(),
        senderName: 'User',
      })),
    });

    render(<FileFilters showCounts={true} />);
    const countBadges = screen.getAllByText(/5|0/);
    expect(countBadges.length).toBeGreaterThan(0);
  });

  it('should call onFilterChange callback', async () => {
    const onFilterChange = vi.fn();
    const user = userEvent.setup();
    render(<FileFilters onFilterChange={onFilterChange} />);

    const imagesCheckbox = screen.getByTestId('chat-file-filter-images-checkbox');
    await user.click(imagesCheckbox);

    expect(onFilterChange).toHaveBeenCalled();
  });
});

describe('FilePagination', () => {
  beforeEach(() => {
    // Setup store with 100 files for pagination testing
    const manyFiles = Array.from({ length: 100 }, (_, i) => ({
      id: String(i),
      name: `file-${i}.jpg`,
      contentType: 'image/jpeg',
      size: 1024,
      url: `https://example.com/file-${i}.jpg`,
      uploadedAt: new Date().toISOString(),
      senderName: 'User',
    }));

    useViewFilesStore.setState({
      filteredFiles: manyFiles,
      displayedFiles: manyFiles.slice(0, 50),
      totalFiles: 100,
      currentPage: 1,
      pageSize: 50,
    });
  });

  it('should render pagination controls', () => {
    render(<FilePagination />);
    expect(screen.getByTestId('chat-file-pagination-container')).toBeInTheDocument();
  });

  it('should show pagination info', () => {
    render(<FilePagination />);
    const info = screen.getByTestId('chat-file-pagination-info');
    expect(info).toHaveTextContent('Hiển thị');
    expect(info).toHaveTextContent('của 100');
  });

  it('should have next button enabled on first page', () => {
    render(<FilePagination />);
    const nextButton = screen.getByTestId('chat-file-pagination-next-button');
    expect(nextButton).not.toBeDisabled();
  });

  it('should have prev button disabled on first page', () => {
    render(<FilePagination />);
    const prevButton = screen.getByTestId('chat-file-pagination-prev-button');
    expect(prevButton).toBeDisabled();
  });

  it('should call onPageChange when navigating', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<FilePagination onPageChange={onPageChange} />);

    const nextButton = screen.getByTestId('chat-file-pagination-next-button');
    await user.click(nextButton);

    expect(onPageChange).toHaveBeenCalled();
  });

  it('should show page numbers', () => {
    render(<FilePagination />);
    // Should show at least page 1 and 2
    expect(screen.getByTestId('chat-file-pagination-page-1')).toBeInTheDocument();
  });
});
