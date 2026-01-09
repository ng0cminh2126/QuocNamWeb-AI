import { getFileIconConfig } from "@/utils/fileIconMapping";
import { cn } from "@/lib/utils";

interface FileIconProps {
  /** MIME type of the file */
  contentType: string;
  /** Optional CSS class names */
  className?: string;
  /** Icon size (default: 16px = w-4 h-4) */
  size?: "sm" | "md" | "lg";
}

/**
 * File icon component with type-specific colors
 *
 * Displays appropriate icon based on file type:
 * - PDF: FileText icon in red
 * - Word: FileText icon in blue
 * - Excel: Sheet icon in green
 * - PowerPoint: Presentation icon in orange
 * - Generic: File icon in gray
 *
 * @example
 * ```tsx
 * <FileIcon contentType="application/pdf" size="md" />
 * <FileIcon contentType="application/vnd.ms-excel" />
 * ```
 */
export default function FileIcon({
  contentType,
  className,
  size = "sm",
}: FileIconProps) {
  const config = getFileIconConfig(contentType);
  const Icon = config.icon;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <Icon
      className={cn(config.color, sizeClasses[size], className)}
      aria-label={`${config.label} file`}
    />
  );
}
