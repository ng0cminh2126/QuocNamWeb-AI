/**
 * ExcelSheetTabs Component
 *
 * Tab navigation for switching between Excel sheets.
 * Displays sheet names in horizontal scrollable tabs.
 *
 * @module components/portal/components/file-sheet/ExcelSheetTabs
 */

import { Button } from "@/components/ui/button";

export interface ExcelSheetTabsProps {
  /** Array of sheet names */
  sheetNames: string[];

  /** Currently active sheet index (0-based) */
  activeSheetIndex: number;

  /** Callback when sheet tab clicked */
  onSheetChange: (index: number) => void;
}

/**
 * Sheet tabs for Excel preview
 *
 * @example
 * <ExcelSheetTabs
 *   sheetNames={["Sheet1", "Summary", "Data"]}
 *   activeSheetIndex={0}
 *   onSheetChange={(idx) => setActiveSheet(idx)}
 * />
 */
export default function ExcelSheetTabs({
  sheetNames,
  activeSheetIndex,
  onSheetChange,
}: ExcelSheetTabsProps) {
  return (
    <div
      className="flex items-center gap-1 px-4 py-2 bg-gray-50 border-b overflow-x-auto"
      data-testid="excel-sheet-tabs"
    >
      {sheetNames.map((name, index) => {
        const isActive = index === activeSheetIndex;
        return (
          <Button
            key={index}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => onSheetChange(index)}
            data-testid={`excel-sheet-tab-${index}`}
            className={isActive ? "font-semibold" : ""}
          >
            {name}
          </Button>
        );
      })}
    </div>
  );
}
