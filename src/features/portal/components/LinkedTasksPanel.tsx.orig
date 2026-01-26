// LinkedTasksPanel - Display tasks linked to a conversation

import React from 'react';
import { ClipboardList, Loader2, AlertCircle } from 'lucide-react';
import { RightAccordion } from './RightAccordion';
import { useLinkedTasks, getTaskCount } from '@/hooks/queries/useLinkedTasks';
import type { LinkedTaskDto } from '@/types/tasks_api';

interface LinkedTasksPanelProps {
  conversationId: string;
  onTaskClick?: (taskId: string) => void;
  onViewAll?: () => void;
}

/**
 * LinkedTasksPanel Component
 * 
 * Displays all tasks linked to a conversation in the right side panel
 * Uses GET /api/conversations/{conversationId}/tasks endpoint
 * 
 * Features:
 * - Auto-refresh linked tasks when new task is created
 * - Loading states
 * - Error states with retry
 * - Empty state
 * - Clickable task cards
 */
export function LinkedTasksPanel({
  conversationId,
  onTaskClick,
  onViewAll,
}: LinkedTasksPanelProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useLinkedTasks({
    conversationId,
    enabled: !!conversationId,
  });

  const taskCount = getTaskCount(data);
  const tasks = data?.tasks ?? [];

  return (
    <div className="premium-accordion-wrapper">
      <RightAccordion
        icon={<ClipboardList className="h-4 w-4 text-brand-600" />}
        title={`Linked Tasks${taskCount > 0 ? ` (${taskCount})` : ''}`}
        action={
          taskCount > 0 && onViewAll ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewAll();
              }}
              className="
                text-xs font-medium
                text-brand-600
                hover:text-brand-700
                hover:underline
                transition-colors
              "
              data-testid="view-all-tasks-button"
            >
              View All
            </button>
          ) : undefined
        }
      >
        <div
          className="space-y-3"
          data-testid="linked-tasks-panel"
        >
          {/* Loading State */}
          {isLoading && (
            <div
              className="flex items-center justify-center py-4"
              data-testid="linked-tasks-loading"
            >
              <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
            </div>
          )}

          {/* Error State */}
          {isError && !isLoading && (
            <div
              className="rounded border border-red-200 bg-red-50 p-3"
              data-testid="linked-tasks-error"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-800">Failed to load tasks</p>
                  <p className="text-xs text-red-600 mt-1">
                    {error instanceof Error ? error.message : 'Unknown error'}
                  </p>
                  <button
                    onClick={() => refetch()}
                    className="mt-2 text-xs text-red-700 underline hover:text-red-800"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && taskCount === 0 && (
            <div
              className="rounded border border-gray-200 bg-gray-50 p-4 text-center"
              data-testid="linked-tasks-empty"
            >
              <ClipboardList className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No linked tasks</p>
              <p className="text-xs text-gray-500 mt-1">
                Create tasks from messages to see them here
              </p>
            </div>
          )}

          {/* Task List */}
          {!isLoading && !isError && taskCount > 0 && (
            <div className="grid grid-cols-1 gap-3">
              {tasks.map((linkedTask) => (
                <LinkedTaskCard
                  key={linkedTask.taskId}
                  linkedTask={linkedTask}
                  onClick={onTaskClick}
                />
              ))}
            </div>
          )}
        </div>
      </RightAccordion>
    </div>
  );
}

/**
 * LinkedTaskCard - Individual task card component
 */
interface LinkedTaskCardProps {
  linkedTask: LinkedTaskDto;
  onClick?: (taskId: string) => void;
}

function LinkedTaskCard({ linkedTask, onClick }: LinkedTaskCardProps) {
  const task = linkedTask.task;

  return (
    <div
      className="
        relative
        rounded-lg
        border border-emerald-100
        p-3
        shadow-[0_2px_3px_rgba(15,23,42,0.10)]
        hover:shadow-[0_6px_8px_rgba(15,23,42,0.16)]
        transition-all
        duration-200
        hover:-translate-y-[1px]
        cursor-pointer
      "
      onClick={() => onClick?.(linkedTask.taskId)}
      data-testid={`linked-task-${linkedTask.taskId}`}
    >
      {/* Status Badge */}
      {task.status && (
        <div className="absolute -top-2 right-2">
          <span
            className="
              inline-flex items-center
              rounded-md px-2 py-0.5 text-[10px] font-medium
              border border-gray-200 bg-gray-50 text-gray-600
              shadow-sm
            "
          >
            {task.status}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {/* Title */}
        <div className="text-[13px] font-semibold leading-snug pr-16">
          {task.title || 'Untitled Task'}
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-500">
          {/* Priority */}
          {task.priority && (
            <>
              <span>Priority:</span>
              <span className="font-medium text-gray-700">{task.priority}</span>
            </>
          )}

          {/* Assignee */}
          {task.assignedTo && (
            <>
              <span>•</span>
              <span>Assigned to:</span>
              <span className="font-medium text-gray-700">
                {task.assignedTo.name || task.assignedTo.email}
              </span>
            </>
          )}
        </div>

        {/* Message Link Indicator */}
        {linkedTask.messageId && (
          <div className="text-[10px] text-gray-400 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Linked to message
          </div>
        )}
      </div>
    </div>
  );
}
