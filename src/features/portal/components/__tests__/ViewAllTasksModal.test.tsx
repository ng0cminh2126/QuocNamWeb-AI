// Test suite for ViewAllTasksModal component

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ViewAllTasksModal } from '../ViewAllTasksModal';
import type { LinkedTaskDto } from '@/types/tasks_api';

// Mock tasks data
const mockTasks: LinkedTaskDto[] = [
  {
    taskId: 'task-001',
    messageId: 'msg-001',
    task: {
      id: 'task-001',
      title: 'Implement API integration',
      status: 'in_progress',
      priority: 'high',
      assignedTo: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
      },
    },
  },
  {
    taskId: 'task-002',
    messageId: 'msg-002',
    task: {
      id: 'task-002',
      title: 'Write documentation',
      status: 'todo',
      priority: 'medium',
      assignedTo: {
        id: 'user-2',
        name: 'Jane Smith',
        email: 'jane@example.com',
      },
    },
  },
  {
    taskId: 'task-003',
    messageId: null,
    task: {
      id: 'task-003',
      title: 'Code review',
      status: 'done',
      priority: 'low',
      assignedTo: {
        id: 'user-3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
      },
    },
  },
];

describe('ViewAllTasksModal', () => {
  const mockOnClose = vi.fn();
  const mockOnRetry = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render modal with header, search, and task list', () => {
      render(
        <ViewAllTasksModal
          isOpen={true}
          onClose={mockOnClose}
          conversationId="conv-123"
          conversationName="Test Conversation"
          tasks={mockTasks}
          isLoading={false}
          isError={false}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByTestId('view-all-tasks-modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-header')).toBeInTheDocument();
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByTestId('task-list')).toBeInTheDocument();
    });

    it('should display correct task count in header', () => {
      render(
        <ViewAllTasksModal
          isOpen={true}
          onClose={mockOnClose}
          conversationId="conv-123"
          tasks={mockTasks}
          isLoading={false}
          isError={false}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByTestId('modal-header')).toHaveTextContent('All Tasks (3)');
    });

    it('should display conversation name in header if provided', () => {
      render(
        <ViewAllTasksModal
          isOpen={true}
          onClose={mockOnClose}
          conversationId="conv-123"
          conversationName="Engineering Team"
          tasks={mockTasks}
          isLoading={false}
          isError={false}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByTestId('modal-header')).toHaveTextContent('Engineering Team');
    });

    it('should not render when isOpen is false', () => {
      const { container } = render(
        <ViewAllTasksModal
          isOpen={false}
          onClose={mockOnClose}
          conversationId="conv-123"
          tasks={mockTasks}
          isLoading={false}
          isError={false}
          onRetry={mockOnRetry}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Close Button Functionality', () => {
    it('should call onClose when close button clicked', () => {
      render(
        <ViewAllTasksModal
          isOpen={true}
          onClose={mockOnClose}
          conversationId="conv-123"
          tasks={mockTasks}
          isLoading={false}
          isError={false}
          onRetry={mockOnRetry}
        />
      );

      fireEvent.click(screen.getByTestId('modal-close-button'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop clicked', () => {
      render(
        <ViewAllTasksModal
          isOpen={true}
          onClose={mockOnClose}
          conversationId="conv-123"
          tasks={mockTasks}
          isLoading={false}
          isError={false}
          onRetry={mockOnRetry}
        />
      );

      fireEvent.click(screen.getByTestId('modal-backdrop'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Search Functionality', () => {
    it('should filter tasks by search term after debounce', async () => {
      render(
        <ViewAllTasksModal
          isOpen={true}
          onClose={mockOnClose}
          conversationId="conv-123"
          tasks={mockTasks}
          isLoading={false}
          isError={false}
          onRetry={mockOnRetry}
        />
      );

      const searchInput = screen.getByTestId('search-input') as HTMLInputElement;

      // Type "API" in search
      fireEvent.change(searchInput, { target: { value: 'API' } });

      // Wait for debounce (300ms)
      await waitFor(
        () => {
          const taskCards = screen.queryAllByTestId(/^task-card-/);
          expect(taskCards.length).toBe(1);
        },
        { timeout: 500 }
      );
    });

    it('should show all tasks when search is cleared', async () => {
      render(
        <ViewAllTasksModal
          isOpen={true}
          onClose={mockOnClose}
          conversationId="conv-123"
          tasks={mockTasks}
          isLoading={false}
          isError={false}
          onRetry={mockOnRetry}
        />
      );

      const searchInput = screen.getByTestId('search-input') as HTMLInputElement;

      // Type and then clear
      fireEvent.change(searchInput, { target: { value: 'API' } });
      await waitFor(() => {}, { timeout: 400 });

      fireEvent.change(searchInput, { target: { value: '' } });
      await waitFor(() => {}, { timeout: 400 });

      const taskCards = screen.queryAllByTestId(/^task-card-/);
      expect(taskCards.length).toBe(3);
    });
  });

  describe('Status Filter', () => {
    it('should filter tasks when status checkbox unchecked', () => {
      render(
        <ViewAllTasksModal
          isOpen={true}
          onClose={mockOnClose}
          conversationId="conv-123"
          tasks={mockTasks}
          isLoading={false}
          isError={false}
          onRetry={mockOnRetry}
        />
      );

      // Initially all 3 tasks visible
      expect(screen.queryAllByTestId(/^task-card-/).length).toBe(3);

      // Uncheck "Done" status
      const doneCheckbox = screen.getByTestId('filter-done-checkbox');
      fireEvent.click(doneCheckbox);

      // Should now have 2 tasks (excluding done)
      expect(screen.queryAllByTestId(/^task-card-/).length).toBe(2);
      expect(screen.queryByText('Code review')).not.toBeInTheDocument();
    });

    it('should apply multiple status filters', () => {
      render(
        <ViewAllTasksModal
          isOpen={true}
          onClose={mockOnClose}
          conversationId="conv-123"
          tasks={mockTasks}
          isLoading={false}
          isError={false}
          onRetry={mockOnRetry}
        />
      );

      // Uncheck "In Progress" and "Done"
      fireEvent.click(screen.getByTestId('filter-inProgress-checkbox'));
      fireEvent.click(screen.getByTestId('filter-done-checkbox'));

      // Should only show todo task
      expect(screen.queryAllByTestId(/^task-card-/).length).toBe(1);
      expect(screen.getByText('Write documentation')).toBeInTheDocument();
    });
  });

  describe('Priority Filter', () => {
    it('should filter tasks by priority', () => {
      render(
        <ViewAllTasksModal
          isOpen={true}
          onClose={mockOnClose}
          conversationId="conv-123"
          tasks={mockTasks}
          isLoading={false}
          isError={false}
          onRetry={mockOnRetry}
        />
      );

      // Uncheck all except High
      fireEvent.click(screen.getByTestId('filter-medium-checkbox'));
      fireEvent.click(screen.getByTestId('filter-low-checkbox'));

      // Should only show high priority task
      expect(screen.queryAllByTestId(/^task-card-/).length).toBe(1);
      expect(screen.getByText('Implement API integration')).toBeInTheDocument();
    });
  });

  describe('Sort Functionality', () => {
    it('should sort tasks by priority (default)', () => {
      render(
        <ViewAllTasksModal
          isOpen={true}
          onClose={mockOnClose}
          conversationId="conv-123"
          tasks={mockTasks}
          isLoading={false}
          isError={false}
          onRetry={mockOnRetry}
        />
      );

      const sortDropdown = screen.getByTestId('sort-dropdown') as HTMLSelectElement;
      expect(sortDropdown.value).toBe('priority');
    });

    it('should change sort order when dropdown changed', () => {
      render(
        <ViewAllTasksModal
          isOpen={true}
          onClose={mockOnClose}
          conversationId="conv-123"
          tasks={mockTasks}
          isLoading={false}
          isError={false}
          onRetry={mockOnRetry}
        />
      );

      const sortDropdown = screen.getByTestId('sort-dropdown');

      fireEvent.change(sortDropdown, { target: { value: 'assignee' } });

      expect((sortDropdown as HTMLSelectElement).value).toBe('assignee');
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when isLoading is true', () => {
      render(
        <ViewAllTasksModal
          isOpen={true}
          onClose={mockOnClose}
          conversationId="conv-123"
          tasks={[]}
          isLoading={true}
          isError={false}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when isError is true', () => {
      const mockError = new Error('Failed to fetch tasks');

      render(
        <ViewAllTasksModal
          isOpen={true}
          onClose={mockOnClose}
          conversationId="conv-123"
          tasks={[]}
          isLoading={false}
          isError={true}
          error={mockError}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText('Failed to load tasks')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch tasks')).toBeInTheDocument();
    });

    it('should call onRetry when retry button clicked', () => {
      const mockError = new Error('Network error');

      render(
        <ViewAllTasksModal
          isOpen={true}
          onClose={mockOnClose}
          conversationId="conv-123"
          tasks={[]}
          isLoading={false}
          isError={true}
          error={mockError}
          onRetry={mockOnRetry}
        />
      );

      fireEvent.click(screen.getByText('Retry'));
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no tasks', () => {
      render(
        <ViewAllTasksModal
          isOpen={true}
          onClose={mockOnClose}
          conversationId="conv-123"
          tasks={[]}
          isLoading={false}
          isError={false}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No linked tasks')).toBeInTheDocument();
    });

    it('should show no results state when filters exclude all tasks', () => {
      render(
        <ViewAllTasksModal
          isOpen={true}
          onClose={mockOnClose}
          conversationId="conv-123"
          tasks={mockTasks}
          isLoading={false}
          isError={false}
          onRetry={mockOnRetry}
        />
      );

      // Uncheck all status filters to exclude all tasks
      const todoCheckbox = screen.getByTestId('filter-todo-checkbox');
      const inProgressCheckbox = screen.getByTestId('filter-inProgress-checkbox');
      const awaitingCheckbox = screen.getByTestId('filter-awaiting-checkbox');
      const doneCheckbox = screen.getByTestId('filter-done-checkbox');

      fireEvent.click(todoCheckbox);
      fireEvent.click(inProgressCheckbox);
      fireEvent.click(awaitingCheckbox);
      fireEvent.click(doneCheckbox);

      expect(screen.getByTestId('no-results-state')).toBeInTheDocument();
      expect(screen.getByText('No tasks match filters')).toBeInTheDocument();
    });
  });

  describe('Task Cards', () => {
    it('should render all task cards', () => {
      render(
        <ViewAllTasksModal
          isOpen={true}
          onClose={mockOnClose}
          conversationId="conv-123"
          tasks={mockTasks}
          isLoading={false}
          isError={false}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByTestId('task-card-task-001')).toBeInTheDocument();
      expect(screen.getByTestId('task-card-task-002')).toBeInTheDocument();
      expect(screen.getByTestId('task-card-task-003')).toBeInTheDocument();
    });

    it('should display task information correctly', () => {
      render(
        <ViewAllTasksModal
          isOpen={true}
          onClose={mockOnClose}
          conversationId="conv-123"
          tasks={mockTasks}
          isLoading={false}
          isError={false}
          onRetry={mockOnRetry}
        />
      );

      // Check first task
      expect(screen.getByText('Implement API integration')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      // Use within to find "high" priority in task card, not in filter chips
      const taskCard = screen.getByTestId('task-card-task-001');
      expect(taskCard).toHaveTextContent('high');
    });

    it('should log task ID when task card clicked', () => {
      const consoleLogSpy = vi.spyOn(console, 'log');

      render(
        <ViewAllTasksModal
          isOpen={true}
          onClose={mockOnClose}
          conversationId="conv-123"
          tasks={mockTasks}
          isLoading={false}
          isError={false}
          onRetry={mockOnRetry}
        />
      );

      fireEvent.click(screen.getByTestId('task-card-task-001'));
      expect(consoleLogSpy).toHaveBeenCalledWith('Task clicked:', 'task-001');

      consoleLogSpy.mockRestore();
    });
  });

  describe('Footer', () => {
    it('should display task count in footer', () => {
      render(
        <ViewAllTasksModal
          isOpen={true}
          onClose={mockOnClose}
          conversationId="conv-123"
          tasks={mockTasks}
          isLoading={false}
          isError={false}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByText('Showing 3 of 3 tasks')).toBeInTheDocument();
    });

    it('should update count when filtered', () => {
      render(
        <ViewAllTasksModal
          isOpen={true}
          onClose={mockOnClose}
          conversationId="conv-123"
          tasks={mockTasks}
          isLoading={false}
          isError={false}
          onRetry={mockOnRetry}
        />
      );

      // Filter by unchecking Done
      fireEvent.click(screen.getByTestId('filter-done-checkbox'));

      expect(screen.getByText('Showing 2 of 3 tasks')).toBeInTheDocument();
    });
  });
});
