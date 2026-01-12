/**
 * Watermark Hook
 *
 * Returns CSS background styles for watermark pattern.
 * Parent component applies these styles to content container.
 *
 * @module components/portal/components/file-sheet/Watermark
 */

import { useMemo } from "react";
import type { WatermarkInfoDto } from "@/types/filePreview";

/**
 * Custom hook to generate watermark background styles
 * Returns background styles to apply watermark pattern
 *
 * @example
 * const watermarkStyles = useWatermarkStyles(watermark);
 * <div style={watermarkStyles}>Content...</div>
 */
export function useWatermarkStyles(
  watermark: WatermarkInfoDto | undefined | null
) {
  // Generate watermark text (only userIdentifier, no timestamp)
  const watermarkText = watermark?.userIdentifier || "";

  // Generate SVG watermark pattern as data URL
  const watermarkPattern = useMemo(() => {
    if (!watermarkText) {
      return "";
    }

    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">
        <text
          x="150"
          y="100"
          font-size="16"
          font-weight="400"
          fill="rgba(0, 0, 0, 0.12)"
          text-anchor="middle"
          transform="rotate(-30 150 100)"
          style="user-select: none;"
        >${watermarkText}</text>
      </svg>
    `;

    // Encode SVG to data URL
    const encoded = encodeURIComponent(svgContent)
      .replace(/'/g, "%27")
      .replace(/"/g, "%22");

    return `data:image/svg+xml,${encoded}`;
  }, [watermarkText]);

  // Return empty object if no watermark pattern
  if (!watermarkPattern) {
    return {};
  }

  // Return style object for parent to apply as background
  return {
    backgroundImage: `url("${watermarkPattern}")`,
    backgroundRepeat: "repeat",
    backgroundPosition: "0 0",
    backgroundSize: "300px 200px",
    backgroundAttachment: "local", // Important: scroll with content
  };
}
