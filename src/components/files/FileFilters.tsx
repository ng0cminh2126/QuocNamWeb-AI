/**
 * File Filters Component
 * Filter checkboxes for different file types
 */

import { useViewFilesStore, useFilterCounts } from '@/stores/viewFilesStore';
import type { FileFiltersProps } from '@/types/files';

const FILTER_OPTIONS = [
  { key: 'images' as const, label: 'Hình ảnh', icon: '🖼️' },
  { key: 'videos' as const, label: 'Video', icon: '🎬' },
  { key: 'pdf' as const, label: 'PDF', icon: '📄' },
  { key: 'word' as const, label: 'Word', icon: '📝' },
  { key: 'excel' as const, label: 'Excel', icon: '📊' },
  { key: 'powerpoint' as const, label: 'PowerPoint', icon: '📑' },
  { key: 'other' as const, label: 'Khác', icon: '📦' },
];

export default function FileFilters({
  onFilterChange,
  showCounts = true,
}: FileFiltersProps) {
  const { filters, setFilters, resetFilters } = useViewFilesStore();
  const counts = useFilterCounts();

  const handleFilterChange = (key: keyof typeof filters) => {
    const newFilters = {
      ...filters,
      [key]: !filters[key],
    };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleResetFilters = () => {
    resetFilters();
    onFilterChange?.(filters);
  };

  const allSelected = Object.values(filters).every((v) => v);
  const someSelected = Object.values(filters).some((v) => v);

  return (
    <div
      className="space-y-3"
      data-testid="chat-file-filters-container"
    >
      {/* Select/Deselect All */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => {
              if (allSelected) {
                resetFilters();
              } else {
                setFilters({
                  images: true,
                  videos: true,
                  pdf: true,
                  word: true,
                  excel: true,
                  powerpoint: true,
                  other: true,
                });
              }
            }}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            data-testid="chat-file-filters-select-all"
          />
          <span className="text-sm font-medium text-gray-700">
            {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
          </span>
        </label>
      </div>

      {/* Filter Options */}
      <div className="space-y-2 pl-4 border-l-2 border-gray-200">
        {FILTER_OPTIONS.map(({ key, label, icon }) => (
          <label
            key={key}
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
            data-testid={`chat-file-filter-${key}`}
          >
            <input
              type="checkbox"
              checked={filters[key]}
              onChange={() => handleFilterChange(key)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              data-testid={`chat-file-filter-${key}-checkbox`}
            />
            <span className="text-sm">{icon}</span>
            <span className="text-sm text-gray-700 flex-1">{label}</span>
            {showCounts && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {counts[key]}
              </span>
            )}
          </label>
        ))}
      </div>

      {/* Reset Button */}
      {someSelected && !allSelected && (
        <div className="pt-2 border-t border-gray-200">
          <button
            onClick={handleResetFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            data-testid="chat-file-filters-reset-button"
          >
            ↺ Reset lọc
          </button>
        </div>
      )}
    </div>
  );
}
