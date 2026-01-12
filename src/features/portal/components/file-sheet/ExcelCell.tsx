/**
 * ExcelCell Component
 *
 * Renders a single Excel cell with formatting and styles.
 * Supports bold, colors, alignment, merged cells.
 *
 * @module components/portal/components/file-sheet/ExcelCell
 */

import type { CellDataDto } from "@/types/filePreview";

export interface ExcelCellProps {
  /** Cell data with value and styling */
  cell: CellDataDto;
}

/**
 * Excel cell with optional styling
 *
 * @example
 * <ExcelCell
 *   cell={{
 *     row: 0,
 *     column: 0,
 *     value: 1234.56,
 *     formattedValue: "1,234.56",
 *     style: { bold: true, backgroundColor: "#FFFF00" }
 *   }}
 * />
 */
export default function ExcelCell({ cell }: ExcelCellProps) {
  const style = cell.style || {};

  return (
    <td
      className="border border-gray-300 px-2 py-1 text-sm"
      data-testid={`excel-cell-${cell.row}-${cell.column}`}
      style={{
        fontWeight: style.bold ? "bold" : "normal",
        fontStyle: style.italic ? "italic" : "normal",
        backgroundColor: style.backgroundColor || "transparent",
        color: style.textColor || "#000000",
        textAlign: style.horizontalAlignment || "left",
        verticalAlign: style.verticalAlignment || "top",
      }}
    >
      {cell.formattedValue}
    </td>
  );
}
