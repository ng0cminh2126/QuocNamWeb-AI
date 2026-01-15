/**
 * File Search Bar Component
 * Search input for filtering files by name
 */

import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { useViewFilesStore } from '@/stores/viewFilesStore';
import type { FileSearchBarProps } from '@/types/files';

export default function FileSearchBar({
  placeholder = 'Tìm kiếm file...',
  onSearch,
}: FileSearchBarProps) {
  const { searchQuery, setSearchQuery, clearSearch } = useViewFilesStore();
  const [inputValue, setInputValue] = useState(searchQuery);

  // Sync internal state with store
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleClear = () => {
    setInputValue('');
    clearSearch();
    onSearch?.('');
  };

  return (
    <div
      className="relative w-full"
      data-testid="chat-file-search-bar-container"
    >
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleChange}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          data-testid="chat-file-search-input"
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 hover:bg-gray-200 rounded transition-colors"
            aria-label="Clear search"
            data-testid="chat-file-search-clear-button"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
}
