/**
 * File Sort Dropdown Component
 * Select sort option for files
 */

import { ChevronDown } from 'lucide-react';
import { useViewFilesStore } from '@/stores/viewFilesStore';
import { getSortLabel, getAvailableSortOptions } from '@/utils/fileSorting';
import type { FileSortOption, FileSortDropdownProps } from '@/types/files';

export default function FileSortDropdown({
  onSortChange,
  fileType = 'media',
}: FileSortDropdownProps) {
  const { sortBy, setSortBy } = useViewFilesStore();
  const options = getAvailableSortOptions(fileType);

  const handleChange = (option: FileSortOption) => {
    setSortBy(option);
    onSortChange?.(option);
  };

  return (
    <div
      className="relative"
      data-testid="chat-file-sort-dropdown-container"
    >
      <div className="relative inline-block w-full sm:w-auto">
        <select
          value={sortBy}
          onChange={(e) => handleChange(e.target.value as FileSortOption)}
          className="appearance-none w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-pointer"
          data-testid="chat-file-sort-select"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {getSortLabel(option)}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}
