/**
 * Integration Test - InformationPanel with View All Files
 * Tests the connection between InformationPanel and ViewAllFilesModal
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InformationPanel } from '@/features/portal/workspace/InformationPanel';
import { useViewFilesStore } from '@/stores/viewFilesStore';

// Mock the FileManagerPhase1A component
vi.mock('@/components/FileManagerPhase1A', () => ({
  FileManagerPhase1A: () => <div data-testid="file-manager">File Manager</div>,
}));

describe('InformationPanel Integration - View All Files', () => {
  beforeEach(() => {
    // Reset store state
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

  it('should render View All Files button in Tất Cả Tệp accordion', () => {
    render(
      <InformationPanel
        groupId="group-123"
        groupName="Test Group"
        workTypeName="Test Type"
      />
    );

    // Check for the accordion section
    expect(screen.getByText('Tất Cả Tệp')).toBeInTheDocument();

    // Check for the button
    const button = screen.getByTestId('view-all-files-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Xem Tất Cả Tệp');
  });

  it('should open modal when clicking View All Files button', async () => {
    const user = userEvent.setup();

    render(
      <InformationPanel
        groupId="group-123"
        groupName="Test Group"
        workTypeName="Test Type"
      />
    );

    const button = screen.getByTestId('view-all-files-button');

    // Click button
    await user.click(button);

    // Modal should be visible
    const modal = screen.getByTestId('view-all-files-modal');
    expect(modal).toBeVisible();
  });

  it('should pass groupId and selectedWorkTypeId to modal', async () => {
    const user = userEvent.setup();

    const testGroupId = 'group-xyz-789';
    const testWorkTypeId = 'type-abc-123';

    render(
      <InformationPanel
        groupId={testGroupId}
        groupName="Test Group"
        workTypeName="Test Type"
        selectedWorkTypeId={testWorkTypeId}
      />
    );

    const button = screen.getByTestId('view-all-files-button');
    await user.click(button);

    // Check that store has correct group and worktype
    const state = useViewFilesStore.getState();
    expect(state.currentGroupId).toBe(testGroupId);
    expect(state.currentWorkTypeId).toBe(testWorkTypeId);
  });

  it('should render other sections alongside View All Files', () => {
    render(
      <InformationPanel
        groupId="group-123"
        groupName="Test Group"
        workTypeName="Test Type"
      />
    );

    // Check other sections are rendered
    expect(screen.getByText('Ảnh / Video')).toBeInTheDocument();
    expect(screen.getByText('Tất Cả Tệp')).toBeInTheDocument();
    expect(screen.getByText('Tài liệu')).toBeInTheDocument();

    // Check file manager components exist
    expect(screen.getAllByTestId('file-manager')).toHaveLength(2); // media + docs
  });

  it('should render Members section for lead view mode', () => {
    const members = [
      { id: '1', name: 'Alice', role: 'Leader' as const },
      { id: '2', name: 'Bob', role: 'Member' as const },
    ];

    render(
      <InformationPanel
        viewMode="lead"
        groupId="group-123"
        groupName="Test Group"
        workTypeName="Test Type"
        members={members}
      />
    );

    // Members section should be visible
    expect(screen.getByText('Thành viên')).toBeInTheDocument();
    expect(screen.getByText('2 thành viên')).toBeInTheDocument();
  });

  it('should not render Members section for staff view mode', () => {
    const members = [
      { id: '1', name: 'Alice', role: 'Leader' as const },
      { id: '2', name: 'Bob', role: 'Member' as const },
    ];

    render(
      <InformationPanel
        viewMode="staff"
        groupId="group-123"
        groupName="Test Group"
        workTypeName="Test Type"
        members={members}
      />
    );

    // Members section should NOT be visible
    expect(screen.queryByText('Thành viên')).not.toBeInTheDocument();
  });

  it('should have proper styling on View All Files button', () => {
    render(
      <InformationPanel
        groupId="group-123"
        groupName="Test Group"
        workTypeName="Test Type"
      />
    );

    const button = screen.getByTestId('view-all-files-button');

    // Check for proper styling classes
    expect(button).toHaveClass('rounded-lg');
    expect(button).toHaveClass('border');
    expect(button).toHaveClass('bg-brand-50');
    expect(button).toHaveClass('text-brand-700');
  });

  it('should display FileText icon in button', () => {
    render(
      <InformationPanel
        groupId="group-123"
        groupName="Test Group"
        workTypeName="Test Type"
      />
    );

    const button = screen.getByTestId('view-all-files-button');

    // Icon should be present (Lucide FileText icon)
    // We check by the SVG or icon class presence
    const icon = button.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should handle missing groupId gracefully', () => {
    render(
      <InformationPanel
        groupName="Test Group"
        workTypeName="Test Type"
      />
    );

    const button = screen.getByTestId('view-all-files-button');
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  it('should always render ViewAllFilesModal component', () => {
    render(
      <InformationPanel
        groupId="group-123"
        groupName="Test Group"
        workTypeName="Test Type"
      />
    );

    // Modal should be present in DOM (not visible, but rendered)
    const modal = screen.getByTestId('view-all-files-modal');
    expect(modal).toBeInTheDocument();
  });
});
