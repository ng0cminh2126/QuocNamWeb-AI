/**
 * ExcelPagination Component
 *
 * Pagination controls for Excel preview.
 * Supports changing rows per page (50 or 100) and navigation (First, Prev, Next, Last).
 * Vietnamese UI labels.
 *
 * @module components/portal/components/file-sheet/ExcelPagination
 */

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

export interface ExcelPaginationProps {
  /** Current page number (1-based) */
  currentPage: number;

  /** Total number of pages */
  totalPages: number;

  /** Rows per page (50 or 100) */
  rowsPerPage: number;

  /** Total number of rows */
  totalRows: number;

  /** Callback when page changed */
  onPageChange: (page: number) => void;

  /** Callback when rows per page changed */
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

/**
 * Excel pagination component
 *
 * @example
 * <ExcelPagination
 *   currentPage={1}
 *   totalPages={10}
 *   rowsPerPage={50}
 *   totalRows={500}
 *   onPageChange={(page) => setCurrentPage(page)}
 *   onRowsPerPageChange={(rows) => setRowsPerPage(rows)}
 * />
 */
export default function ExcelPagination({
  currentPage,
  totalPages,
  rowsPerPage,
  totalRows,
  onPageChange,
  onRowsPerPageChange,
}: ExcelPaginationProps) {
  // Calculate row range for display
  const startRow = (currentPage - 1) * rowsPerPage + 1;
  const endRow = Math.min(currentPage * rowsPerPage, totalRows);

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div
      className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t"
      data-testid="excel-pagination"
    >
      {/* Rows per page selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Số dòng/trang:</span>
        <Select
          value={rowsPerPage.toString()}
          onValueChange={(value) => onRowsPerPageChange(Number(value))}
        >
          <SelectTrigger
            className="w-20"
            data-testid="excel-pagination-rows-select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="50"
              data-testid="excel-pagination-rows-option-50"
            >
              50
            </SelectItem>
            <SelectItem
              value="100"
              data-testid="excel-pagination-rows-option-100"
            >
              100
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Row range display */}
      <div
        className="text-sm text-gray-700"
        data-testid="excel-pagination-info"
      >
        Dòng {startRow}-{endRow} / {totalRows}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={isFirstPage}
          data-testid="excel-pagination-first-button"
          aria-label="Trang đầu"
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Đầu</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          data-testid="excel-pagination-prev-button"
          aria-label="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Trước</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          data-testid="excel-pagination-next-button"
          aria-label="Trang tiếp theo"
        >
          <span className="mr-1 hidden sm:inline">Sau</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={isLastPage}
          data-testid="excel-pagination-last-button"
          aria-label="Trang cuối"
        >
          <span className="mr-1 hidden sm:inline">Cuối</span>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
